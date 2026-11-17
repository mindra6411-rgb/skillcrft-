/**
 * Status oficiais de uma solicitação.
 *
 * Compatíveis com o fluxo real de atendimento (5 etapas do modelo de negócio):
 * o pedido chega, é analisado/orçado, é desenvolvido, é entregue — ou é
 * cancelado. Nenhum status inventa uma etapa que a equipe não executa.
 */
export const STATUS_SOLICITACAO = [
  'aguardando_analise',
  'em_analise',
  'em_andamento',
  'concluido',
  'cancelado',
] as const

export type StatusSolicitacao = (typeof STATUS_SOLICITACAO)[number]

type MetaStatus = { rotulo: string; descricao: string; tom: 'neutro' | 'info' | 'ativo' | 'ok' | 'off' }

export const META_STATUS: Record<StatusSolicitacao, MetaStatus> = {
  aguardando_analise: {
    rotulo: 'Aguardando análise',
    descricao: 'O pedido foi registrado e ainda não foi avaliado pela equipe.',
    tom: 'neutro',
  },
  em_analise: {
    rotulo: 'Em análise',
    descricao: 'A equipe está conferindo o escopo para montar o orçamento.',
    tom: 'info',
  },
  em_andamento: {
    rotulo: 'Em andamento',
    descricao: 'O serviço está sendo desenvolvido.',
    tom: 'ativo',
  },
  concluido: {
    rotulo: 'Concluído',
    descricao: 'A entrega foi finalizada com o aluno.',
    tom: 'ok',
  },
  cancelado: {
    rotulo: 'Cancelado',
    descricao: 'O pedido foi encerrado — a pedido do aluno ou por falta de retorno.',
    tom: 'off',
  },
}

export const STATUS_INICIAL: StatusSolicitacao = 'aguardando_analise'

export function ehStatus(valor: unknown): valor is StatusSolicitacao {
  return typeof valor === 'string' && (STATUS_SOLICITACAO as readonly string[]).includes(valor)
}

/** Classes visuais por tom (tema escuro da identidade). */
export const CLASSES_TOM: Record<MetaStatus['tom'], string> = {
  neutro: 'border-offwhite-50/15 bg-offwhite-50/[0.06] text-offwhite-100/70',
  info: 'border-skill-500/40 bg-skill-500/12 text-accent-300',
  ativo: 'border-accent-400/45 bg-accent-400/14 text-accent-300',
  ok: 'border-emerald-400/35 bg-emerald-400/12 text-emerald-300',
  off: 'border-charcoal-500/45 bg-charcoal-500/15 text-offwhite-100/55',
}

export function rotuloStatus(valor: unknown): string {
  return ehStatus(valor) ? META_STATUS[valor].rotulo : 'Aguardando análise'
}
