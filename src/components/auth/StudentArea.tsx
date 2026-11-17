import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Inbox,
  LifeBuoy,
  ListChecks,
  Loader2,
  LogOut,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Sigma,
  TriangleAlert,
  X,
} from 'lucide-react'
import { irParaSecao, type Rota } from '../../hooks/useHashRoute'
import { listarRascunhosLocais, listarSolicitacoesDoAluno, type Solicitacao } from '../../lib/solicitations'
import { CLASSES_TOM, META_STATUS, STATUS_SOLICITACAO } from '../../lib/status'
import { formatarData, formatarDataHora } from '../../lib/validation'
import { useAuth } from '../../context/AuthContext'
import { Logo } from '../brand/Logo'
import { AuthButton } from './AuthButton'
import { GoogleIcon } from './GoogleIcon'

const ICONES_MEIO: Record<string, typeof Mail> = {
  email: Mail,
  whatsapp: MessageCircle,
  telefone: Phone,
}

type Filtro = 'todos' | 'rascunhos' | (typeof STATUS_SOLICITACAO)[number]

const FILTROS: { id: Filtro; rotulo: string }[] = [
  { id: 'todos', rotulo: 'Todos' },
  ...STATUS_SOLICITACAO.map((status) => ({ id: status as Filtro, rotulo: META_STATUS[status].rotulo })),
  { id: 'rascunhos', rotulo: 'Rascunhos locais' },
]

type StudentAreaProps = {
  irParaHome: () => void
  navegar: (destino: Rota) => void
}

export function StudentArea({ irParaHome, navegar }: StudentAreaProps) {
  const { usuario, carregando, configurado, sair } = useAuth()
  const [remotas, setRemotas] = useState<Solicitacao[] | null>(null)
  const [erroRemoto, setErroRemoto] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [aberto, setAberto] = useState<string | null>(null)

  useEffect(() => {
    if (!configurado || !usuario) {
      setRemotas(null)
      return
    }
    let ativo = true
    setErroRemoto(null)
    listarSolicitacoesDoAluno(usuario.id).then(({ dados, erro }) => {
      if (!ativo) return
      setRemotas(dados)
      setErroRemoto(erro)
    })
    return () => {
      ativo = false
    }
  }, [configurado, usuario])

  const locais = useMemo(() => listarRascunhosLocais(), [usuario])

  const lista = useMemo(
    () => [...(remotas ?? []), ...locais].sort((a, b) => b.criadaEm.localeCompare(a.criadaEm)),
    [remotas, locais],
  )

  const filtrada = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return lista.filter((item) => {
      if (filtro === 'rascunhos' && item.origem !== 'local') return false
      if (filtro !== 'todos' && filtro !== 'rascunhos' && item.status !== filtro) return false
      if (!termo) return true
      return [item.protocolo, item.servicoTitulo, item.descricao, item.nome, item.informacoes]
        .join(' ')
        .toLowerCase()
        .includes(termo)
    })
  }, [lista, busca, filtro])

  const contagemPorFiltro = useMemo(() => {
    const mapa = new Map<Filtro, number>()
    mapa.set('todos', lista.length)
    mapa.set('rascunhos', lista.filter((i) => i.origem === 'local').length)
    for (const status of STATUS_SOLICITACAO) {
      mapa.set(status, lista.filter((i) => i.status === status).length)
    }
    return mapa
  }, [lista])

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="inline-flex items-center gap-2 font-body text-sm text-offwhite-100/70">
          <Loader2 className="h-5 w-5 animate-spin text-accent-400" aria-hidden="true" />
          Carregando sessão…
        </span>
      </div>
    )
  }

  if (!usuario) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card-surface w-full max-w-md p-8 text-center sm:p-10"
        >
          <Logo variante="lockup-white" className="mx-auto h-20 w-auto" />
          <h1 className="mt-6 font-display text-2xl font-extrabold text-offwhite-50">Área do aluno</h1>
          <p className="mt-3 font-body text-sm leading-relaxed text-offwhite-100/70">
            Entre com sua conta Google para acompanhar suas solicitações, com busca, filtro por status e detalhes de
            cada pedido.
          </p>
          <div className="mt-6">
            <AuthButton />
          </div>
          <p className="mt-4 font-caption text-xs text-offwhite-100/50">
            A navegação institucional, as ferramentas gratuitas e a central de ajuda continuam disponíveis sem login.
          </p>
          <div className="mt-6 grid gap-2.5 sm:grid-cols-3">
            <button type="button" onClick={irParaHome} className="btn-ghost px-3! py-2.5! text-xs!">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Site
            </button>
            <button type="button" onClick={() => navegar('ferramentas')} className="btn-ghost px-3! py-2.5! text-xs!">
              <Sigma className="h-3.5 w-3.5" aria-hidden="true" />
              Ferramentas
            </button>
            <button type="button" onClick={() => navegar('ajuda')} className="btn-ghost px-3! py-2.5! text-xs!">
              <LifeBuoy className="h-3.5 w-3.5" aria-hidden="true" />
              Ajuda
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const nome = (usuario.user_metadata?.full_name as string | undefined) || usuario.email || 'Aluno'
  const avatar = usuario.user_metadata?.avatar_url as string | undefined

  const irPara = (id: string) => {
    irParaHome()
    window.setTimeout(() => irParaSecao(id), 120)
  }

  return (
    <div className="container-site min-h-screen pt-28 pb-20 sm:pt-36">
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card-surface relative overflow-hidden p-7 sm:p-9"
      >
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {avatar ? (
              <img
                src={avatar}
                alt=""
                className="h-14 w-14 rounded-2xl object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-skill-500 font-display text-lg font-extrabold text-offwhite-50">
                {nome.slice(0, 1).toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <p className="font-caption text-xs tracking-[0.16em] text-accent-400 uppercase">Área do aluno</p>
              <h1 className="mt-1 font-display text-2xl font-extrabold text-offwhite-50">
                Olá, {nome.split(' ')[0]}!
              </h1>
              <p className="mt-0.5 truncate font-body text-sm text-offwhite-100/60">{usuario.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-lg border border-offwhite-50/12 px-3 py-1.5 font-caption text-xs text-offwhite-100/65">
              <GoogleIcon className="h-3.5 w-3.5" />
              Conta Google conectada
            </span>
            <button
              type="button"
              onClick={() => {
                void sair()
                irParaHome()
              }}
              className="btn-ghost px-4! py-2! text-xs!"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Sair
            </button>
          </div>
        </div>
      </motion.header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.45fr_0.55fr]">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06 }}
          className="card-surface p-6 sm:p-8"
          aria-label="Minhas solicitações"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="flex items-center gap-2.5 font-display text-lg font-extrabold text-offwhite-50">
              <ClipboardList className="h-5 w-5 text-accent-400" aria-hidden="true" />
              Minhas solicitações
            </h2>
            <span className="rounded-full border border-offwhite-50/12 px-3 py-1 font-caption text-xs text-offwhite-100/60">
              {filtrada.length} de {lista.length} {lista.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>

          {/* busca e filtros */}
          <div className="mt-5 space-y-3">
            <div className="relative">
              <label htmlFor="busca-solicitacoes" className="sr-only">
                Buscar solicitação por protocolo, serviço ou descrição
              </label>
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-offwhite-100/40"
                aria-hidden="true"
              />
              <input
                id="busca-solicitacoes"
                type="search"
                className="field-input py-2.5! pl-10!"
                placeholder="Buscar por protocolo, serviço ou descrição…"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca('')}
                  aria-label="Limpar busca"
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1 text-offwhite-100/45 transition-colors hover:text-offwhite-50"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Filtrar solicitações por status"
            >
              {FILTROS.map((opcao) => {
                const ativo = filtro === opcao.id
                const total = contagemPorFiltro.get(opcao.id) ?? 0
                return (
                  <button
                    key={opcao.id}
                    type="button"
                    onClick={() => setFiltro(opcao.id)}
                    aria-pressed={ativo}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-caption text-[0.7rem] font-bold transition-colors duration-300 ${
                      ativo
                        ? 'border-accent-400/55 bg-accent-400/14 text-accent-300'
                        : 'border-offwhite-50/12 text-offwhite-100/55 hover:border-offwhite-50/25 hover:text-offwhite-100/85'
                    }`}
                  >
                    {opcao.rotulo}
                    <span className={ativo ? 'text-accent-300/70' : 'text-offwhite-100/35'}>{total}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {erroRemoto && (
            <p className="mt-5 flex items-start gap-2.5 rounded-xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 font-caption text-xs leading-relaxed text-amber-200">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Não foi possível consultar o histórico no banco ({erroRemoto}). Verifique se as migrações de
              supabase/migrations/ foram aplicadas. Exibindo os rascunhos locais deste navegador.
            </p>
          )}

          {!configurado && (
            <p className="mt-5 flex items-start gap-2.5 rounded-xl border border-offwhite-50/12 bg-deep-950/40 px-4 py-3 font-caption text-xs leading-relaxed text-offwhite-100/60">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" />
              Sem banco configurado neste ambiente, o histórico mostra apenas os rascunhos salvos neste navegador. Com
              o Supabase ativo, cada pedido aparece aqui com o status atualizado pela equipe.
            </p>
          )}

          {lista.length === 0 ? (
            <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-offwhite-50/15 px-6 py-12 text-center">
              <Inbox className="h-8 w-8 text-offwhite-100/35" aria-hidden="true" />
              <p className="mt-4 font-display text-sm font-bold text-offwhite-50">Nenhuma solicitação ainda</p>
              <p className="mt-2 max-w-xs font-body text-sm text-offwhite-100/60">
                Quando você solicitar um serviço pelo formulário, ele aparece aqui com protocolo, status e detalhes.
              </p>
              <button type="button" onClick={() => irPara('servicos')} className="btn-primary mt-6 py-2.5! text-xs!">
                Ver serviços
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ) : filtrada.length === 0 ? (
            <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-offwhite-50/15 px-6 py-10 text-center">
              <Search className="h-7 w-7 text-offwhite-100/30" aria-hidden="true" />
              <p className="mt-4 font-display text-sm font-bold text-offwhite-50">Nada encontrado com esses critérios</p>
              <p className="mt-2 max-w-sm font-body text-sm text-offwhite-100/60">
                Você tem {lista.length} {lista.length === 1 ? 'registro' : 'registros'} no histórico, mas nenhum
                corresponde à busca ou ao filtro selecionado.
              </p>
              <button
                type="button"
                onClick={() => {
                  setBusca('')
                  setFiltro('todos')
                }}
                className="btn-ghost mt-6 py-2.5! text-xs!"
              >
                Limpar busca e filtros
              </button>
            </div>
          ) : (
            <ul className="mt-6 space-y-3.5">
              {filtrada.map((item) => {
                const IconeMeio = ICONES_MEIO[item.meioContato] ?? Mail
                const chave = `${item.origem}-${item.id}`
                const expandido = aberto === chave
                const meta = META_STATUS[item.status]
                return (
                  <li
                    key={chave}
                    className="rounded-2xl border border-offwhite-50/10 bg-deep-900/60 transition-colors duration-300 hover:border-offwhite-50/18"
                  >
                    <div className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-display text-sm font-bold text-offwhite-50">{item.servicoTitulo}</p>
                          <p className="mt-1 font-caption text-xs text-offwhite-100/45">
                            Protocolo {item.protocolo} · {formatarDataHora(item.criadaEm)}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {item.origem === 'local' && (
                            <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2.5 py-1 font-caption text-[0.62rem] font-bold tracking-wide text-amber-200 uppercase">
                              Rascunho local
                            </span>
                          )}
                          <span
                            className={`rounded-full border px-2.5 py-1 font-caption text-[0.62rem] font-bold tracking-wide uppercase ${CLASSES_TOM[meta.tom]}`}
                            title={meta.descricao}
                          >
                            {meta.rotulo}
                          </span>
                        </div>
                      </div>

                      <p className="mt-3 line-clamp-2 font-body text-sm text-offwhite-100/65">{item.descricao}</p>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5 font-caption text-xs text-offwhite-100/50">
                          <IconeMeio className="h-3.5 w-3.5" aria-hidden="true" />
                          Retorno por {item.meioContato || 'contato informado'} · {item.contato}
                        </span>
                        <button
                          type="button"
                          onClick={() => setAberto(expandido ? null : chave)}
                          aria-expanded={expandido}
                          aria-controls={`detalhe-${chave}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-offwhite-50/12 px-3 py-1.5 font-caption text-[0.7rem] font-bold text-offwhite-100/65 transition-colors duration-300 hover:border-accent-400/50 hover:text-offwhite-50"
                        >
                          {expandido ? 'Ocultar detalhes' : 'Ver detalhes'}
                          <ChevronDown
                            className={`h-3.5 w-3.5 transition-transform duration-300 ${expandido ? 'rotate-180' : ''}`}
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </div>

                    <div
                      id={`detalhe-${chave}`}
                      role="region"
                      aria-label={`Detalhes da solicitação ${item.protocolo}`}
                      hidden={!expandido}
                      className="border-t border-offwhite-50/8 px-5 py-5"
                    >
                      <dl className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <dt className="font-caption text-[0.65rem] tracking-[0.16em] text-offwhite-100/40 uppercase">
                            Nome informado
                          </dt>
                          <dd className="mt-1 font-body text-sm text-offwhite-50">{item.nome || '—'}</dd>
                        </div>
                        <div>
                          <dt className="font-caption text-[0.65rem] tracking-[0.16em] text-offwhite-100/40 uppercase">
                            Prazo desejado
                          </dt>
                          <dd className="mt-1 inline-flex items-center gap-1.5 font-body text-sm text-offwhite-50">
                            <CalendarDays className="h-3.5 w-3.5 text-accent-400" aria-hidden="true" />
                            {formatarData(item.prazo) ?? 'Não informado'}
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="font-caption text-[0.65rem] tracking-[0.16em] text-offwhite-100/40 uppercase">
                            Descrição completa
                          </dt>
                          <dd className="mt-1 font-body text-sm leading-relaxed text-offwhite-100/75 whitespace-pre-line">
                            {item.descricao}
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="font-caption text-[0.65rem] tracking-[0.16em] text-offwhite-100/40 uppercase">
                            Informações complementares
                          </dt>
                          <dd className="mt-1 font-body text-sm leading-relaxed text-offwhite-100/75 whitespace-pre-line">
                            {item.informacoes || '—'}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-caption text-[0.65rem] tracking-[0.16em] text-offwhite-100/40 uppercase">
                            Situação
                          </dt>
                          <dd className="mt-1 font-body text-sm text-offwhite-100/75">{meta.descricao}</dd>
                        </div>
                        <div>
                          <dt className="font-caption text-[0.65rem] tracking-[0.16em] text-offwhite-100/40 uppercase">
                            Origem do registro
                          </dt>
                          <dd className="mt-1 font-body text-sm text-offwhite-100/75">
                            {item.origem === 'supabase'
                              ? 'Gravado no banco de dados da equipe'
                              : 'Salvo apenas neste navegador'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="space-y-6"
        >
          <div className="card-surface p-6">
            <h2 className="font-display text-sm font-extrabold tracking-wide text-offwhite-50 uppercase">Atalhos</h2>
            <div className="mt-4 space-y-2.5">
              <button type="button" onClick={() => irPara('contato')} className="btn-primary w-full py-2.5! text-xs!">
                Solicitar serviço
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => irPara('servicos')} className="btn-ghost w-full py-2.5! text-xs!">
                Ver serviços e preços
              </button>
              <button type="button" onClick={() => navegar('ferramentas')} className="btn-ghost w-full py-2.5! text-xs!">
                <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
                Ferramentas de estudo
              </button>
              <button type="button" onClick={() => navegar('ajuda')} className="btn-ghost w-full py-2.5! text-xs!">
                <LifeBuoy className="h-3.5 w-3.5" aria-hidden="true" />
                Central de ajuda
              </button>
            </div>
          </div>

          <div className="card-surface p-6">
            <h2 className="font-display text-sm font-extrabold tracking-wide text-offwhite-50 uppercase">Sessão</h2>
            <dl className="mt-4 space-y-3 font-body text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-offwhite-100/55">Provedor</dt>
                <dd className="inline-flex items-center gap-1.5 text-offwhite-50">
                  <GoogleIcon className="h-3.5 w-3.5" /> Google
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-offwhite-100/55">Conta</dt>
                <dd className="truncate text-offwhite-50">{usuario.email}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-offwhite-100/55">Aluno desde</dt>
                <dd className="text-offwhite-50">{formatarDataHora(usuario.created_at)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-offwhite-100/55">Banco de dados</dt>
                <dd className={configurado ? 'text-emerald-300' : 'text-amber-200'}>
                  {configurado ? 'Conectado' : 'Não configurado'}
                </dd>
              </div>
            </dl>
          </div>
        </motion.aside>
      </div>
    </div>
  )
}
