import { ArrowUpRight, BadgeCheck, BookOpen, FileCheck, Globe, MessagesSquare, Palette, Presentation } from 'lucide-react'
import { SERVICOS, type Servico } from '../../config/site'
import { Reveal } from '../ui/Reveal'
import { SectionHeader } from '../ui/SectionHeader'

const ICONES: Record<Servico['icone'], typeof Presentation> = {
  presentation: Presentation,
  globe: Globe,
  'file-check': FileCheck,
  book: BookOpen,
  palette: Palette,
}

const SPANS = ['lg:col-span-2', 'lg:col-span-2', 'lg:col-span-2', 'lg:col-span-3', 'lg:col-span-3']

export function Services({ onSolicitar }: { onSolicitar: (servicoId: string) => void }) {
  return (
    <section id="servicos" className="relative overflow-hidden bg-offwhite-50 py-24 text-charcoal-900 sm:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-deep-800/12 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-[-14rem] h-[28rem] w-[28rem] rounded-full bg-skill-500/10 blur-[110px]"
      />

      <div className="container-site relative">
        <div className="grid items-end gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <SectionHeader
            alinhamento="esquerda"
            tom="claro"
            kicker="Nossos serviços"
            titulo={
              <>
                O que a Skill Craft <span className="text-skill-500">faz por você</span>
              </>
            }
            lead="Cinco serviços oficiais com preço de referência transparente. Você solicita quando precisa — sem mensalidade, sem compromisso."
          />
          <Reveal delay={0.15}>
            <p className="flex items-start gap-3 rounded-2xl border border-deep-800/10 bg-white/70 p-5 font-caption text-xs leading-relaxed text-charcoal-700">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-skill-500" aria-hidden="true" />
              Valores da tabela oficial consolidada pelo Projeto Integrador. O orçamento final é confirmado pela equipe
              na etapa 3, conforme o escopo de cada pedido.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {SERVICOS.map((servico, i) => {
            const Icone = ICONES[servico.icone]
            const destaque = servico.id === 'sites-simples'
            return (
              <Reveal key={servico.id} delay={0.06 + i * 0.07} className={SPANS[i]}>
                <article
                  className={`group relative flex h-full flex-col overflow-hidden rounded-2xl p-7 transition-all duration-500 hover:-translate-y-2 ${
                    destaque
                      ? 'bg-deep-800 text-offwhite-50 shadow-card hover:shadow-glow'
                      : 'card-surface-light hover:shadow-glow-soft'
                  }`}
                >
                  {destaque && <div aria-hidden="true" className="padrao-iso absolute inset-0 opacity-60" />}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-skill-500 to-accent-400 transition-transform duration-500 group-hover:scale-x-100 ${
                      destaque ? '' : 'from-skill-500/80 to-accent-400/80'
                    }`}
                  />

                  <div className="relative flex items-start justify-between gap-4">
                    <span
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 ${
                        destaque
                          ? 'bg-gradient-to-br from-skill-500 to-accent-400 text-offwhite-50 shadow-glow-soft'
                          : 'bg-gradient-to-br from-skill-500/12 to-accent-400/12 text-skill-600'
                      }`}
                    >
                      <Icone className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 font-caption text-[0.62rem] font-bold tracking-[0.16em] uppercase ${
                        destaque
                          ? 'border-accent-400/35 bg-accent-400/10 text-accent-300'
                          : 'border-deep-800/10 bg-deep-800/[0.03] text-charcoal-500'
                      }`}
                    >
                      {servico.area}
                    </span>
                  </div>

                  <h3
                    className={`relative mt-6 font-display text-lg font-extrabold ${
                      destaque ? 'text-offwhite-50' : 'text-deep-800'
                    }`}
                  >
                    {servico.titulo}
                  </h3>
                  <p
                    className={`relative mt-2.5 flex-1 font-body text-sm leading-relaxed ${
                      destaque ? 'text-offwhite-100/75' : 'text-charcoal-700'
                    }`}
                  >
                    {servico.descricao}
                  </p>

                  <div
                    className={`relative mt-7 flex items-center justify-between gap-3 border-t pt-5 ${
                      destaque ? 'border-offwhite-50/12' : 'border-deep-800/8'
                    }`}
                  >
                    <p>
                      <span
                        className={`font-display text-2xl font-extrabold tracking-tight ${
                          destaque ? 'text-accent-300' : 'text-skill-600'
                        }`}
                      >
                        {servico.precoLabel}
                      </span>
                      <span
                        className={`block font-caption text-[0.62rem] tracking-[0.14em] uppercase ${
                          destaque ? 'text-offwhite-100/55' : 'text-charcoal-500'
                        }`}
                      >
                        preço de referência
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={() => onSolicitar(servico.id)}
                      className={destaque ? 'btn-primary px-4! py-2.5! text-xs!' : 'btn-light px-4! py-2.5! text-xs!'}
                      aria-label={`Solicitar ${servico.titulo}`}
                    >
                      Solicitar
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              </Reveal>
            )
          })}

          <Reveal delay={0.06 + 5 * 0.07} className="sm:col-span-2 lg:col-span-6">
            <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-2xl bg-gradient-to-r from-deep-800 via-deep-700 to-skill-700 p-8 text-offwhite-50 shadow-card sm:flex-row sm:items-center sm:p-10">
              <div aria-hidden="true" className="padrao-iso absolute inset-0 opacity-50" />
              <div
                aria-hidden="true"
                className="absolute -top-24 right-10 h-56 w-56 rounded-full bg-accent-400/20 blur-[80px]"
              />
              <div className="relative flex items-start gap-4">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-offwhite-50/12 backdrop-blur-sm">
                  <MessagesSquare className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-extrabold sm:text-xl">Não sabe qual serviço pedir?</h3>
                  <p className="mt-1.5 max-w-md font-body text-sm leading-relaxed text-offwhite-100/75">
                    Conte o que você precisa entregar e a equipe indica o caminho certo — ou combina um escopo sob
                    medida dentro dos serviços oficiais.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSolicitar('')}
                className="relative inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-offwhite-50 px-6 py-3 font-display text-sm font-bold text-deep-800 transition-all duration-300 hover:-translate-y-0.5 hover:bg-offwhite-100 hover:shadow-glow-soft active:translate-y-0 active:scale-[0.98] sm:w-auto"
              >
                Falar com a equipe
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
