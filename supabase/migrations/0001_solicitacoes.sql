-- ---------------------------------------------------------------------------
-- Skill Craft · Migração 0001 — tabela de solicitações do formulário de contato
-- Execute no SQL Editor do Supabase (ou via CLI: supabase db push).
-- Sem esta tabela, o site continua funcionando: o formulário grava rascunhos
-- locais declarados como demonstração (nenhum envio é simulado como real).
-- ---------------------------------------------------------------------------

create table if not exists public.solicitacoes (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  protocolo   text not null,
  nome        text not null,
  servico     text not null,
  descricao   text not null check (char_length(descricao) between 10 and 600),
  meio_contato text not null check (meio_contato in ('email', 'whatsapp', 'telefone')),
  contato     text not null,
  usuario_id  uuid references auth.users (id) on delete set null
);

create index if not exists solicitacoes_usuario_idx
  on public.solicitacoes (usuario_id);

alter table public.solicitacoes enable row level security;

-- O formulário é público: qualquer visitante (autenticado ou não) pode enviar.
create policy "insercao_publica_de_solicitacoes"
  on public.solicitacoes
  for insert
  to anon, authenticated
  with check (true);

-- Cada aluno logado lê apenas o próprio histórico (Área do Aluno).
create policy "leitura_do_proprio_aluno"
  on public.solicitacoes
  for select
  to authenticated
  using (usuario_id = auth.uid());

-- Atualizações/exclusões não são expostas ao site (gestão feita pelo painel).
