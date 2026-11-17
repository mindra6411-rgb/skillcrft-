-- ---------------------------------------------------------------------------
-- Skill Craft · Migração 0007 — promoção a Professor somente por lista do banco
--
-- Por que existe: o cadastro (migração 0004) sempre cria o perfil como 'aluno'.
-- Um estudante que também é professor precisa de um caminho controlado para
-- receber o papel 'professor' — e esse caminho não pode ser "mandar papel no
-- cadastro", porque `user_metadata` e o corpo da requisição são controlados
-- pelo cliente.
--
-- Regra implementada:
--   • o e-mail é comparado com `public.professores_autorizados` (0006);
--   • a função só promove o PRÓPRIO usuário autenticado — nunca outra pessoa;
--   • só promove de 'aluno' para 'professor': não rebaixa administrador e não
--     cria administrador (essa promoção é manual, no SQL Editor);
--   • a lista de professores não é legível pelo cliente.
--
-- Natureza: ADITIVA e idempotente. Depende de 0004 e 0006.
-- ---------------------------------------------------------------------------

create or replace function public.skillcraft_promove_professor(p_email text)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_email text := lower(trim(p_email));
  v_email_sessao text;
  v_autorizado boolean;
begin
  -- Sem sessão, nada acontece.
  if v_uid is null then
    return false;
  end if;

  -- O e-mail informado precisa ser o da própria sessão (impede promover outra conta).
  select lower(u.email) into v_email_sessao from auth.users u where u.id = v_uid;
  if v_email_sessao is null or v_email_sessao <> v_email then
    return false;
  end if;

  -- O e-mail precisa estar na lista fechada, que o cliente não lê.
  select exists (
    select 1 from public.professores_autorizados pa
    where lower(pa.email) = v_email
  ) into v_autorizado;

  if not v_autorizado then
    return false;
  end if;

  -- Promoção restrita: apenas de aluno (ou sem linha) para professor.
  insert into public.perfis (usuario_id, papel)
  values (v_uid, 'professor')
  on conflict (usuario_id) do update
    set papel = 'professor', atualizado_em = now()
    where public.perfis.papel = 'aluno';

  return true;
end;
$$;

revoke all on function public.skillcraft_promove_professor(text) from public;
grant execute on function public.skillcraft_promove_professor(text) to authenticated;

-- Nota: esta função ignora o trigger `trg_protege_papel` porque o trigger só
-- bloqueia quando quem escreve é o próprio alvo *via API*. Para deixar isso
-- explícito e seguro, o trigger é ajustado para permitir a passagem quando a
-- sessão está promovendo a si mesma de aluno para professor por esta função.
-- A marcação usa um GUC local (`app.skillcraft_promocao_professor`), que só a
-- função acima define — o cliente não consegue definir variáveis de sessão via
-- PostgREST.
create or replace function public.skillcraft_protege_papel()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_promocao_professor boolean := coalesce(current_setting('app.skillcraft_promocao_professor', true), '') = 'on';
begin
  -- Caminho controlado: aluno → professor, quando a função autorizada sinalizou.
  if v_promocao_professor
     and new.usuario_id = auth.uid()
     and new.papel = 'professor'
     and (tg_op = 'INSERT' or old.papel = 'aluno') then
    new.atualizado_em := now();
    return new;
  end if;

  if new.usuario_id = auth.uid() then
    raise exception 'Não é permitido alterar o próprio perfil.'
      using errcode = 'insufficient_privilege';
  end if;

  if not public.skillcraft_eh_admin() then
    raise exception 'Somente administradores podem alterar perfis.'
      using errcode = 'insufficient_privilege';
  end if;

  new.atualizado_em := now();
  return new;
end;
$$;

-- Ajusta a função de promoção para sinalizar o GUC antes de escrever.
create or replace function public.skillcraft_promove_professor(p_email text)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_email text := lower(trim(p_email));
  v_email_sessao text;
  v_autorizado boolean;
begin
  if v_uid is null then
    return false;
  end if;

  select lower(u.email) into v_email_sessao from auth.users u where u.id = v_uid;
  if v_email_sessao is null or v_email_sessao <> v_email then
    return false;
  end if;

  select exists (
    select 1 from public.professores_autorizados pa
    where lower(pa.email) = v_email
  ) into v_autorizado;

  if not v_autorizado then
    return false;
  end if;

  -- Sinaliza ao trigger (escopo da transação atual).
  perform set_config('app.skillcraft_promocao_professor', 'on', true);

  insert into public.perfis (usuario_id, papel)
  values (v_uid, 'professor')
  on conflict (usuario_id) do update
    set papel = 'professor', atualizado_em = now()
    where public.perfis.papel = 'aluno';

  perform set_config('app.skillcraft_promocao_professor', 'off', true);

  return true;
end;
$$;

revoke all on function public.skillcraft_promove_professor(text) from public;
grant execute on function public.skillcraft_promove_professor(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Cadastro de um professor autorizado (SQL Editor, como dono):
--   insert into public.professores_autorizados (email, observacao)
--   values ('professor@raphaeldisanto.com.br', 'Professor orientador')
--   on conflict (email) do nothing;
-- O estudante cria a conta normalmente e clica em "Sou professor" no cadastro.
-- ---------------------------------------------------------------------------
