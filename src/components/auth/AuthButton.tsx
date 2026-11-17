import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { KeyRound, Loader2, LogIn, LogOut, ShieldCheck, UserRound } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { PERFIS } from '../../lib/papeis'
import { nomeDoUsuario } from '../../lib/auth'
import { AuthModal, type ModoAuth } from './AuthModal'

type Props = {
  compacto?: boolean
  /** Modo inicial ao abrir o modal (ex.: redefinir senha a partir de #/redefinir-senha). */
  modoInicial?: ModoAuth
  /** Abre o modal automaticamente (usado pela rota de redefinição). */
  abrirAutomaticamente?: boolean
  aoAbrirModal?: () => void
}

/**
 * Botão de conta do cabeçalho.
 *
 * Antes este botão iniciava OAuth com Google. Agora ele abre o modal de
 * e-mail + senha. O papel exibido vem do banco (`useAuth().papel`), nunca de
 * dado local — se a pessoa alterar o JavaScript, o menu pode até mudar de
 * aparência, mas o banco continua negando leitura e escrita indevidas.
 */
export function AuthButton({ compacto = false, modoInicial = 'entrar', abrirAutomaticamente = false, aoAbrirModal }: Props) {
  const { usuario, carregando, papel, sair } = useAuth()
  const [modal, setModal] = useState<{ aberto: boolean; modo: ModoAuth }>({
    aberto: abrirAutomaticamente,
    modo: modoInicial,
  })
  const [menuAberto, setMenuAberto] = useState(false)
  const refMenu = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuAberto) return
    const aoClicarFora = (e: MouseEvent) => {
      if (refMenu.current && !refMenu.current.contains(e.target as Node)) setMenuAberto(false)
    }
    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [menuAberto])

  const abrir = useCallback(
    (modo: ModoAuth) => {
      setModal({ aberto: true, modo })
      aoAbrirModal?.()
    },
    [aoAbrirModal],
  )

  if (carregando) {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-xl border border-offwhite-50/10 px-4 py-2.5 font-display text-xs font-semibold text-offwhite-100/60 ${
          compacto ? '' : 'w-full justify-center'
        }`}
        aria-busy="true"
      >
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Verificando sessão…
      </span>
    )
  }

  if (usuario) {
    const nome = nomeDoUsuario(usuario) || 'Conta'
    const iniciais = nome
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
    const perfil = PERFIS[papel]

    return (
      <div className="relative" ref={refMenu}>
        <button
          type="button"
          onClick={() => setMenuAberto((v) => !v)}
          aria-expanded={menuAberto}
          aria-haspopup="menu"
          className="flex items-center gap-2 rounded-xl border border-offwhite-50/15 py-1.5 pr-3 pl-1.5 transition-colors hover:border-accent-400/50"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-skill-500 font-display text-[0.65rem] font-bold text-offwhite-50">
            {iniciais || <UserRound className="h-3.5 w-3.5" aria-hidden="true" />}
          </span>
          <span className="hidden max-w-28 truncate font-display text-xs font-semibold text-offwhite-50 sm:block">
            {nome.split(' ')[0]}
          </span>
        </button>

        <AnimatePresence>
          {menuAberto && (
            <motion.div
              role="menu"
              className="card-surface absolute right-0 z-50 mt-2 w-64 overflow-hidden bg-deep-900/95 p-1.5"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.18 }}
            >
              <div className="px-3 py-2.5">
                <p className="truncate font-display text-sm font-bold text-offwhite-50">{nome}</p>
                <p className="truncate font-caption text-xs text-offwhite-100/60">{usuario.email}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-accent-400/25 bg-accent-400/10 px-2 py-0.5 font-caption text-[0.65rem] font-semibold text-accent-300">
                  <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                  {perfil.rotulo}
                </p>
              </div>
              <a
                href="#/app"
                role="menuitem"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-body text-sm text-offwhite-100/80 transition-colors hover:bg-offwhite-50/5 hover:text-offwhite-50"
                onClick={() => setMenuAberto(false)}
              >
                <UserRound className="h-4 w-4 text-accent-400" aria-hidden="true" />
                Área do aluno
              </a>
              {perfil.painelAdministrativo && (
                <a
                  href="#/admin"
                  role="menuitem"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-body text-sm text-offwhite-100/80 transition-colors hover:bg-offwhite-50/5 hover:text-offwhite-50"
                  onClick={() => setMenuAberto(false)}
                >
                  <ShieldCheck className="h-4 w-4 text-accent-400" aria-hidden="true" />
                  Painel administrativo
                </a>
              )}
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 font-body text-sm text-offwhite-100/80 transition-colors hover:bg-offwhite-50/5 hover:text-offwhite-50"
                onClick={() => {
                  setMenuAberto(false)
                  abrir('trocar-senha')
                }}
              >
                <KeyRound className="h-4 w-4 text-accent-400" aria-hidden="true" />
                Alterar senha
              </button>
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 font-body text-sm text-offwhite-100/80 transition-colors hover:bg-offwhite-50/5 hover:text-offwhite-50"
                onClick={() => {
                  setMenuAberto(false)
                  void sair()
                }}
              >
                <LogOut className="h-4 w-4 text-accent-400" aria-hidden="true" />
                Sair
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AuthModal
          aberto={modal.aberto}
          modo={modal.modo}
          fechar={() => setModal((m) => ({ ...m, aberto: false }))}
          irParaModo={(modo) => setModal({ aberto: true, modo })}
        />
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => abrir(modal.modo)}
        className={`inline-flex items-center justify-center gap-2 rounded-xl border border-offwhite-50/15 bg-offwhite-50/[0.04] font-display text-xs font-bold text-offwhite-50 transition-colors duration-200 hover:border-accent-400/50 hover:bg-offwhite-50/10 ${
          compacto ? 'px-3.5 py-2.5' : 'w-full px-5 py-3'
        }`}
      >
        <LogIn className="h-4 w-4" aria-hidden="true" />
        <span className={compacto ? 'hidden sm:inline' : ''}>Entrar</span>
      </button>
      <AuthModal
        aberto={modal.aberto}
        modo={modal.modo}
        fechar={() => setModal((m) => ({ ...m, aberto: false }))}
        irParaModo={(modo) => setModal({ aberto: true, modo })}
      />
    </>
  )
}
