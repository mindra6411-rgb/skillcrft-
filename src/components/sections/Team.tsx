import { Briefcase, Check, Code2, Megaphone, Users } from 'lucide-react'
import { EQUIPE, EQUIPE_TOTAL, type EquipeArea } from '../../config/site'
import { Reveal } from '../ui/Reveal'
import { SectionHeader } from '../ui/SectionHeader'

const ICONES: Record<EquipeArea['icone'], typeof Briefcase> = {
  briefcase: Briefcase,
  code: Code2,
  megaphone: Megaphone,
}

/**
 * Equipe — composição OFICIAL atual (2 em TI, 3 em ADM, 1 em Marketing).
 * Nenhum nome é inventado: só aparecem os nomes informados pela equipe.
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
        <div className="grid items-end gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <SectionHeader
            alinhamento="esquerda"
            tom="claro"
            kicker="Equipe"
            titulo={
              <>
                Seis pessoas, três áreas, <span className="text-skill-500">um mesmo padrão de entrega</span>
              </>
            }
            lead="A Skill Craft é organizada por áreas de atuação, com responsabilidades definidas. É essa divisão que permite atender um pedido de ponta a ponta."
          />
          <Reveal delay={0.12}>
            <div className="flex items-center gap-5 rounded-2xl border border-deep-800/10 bg-white/75 p-6">
              <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-skill-500/10 text-skill-600">
                <Users className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="font-display text-4xl leading-none font-extrabold tracking-tight text-deep-800">
                  {EQUIPE_TOTAL}
                </p>
                <p className="mt-2 font-caption text-xs tracking-[0.14em] text-charcoal-500 uppercase">
                  integrantes · {EQUIPE.length} áreas
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {EQUIPE.map((area, i) => {
            const Icone = ICONES[area.icone]
            return (
              <Reveal key={area.id} delay={0.06 + i * 0.08}>
                <article className="card-surface-light group flex h-full flex-col p-7 transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-skill-500/12 to-accent-400/12 text-skill-600">
                      <Icone className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="rounded-full border border-deep-800/10 bg-deep-800/[0.04] px-3 py-1 font-caption text-[0.62rem] font-bold tracking-[0.14em] text-charcoal-500 uppercase">
                      {area.integrantes} {area.integrantes === 1 ? 'integrante' : 'integrantes'}
                    </span>
                  </div>

                  <p className="mt-6 font-caption text-[0.65rem] font-bold tracking-[0.24em] text-skill-500 uppercase">
                    {area.sigla}
                  </p>
                  <h3 className="mt-1.5 font-display text-xl font-extrabold text-deep-800">{area.titulo}</h3>
                  <p className="mt-3 font-body text-sm leading-relaxed text-charcoal-700">{area.papel}</p>

                  {area.nomes.length > 0 && (
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {area.nomes.map((nome) => (
                        <li
                          key={nome}
                          className="inline-flex items-center rounded-lg bg-skill-500/10 px-3 py-1.5 font-display text-xs font-bold text-skill-700"
                        >
                          {nome}
                        </li>
                      ))}
                    </ul>
                  )}

                  <ul className="mt-6 space-y-2.5 border-t border-deep-800/8 pt-5">
                    {area.frentes.map((frente) => (
                      <li key={frente} className="flex items-start gap-2.5 font-body text-sm text-charcoal-700">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-skill-500" aria-hidden="true" />
                        {frente}
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
            Composição oficial confirmada pela equipe: {EQUIPE.map((a) => `${a.integrantes} em ${a.sigla}`).join(' · ')}.
            As áreas se reúnem nas etapas de orçamento, desenvolvimento e entrega do fluxo de atendimento.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
