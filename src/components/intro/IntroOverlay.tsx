import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { SLOGAN_PRINCIPAL } from '../../config/site'

const CHAVE_SESSAO = 'skillcraft:intro-vista'
const DURACAO_TOTAL_MS = 3600

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Abertura cinematográfica da Skill Craft:
 * 1. fundo Deep Slate · 2. linhas geométricas · 3. construção do símbolo SC ·
 * 4. encaixe das estruturas · 5. iluminação azul · 6. logotipo oficial ·
 * 7. transição suave para o Hero.
 * Rápida, pulável (clique/Esc), 1× por sessão e respeita prefers-reduced-motion.
 */
export function IntroOverlay({ onConcluir }: { onConcluir?: () => void }) {
  const reduzido = useReducedMotion()
  const [visivel, setVisivel] = useState(() => {
    if (typeof window === 'undefined') return false
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    try {
      return sessionStorage.getItem(CHAVE_SESSAO) !== '1'
    } catch {
      return true
    }
  })

  useEffect(() => {
    if (!visivel) return
    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(() => setVisivel(false), DURACAO_TOTAL_MS)
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVisivel(false)
    }
    window.addEventListener('keydown', aoTeclar)
    return () => {
      document.body.style.overflow = ''
      window.clearTimeout(timer)
      window.removeEventListener('keydown', aoTeclar)
    }
  }, [visivel])

  useEffect(() => {
    if (!visivel) {
      onConcluir?.()
      try {
        sessionStorage.setItem(CHAVE_SESSAO, '1')
      } catch {
        /* sem armazenamento disponível */
      }
    }
  }, [visivel, onConcluir])

  if (reduzido) return null

  const pular = () => setVisivel(false)

  return (
    <AnimatePresence>
      {visivel && (
        <motion.div
          key="intro-skill-craft"
          role="presentation"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-deep-950"
          exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.6, ease: EASE } }}
          onClick={pular}
        >
          {/* iluminação ambiente que respira */}
          <motion.div
            aria-hidden="true"
            className="absolute h-[48rem] w-[48rem] rounded-full bg-skill-500/25 blur-[130px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.55, 0.85, 0.6], scale: [0.8, 1, 1.15, 1.2] }}
            transition={{ duration: 3.2, times: [0, 0.4, 0.62, 1] }}
          />

          <div className="relative flex flex-col items-center px-6">
            {/* construção geométrica do símbolo */}
            <motion.svg
              viewBox="0 0 320 320"
              className="h-44 w-44 sm:h-56 sm:w-56"
              aria-hidden="true"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0, scale: 0.84, transition: { delay: 1.95, duration: 0.5, ease: EASE } }}
            >
              {/* linhas geométricas de construção */}
              {['M40 92 L280 232', 'M40 232 L280 92', 'M160 28 L160 296'].map((d, i) => (
                <motion.path
                  key={d}
                  d={d}
                  stroke="#6B8CFF"
                  strokeOpacity={0.3}
                  strokeWidth={1}
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.12 + i * 0.1, duration: 0.65, ease: 'easeInOut' }}
                />
              ))}
              {/* contorno hexagonal */}
              <motion.path
                d="M160 66 L242 113 L242 207 L160 254 L78 207 L78 113 Z"
                stroke="#6B8CFF"
                strokeWidth={2}
                fill="none"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.4, duration: 0.8, ease: 'easeInOut' }}
              />
              {/* encaixe das faces isométricas */}
              <motion.polygon
                points="160,66 242,113 160,160 78,113"
                fill="#3155D9"
                initial={{ opacity: 0, y: -48 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.95, duration: 0.5, ease: EASE }}
              />
              <motion.polygon
                points="78,113 160,160 160,254 78,207"
                fill="#17244E"
                initial={{ opacity: 0, x: -54 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1, duration: 0.5, ease: EASE }}
              />
              <motion.polygon
                points="242,113 160,160 160,254 242,207"
                fill="#6B8CFF"
                initial={{ opacity: 0, x: 54 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.25, duration: 0.5, ease: EASE }}
              />
              <motion.path
                d="M118 138 L160 114 L202 138 L160 162 Z M136 172 L160 186 L160 214 L136 200 Z"
                fill="#080F24"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.42, duration: 0.4, ease: EASE }}
              />
              {/* iluminação azul percorrendo o símbolo */}
              <motion.path
                d="M160 66 L242 113 L242 207 L160 254 L78 207 L78 113 Z"
                stroke="#93ABFF"
                strokeWidth={3}
                fill="none"
                strokeLinejoin="round"
                style={{ filter: 'drop-shadow(0 0 10px rgba(107,140,255,0.9))' }}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: [0, 1], opacity: [0, 1, 0] }}
                transition={{ delay: 1.6, duration: 0.75, times: [0, 0.55, 1], ease: 'easeInOut' }}
              />
            </motion.svg>

            {/* logotipo oficial com varredura de luz */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[62%] overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.05, duration: 0.7, ease: EASE }}
            >
              <img
                src="/brand/logo-white.webp"
                alt="Skill Craft"
                width={669}
                height={592}
                className="h-40 w-auto sm:h-52"
              />
              <motion.span
                aria-hidden="true"
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-accent-300/45 to-transparent"
                style={{ filter: 'blur(6px)' }}
                initial={{ left: '-40%' }}
                animate={{ left: '120%' }}
                transition={{ delay: 2.25, duration: 0.9, ease: 'easeInOut' }}
              />
            </motion.div>

            <motion.p
              className="absolute top-1/2 mt-24 font-caption text-sm tracking-[0.2em] text-accent-300 uppercase sm:mt-28"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.6, duration: 0.6, ease: EASE }}
            >
              {SLOGAN_PRINCIPAL}
            </motion.p>
          </div>

          <motion.button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              pular()
            }}
            className="absolute right-5 bottom-5 rounded-lg border border-offwhite-50/15 px-4 py-2 font-caption text-xs tracking-wide text-offwhite-100/70 transition-colors hover:border-accent-400/50 hover:text-offwhite-50 sm:right-8 sm:bottom-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            Pular introdução · Esc
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
