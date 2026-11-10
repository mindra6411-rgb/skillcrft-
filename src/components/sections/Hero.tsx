import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ChevronDown, Sparkles } from 'lucide-react'
import { SLOGAN_PRINCIPAL } from '../../config/site'
import { irParaSecao } from '../../hooks/useHashRoute'
import { CountUp } from '../ui/CountUp'

const EASE = [0.22, 1, 0.36, 1] as const

const NUMEROS = [
  { valor: 5, sufixo: '', rotulo: 'serviços oficiais' },
  { valor: 3, sufixo: '', rotulo: 'áreas integradas' },
  { valor: 100, sufixo: '%', rotulo: 'atendimento digital' },
]

export function Hero({ iniciar }: { iniciar: boolean }) {
  const reduzido = useReducedMotion()
  const [videoOk, setVideoOk] = useState(true)
  const refSecao = useRef<HTMLElement>(null)
  const refVideo = useRef<HTMLVideoElement>(null)

  // pausa o vídeo quando o Hero sai da tela (desempenho em celulares)
  useEffect(() => {
    const video = refVideo.current
    const secao = refSecao.current
    if (!video || !secao || reduzido) return
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) void video.play().catch(() => undefined)
        else video.pause()
      },
      { threshold: 0.08 },
    )
    observador.observe(secao)
    return () => observador.disconnect()
  }, [reduzido, videoOk])

  const animar = (delay: number) => ({
    initial: { opacity: 0, y: 30 },
    animate: iniciar ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 },
    transition: { duration: 0.85, delay, ease: EASE },
  })

  return (
    <section ref={refSecao} id="inicio" className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden">
      {/* vídeo de fundo tecnológico (loop sem emenda, sem áudio, gerado para a marca) */}
      <div aria-hidden="true" className="absolute inset-0">
        {reduzido || !videoOk ? (
          <img src="/video/hero-poster.webp" alt="" className="h-full w-full object-cover" />
        ) : (
          <video
            ref={refVideo}
            className="h-full w-full object-cover"
            src="/video/hero-loop.mp4"
            poster="/video/hero-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            disablePictureInPicture
            tabIndex={-1}
            onError={() => setVideoOk(false)}
          />
        )}
        {/* camadas de legibilidade */}
        <div className="absolute inset-0 bg-deep-950/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-950/88 via-deep-950/40 to-deep-950/15" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-deep-800 via-deep-800/60 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-deep-950/80 to-transparent" />
      </div>

      {/* geometria de canto, eco do símbolo */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -bottom-24 hidden h-[26rem] w-[26rem] opacity-25 lg:block"
        viewBox="0 0 120 132"
        fill="none"
      >
        <path d="M60 4 L114 35 L114 97 L60 128 L6 97 L6 35 Z" stroke="#6B8CFF" strokeWidth="0.8" />
        <path d="M60 26 L94 46 L94 86 L60 106 L26 86 L26 46 Z" stroke="#3155D9" strokeWidth="0.6" />
      </svg>

      <div className="container-site relative py-32 sm:py-36">
        <div className="max-w-3xl">
          <motion.p {...animar(0.05)} className="flex flex-wrap items-center gap-4">
            <img src="/brand/symbol-white.webp" alt="" aria-hidden="true" className="h-10 w-10" width={40} height={27} />
            <span className="font-caption text-xs font-bold tracking-[0.42em] text-accent-300 uppercase">
              Skill Craft
            </span>
            <span className="hidden h-px w-16 bg-gradient-to-r from-accent-400/70 to-transparent sm:block" />
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-400/30 bg-accent-400/10 px-3.5 py-1 font-caption text-[0.68rem] font-bold tracking-[0.14em] text-accent-300 uppercase backdrop-blur-sm">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Projeto Integrador 2026
            </span>
          </motion.p>

          <motion.h1
            {...animar(0.16)}
            className="mt-7 font-display text-[clamp(2.5rem,6.4vw,4.8rem)] leading-[1.04] font-extrabold tracking-tight text-balance text-offwhite-50"
          >
            {SLOGAN_PRINCIPAL.replace('para o mercado.', '')}
            <span className="text-gradient-skill drop-shadow-[0_0_28px_rgba(107,140,255,0.35)]">para o mercado.</span>
          </motion.h1>

          <motion.p {...animar(0.3)} className="mt-6 max-w-xl font-body text-base leading-relaxed text-offwhite-100/80 sm:text-lg">
            Agência estudantil de apoio acadêmico, tecnológico e criativo. Unimos Administração, Tecnologia da
            Informação e Design Gráfico em entregas com qualidade profissional — do resumo técnico ao site do seu
            projeto.
          </motion.p>

          <motion.div {...animar(0.42)} className="mt-9 flex flex-col gap-3.5 sm:flex-row sm:items-center">
            <button type="button" className="btn-primary group" onClick={() => irParaSecao('servicos')}>
              Conheça nossos serviços
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </button>
            <button type="button" className="btn-ghost" onClick={() => irParaSecao('sobre')}>
              Conheça a Skill Craft
            </button>
          </motion.div>

          <motion.dl {...animar(0.56)} className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-6">
            {NUMEROS.map((item, i) => (
              <div key={item.rotulo} className="flex items-center gap-10">
                {i > 0 && <span aria-hidden="true" className="hidden h-10 w-px bg-gradient-to-b from-transparent via-accent-400/40 to-transparent sm:block" />}
                <div className="flex flex-col">
                  <dt className="order-2 mt-1 font-caption text-[0.7rem] tracking-[0.18em] text-offwhite-100/60 uppercase">
                    {item.rotulo}
                  </dt>
                  <dd className="order-1 font-display text-3xl font-extrabold text-offwhite-50">
                    <CountUp valor={item.valor} sufixo={item.sufixo} />
                  </dd>
                </div>
              </div>
            ))}
          </motion.dl>
        </div>
      </div>

      {/* indicador de rolagem */}
      <motion.a
        href="#sobre"
        onClick={(e) => {
          e.preventDefault()
          irParaSecao('sobre')
        }}
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-offwhite-100/55 transition-colors hover:text-accent-300 sm:flex"
        initial={{ opacity: 0 }}
        animate={iniciar ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        aria-label="Rolar para a seção Sobre nós"
      >
        <span className="font-caption text-[0.62rem] tracking-[0.3em] uppercase">Role para explorar</span>
        <motion.span
          animate={reduzido ? undefined : { y: [0, 7, 0] }}
          transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </motion.span>
      </motion.a>
    </section>
  )
}
