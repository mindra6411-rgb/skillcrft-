import { ClipboardList, FileSearch, Laptop, PackageCheck, Send } from 'lucide-react'
import { ETAPAS, type Etapa } from '../../config/site'
import { Reveal } from '../ui/Reveal'
import { SectionHeader } from '../ui/SectionHeader'
import { motion, useReducedMotion } from 'framer-motion'

const ICONES: Record<Etapa['icone'], typeof Send> = {
  clipboard: ClipboardList,
  send: Send,
  'file-search': FileSearch,
  laptop: Laptop,
  'package-check': PackageCheck,
}

export function HowItWorks() {
  const reduzido = useReducedMotion()

  return (
    <section id="como-funciona" className="relative overflow-hidden py-24 sm:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-[-14rem] h-[28rem] w-[28rem] rounded-full bg-skill-500/10 blur-[120px]" />
        <div className="padrao-iso absolute inset-x-0 top-0 h-56 opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      </div>

      <div className="container-site relative">
        <SectionHeader
          kicker="Como funciona"
          titulo={
            <>
              Do pedido à entrega, <span className="text-gradient-skill">em cinco etapas</span>
            </>
          }
          lead="Um fluxo simples e acompanhado de perto, do primeiro contato ao pós-venda."
        />

        <div className="relative mt-20">
          {/* linha de conexão animada (desktop) */}
          <div aria-hidden="true" className="absolute top-8 right-[10%] left-[10%] hidden h-px bg-offwhite-50/8 md:block">
            <motion.span
              className="absolute inset-0 origin-left bg-gradient-to-r from-skill-500 via-accent-400 to-accent-300 shadow-glow-soft"
              initial={{ scaleX: reduzido ? 1 : 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '-120px' }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          {/* linha de conexão animada (mobile) */}
          <div aria-hidden="true" className="absolute top-4 bottom-4 left-8 w-px bg-offwhite-50/8 md:hidden">
            <motion.span
              className="absolute inset-0 origin-top bg-gradient-to-b from-skill-500 via-accent-400 to-accent-300"
              initial={{ scaleY: reduzido ? 1 : 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          <ol className="grid gap-12 md:grid-cols-5 md:gap-6">
            {ETAPAS.map((etapa, i) => {
              const Icone = ICONES[etapa.icone]
              return (
                <Reveal key={etapa.numero} delay={0.1 + i * 0.12}>
                  <li className="group relative flex items-start gap-6 md:flex-col md:items-center md:gap-0 md:text-center">
                    <span className="relative z-10 inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-accent-400/35 bg-deep-900 text-accent-400 shadow-glow-soft transition-all duration-500 group-hover:-translate-y-1.5 group-hover:border-accent-400/70 group-hover:bg-gradient-to-br group-hover:from-skill-600 group-hover:to-accent-400 group-hover:text-offwhite-50">
                      <Icone className="h-6 w-6" aria-hidden="true" />
                      <span className="absolute -top-2.5 -right-2.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-skill font-display text-[0.62rem] font-extrabold text-offwhite-50 shadow-glow-soft">
                        {etapa.numero}
                      </span>
                    </span>
                    <div className="md:mt-6">
                      <h3 className="font-display text-base font-bold text-offwhite-50 transition-colors duration-300 group-hover:text-accent-300">
                        {etapa.titulo}
                      </h3>
                      <p className="mt-2 font-body text-sm leading-relaxed text-offwhite-100/60">{etapa.descricao}</p>
                    </div>
                  </li>
                </Reveal>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
