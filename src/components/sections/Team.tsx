import { Briefcase, Check, Code2, Palette } from 'lucide-react'
import { EQUIPE, type EquipeArea } from '../../config/site'
import { Reveal } from '../ui/Reveal'
import { SectionHeader } from '../ui/SectionHeader'

const ICONES: Record<EquipeArea['icone'], typeof Briefcase> = {
  briefcase: Briefcase,
  code: Code2,
  palette: Palette,
}

/**
 * Equipe — três áreas de atuação com as responsabilidades documentadas no
 * Projeto Integrador. Sem nomes e sem contagem de integrantes (decisão do
 * responsável pelo projeto): a seção fica pronta para receber as
 * informações da equipe quando forem confirmadas para divulgação.
 */
export function Team() {
  return (
    <section id="equipe" className="relative overflow-hidden bg-offwhite-50 py-24 text-charcoal-900 sm:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-deep-800/10 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-32 h-[26rem] w-[26rem] rounded-full bg-skill-500/8 blur-[110px]"
      />

      <div className="container-site relative">
        <SectionHeader
          alinhamento="esquerda"
          tom="claro"
          kicker="Equipe"
          titulo={
            <>
              Três áreas, <span className="text-skill-500">um mesmo padrão de entrega</span>
            </>
          }
          lead="A Skill Craft é uma agência estudantil organizada em três áreas de atuação, cada uma com responsabilidade própria — e com as decisões importantes tomadas em conjunto."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {EQUIPE.map((area, i) => {
            const Icone = ICONES[area.icone]
            return (
              <Reveal key={area.id} delay={0.06 + i * 0.08}>
                <article className="card-surface-light group flex h-full flex-col p-7 transition-transform duration-300 hover:-translate-y-1">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-skill-500/12 to-accent-400/12 text-skill-600">
                    <Icone className="h-5 w-5" aria-hidden="true" />
                  </span>

                  <p className="mt-6 font-caption text-[0.65rem] font-bold tracking-[0.24em] text-skill-500 uppercase">
                    {area.sigla}
                  </p>
                  <h3 className="mt-1.5 font-display text-xl font-extrabold text-deep-800">{area.titulo}</h3>
                  <p className="mt-3 font-body text-sm leading-relaxed text-charcoal-700">
                    {area.responsabilidade}
                  </p>

                  <ul className="mt-6 space-y-2.5 border-t border-deep-800/8 pt-5">
                    {area.entregas.map((entrega) => (
                      <li key={entrega} className="flex items-start gap-2.5 font-body text-sm text-charcoal-700">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-skill-500" aria-hidden="true" />
                        {entrega}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={0.1} className="mt-10">
          <p className="font-caption text-xs leading-relaxed text-charcoal-500">
            Cada área tem responsabilidade definida — e as decisões importantes, como nome, serviços, público-alvo e
            funcionamento, são tomadas em conjunto pela equipe.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
