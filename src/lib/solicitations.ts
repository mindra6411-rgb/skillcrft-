import { supabase } from './supabase'
import { gerarProtocolo } from './validation'
import { STATUS_INICIAL, ehStatus, type StatusSolicitacao } from './status'

export type Solicitacao = {
  id: string
  protocolo: string
  criadaEm: string
  nome: string
  servicoId: string
  servicoTitulo: string
  descricao: string
  /** Prazo desejado pelo aluno (data ISO `AAAA-MM-DD`) ou null quando não informado. */
  prazo: string | null
  /** Informações complementares opcionais. */
  informacoes: string
  meioContato: string
  contato: string
  status: StatusSolicitacao
  origem: 'local' | 'supabase'
  usuarioId: string | null
}

export type NovoSolicitacao = Omit<
  Solicitacao,
  'id' | 'protocolo' | 'criadaEm' | 'status' | 'origem' | 'usuarioId'
>

const CHAVE_RASCUNHOS = 'skillcraft:solicitacoes:rascunhos'

/**
 * Normaliza registros antigos salvos no navegador (sem `status`, `prazo` ou
 * `informacoes`) para o formato atual — nada é descartado ao atualizar o site.
 */
function normalizar(bruto: unknown): Solicitacao | null {
  if (!bruto || typeof bruto !== 'object') return null
  const item = bruto as Record<string, unknown>
  const texto = (valor: unknown) => (typeof valor === 'string' ? valor : '')
  return {
    id: texto(item.id) || `local-${Math.random().toString(36).slice(2, 10)}`,
    protocolo: texto(item.protocolo) || '—',
    criadaEm: texto(item.criadaEm) || new Date().toISOString(),
    nome: texto(item.nome),
    servicoId: texto(item.servicoId),
    servicoTitulo: texto(item.servicoTitulo),
    descricao: texto(item.descricao),
    prazo: typeof item.prazo === 'string' && item.prazo ? item.prazo : null,
    informacoes: texto(item.informacoes),
    meioContato: texto(item.meioContato),
    contato: texto(item.contato),
    status: ehStatus(item.status) ? item.status : STATUS_INICIAL,
    origem: 'local',
    usuarioId: typeof item.usuarioId === 'string' ? item.usuarioId : null,
  }
}

export function listarRascunhosLocais(): Solicitacao[] {
  try {
    const bruto = localStorage.getItem(CHAVE_RASCUNHOS)
    if (!bruto) return []
    const lista = JSON.parse(bruto)
    if (!Array.isArray(lista)) return []
    return lista.map(normalizar).filter((item): item is Solicitacao => item !== null)
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

/** Linha da tabela `solicitacoes` convertida para o modelo da interface. */
function doBanco(linha: Record<string, unknown>, usuarioId: string | null): Solicitacao {
  const texto = (valor: unknown) => (typeof valor === 'string' ? valor : '')
  return {
    id: texto(linha.id),
    protocolo: texto(linha.protocolo) || '—',
    criadaEm: texto(linha.created_at) || new Date().toISOString(),
    nome: texto(linha.nome),
    servicoId: '',
    servicoTitulo: texto(linha.servico),
    descricao: texto(linha.descricao),
    prazo: texto(linha.prazo) || null,
    informacoes: texto(linha.informacoes),
    meioContato: texto(linha.meio_contato),
    contato: texto(linha.contato),
    status: ehStatus(linha.status) ? linha.status : STATUS_INICIAL,
    origem: 'supabase',
    usuarioId,
  }
}

/**
 * Solicitações do aluno autenticado. O filtro por `usuario_id` existe na
 * interface e, principalmente, nas políticas de RLS do banco
 * (supabase/migrations/0001_solicitacoes.sql) — a garantia é server-side.
 */
export async function listarSolicitacoesDoAluno(
  usuarioId: string,
): Promise<{ dados: Solicitacao[]; erro: string | null }> {
  if (!supabase) return { dados: [], erro: null }
  const { data, error } = await supabase
    .from('solicitacoes')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('created_at', { ascending: false })
  if (error) return { dados: [], erro: error.message }
  return {
    dados: (data ?? []).map((linha) => doBanco(linha as Record<string, unknown>, usuarioId)),
    erro: null,
  }
}

/**
 * Todas as solicitações — usado apenas pelo painel administrativo, cuja
 * autorização é validada no banco (RPC `skillcraft_eh_admin` + política de RLS
 * em supabase/migrations/0003_administradores.sql). Sem permissão, o próprio
 * banco devolve erro/lista vazia: não há "esconder botão" no frontend.
 */
export async function listarTodasSolicitacoes(): Promise<{ dados: Solicitacao[]; erro: string | null }> {
  if (!supabase) return { dados: [], erro: 'Banco de dados não configurado neste ambiente.' }
  const { data, error } = await supabase
    .from('solicitacoes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) return { dados: [], erro: error.message }
  return { dados: (data ?? []).map((linha) => doBanco(linha as Record<string, unknown>, null)), erro: null }
}

/** Atualização de status — permitida pelo banco somente a perfis administradores. */
export async function atualizarStatusSolicitacao(
  id: string,
  status: StatusSolicitacao,
): Promise<{ ok: boolean; erro: string | null }> {
  if (!supabase) return { ok: false, erro: 'Banco de dados não configurado neste ambiente.' }
  const { error } = await supabase.from('solicitacoes').update({ status }).eq('id', id)
  if (error) return { ok: false, erro: error.message }
  return { ok: true, erro: null }
}

/** Verificação de perfil administrativo feita NO BANCO (function RPC). */
export async function consultarPerfilAdministrativo(): Promise<{
  administrador: boolean
  erro: string | null
}> {
  if (!supabase) return { administrador: false, erro: 'Banco de dados não configurado neste ambiente.' }
  const { data, error } = await supabase.rpc('skillcraft_eh_admin')
  if (error) return { administrador: false, erro: error.message }
  return { administrador: data === true, erro: null }
}

/**
 * Envia a solicitação. Com Supabase configurado, grava na tabela `solicitacoes`
 * (migrações em supabase/migrations/). Sem backend — ou se a gravação falhar —
 * a solicitação vira um rascunho local declarado como tal: nenhum envio real é
 * simulado.
 */
export async function enviarSolicitacao(
  dados: NovoSolicitacao,
  usuarioId: string | null,
): Promise<ResultadoEnvio> {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `sc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

  const base: Solicitacao = {
    ...dados,
    id,
    protocolo: gerarProtocolo(),
    criadaEm: new Date().toISOString(),
    status: STATUS_INICIAL,
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
      prazo: base.prazo,
      informacoes: base.informacoes,
      meio_contato: base.meioContato,
      contato: base.contato,
      status: base.status,
      usuario_id: usuarioId,
    })
    if (!error) {
      return { status: 'enviado', solicitacao: { ...base, origem: 'supabase' } }
    }
    salvarRascunhoLocal(base)
    return {
      status: 'rascunho-local',
      solicitacao: base,
      aviso: `O Supabase está configurado, mas a gravação falhou (${error.message}). Sua solicitação foi mantida como rascunho local neste navegador.`,
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
