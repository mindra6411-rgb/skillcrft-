import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

type RevealProps = {
  children: ReactNode
  delay?: number
  y?: number
  x?: number
  className?: string
}

/** Aparecimento suave das seções ao rolar (respeita prefers-reduced-motion). */
export function Reveal({ children, delay = 0, y = 30, x = 0, className }: RevealProps) {
  const reduzido = useReducedMotion()
  if (reduzido) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
