import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowUpRight,
  ClipboardList,
  Inbox,
  Loader2,
  LogOut,
  Mail,
  MessageCircle,
  Phone,
  TriangleAlert,
} from 'lucide-react'
import { irParaSecao } from '../../hooks/useHashRoute'
import { listarRascunhosLocais, type Solicitacao } from '../../lib/solicitations'
import { supabase } from '../../lib/supabase'
import { formatarDataHora } from '../../lib/validation'
import { useAuth } from '../../context/AuthContext'
import { Logo } from '../brand/Logo'
import { AuthButton } from './AuthButton'
import { GoogleIcon } from './GoogleIcon'

const ICONES_MEIO: Record<string, typeof Mail> = {
  email: Mail,
  whatsapp: MessageCircle,
  telefone: Phone,
}

export function StudentArea({ irParaHome }: { irParaHome: () => void }) {
  const { usuario, carregando, configurado, sair } = useAuth()
  const [remotas, setRemotas] = useState<Solicitacao[] | null>(null)
  const [erroRemoto, setErroRemoto] = useState<string | null>(null)

  useEffect(() => {
    if (!configurado || !usuario) return
    let ativo = true
    supabase
      ?.from('solicitacoes')
      .select('*')
      .eq('usuario_id', usuario.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!ativo) return
        if (error) {
          setErroRemoto(error.message)
          setRemotas([])
          return
        }
        setRemotas(
          (data ?? []).map((linha) => ({
            id: String(linha.id),
            protocolo: String(linha.protocolo ?? '—'),
            criadaEm: String(linha.created_at ?? new Date().toISOString()),
            nome: String(linha.nome ?? ''),
            servicoId: '',
            servicoTitulo: String(linha.servico ?? ''),
            descricao: String(linha.descricao ?? ''),
            meioContato: String(linha.meio_contato ?? ''),
            contato: String(linha.contato ?? ''),
            origem: 'supabase' as const,
            usuarioId: usuario.id,
          })),
        )
      })
    return () => {
      ativo = false
    }
  }, [configurado, usuario])

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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card-surface w-full max-w-md p-8 text-center sm:p-10"
        >
          <Logo variante="lockup-white" className="mx-auto h-20 w-auto" />
          <h1 className="mt-6 font-display text-2xl font-extrabold text-offwhite-50">Área do aluno</h1>
          <p className="mt-3 font-body text-sm leading-relaxed text-offwhite-100/70">
            Entre com sua conta Google para acompanhar suas solicitações e históricos de atendimento da Skill Craft.
          </p>
          <div className="mt-6">
            <AuthButton />
          </div>
          <p className="mt-4 font-caption text-xs text-offwhite-100/50">
            A navegação institucional continua disponível sem login.
          </p>
          <button
            type="button"
            onClick={irParaHome}
            className="btn-ghost mt-6 w-full py-2.5!"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar ao site
          </button>
        </motion.div>
      </div>
    )
  }

  const nome = (usuario.user_metadata?.full_name as string | undefined) || usuario.email || 'Aluno'
  const avatar = usuario.user_metadata?.avatar_url as string | undefined
  const locais = listarRascunhosLocais()
  const lista = [...(remotas ?? []), ...locais].sort((a, b) => b.criadaEm.localeCompare(a.criadaEm))

  const irPara = (id: string) => {
    irParaHome()
    window.setTimeout(() => irParaSecao(id), 90)
  }

  return (
    <div className="container-site min-h-screen pt-28 pb-20 sm:pt-36">
      <motion.header
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card-surface relative overflow-hidden p-7 sm:p-9"
      >
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-skill-500/20 blur-[90px]" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {avatar ? (
              <img src={avatar} alt="" className="h-14 w-14 rounded-2xl object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-skill-500 font-display text-lg font-extrabold text-offwhite-50">
                {nome.slice(0, 1).toUpperCase()}
              </span>
            )}
            <div>
              <p className="font-caption text-xs tracking-[0.16em] text-accent-400 uppercase">Área do aluno</p>
              <h1 className="mt-1 font-display text-2xl font-extrabold text-offwhite-50">Olá, {nome.split(' ')[0]}!</h1>
              <p className="mt-0.5 font-body text-sm text-offwhite-100/60">{usuario.email}</p>
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
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="card-surface p-6 sm:p-8"
          aria-label="Minhas solicitações"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2.5 font-display text-lg font-extrabold text-offwhite-50">
              <ClipboardList className="h-5 w-5 text-accent-400" aria-hidden="true" />
              Minhas solicitações
            </h2>
            <span className="rounded-full border border-offwhite-50/12 px-3 py-1 font-caption text-xs text-offwhite-100/60">
              {lista.length} {lista.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>

          {erroRemoto && (
            <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 font-caption text-xs leading-relaxed text-amber-200">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Não foi possível consultar o histórico no Supabase ({erroRemoto}). Execute a migração
              supabase/migrations/0001_solicitacoes.sql. Exibindo rascunhos locais deste navegador.
            </p>
          )}

          {lista.length === 0 ? (
            <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-offwhite-50/15 px-6 py-12 text-center">
              <Inbox className="h-8 w-8 text-offwhite-100/35" aria-hidden="true" />
              <p className="mt-4 font-display text-sm font-bold text-offwhite-50">Nenhuma solicitação ainda</p>
              <p className="mt-2 max-w-xs font-body text-sm text-offwhite-100/60">
                Quando você solicitar um serviço pelo formulário, ele aparece aqui com protocolo e status.
              </p>
              <button type="button" onClick={() => irPara('servicos')} className="btn-primary mt-6 py-2.5! text-xs!">
                Ver serviços
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <ul className="mt-6 space-y-4">
              {lista.map((item) => {
                const IconeMeio = ICONES_MEIO[item.meioContato] ?? Mail
                return (
                  <li key={`${item.origem}-${item.id}`} className="rounded-2xl border border-offwhite-50/10 bg-deep-900/60 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-display text-sm font-bold text-offwhite-50">{item.servicoTitulo}</p>
                      <span
                        className={`rounded-full px-3 py-1 font-caption text-[0.65rem] font-bold tracking-wide uppercase ${
                          item.origem === 'supabase'
                            ? 'bg-accent-400/15 text-accent-300'
                            : 'bg-amber-300/15 text-amber-200'
                        }`}
                      >
                        {item.origem === 'supabase' ? 'Recebida pela equipe' : 'Rascunho local'}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 font-body text-sm text-offwhite-100/65">{item.descricao}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 font-caption text-xs text-offwhite-100/50">
                      <span>Protocolo {item.protocolo}</span>
                      <span>{formatarDataHora(item.criadaEm)}</span>
                      <span className="inline-flex items-center gap-1.5">
                        <IconeMeio className="h-3.5 w-3.5" aria-hidden="true" />
                        {item.contato}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
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
              <button type="button" onClick={() => irPara('como-funciona')} className="btn-ghost w-full py-2.5! text-xs!">
                Rever etapas do atendimento
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
            </dl>
          </div>
        </motion.aside>
      </div>
    </div>
  )
}
