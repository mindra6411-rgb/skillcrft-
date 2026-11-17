import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  CalendarDays,
  CircleAlert,
  Database,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'
import { PageShell } from '../ui/PageShell'
import { Logo } from '../brand/Logo'
import { AuthButton } from '../auth/AuthButton'
import { useAuth } from '../../context/AuthContext'
import {
  atualizarStatusSolicitacao,
  consultarPerfilAdministrativo,
  listarTodasSolicitacoes,
  type Solicitacao,
} from '../../lib/solicitations'
import { META_STATUS, STATUS_SOLICITACAO, type StatusSolicitacao } from '../../lib/status'
import { formatarData, formatarDataHora } from '../../lib/validation'

type EstadoAcesso = 'verificando' | 'autorizado' | 'negado' | 'erro'

/** Cartão de estado usado quando o painel não pode ser exibido. */
function EstadoPainel({
  icone: Icone,
  titulo,
  texto,
  acao,
  irParaHome,
}: {
  icone: typeof ShieldAlert
  titulo: string
  texto: ReactNode
  acao?: ReactNode
  irParaHome: () => void
}) {
  return (
    <PageShell kicker="Painel administrativo" titulo={titulo} irParaHome={irParaHome}>
      <div className="card-surface mx-auto max-w-2xl p-8 text-center sm:p-10">
        <Logo variante="lockup-white" className="mx-auto h-16 w-auto" />
        <span className="mx-auto mt-7 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-400/12 text-accent-400">
          <Icone className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="mt-5 font-body text-sm leading-relaxed text-offwhite-100/70">{texto}</div>
        {acao && <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">{acao}</div>}
      </div>
    </PageShell>
  )
}

/**
 * Painel administrativo.
 *
 * A autorização NÃO é decidida pela interface: ela é consultada no banco pela
 * function `skillcraft_eh_admin()` e reforçada pelas políticas de RLS de
 * `supabase/migrations/0003_administradores.sql`. Mesmo que alguém altere o
 * código no navegador, o banco continua negando leitura geral e atualização de
 * status para quem não está na tabela `administradores`.
 *
 * Sem banco configurado o painel não finge funcionar: explica a pendência.
 */
export function Admin({ irParaHome }: { irParaHome: () => void }) {
  const { usuario, carregando, configurado } = useAuth()
  const [acesso, setAcesso] = useState<EstadoAcesso>('verificando')
  const [erroAcesso, setErroAcesso] = useState<string | null>(null)
  const [itens, setItens] = useState<Solicitacao[]>([])
  const [carregandoLista, setCarregandoLista] = useState(false)
  const [erroLista, setErroLista] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [salvando, setSalvando] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  const verificar = useCallback(async () => {
    if (!configurado || !usuario) return
    setAcesso('verificando')
    const { administrador, erro } = await consultarPerfilAdministrativo()
    if (erro) {
      setErroAcesso(erro)
      setAcesso('erro')
      return
    }
    setErroAcesso(null)
    setAcesso(administrador ? 'autorizado' : 'negado')
  }, [configurado, usuario])

  const carregarLista = useCallback(async () => {
    setCarregandoLista(true)
    const { dados, erro } = await listarTodasSolicitacoes()
    setItens(dados)
    setErroLista(erro)
    setCarregandoLista(false)
  }, [])

  useEffect(() => {
    if (!configurado || !usuario) return
    void verificar()
  }, [configurado, usuario, verificar])

  useEffect(() => {
    if (acesso !== 'autorizado') return
    void carregarLista()
  }, [acesso, carregarLista])

  const filtrada = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return itens
    return itens.filter((item) =>
      [item.protocolo, item.nome, item.servicoTitulo, item.descricao, item.contato]
        .join(' ')
        .toLowerCase()
        .includes(termo),
    )
  }, [itens, busca])

  const aoMudarStatus = async (item: Solicitacao, status: StatusSolicitacao) => {
    if (status === item.status) return
    setSalvando(item.id)
    setAviso(null)
    const anterior = item.status
    setItens((atual) => atual.map((i) => (i.id === item.id ? { ...i, status } : i)))
    const { ok, erro } = await atualizarStatusSolicitacao(item.id, status)
    setSalvando(null)
    if (!ok) {
      setItens((atual) => atual.map((i) => (i.id === item.id ? { ...i, status: anterior } : i)))
      setAviso(`Não foi possível atualizar ${item.protocolo}: ${erro ?? 'erro desconhecido'}.`)
      return
    }
    setAviso(`${item.protocolo} atualizado para “${META_STATUS[status].rotulo}”.`)
  }

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="inline-flex items-center gap-2 font-body text-sm text-offwhite-100/70">
          <Loader2 className="h-5 w-5 animate-spin text-accent-400" aria-hidden="true" />
          Verificando sessão…
        </span>
      </div>
    )
  }

  if (!configurado) {
    return (
      <EstadoPainel
        icone={Database}
        irParaHome={irParaHome}
        titulo="Painel indisponível neste ambiente"
        texto={
          <>
            O painel administrativo exige banco de dados ativo, porque a permissão é validada no próprio Supabase — não
            por esconder botões na tela. Configure <code className="text-accent-300">VITE_SUPABASE_URL</code> e{' '}
            <code className="text-accent-300">VITE_SUPABASE_ANON_KEY</code>, aplique as migrações de{' '}
            <code className="text-accent-300">supabase/migrations/</code> e registre o usuário administrador conforme
            documentado em <code className="text-accent-300">docs/CONFIGURACAO.md</code>.
          </>
        }
        acao={
          <button type="button" onClick={irParaHome} className="btn-ghost py-2.5! text-xs!">
            Voltar ao site
          </button>
        }
      />
    )
  }

  if (!usuario) {
    return (
      <EstadoPainel
        icone={ShieldAlert}
        irParaHome={irParaHome}
        titulo="Entre para continuar"
        texto="O painel é restrito. Entre com uma conta Google que esteja registrada como administradora no banco de dados."
        acao={<AuthButton />}
      />
    )
  }

  if (acesso === 'verificando') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="inline-flex items-center gap-2 font-body text-sm text-offwhite-100/70">
          <Loader2 className="h-5 w-5 animate-spin text-accent-400" aria-hidden="true" />
          Consultando permissão no banco…
        </span>
      </div>
    )
  }

  if (acesso === 'negado') {
    return (
      <EstadoPainel
        icone={ShieldAlert}
        irParaHome={irParaHome}
        titulo="Acesso não autorizado"
        texto={
          <>
            Sua conta Google está conectada, mas o banco de dados não a reconhece como administradora — e por isso
            nenhum pedido foi exibido. Para liberar o acesso, é preciso incluir o seu{' '}
            <code className="text-accent-300">user id</code> na tabela{' '}
            <code className="text-accent-300">administradores</code>.
          </>
        }
        acao={
          <button type="button" onClick={irParaHome} className="btn-ghost py-2.5! text-xs!">
            Voltar ao site
          </button>
        }
      />
    )
  }

  if (acesso === 'erro') {
    return (
      <EstadoPainel
        icone={CircleAlert}
        irParaHome={irParaHome}
        titulo="Não foi possível verificar a permissão"
        texto={
          <>
            O banco retornou um erro ao consultar a função <code className="text-accent-300">skillcraft_eh_admin()</code>
            : {erroAcesso}. Aplique a migração <code className="text-accent-300">0003_administradores.sql</code> e tente
            novamente.
          </>
        }
        acao={
          <>
            <button type="button" onClick={() => void verificar()} className="btn-primary py-2.5! text-xs!">
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Tentar novamente
            </button>
            <button type="button" onClick={irParaHome} className="btn-ghost py-2.5! text-xs!">
              Voltar ao site
            </button>
          </>
        }
      />
    )
  }

  return (
    <PageShell
      kicker="Painel administrativo"
      titulo="Solicitações recebidas"
      lead="Visão restrita a perfis administradores validados no banco. Aqui é possível acompanhar todos os pedidos e atualizar o status de cada um."
      irParaHome={irParaHome}
      aside={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-center gap-2.5 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-2.5 font-caption text-xs text-emerald-200">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Permissão confirmada pelo banco de dados
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <label htmlFor="busca-admin" className="sr-only">
                Buscar solicitação
              </label>
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-offwhite-100/40"
                aria-hidden="true"
              />
              <input
                id="busca-admin"
                type="search"
                className="field-input py-2.5! pl-10!"
                placeholder="Protocolo, nome, serviço…"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => void carregarLista()}
              disabled={carregandoLista}
              className="btn-ghost px-4! py-2.5! text-xs!"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${carregandoLista ? 'animate-spin' : ''}`} aria-hidden="true" />
              Atualizar
            </button>
          </div>
        </div>
      }
    >
      {aviso && (
        <p
          role="status"
          className="mb-5 rounded-xl border border-accent-400/25 bg-accent-400/10 px-4 py-3 font-caption text-xs text-accent-300"
        >
          {aviso}
        </p>
      )}
      {erroLista && (
        <p className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 font-caption text-xs leading-relaxed text-amber-200">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {erroLista}
        </p>
      )}

      <div className="card-surface p-6 sm:p-8">
        <p className="font-caption text-xs text-offwhite-100/50">
          {filtrada.length} de {itens.length} solicitações · até 200 registros por consulta
        </p>

        {carregandoLista && itens.length === 0 ? (
          <p className="mt-6 inline-flex items-center gap-2 font-body text-sm text-offwhite-100/65">
            <Loader2 className="h-4 w-4 animate-spin text-accent-400" aria-hidden="true" />
            Carregando solicitações…
          </p>
        ) : itens.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-offwhite-50/15 px-5 py-10 text-center font-body text-sm text-offwhite-100/55">
            Nenhuma solicitação gravada no banco até agora.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {filtrada.map((item) => (
              <li key={item.id} className="rounded-2xl border border-offwhite-50/10 bg-deep-950/40 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-sm font-bold text-offwhite-50">{item.servicoTitulo}</p>
                    <p className="mt-1 font-caption text-xs text-offwhite-100/45">
                      {item.protocolo} · {item.nome || 'sem nome'} · {formatarDataHora(item.criadaEm)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor={`status-${item.id}`} className="sr-only">
                      Status da solicitação {item.protocolo}
                    </label>
                    <select
                      id={`status-${item.id}`}
                      className="field-input w-auto py-2! text-xs!"
                      value={item.status}
                      disabled={salvando === item.id}
                      onChange={(e) => void aoMudarStatus(item, e.target.value as StatusSolicitacao)}
                    >
                      {STATUS_SOLICITACAO.map((status) => (
                        <option key={status} value={status} className="text-offwhite-50">
                          {META_STATUS[status].rotulo}
                        </option>
                      ))}
                    </select>
                    {salvando === item.id && (
                      <Loader2 className="h-4 w-4 animate-spin text-accent-400" aria-hidden="true" />
                    )}
                  </div>
                </div>
                <p className="mt-3 font-body text-sm leading-relaxed text-offwhite-100/70">{item.descricao}</p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 font-caption text-xs text-offwhite-100/50">
                  <span>Contato: {item.contato || '—'}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    Prazo desejado: {formatarData(item.prazo) ?? 'não informado'}
                  </span>
                  <span>Aluno: {item.usuarioId ? 'identificado na sessão' : 'enviado sem sessão'}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  )
}
