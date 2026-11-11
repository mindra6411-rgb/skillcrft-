import { Briefcase, Check, Code2, PenTool, Quote } from 'lucide-react'
import { AREAS, FRASES_APOIO, MISSAO, type Area } from '../../config/site'
import { Logo } from '../brand/Logo'
import { Reveal } from '../ui/Reveal'
import { SectionHeader } from '../ui/SectionHeader'

const ICONES: Record<Area['icone'], typeof Briefcase> = {
  briefcase: Briefcase,
  code: Code2,
  'pen-tool': PenTool,
}

export function About() {
  return (
    <section id="sobre" className="relative overflow-hidden py-24 sm:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[30rem] w-[30rem] rounded-full bg-skill-500/10 blur-[120px]" />
        <div className="padrao-iso absolute inset-x-0 bottom-0 h-64 opacity-40 [mask-image:linear-gradient(to_top,black,transparent)]" />
      </div>

      <div className="container-site relative grid gap-16 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
        <div>
          <SectionHeader
            alinhamento="esquerda"
            kicker="Sobre nós"
            titulo={
              <>
                Três áreas técnicas, <span className="text-gradient-skill">uma única equipe</span>
              </>
            }
            lead="A Skill Craft é uma agência estudantil de apoio acadêmico, tecnológico e criativo, criada por alunos de Administração, TI e Design Gráfico para apoiar outros estudantes."
          />

          <Reveal delay={0.12} className="mt-10">
            <figure className="card-surface relative overflow-hidden p-7 sm:p-9">
              <Quote className="absolute top-6 left-6 h-9 w-9 text-accent-400/20" aria-hidden="true" />
              <blockquote className="relative font-display text-lg leading-relaxed font-semibold text-balance text-offwhite-50 sm:text-xl">
                “{MISSAO}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-2.5 font-caption text-xs tracking-[0.16em] text-offwhite-100/50 uppercase">
                <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-accent-400 to-transparent" />
                Missão Skill Craft
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={0.2} className="mt-8">
            <div className="group relative rounded-2xl bg-offwhite-50 p-8 shadow-card-light transition-transform duration-500 hover:-translate-y-1 sm:p-10">
              <Logo variante="lockup-color" className="mx-auto h-32 w-auto sm:h-36" />
              <p className="mt-5 text-center font-caption text-[0.68rem] tracking-[0.22em] text-charcoal-500 uppercase">
                Identidade oficial · Guia de marca v1.0
              </p>
              <span
                aria-hidden="true"
                className="absolute inset-x-10 -bottom-px h-px bg-gradient-to-r from-transparent via-skill-500/60 to-transparent"
              />
            </div>
          </Reveal>
        </div>

        <div className="flex flex-col justify-center gap-10">
          {AREAS.map((area, i) => {
            const Icone = ICONES[area.icone]
            return (
              <Reveal key={area.id} delay={0.1 + i * 0.12} x={26} y={0}>
                <article className="group relative border-l border-offwhite-50/10 pl-7 transition-colors duration-500 hover:border-accent-400/70 sm:pl-9">
                  <span
                    aria-hidden="true"
                    className="absolute top-0 -left-px h-0 w-px bg-gradient-to-b from-accent-400 to-skill-500 transition-all duration-500 group-hover:h-full"
                  />
                  <div className="flex items-start justify-between gap-5">
                    <div className="flex items-center gap-4">
                      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-skill-600 to-accent-400 text-offwhite-50 shadow-glow-soft transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                        <Icone className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-caption text-[0.65rem] font-bold tracking-[0.28em] text-accent-400/80 uppercase">
                          Área 0{i + 1}
                        </p>
                        <h3 className="mt-0.5 font-display text-xl font-extrabold text-offwhite-50 sm:text-2xl">
                          {area.titulo}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 font-body text-sm leading-relaxed text-offwhite-100/70 sm:text-[0.95rem]">
                    {area.resumo}
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {area.itens.map((item) => (
                      <li
                        key={item}
                        className="inline-flex items-center gap-1.5 rounded-full border border-offwhite-50/12 bg-offwhite-50/[0.03] px-3.5 py-1.5 font-caption text-xs text-offwhite-100/70 transition-colors duration-300 group-hover:border-accent-400/35"
                      >
                        <Check className="h-3 w-3 text-accent-400" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>

      <Reveal delay={0.1} className="container-site relative mt-20">
        <div className="hairline-x" />
        <p className="mx-auto mt-10 max-w-3xl text-center font-body text-sm leading-relaxed text-offwhite-100/60 sm:text-base">
          Nosso público são estudantes de cursos técnicos, profissionalizantes e superiores que precisam de reforço,
          orientação e apoio no uso de ferramentas digitais — {FRASES_APOIO[1].toLowerCase()}
        </p>
      </Reveal>
    </section>
  )
}
