import { Briefcase, Check, Code2, PenTool, Quote } from 'lucide-react'
import { AREAS, FRASES_APOIO, MISSAO, type Area } from '../../config/site'
import { Reveal } from '../ui/Reveal'
import { SectionHeader } from '../ui/SectionHeader'

const ICONES: Record<Area['icone'], typeof Briefcase> = {
  briefcase: Briefcase,
  code: Code2,
  'pen-tool': PenTool,
}

export function About() {
  return (
    <section id="sobre" className="relative py-20 sm:py-28">
      <div className="container-site">
        <SectionHeader
          kicker="Sobre nós"
          titulo={
            <>
              Três áreas técnicas, <span className="text-gradient-skill">uma única equipe</span>
            </>
          }
          lead="A Skill Craft é uma agência estudantil de apoio acadêmico, tecnológico e criativo, criada por alunos de Administração, TI e Design Gráfico para apoiar outros estudantes."
        />

        <Reveal delay={0.1} className="mx-auto mt-12 max-w-3xl">
          <figure className="card-surface relative overflow-hidden p-7 sm:p-9">
            <Quote className="absolute top-6 left-6 h-8 w-8 text-accent-400/25" aria-hidden="true" />
            <blockquote className="relative font-display text-lg leading-relaxed font-semibold text-balance text-offwhite-50 sm:text-xl">
              “{MISSAO}”
            </blockquote>
            <figcaption className="mt-4 font-caption text-xs tracking-[0.16em] text-offwhite-100/55 uppercase">
              Missão Skill Craft · {FRASES_APOIO[0]}
            </figcaption>
          </figure>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {AREAS.map((area, i) => {
            const Icone = ICONES[area.icone]
            return (
              <Reveal key={area.id} delay={0.12 + i * 0.1}>
                <article className="card-surface group h-full p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-accent-400/40">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-skill-500/15 text-accent-400 transition-colors duration-300 group-hover:bg-skill-500 group-hover:text-offwhite-50">
                    <Icone className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-extrabold text-offwhite-50">{area.titulo}</h3>
                  <p className="mt-3 font-body text-sm leading-relaxed text-offwhite-100/70">{area.resumo}</p>
                  <ul className="mt-5 space-y-2.5 border-t border-offwhite-50/10 pt-5">
                    {area.itens.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 font-body text-sm text-offwhite-100/75">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={0.15} className="mt-12">
          <p className="mx-auto max-w-3xl text-center font-body text-sm leading-relaxed text-offwhite-100/60">
            Nosso público são estudantes de cursos técnicos, profissionalizantes e superiores que precisam de reforço,
            orientação, acompanhamento e apoio no uso de ferramentas digitais — {FRASES_APOIO[1].toLowerCase()}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
