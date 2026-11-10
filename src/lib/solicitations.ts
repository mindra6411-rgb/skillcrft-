import { supabase } from './supabase'
import { gerarProtocolo } from './validation'

export type Solicitacao = {
  id: string
  protocolo: string
  criadaEm: string
  nome: string
  servicoId: string
  servicoTitulo: string
  descricao: string
  meioContato: string
  contato: string
  origem: 'local' | 'supabase'
  usuarioId: string | null
}

export type NovoSolicitacao = Omit<Solicitacao, 'id' | 'protocolo' | 'criadaEm' | 'origem' | 'usuarioId'>

const CHAVE_RASCUNHOS = 'skillcraft:solicitacoes:rascunhos'

export function listarRascunhosLocais(): Solicitacao[] {
  try {
    const bruto = localStorage.getItem(CHAVE_RASCUNHOS)
    if (!bruto) return []
    const lista = JSON.parse(bruto) as Solicitacao[]
    return Array.isArray(lista) ? lista : []
  } catch {
    return []
  }
}

function salvarRascunhoLocal(solicitacao: Solicitacao): void {
  try {
    const atuais = listarRascunhosLocais()
    localStorage.setItem(CHAVE_RASCUNHOS, JSON.stringify([solicitacao, ...atuais].slice(0, 30)))
  } catch {
    /* armazenamento indisponível (modo privado etc.) — segue sem persistir */
  }
}

export type ResultadoEnvio = {
  status: 'enviado' | 'rascunho-local'
  solicitacao: Solicitacao
  aviso?: string
}

/**
 * Envia a solicitação. Com Supabase configurado, grava na tabela `solicitacoes`
 * (migração em supabase/migrations/0001_solicitacoes.sql). Sem backend — ou se a
 * gravação falhar — a solicitação vira um rascunho local declarado como tal:
 * nenhum envio real é simulado.
 */
export async function enviarSolicitacao(dados: NovoSolicitacao, usuarioId: string | null): Promise<ResultadoEnvio> {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `sc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

  const base: Solicitacao = {
    ...dados,
    id,
    protocolo: gerarProtocolo(),
    criadaEm: new Date().toISOString(),
    origem: 'local',
    usuarioId,
  }

  if (supabase) {
    const { error } = await supabase.from('solicitacoes').insert({
      id: base.id,
      protocolo: base.protocolo,
      nome: base.nome,
      servico: base.servicoTitulo,
      descricao: base.descricao,
      meio_contato: base.meioContato,
      contato: base.contato,
      usuario_id: usuarioId,
    })
    if (!error) {
      return { status: 'enviado', solicitacao: { ...base, origem: 'supabase' } }
    }
    return {
      status: 'rascunho-local',
      solicitacao: base,
      aviso: `O Supabase está configurado, mas a gravação falhou (${error.message}). Sua solicitação foi mantida como rascunho local.`,
    }
  }

  salvarRascunhoLocal(base)
  return {
    status: 'rascunho-local',
    solicitacao: base,
    aviso:
      'Nenhum backend está configurado neste ambiente, então nada foi enviado pela internet. Sua solicitação foi salva neste navegador como rascunho de demonstração.',
  }
}
