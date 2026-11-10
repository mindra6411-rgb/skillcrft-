import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, LogOut, UserRound } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { GoogleIcon } from './GoogleIcon'
import { AuthModal } from './AuthModal'

export function AuthButton({ compacto = false }: { compacto?: boolean }) {
  const { usuario, carregando, entrarComGoogle, sair } = useAuth()
  const [modal, setModal] = useState<{ aberto: boolean; modo: 'pendente' | 'erro'; erro?: string }>({
    aberto: false,
    modo: 'pendente',
  })
  const [menuAberto, setMenuAberto] = useState(false)
  const [entrando, setEntrando] = useState(false)
  const refMenu = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuAberto) return
    const aoClicarFora = (e: MouseEvent) => {
      if (refMenu.current && !refMenu.current.contains(e.target as Node)) setMenuAberto(false)
    }
    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [menuAberto])

  const aoClicarLogin = async () => {
    setEntrando(true)
    const resultado = await entrarComGoogle()
    setEntrando(false)
    if (resultado.pendente) setModal({ aberto: true, modo: 'pendente' })
    else if (resultado.erro) setModal({ aberto: true, modo: 'erro', erro: resultado.erro })
  }

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
    const nome = (usuario.user_metadata?.full_name as string | undefined) || usuario.email || 'Aluno'
    const iniciais = nome
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
    const avatar = usuario.user_metadata?.avatar_url as string | undefined

    return (
      <div className="relative" ref={refMenu}>
        <button
          type="button"
          onClick={() => setMenuAberto((v) => !v)}
          aria-expanded={menuAberto}
          aria-haspopup="menu"
          className="flex items-center gap-2 rounded-xl border border-offwhite-50/15 py-1.5 pr-3 pl-1.5 transition-colors hover:border-accent-400/50"
        >
          {avatar ? (
            <img src={avatar} alt="" className="h-7 w-7 rounded-lg object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-skill-500 font-display text-[0.65rem] font-bold text-offwhite-50">
              {iniciais}
            </span>
          )}
          <span className="hidden max-w-28 truncate font-display text-xs font-semibold text-offwhite-50 sm:block">
            {nome.split(' ')[0]}
          </span>
        </button>

        <AnimatePresence>
          {menuAberto && (
            <motion.div
              role="menu"
              className="card-surface absolute right-0 z-50 mt-2 w-60 overflow-hidden bg-deep-900/95 p-1.5"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.18 }}
            >
              <div className="px-3 py-2.5">
                <p className="truncate font-display text-sm font-bold text-offwhite-50">{nome}</p>
                <p className="truncate font-caption text-xs text-offwhite-100/60">{usuario.email}</p>
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
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={aoClicarLogin}
        disabled={entrando}
        className={`inline-flex items-center justify-center gap-2 rounded-xl border border-offwhite-50/15 bg-offwhite-50/[0.04] font-display text-xs font-bold text-offwhite-50 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-400/50 hover:bg-offwhite-50/10 active:translate-y-0 disabled:pointer-events-none disabled:opacity-60 ${
          compacto ? 'px-3.5 py-2.5' : 'w-full px-5 py-3'
        }`}
      >
        {entrando ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <GoogleIcon className="h-4 w-4" />}
        <span className={compacto ? 'hidden sm:inline' : ''}>Entrar com Google</span>
        {compacto && <span className="sm:hidden">Entrar</span>}
      </button>
      <AuthModal aberto={modal.aberto} modo={modal.modo} erro={modal.erro} fechar={() => setModal((m) => ({ ...m, aberto: false }))} />
    </>
  )
}
