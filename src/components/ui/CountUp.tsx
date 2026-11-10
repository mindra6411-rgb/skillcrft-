import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'framer-motion'

type CountUpProps = {
  valor: number
  sufixo?: string
  duracao?: number
  className?: string
}

/** Contagem animada de números reais, disparada quando entra na viewport. */
export function CountUp({ valor, sufixo = '', duracao = 1.5, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const emView = useInView(ref, { once: true, margin: '-40px' })
  const reduzido = useReducedMotion()
  const [atual, setAtual] = useState(0)

  useEffect(() => {
    if (!emView) return
    if (reduzido) {
      setAtual(valor)
      return
    }
    const controle = animate(0, valor, {
      duration: duracao,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setAtual(Math.round(v)),
    })
    return () => controle.stop()
  }, [emView, valor, duracao, reduzido])

  return (
    <span ref={ref} className={className}>
      {atual}
      {sufixo}
    </span>
  )
}
