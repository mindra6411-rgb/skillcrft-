-- ---------------------------------------------------------------------------
-- Skill Craft · Migração 0002 — status de atendimento, prazo desejado e
-- informações complementares do formulário.
--
-- Natureza: ADITIVA e segura.
--   • só acrescenta colunas (nada é renomeado, removido ou reescrito);
--   • pedidos já gravados recebem automaticamente o status inicial
--     'aguardando_analise', compatível com a etapa 1 do fluxo oficial;
--   • pode ser executada mais de uma vez (IF NOT EXISTS / DROP POLICY IF EXISTS);
--   • não desativa RLS nem amplia acesso de leitura.
--
-- Como aplicar: SQL Editor do Supabase (ou `supabase db push`).
-- Dependência: migração 0001_solicitacoes.sql já aplicada.
-- ---------------------------------------------------------------------------

alter table public.solicitacoes
  add column if not exists status text not null default 'aguardando_analise'
    check (status in ('aguardando_analise', 'em_analise', 'em_andamento', 'concluido', 'cancelado')),
  add column if not exists prazo date null,
  add column if not exists informacoes text null
    check (informacoes is null or char_length(informacoes) <= 300);

create index if not exists solicitacoes_status_idx
  on public.solicitacoes (status);

-- Endurecimento da inserção pública (a política de 0001 aceitava qualquer valor):
--   • um visitante só pode criar pedido com o status inicial (impede alguém de
--     gravar o próprio pedido como "concluido");
--   • só pode vincular o pedido à própria conta autenticada (ou a nenhuma).
-- O formulário do site já envia exatamente esses valores, então nada muda na UX.
drop policy if exists "insercao_publica_de_solicitacoes" on public.solicitacoes;

create policy "insercao_publica_de_solicitacoes"
  on public.solicitacoes
  for insert
  to anon, authenticated
  with check (
    status = 'aguardando_analise'
    and (usuario_id is null or usuario_id = auth.uid())
  );

-- Observação: a atualização de status continua restrita — ela só é liberada
-- para perfis administradores na migração 0003_administradores.sql.
