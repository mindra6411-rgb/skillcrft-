import { Briefcase, Code2, Handshake, PenTool, ShieldCheck, Workflow } from 'lucide-react'
import { FRASES_APOIO } from '../../config/site'
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

const NOS = [
  { icone: Briefcase, label: 'Administração', classe: 'top-0 left-1/2 -translate-x-1/2' },
  { icone: Code2, label: 'TI', classe: 'bottom-[6%] left-[2%]' },
  { icone: PenTool, label: 'Design', classe: 'bottom-[6%] right-[2%]' },
]

export function Differentials() {
  return (
    <section id="diferenciais" className="relative overflow-hidden py-24 sm:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-12rem] bottom-[-10rem] h-[30rem] w-[30rem] rounded-full bg-accent-400/8 blur-[120px]" />
      </div>

      <div className="container-site relative">
        <SectionHeader
          kicker="Diferenciais"
          titulo={
            <>
              O que nenhuma área sozinha <span className="text-gradient-skill">conseguiria entregar</span>
            </>
          }
          lead="A Skill Craft existe na interseção de Administração, Tecnologia da Informação e Design Gráfico. É essa integração que transforma um pedido simples em um resultado completo."
        />

        {/* órbita da integração */}
        <Reveal delay={0.12} className="mt-16">
          <div className="relative mx-auto h-80 w-80 sm:h-96 sm:w-96">
            <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <circle cx="200" cy="200" r="150" fill="none" stroke="#6B8CFF" strokeOpacity="0.16" strokeWidth="1" />
              <path d="M200 200 L200 52" stroke="#6B8CFF" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="4 7" />
              <path d="M200 200 L74 306" stroke="#6B8CFF" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="4 7" />
              <path d="M200 200 L326 306" stroke="#6B8CFF" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="4 7" />
            </svg>

            {/* anel de luz giratório */}
            <span
              aria-hidden="true"
              className="animate-spin-slow absolute inset-8 rounded-full"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent 0 34%, rgba(107,140,255,0.55) 48%, rgba(147,171,255,0.85) 52%, transparent 66% 100%)',
                WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))',
                mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))',
              }}
            />
            <span aria-hidden="true" className="absolute inset-16 rounded-full bg-skill-500/12 blur-2xl animate-pulse-soft" />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <img
                src="/brand/symbol-color.webp"
                alt="Símbolo Skill Craft"
                className="h-28 w-28 sm:h-32 sm:w-32"
                width={32}
                height={22}
                style={{ filter: 'drop-shadow(0 0 26px rgba(49,85,217,0.55))' }}
              />
              <span className="mt-4 flex items-center justify-center gap-1.5 rounded-full border border-accent-400/30 bg-accent-400/10 px-3.5 py-1 font-caption text-[0.62rem] font-bold tracking-[0.16em] text-accent-300 uppercase backdrop-blur-sm">
                <Handshake className="h-3 w-3" aria-hidden="true" />
                Integração real
              </span>
            </div>

            {NOS.map((no) => (
              <span
                key={no.label}
                className={`card-surface absolute flex items-center gap-2 rounded-xl bg-deep-900/95 px-4 py-2.5 font-display text-xs font-bold text-offwhite-50 ${no.classe}`}
              >
                <no.icone className="h-4 w-4 text-accent-400" aria-hidden="true" />
                {no.label}
              </span>
            ))}
          </div>
        </Reveal>

        <div className="mx-auto mt-20 grid max-w-5xl gap-x-14 gap-y-10 sm:grid-cols-2">
          {PILARES.map((pilar, i) => (
            <Reveal key={pilar.titulo} delay={0.08 + i * 0.09}>
              <div className="group border-b border-offwhite-50/8 pb-8">
                <div className="flex items-center gap-3.5">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent-400/10 text-accent-400 transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-skill-600 group-hover:to-accent-400 group-hover:text-offwhite-50">
                    <pilar.icone className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-base font-bold text-offwhite-50">{pilar.titulo}</h3>
                </div>
                <p className="mt-3.5 font-body text-sm leading-relaxed text-offwhite-100/65">{pilar.texto}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-16">
          <p className="mx-auto max-w-2xl text-center font-display text-xl font-semibold text-balance text-offwhite-100/85 sm:text-2xl">
            “{FRASES_APOIO[1]}”
          </p>
        </Reveal>
      </div>
    </section>
  )
}
