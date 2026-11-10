import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { SLOGAN_PRINCIPAL } from '../../config/site'

const CHAVE_SESSAO = 'skillcraft:intro-vista'
const DURACAO_TOTAL_MS = 3200

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Abertura cinematográfica da Skill Craft:
 * fundo Deep Slate → linhas geométricas → construção do símbolo SC →
 * encaixe das formas → logotipo oficial → transição para a página inicial.
 * Roda uma vez por sessão, pode ser pulada e respeita prefers-reduced-motion.
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
          exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.55, ease: EASE } }}
          onClick={pular}
        >
          {/* brilho ambiente */}
          <motion.div
            aria-hidden="true"
            className="absolute h-[46rem] w-[46rem] rounded-full bg-skill-500/20 blur-[120px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0.5] }}
            transition={{ duration: 2.4, times: [0, 0.5, 1] }}
          />

          <div className="relative flex flex-col items-center px-6">
            {/* Construção geométrica do símbolo */}
            <motion.svg
              viewBox="0 0 320 320"
              className="h-44 w-44 sm:h-56 sm:w-56"
              aria-hidden="true"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0, scale: 0.86, transition: { delay: 1.75, duration: 0.45, ease: EASE } }}
            >
              {/* linhas geométricas de construção */}
              {[
                'M40 92 L280 232',
                'M40 232 L280 92',
                'M160 28 L160 296',
              ].map((d, i) => (
                <motion.path
                  key={d}
                  d={d}
                  stroke="#6B8CFF"
                  strokeOpacity={0.28}
                  strokeWidth={1}
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.12, duration: 0.7, ease: 'easeInOut' }}
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
                transition={{ delay: 0.45, duration: 0.85, ease: 'easeInOut' }}
              />
              {/* encaixe das faces isométricas */}
              <motion.polygon
                points="160,66 242,113 160,160 78,113"
                fill="#3155D9"
                initial={{ opacity: 0, y: -46 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.5, ease: EASE }}
              />
              <motion.polygon
                points="78,113 160,160 160,254 78,207"
                fill="#17244E"
                initial={{ opacity: 0, x: -52 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.14, duration: 0.5, ease: EASE }}
              />
              <motion.polygon
                points="242,113 160,160 160,254 242,207"
                fill="#6B8CFF"
                initial={{ opacity: 0, x: 52 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.28, duration: 0.5, ease: EASE }}
              />
              {/* recorte em "S" sugerindo o monograma */}
              <motion.path
                d="M118 138 L160 114 L202 138 L160 162 Z M136 172 L160 186 L160 214 L136 200 Z"
                fill="#080F24"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.45, duration: 0.4, ease: EASE }}
              />
            </motion.svg>

            {/* Logotipo oficial */}
            <motion.img
              src="/brand/logo-white.webp"
              alt="Skill Craft"
              width={669}
              height={592}
              className="absolute top-1/2 left-1/2 h-40 w-auto -translate-x-1/2 -translate-y-[62%] sm:h-52"
              initial={{ opacity: 0, scale: 0.9, y: '-58%' }}
              animate={{ opacity: 1, scale: 1, y: '-62%' }}
              transition={{ delay: 1.85, duration: 0.7, ease: EASE }}
            />

            <motion.p
              className="absolute top-1/2 mt-24 font-caption text-sm tracking-[0.18em] text-accent-300 uppercase sm:mt-28"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.35, duration: 0.6, ease: EASE }}
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
