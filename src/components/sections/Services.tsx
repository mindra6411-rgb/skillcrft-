import { ArrowUpRight, BookOpen, FileCheck, Globe, MessagesSquare, Palette, Presentation } from 'lucide-react'
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

export function Services({ onSolicitar }: { onSolicitar: (servicoId: string) => void }) {
  return (
    <section id="servicos" className="relative bg-offwhite-50 py-20 text-charcoal-900 sm:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-deep-800/10 to-transparent"
      />
      <div className="container-site relative">
        <SectionHeader
          tom="claro"
          kicker="Nossos serviços"
          titulo={
            <>
              O que a Skill Craft <span className="text-skill-500">faz por você</span>
            </>
          }
          lead="Cinco serviços oficiais com preço de referência transparente. Você solicita quando precisa, sem mensalidade nem compromisso."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICOS.map((servico, i) => {
            const Icone = ICONES[servico.icone]
            return (
              <Reveal key={servico.id} delay={0.08 + i * 0.07} className={i === 3 ? 'sm:col-span-1' : ''}>
                <article className="card-surface-light group flex h-full flex-col p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow">
                  <div className="flex items-start justify-between gap-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-skill-500/10 text-skill-600 transition-colors duration-300 group-hover:bg-skill-500 group-hover:text-offwhite-50">
                      <Icone className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="rounded-full border border-deep-800/10 px-3 py-1 font-caption text-[0.65rem] font-bold tracking-[0.14em] text-charcoal-500 uppercase">
                      {servico.area}
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-lg font-extrabold text-deep-800">{servico.titulo}</h3>
                  <p className="mt-2.5 flex-1 font-body text-sm leading-relaxed text-charcoal-700">{servico.descricao}</p>

                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-deep-800/10 pt-5">
                    <p>
                      <span className="font-display text-xl font-extrabold text-skill-600">{servico.precoLabel}</span>
                      <span className="block font-caption text-[0.65rem] tracking-wide text-charcoal-500 uppercase">
                        preço de referência
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={() => onSolicitar(servico.id)}
                      className="btn-light !px-4 !py-2.5 !text-xs"
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

          <Reveal delay={0.08 + 5 * 0.07}>
            <div className="flex h-full flex-col justify-between rounded-2xl bg-gradient-to-br from-skill-600 to-deep-800 p-7 text-offwhite-50 shadow-card">
              <div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-offwhite-50/15">
                  <MessagesSquare className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-lg font-extrabold">Não sabe qual serviço pedir?</h3>
                <p className="mt-2.5 font-body text-sm leading-relaxed text-offwhite-100/80">
                  Conte o que você precisa entregar e a equipe indica o caminho certo — ou combina um escopo sob medida
                  dentro dos serviços oficiais.
                </p>
              </div>
              <button type="button" onClick={() => onSolicitar('')} className="btn-primary mt-6 w-full bg-offwhite-50 !text-deep-800 hover:bg-offwhite-100">
                Falar com a equipe
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <p className="mt-10 text-center font-caption text-xs leading-relaxed text-charcoal-500">
            Valores da tabela oficial consolidada pelo Projeto Integrador. O orçamento final é confirmado pela equipe na
            etapa 3, conforme o escopo de cada pedido.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
