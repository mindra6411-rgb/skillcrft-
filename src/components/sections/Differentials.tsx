import { Briefcase, Code2, Handshake, PenTool, ShieldCheck, Workflow } from 'lucide-react'
import { Reveal } from '../ui/Reveal'
import { SectionHeader } from '../ui/SectionHeader'

const PILARES = [
  {
    icone: Workflow,
    titulo: 'Um pedido, três especialidades',
    texto: 'O pedido entra uma única vez e as três áreas resolvem em conjunto — sem retrabalho nem desencontro de informações.',
  },
  {
    icone: ShieldCheck,
    titulo: 'Gestão de verdade',
    texto: 'Administração cuida de escopo, prazos e organização, para cada entrega chegar completa e no combinado.',
  },
  {
    icone: Code2,
    titulo: 'Método e técnica',
    texto: 'TI aplica ferramentas digitais, lógica e boas práticas em tudo o que é construído, do resumo ao site.',
  },
  {
    icone: PenTool,
    titulo: 'Comunicação que valoriza',
    texto: 'Design garante estética, clareza e identidade visual para o seu trabalho causar a impressão certa.',
  },
]

export function Differentials() {
  return (
    <section id="diferenciais" className="relative py-20 sm:py-28">
      <div className="container-site">
        <div className="card-surface relative overflow-hidden p-8 sm:p-12 lg:p-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-skill-500/15 blur-[100px]"
          />
          <div className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <SectionHeader
                alinhamento="esquerda"
                kicker="Diferenciais"
                titulo={
                  <>
                    O que nenhuma área sozinha <span className="text-gradient-skill">conseguiria entregar</span>
                  </>
                }
                lead="A Skill Craft existe na interseção de Administração, Tecnologia da Informação e Design Gráfico. É essa integração que transforma um pedido simples em um resultado completo."
              />

              <ul className="mt-10 grid gap-6 sm:grid-cols-2">
                {PILARES.map((pilar, i) => (
                  <Reveal key={pilar.titulo} delay={0.1 + i * 0.08}>
                    <li className="flex gap-4">
                      <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-400/12 text-accent-400">
                        <pilar.icone className="h-4.5 w-4.5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-display text-sm font-bold text-offwhite-50">{pilar.titulo}</h3>
                        <p className="mt-1.5 font-body text-sm leading-relaxed text-offwhite-100/65">{pilar.texto}</p>
                      </div>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>

            {/* diagrama da integração entre as três áreas */}
            <Reveal delay={0.2} className="relative">
              <div className="relative mx-auto h-80 max-w-sm">
                <svg viewBox="0 0 400 320" className="absolute inset-0 h-full w-full" aria-hidden="true">
                  <path d="M200 210 L84 92" stroke="#6B8CFF" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="5 6" />
                  <path d="M200 210 L200 70" stroke="#6B8CFF" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="5 6" />
                  <path d="M200 210 L316 92" stroke="#6B8CFF" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="5 6" />
                  <circle cx="200" cy="210" r="58" fill="none" stroke="#3155D9" strokeOpacity="0.5" strokeWidth="1.5" />
                </svg>

                {[
                  { icone: Briefcase, label: 'Administração', classe: 'top-[8%] left-[2%]' },
                  { icone: Code2, label: 'TI', classe: 'top-0 left-1/2 -translate-x-1/2' },
                  { icone: PenTool, label: 'Design', classe: 'top-[8%] right-[2%]' },
                ].map((no) => (
                  <span
                    key={no.label}
                    className={`card-surface absolute flex items-center gap-2 rounded-xl bg-deep-900/95 px-3.5 py-2.5 font-display text-xs font-bold text-offwhite-50 ${no.classe}`}
                  >
                    <no.icone className="h-4 w-4 text-accent-400" aria-hidden="true" />
                    {no.label}
                  </span>
                ))}

                <div className="absolute top-[42%] left-1/2 flex -translate-x-1/2 flex-col items-center">
                  <img src="/brand/symbol-color.webp" alt="Símbolo Skill Craft" className="h-24 w-24" width={24} height={16} />
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-accent-400/30 bg-accent-400/10 px-3 py-1 font-caption text-[0.65rem] font-bold tracking-[0.14em] text-accent-300 uppercase">
                    <Handshake className="h-3 w-3" aria-hidden="true" />
                    Integração real
                  </span>
                </div>
              </div>
              <p className="mt-4 text-center font-caption text-xs text-offwhite-100/50">
                Cada projeto passa pelas três áreas antes de chegar até você.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
