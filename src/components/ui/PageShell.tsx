import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

type PageShellProps = {
  kicker: string
  titulo: string
  lead?: ReactNode
  irParaHome: () => void
  rotuloVoltar?: string
  children: ReactNode
  /** Conteúdo complementar exibido ao lado do cabeçalho (ex.: avisos). */
  aside?: ReactNode
}

/**
 * Cabeçalho padrão das páginas internas (fora da página institucional):
 * mesma identidade visual, hierarquia clara e sempre um caminho de volta.
 */
export function PageShell({
  kicker,
  titulo,
  lead,
  irParaHome,
  rotuloVoltar = 'Voltar ao site',
  children,
  aside,
}: PageShellProps) {
  return (
    <div className="container-site min-h-screen pt-28 pb-20 sm:pt-36">
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl"
      >
        <button type="button" onClick={irParaHome} className="btn-ghost px-4! py-2! text-xs!">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          {rotuloVoltar}
        </button>
        <p className="kicker mt-8 text-accent-400">
          <span aria-hidden="true" className="kicker-dot" />
          {kicker}
        </p>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-balance text-offwhite-50 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
          {titulo}
        </h1>
        {lead && <p className="mt-4 font-body text-base leading-relaxed text-offwhite-100/70">{lead}</p>}
      </motion.header>

      {aside && <div className="mt-8">{aside}</div>}

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="mt-10"
      >
        {children}
      </motion.div>
    </div>
  )
}
