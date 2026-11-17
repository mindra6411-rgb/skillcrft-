import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type ToolCardProps = {
  icone: LucideIcon
  titulo: string
  descricao: string
  /** Identificador da seção interna (usado pelos atalhos do topo da página). */
  id: string
  acoes?: ReactNode
  children: ReactNode
}

/** Cartão padrão das ferramentas do estudante. */
export function ToolCard({ icone: Icone, titulo, descricao, id, acoes, children }: ToolCardProps) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="card-surface scroll-mt-28 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-400/12 text-accent-400">
            <Icone className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id={`${id}-titulo`} className="font-display text-lg font-extrabold text-offwhite-50 sm:text-xl">
              {titulo}
            </h2>
            <p className="mt-1.5 max-w-xl font-body text-sm leading-relaxed text-offwhite-100/65">{descricao}</p>
          </div>
        </div>
        {acoes && <div className="flex flex-wrap items-center gap-2">{acoes}</div>}
      </div>
      <div className="mt-7">{children}</div>
    </section>
  )
}
