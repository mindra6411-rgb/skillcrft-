-- ---------------------------------------------------------------------------
-- Skill Craft · Migração 0006 — identificação do aluno e listas de apoio
--
-- Duas necessidades reais desta etapa:
--
-- 1. O formulário é PÚBLICO (visitante pode pedir orçamento sem conta). Mas,
--    quando existe sessão, o pedido precisa chegar vinculado à conta para
--    aparecer na Área do Aluno. E, para um ADMINISTRADOR conseguir dar retorno,
--    o painel precisa saber o nome/e-mail de quem enviou — hoje só via um UUID.
--    → `public.usuarios_publico` expõe apenas id, nome, e-mail e papel, e
--      SOMENTE para o próprio usuário ou para administradores.
--
-- 2. O cadastro precisa oferecer o perfil Professor. A lista fechada de
--    professores autorizados vive em `public.professores_autorizados`, que o
--    cliente NÃO consegue ler (senão viraria uma lista de e-mails da escola).
--
-- Natureza: ADITIVA e idempotente. Não altera dados existentes.
-- Dependências: 0001–0005.
-- ---------------------------------------------------------------------------

-- 1. Visão pública mínima dos usuários --------------------------------------
-- Esta visão NÃO é `security_invoker`: ela roda com o privilégio do dono para
-- conseguir ler `auth.users` (que o cliente não acessa). A filtragem de linhas
-- é garantida pelo WHERE abaixo — nunca por confiança na interface.
create or replace view public.usuarios_publico
with (security_invoker = off)
as
select
  u.id,
  coalesce(nullif(trim(u.raw_user_meta_data ->> 'nome'), ''), split_part(u.email, '@', 1)) as nome,
  u.email,
  coalesce(
    (select p.papel from public.perfis p where p.usuario_id = u.id),
    'aluno'::public.papel_usuario
  ) as papel
from auth.users u
where u.id = auth.uid()
   or public.skillcraft_eh_admin();

revoke all on public.usuarios_publico from anon, authenticated;
grant select on public.usuarios_publico to authenticated;

comment on view public.usuarios_publico is
  'Nome/e-mail/papel do próprio usuário ou de qualquer usuário para administradores. Sem CPF, sem metadados sensíveis.';

-- 2. Lista de professores autorizados --------------------------------------
create table if not exists public.professores_autorizados (
  email        text primary key check (char_length(email) between 5 and 254),
  criado_em    timestamptz not null default now(),
  observacao   text
);

alter table public.professores_autorizados enable row level security;

-- Nenhuma política: nem leitura, nem escrita pelo cliente. A conferência é
-- feita pela function abaixo (SECURITY DEFINER), que responde apenas
-- sim/não para o e-mail que o próprio usuário está usando no cadastro.
--
-- Para cadastrar um professor autorizado, use o SQL Editor:
--   insert into public.professores_autorizados (email, observacao)
--   values ('professor@raphaeldisanto.com.br', 'Orientador do PI');

create or replace function public.skillcraft_email_professor_autorizado(p_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.professores_autorizados pa
    where lower(pa.email) = lower(trim(p_email))
  );
$$;

revoke all on function public.skillcraft_email_professor_autorizado(text) from public;
grant execute on function public.skillcraft_email_professor_autorizado(text) to anon, authenticated;

-- 3. Pedido enviado durante a sessão fica vinculado à conta ----------------
-- A visão do banco continua a mesma; o site passa a enviar `usuario_id`
-- quando há sessão, e a política de 0002 já exige `usuario_id = auth.uid()`,
-- o que impede vincular um pedido à conta de outra pessoa.
--
-- Nada a alterar aqui — o registro fica como documentação da regra vigente.
-- ---------------------------------------------------------------------------
