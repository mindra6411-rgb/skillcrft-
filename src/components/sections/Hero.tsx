import { motion } from 'framer-motion'
import { ArrowRight, Briefcase, Code2, MessagesSquare, PenTool, Sparkles } from 'lucide-react'
import { SLOGAN_PRINCIPAL } from '../../config/site'
import { irParaSecao } from '../../hooks/useHashRoute'
import { Logo } from '../brand/Logo'

const EASE = [0.22, 1, 0.36, 1] as const

const chips = [
  { icone: Briefcase, label: 'Administração', classe: 'top-6 -left-3 sm:-left-8' },
  { icone: Code2, label: 'Tecnologia da Informação', classe: '-bottom-5 -left-2 sm:-left-6' },
  { icone: PenTool, label: 'Design Gráfico', classe: 'top-1/3 -right-3 sm:-right-8' },
]

const numeros = [
  { valor: '5', rotulo: 'serviços sob demanda' },
  { valor: '3', rotulo: 'áreas integradas' },
  { valor: '100%', rotulo: 'digital e acessível' },
]

export function Hero({ iniciar }: { iniciar: boolean }) {
  const animar = (delay: number) => ({
    initial: { opacity: 0, y: 26 },
    animate: iniciar ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 },
    transition: { duration: 0.75, delay, ease: EASE },
  })

  return (
    <section id="inicio" className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      {/* fundo geométrico inspirado na marca */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[38rem] w-[60rem] -translate-x-1/2 rounded-full bg-skill-500/15 blur-[130px]" />
        <div className="absolute right-[-10rem] bottom-[-12rem] h-[30rem] w-[30rem] rounded-full bg-accent-400/10 blur-[110px]" />
        <svg className="absolute inset-0 h-full w-full opacity-[0.16]" aria-hidden="true">
          <defs>
            <pattern id="grade-iso" width="72" height="42" patternUnits="userSpaceOnUse">
              <path d="M0 42 L36 21 L72 42 M36 21 L36 0" stroke="#6B8CFF" strokeOpacity="0.35" strokeWidth="1" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grade-iso)" />
        </svg>
        <motion.div
          className="animate-float-slow absolute top-24 left-[6%] hidden lg:block"
          animate={{ rotate: [0, 6, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="120" height="132" viewBox="0 0 120 132" fill="none" aria-hidden="true">
            <path d="M60 4 L114 35 L114 97 L60 128 L6 97 L6 35 Z" stroke="#6B8CFF" strokeOpacity="0.35" strokeWidth="1.5" />
          </svg>
        </motion.div>
        <motion.div
          className="animate-float-slower absolute right-[8%] bottom-24 hidden lg:block"
          animate={{ rotate: [0, -8, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="84" height="92" viewBox="0 0 120 132" fill="none" aria-hidden="true">
            <path d="M60 4 L114 35 L114 97 L60 128 L6 97 L6 35 Z" stroke="#3155D9" strokeOpacity="0.5" strokeWidth="2" />
          </svg>
        </motion.div>
      </div>

      <div className="container-site relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div>
          <motion.p {...animar(0.05)}>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-400/30 bg-accent-400/10 px-4 py-1.5 font-caption text-xs font-bold tracking-[0.14em] text-accent-300 uppercase">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Agência estudantil · Projeto Integrador 2026
            </span>
          </motion.p>

          <motion.h1
            {...animar(0.15)}
            className="mt-6 font-display text-4xl leading-[1.08] font-extrabold tracking-tight text-balance text-offwhite-50 sm:text-5xl xl:text-[3.9rem]"
          >
            {SLOGAN_PRINCIPAL.replace('para o mercado.', '')}
            <span className="text-gradient-skill">para o mercado.</span>
          </motion.h1>

          <motion.p {...animar(0.28)} className="mt-6 max-w-xl font-body text-base leading-relaxed text-offwhite-100/75 sm:text-lg">
            A Skill Craft reúne Administração, Tecnologia da Informação e Design Gráfico em serviços acadêmicos com
            qualidade profissional: apresentações, sites, revisões, resumos e artes feitos por estudantes que entendem
            a sua rotina.
          </motion.p>

          <motion.div {...animar(0.4)} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="button" className="btn-primary" onClick={() => irParaSecao('servicos')}>
              Conheça nossos serviços
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" className="btn-ghost" onClick={() => irParaSecao('contato')}>
              <MessagesSquare className="h-4 w-4" aria-hidden="true" />
              Fale com a equipe
            </button>
          </motion.div>

          <motion.dl {...animar(0.52)} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            {numeros.map((item) => (
              <div key={item.rotulo} className="flex items-baseline gap-2">
                <dt className="sr-only">{item.rotulo}</dt>
                <dd className="font-display text-2xl font-extrabold text-accent-400">{item.valor}</dd>
                <dd className="font-caption text-xs tracking-wide text-offwhite-100/60 uppercase">{item.rotulo}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* cartão da marca oficial */}
        <motion.div {...animar(0.35)} className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div
            aria-hidden="true"
            className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-skill-500/25 via-transparent to-accent-400/20 blur-2xl"
          />
          <div className="relative rounded-3xl bg-offwhite-50 p-8 shadow-card sm:p-12">
            <Logo variante="lockup-color" className="mx-auto h-44 w-auto sm:h-52" />
            <p className="mt-6 text-center font-caption text-xs tracking-[0.18em] text-charcoal-500 uppercase">
              Identidade oficial · Guia de marca v1.0
            </p>
          </div>

          {chips.map((chip, i) => (
            <motion.span
              key={chip.label}
              className={`card-surface absolute flex items-center gap-2 rounded-xl bg-deep-900/90 px-3.5 py-2.5 font-display text-xs font-bold text-offwhite-50 ${chip.classe}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={iniciar ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.7 + i * 0.12, duration: 0.5, ease: EASE }}
            >
              <span className="animate-float-slow" style={{ animationDelay: `${i * 1.3}s` }}>
                <chip.icone className="h-4 w-4 text-accent-400" aria-hidden="true" />
              </span>
              {chip.label}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
