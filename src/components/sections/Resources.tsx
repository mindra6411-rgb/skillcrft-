import { ArrowUpRight, LifeBuoy, Sigma } from 'lucide-react'
import type { Rota } from '../../hooks/useHashRoute'
import { Reveal } from '../ui/Reveal'

const FERRAMENTAS = ['Calculadora de médias ponderadas', 'Gerador de cronograma de estudos', 'Checklist de trabalho']
const AJUDAS = ['Como solicitar e acompanhar um pedido', 'O que significa cada status', 'Perguntas frequentes']

/**
 * Faixa de utilidades: duas páginas que não são institucionais (ferramentas
 * gratuitas e central de ajuda), com acesso direto. Formato de painel dividido
 * — propositalmente diferente dos cards das outras seções.
 */
export function Resources({ navegar }: { navegar: (destino: Rota) => void }) {
  return (
    <section id="recursos" aria-labelledby="recursos-titulo" className="relative py-20 sm:py-24">
      <div className="container-site relative">
        <Reveal>
          <h2 id="recursos-titulo" className="sr-only">
            Recursos para estudantes
          </h2>
          <div className="grid overflow-hidden rounded-2xl border border-offwhite-50/10 bg-deep-900/55 md:grid-cols-2">
            <div className="border-b border-offwhite-50/8 p-7 sm:p-9 md:border-r md:border-b-0">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent-400/12 text-accent-400">
                  <Sigma className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <p className="font-caption text-xs font-bold tracking-[0.2em] text-accent-400 uppercase">
                  Ferramentas gratuitas
                </p>
              </div>
              <h3 className="mt-5 font-display text-xl font-extrabold text-offwhite-50 sm:text-2xl">
                Apoios de estudo que rodam no navegador
              </h3>
              <ul className="mt-4 space-y-2">
                {FERRAMENTAS.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 font-body text-sm text-offwhite-100/70">
                    <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => navegar('ferramentas')} className="btn-ghost mt-7 py-2.5! text-xs!">
                Abrir ferramentas
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-7 sm:p-9">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent-400/12 text-accent-400">
                  <LifeBuoy className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <p className="font-caption text-xs font-bold tracking-[0.2em] text-accent-400 uppercase">
                  Central de ajuda
                </p>
              </div>
              <h3 className="mt-5 font-display text-xl font-extrabold text-offwhite-50 sm:text-2xl">
                Dúvidas sobre pedido, status e dados
              </h3>
              <ul className="mt-4 space-y-2">
                {AJUDAS.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 font-body text-sm text-offwhite-100/70">
                    <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => navegar('ajuda')} className="btn-ghost mt-7 py-2.5! text-xs!">
                Abrir central de ajuda
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
