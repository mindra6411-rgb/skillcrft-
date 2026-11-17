import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, KeyRound, Loader2, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { AuthModal } from '../auth/AuthModal'
import { Logo } from '../brand/Logo'

/**
 * Rota #/redefinir-senha — destino do link enviado por e-mail.
 *
 * Por que existe: com autenticação por e-mail e senha, o link de recuperação
 * precisa de uma tela para o usuário escolher a nova senha. O Supabase devolve
 * a sessão de recuperação no fragmento da URL; o AuthContext limpa esses tokens
 * e redireciona para cá.
 *
 * Sem sessão válida (link expirado, aberto em outro navegador ou já usado), a
 * tela não finge que funcionou: orienta a pedir um novo link.
 */
export function RedefinirSenha({ irParaHome }: { irParaHome: () => void }) {
  const { usuario, carregando, configurado } = useAuth()
  const [modal, setModal] = useState(false)

  useEffect(() => {
    if (carregando) return
    if (usuario) setModal(true)
  }, [carregando, usuario])

  return (
    <div className="flex min-h-screen items-center justify-center px-5 pt-24 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card-surface w-full max-w-md p-8 text-center sm:p-10"
      >
        <Logo variante="lockup-white" className="mx-auto h-20 w-auto" />
        <span className="mx-auto mt-6 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-skill-500/15 text-accent-400">
          <KeyRound className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-offwhite-50">Definir nova senha</h1>

        {carregando ? (
          <p className="mt-4 inline-flex items-center gap-2 font-body text-sm text-offwhite-100/70">
            <Loader2 className="h-4 w-4 animate-spin text-accent-400" aria-hidden="true" />
            Validando o link…
          </p>
        ) : !configurado ? (
          <p className="mt-4 font-body text-sm leading-relaxed text-offwhite-100/70">
            A autenticação não está configurada neste ambiente, então nenhum link de recuperação pode ser validado.
          </p>
        ) : usuario ? (
          <>
            <p className="mt-3 font-body text-sm leading-relaxed text-offwhite-100/70">
              Link validado para <strong className="text-offwhite-50">{usuario.email}</strong>. Escolha a nova senha.
            </p>
            <button type="button" onClick={() => setModal(true)} className="btn-primary mt-6 w-full py-3! text-sm!">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Escolher nova senha
            </button>
          </>
        ) : (
          <>
            <p className="mt-3 font-body text-sm leading-relaxed text-offwhite-100/70">
              Este link não está mais válido — ele pode ter expirado, já ter sido usado ou ter sido aberto em outro
              navegador. Por segurança, pedidos assim precisam ser refeitos.
            </p>
            <a href="#/app" className="btn-primary mt-6 inline-flex py-3! text-sm!">
              Pedir um novo link
            </a>
          </>
        )}

        <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
          <button type="button" onClick={irParaHome} className="btn-ghost px-3! py-2.5! text-xs!">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Ir para o site
          </button>
          <a href="#/ajuda" className="btn-ghost px-3! py-2.5! text-xs!">
            Central de ajuda
          </a>
        </div>
      </motion.div>

      <AuthModal
        aberto={modal}
        modo="redefinir"
        fechar={() => setModal(false)}
        irParaModo={(m) => (m === 'entrar' ? irParaHome() : setModal(true))}
      />
    </div>
  )
}
