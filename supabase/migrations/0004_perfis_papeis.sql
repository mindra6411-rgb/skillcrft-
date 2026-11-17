-- ---------------------------------------------------------------------------
-- Skill Craft · Migração 0004 — perfis de acesso (papéis) validados no banco
--
-- Por que existe: o site precisa de quatro perfis — Visitante, Aluno,
-- Professor e Administrador — com permissões diferentes. A decisão de qual
-- perfil o usuário tem NUNCA pode vir do navegador (localStorage, parâmetro de
-- URL, requisição forjada): precisa ser lida daqui.
--
-- Garantias desta migração:
--   1. `public.perfis` guarda o papel de cada usuário (1 linha por usuário);
--   2. quem não tem linha é tratado como ALUNO (padrão), nunca como admin;
--   3. o usuário só consegue LER o próprio papel — não lista os outros;
--   4. um usuário NÃO consegue inserir, atualizar ou apagar o próprio papel.
--      Existe uma política de UPDATE apenas para administradores e um trigger
--      que bloqueia qualquer alteração em que o alvo seja o próprio autor —
--      então nem um administrador consegue se autopromover por essa via;
--   5. `skillcraft_papel()` devolve o papel atual e `skillcraft_eh_admin()`
--      continua existindo (compatibilidade com a migração 0003).
--
-- Natureza: ADITIVA e idempotente. Não remove dados, não desativa RLS e não
-- expõe nenhuma chave. Pode ser reaplicada com segurança.
--
-- Dependências: 0001, 0002 e 0003 já aplicadas.
-- ---------------------------------------------------------------------------

-- 1. Tipo do papel -----------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'papel_usuario') then
    create type public.papel_usuario as enum ('aluno', 'professor', 'administrador');
  end if;
end $$;

-- 2. Tabela de perfis --------------------------------------------------------
create table if not exists public.perfis (
  usuario_id  uuid primary key references auth.users (id) on delete cascade,
  papel       public.papel_usuario not null default 'aluno',
  criado_em   timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists perfis_papel_idx on public.perfis (papel);

alter table public.perfis enable row level security;

-- 3. Políticas ---------------------------------------------------------------
-- Leitura: cada usuário vê apenas a própria linha. Ninguém lista perfis.
drop policy if exists "perfil_leitura_do_proprio" on public.perfis;
create policy "perfil_leitura_do_proprio"
  on public.perfis
  for select
  to authenticated
  using (usuario_id = auth.uid());

-- Inserção: somente administradores podem criar perfil de outra pessoa.
-- O `with check` exige alvo diferente do autor (bloqueia autocriação).
drop policy if exists "perfil_insercao_por_admin" on public.perfis;
create policy "perfil_insercao_por_admin"
  on public.perfis
  for insert
  to authenticated
  with check (public.skillcraft_eh_admin() and usuario_id <> auth.uid());

-- Atualização: somente administradores, e nunca sobre o próprio registro.
drop policy if exists "perfil_atualizacao_por_admin" on public.perfis;
create policy "perfil_atualizacao_por_admin"
  on public.perfis
  for update
  to authenticated
  using (public.skillcraft_eh_admin() and usuario_id <> auth.uid())
  with check (public.skillcraft_eh_admin() and usuario_id <> auth.uid());

-- Exclusão: intencionalmente SEM política — negada pela API.
-- (Remover o papel equivale a rebaixar para o padrão "aluno"; faça por UPDATE.)

-- 4. Trigger de defesa em profundidade --------------------------------------
-- Mesmo que uma política futura seja relaxada por engano, o trigger continua
-- bloqueando autopromoção / autoelevação de privilégio.
create or replace function public.skillcraft_protege_papel()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Bloqueia qualquer escrita em que o alvo seja o próprio autor da requisição.
  if new.usuario_id = auth.uid() then
    raise exception 'Não é permitido alterar o próprio perfil.'
      using errcode = 'insufficient_privilege';
  end if;

  -- Um administrador não pode se tornar administrador por esta via nem
  -- rebaixar-se; e ninguém pode mudar o papel sem ser administrador.
  if not public.skillcraft_eh_admin() then
    raise exception 'Somente administradores podem alterar perfis.'
      using errcode = 'insufficient_privilege';
  end if;

  new.atualizado_em := now();
  return new;
end;
$$;

drop trigger if exists trg_protege_papel on public.perfis;
create trigger trg_protege_papel
  before insert or update on public.perfis
  for each row execute function public.skillcraft_protege_papel();

-- 5. Consulta do papel atual -------------------------------------------------
-- SECURITY DEFINER para evitar recursão de RLS. Devolve no máximo um papel:
-- nunca lista usuários. Sem registro, devolve 'aluno' (padrão seguro).
create or replace function public.skillcraft_papel()
returns public.papel_usuario
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.papel from public.perfis p where p.usuario_id = auth.uid()),
    'aluno'::public.papel_usuario
  );
$$;

revoke all on function public.skillcraft_papel() from public;
grant execute on function public.skillcraft_papel() to authenticated;

-- `skillcraft_eh_admin()` passa a considerar a tabela nova E a tabela legada
-- `administradores` (0003), para não quebrar quem já estava configurado.
create or replace function public.skillcraft_eh_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.perfis p
    where p.usuario_id = auth.uid() and p.papel = 'administrador'
  ) or exists (
    select 1 from public.administradores a
    where a.usuario_id = auth.uid()
  );
$$;

revoke all on function public.skillcraft_eh_admin() from public;
grant execute on function public.skillcraft_eh_admin() to authenticated;

-- 6. Perfil criado automaticamente no cadastro ------------------------------
-- Todo usuário novo nasce como 'aluno'. O trigger roda como dono do esquema
-- para poder escrever na tabela, mas sempre com papel fixo — nunca vem do
-- cliente (user_metadata pode ser forjado e por isso é ignorado aqui).
create or replace function public.skillcraft_cria_perfil_padrao()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfis (usuario_id, papel)
  values (new.id, 'aluno')
  on conflict (usuario_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_cria_perfil_padrao on auth.users;
create trigger trg_cria_perfil_padrao
  after insert on auth.users
  for each row execute function public.skillcraft_cria_perfil_padrao();

-- 7. Promover o primeiro administrador (faça no SQL Editor, como dono) ------
--   1. Cadastre-se no site normalmente (o perfil nasce como 'aluno').
--   2. Descubra o id:
--        select id, email from auth.users order by created_at desc;
--   3. Promova (aqui, no SQL Editor, a sessão é do dono — o trigger não se
--      aplica porque não há `auth.uid()`):
--        update public.perfis set papel = 'administrador'
--        where usuario_id = 'COLE-O-UUID-AQUI';
--   4. Abra #/admin: a permissão é confirmada pelo banco a cada carregamento.
-- ---------------------------------------------------------------------------
