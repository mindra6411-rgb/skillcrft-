import { ClipboardList, FileSearch, Laptop, PackageCheck, Send } from 'lucide-react'
import { ETAPAS, type Etapa } from '../../config/site'
import { Reveal } from '../ui/Reveal'
import { SectionHeader } from '../ui/SectionHeader'

const ICONES: Record<Etapa['icone'], typeof Send> = {
  clipboard: ClipboardList,
  send: Send,
  'file-search': FileSearch,
  laptop: Laptop,
  'package-check': PackageCheck,
}

export function HowItWorks() {
  return (
    <section id="como-funciona" className="relative overflow-hidden py-20 sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 left-[-12rem] h-[26rem] w-[26rem] rounded-full bg-skill-500/10 blur-[110px]" />
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

        <ol className="relative mt-16 grid gap-10 md:grid-cols-5 md:gap-6">
          <div
            aria-hidden="true"
            className="absolute top-7 right-[10%] left-[10%] hidden h-px bg-gradient-to-r from-transparent via-accent-400/40 to-transparent md:block"
          />
          {ETAPAS.map((etapa, i) => {
            const Icone = ICONES[etapa.icone]
            return (
              <Reveal key={etapa.numero} delay={0.08 + i * 0.09}>
                <li className="group relative flex gap-5 md:flex-col md:items-center md:gap-0 md:text-center">
                  <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-accent-400/40 bg-deep-900 font-display text-base font-extrabold text-accent-400 shadow-glow transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-skill-500 group-hover:text-offwhite-50">
                    {etapa.numero}
                  </span>
                  <div className="md:mt-5">
                    <span className="inline-flex items-center gap-2 font-display text-base font-bold text-offwhite-50">
                      <Icone className="h-4 w-4 text-accent-400" aria-hidden="true" />
                      {etapa.titulo}
                    </span>
                    <p className="mt-2 font-body text-sm leading-relaxed text-offwhite-100/65">{etapa.descricao}</p>
                  </div>
                </li>
              </Reveal>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
