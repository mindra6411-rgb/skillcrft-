import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useScroll } from 'framer-motion'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { NAV_LINKS } from '../../config/site'
import { irParaSecao, type Rota } from '../../hooks/useHashRoute'
import { useScrollSpy } from '../../hooks/useScrollSpy'
import { Logo } from '../brand/Logo'
import { AuthButton } from '../auth/AuthButton'

type NavbarProps = {
  rota: Rota
  irParaHome: () => void
}

const IDS_SECOES = NAV_LINKS.map((l) => l.id)

export function Navbar({ rota, irParaHome }: NavbarProps) {
  const [rolou, setRolou] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)
  const secaoAtiva = useScrollSpy(IDS_SECOES)
  const { scrollYProgress } = useScroll()

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 24)
    aoRolar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [])

  useEffect(() => {
    setMenuAberto(false)
  }, [rota])

  const irPara = (id: string) => {
    setMenuAberto(false)
    if (rota !== 'home') {
      irParaHome()
      window.setTimeout(() => irParaSecao(id), 90)
      return
    }
    irParaSecao(id)
  }

  return (
    <>
      {/* indicador de progresso de leitura */}
      <motion.span
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-skill-500 via-accent-400 to-accent-300"
        style={{ scaleX: scrollYProgress }}
      />

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          rolou || menuAberto
            ? 'border-b border-offwhite-50/8 bg-deep-950/80 shadow-card backdrop-blur-xl'
            : 'border-b border-transparent bg-gradient-to-b from-deep-950/70 to-transparent'
        }`}
      >
        <nav aria-label="Principal" className="container-site flex h-16 items-center justify-between gap-4 sm:h-20">
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault()
              setMenuAberto(false)
              if (rota !== 'home') {
                irParaHome()
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
            className="rounded-lg transition-opacity hover:opacity-90"
            aria-label="Skill Craft — início"
          >
            <Logo variante="navbar" />
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    irPara(link.id)
                  }}
                  aria-current={rota === 'home' && secaoAtiva === link.id ? 'true' : undefined}
                  className={`relative rounded-lg px-3.5 py-2 font-display text-[0.82rem] font-semibold transition-colors duration-300 ${
                    rota === 'home' && secaoAtiva === link.id
                      ? 'text-offwhite-50'
                      : 'text-offwhite-100/60 hover:text-offwhite-50'
                  }`}
                >
                  {link.label}
                  {rota === 'home' && secaoAtiva === link.id && (
                    <motion.span
                      layoutId="nav-ativo"
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-skill-500 to-accent-400 shadow-glow-soft"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <AuthButton compacto />
            <button type="button" onClick={() => irPara('contato')} className="btn-primary hidden px-5! py-2.5! sm:inline-flex">
              Solicitar serviço
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-offwhite-50/15 text-offwhite-50 transition-all duration-300 hover:border-accent-400/60 hover:bg-accent-400/10 lg:hidden"
              aria-expanded={menuAberto}
              aria-controls="menu-mobile"
              aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
              onClick={() => setMenuAberto((v) => !v)}
            >
              {menuAberto ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {menuAberto && (
            <motion.div
              id="menu-mobile"
              className="border-t border-offwhite-50/8 bg-deep-950/95 backdrop-blur-xl lg:hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <ul className="container-site flex flex-col gap-1 py-4">
                {NAV_LINKS.map((link) => (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      onClick={(e) => {
                        e.preventDefault()
                        irPara(link.id)
                      }}
                      className="block rounded-xl px-3 py-3 font-display text-sm font-semibold text-offwhite-100/75 transition-colors hover:bg-accent-400/10 hover:text-offwhite-50"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li className="pt-2">
                  <button type="button" onClick={() => irPara('contato')} className="btn-primary w-full">
                    Solicitar serviço
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
