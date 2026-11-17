-- ---------------------------------------------------------------------------
-- Skill Craft · Migração 0003 — perfil administrativo validado NO BANCO.
--
-- Por que existe: o painel administrativo (#/admin) só pode existir se a
-- autorização for decidida pelo banco de dados, e não por esconder botões no
-- frontend. Aqui ficam:
--   1. a tabela `administradores` (quem pode);
--   2. a function `skillcraft_eh_admin()` (consulta usada pelo site);
--   3. as políticas de RLS que liberam leitura geral e atualização de status
--      apenas para esses perfis.
--
-- Natureza: ADITIVA e segura. Não altera dados existentes, não desativa RLS e
-- não expõe nenhuma chave. Pode ser reaplicada (IF NOT EXISTS / OR REPLACE).
--
-- Como aplicar: SQL Editor do Supabase (ou `supabase db push`).
-- Dependências: 0001_solicitacoes.sql e 0002_status_prazo_informacoes.sql.
-- ---------------------------------------------------------------------------

create table if not exists public.administradores (
  usuario_id  uuid primary key references auth.users (id) on delete cascade,
  criado_em   timestamptz not null default now(),
  observacao  text
);

alter table public.administradores enable row level security;

-- Nenhum usuário lista os administradores pela API: cada um só enxerga o
-- próprio registro (usado para o site saber se deve mostrar o painel).
drop policy if exists "leitura_do_proprio_perfil_administrativo" on public.administradores;

create policy "leitura_do_proprio_perfil_administrativo"
  on public.administradores
  for select
  to authenticated
  using (usuario_id = auth.uid());

-- Function SECURITY DEFINER: executa como dona do esquema para evitar recursão
-- de RLS (a política de `solicitacoes` chama esta função). Ela nunca é exposta
-- com privilégio de escrita e devolve apenas verdadeiro/falso.
create or replace function public.skillcraft_eh_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.administradores a
    where a.usuario_id = auth.uid()
  );
$$;

revoke all on function public.skillcraft_eh_admin() from public;
grant execute on function public.skillcraft_eh_admin() to authenticated;

-- Leitura administrativa: quem é administrador vê todas as solicitações.
-- (A política do aluno continua valendo; políticas permissivas se somam.)
drop policy if exists "leitura_administrativa_de_solicitacoes" on public.solicitacoes;

create policy "leitura_administrativa_de_solicitacoes"
  on public.solicitacoes
  for select
  to authenticated
  using (public.skillcraft_eh_admin());

-- Atualização: apenas administradores, apenas sobre registros existentes.
-- O painel do site atualiza somente o campo `status`; exclusão continua sem
-- nenhuma política (ou seja, negada pela API).
drop policy if exists "atualizacao_administrativa_de_status" on public.solicitacoes;

create policy "atualizacao_administrativa_de_status"
  on public.solicitacoes
  for update
  to authenticated
  using (public.skillcraft_eh_admin())
  with check (public.skillcraft_eh_admin());

-- ---------------------------------------------------------------------------
-- Como nomear o primeiro administrador (faça isso no SQL Editor):
--
--   1. Entre no site com a conta Google que será administradora.
--   2. Localize o id do usuário:
--        select id, email from auth.users order by created_at desc;
--   3. Registre o perfil:
--        insert into public.administradores (usuario_id, observacao)
--        values ('COLE-O-UUID-AQUI', 'Primeiro administrador — equipe Skill Craft');
--   4. Abra #/admin no site: a permissão passa a ser confirmada pelo banco.
--
-- Para remover o acesso:
--        delete from public.administradores where usuario_id = 'UUID';
-- ---------------------------------------------------------------------------
