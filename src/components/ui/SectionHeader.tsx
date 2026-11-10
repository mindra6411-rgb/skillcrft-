import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

type SectionHeaderProps = {
  kicker: string
  titulo: ReactNode
  lead?: ReactNode
  alinhamento?: 'centro' | 'esquerda'
  tom?: 'escuro' | 'claro'
}

export function SectionHeader({ kicker, titulo, lead, alinhamento = 'centro', tom = 'escuro' }: SectionHeaderProps) {
  const claro = tom === 'claro'
  return (
    <Reveal className={alinhamento === 'centro' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className={`kicker ${claro ? 'text-skill-600' : 'text-accent-400'}`}>
        <span aria-hidden="true" className="kicker-dot" />
        {kicker}
      </p>
      <h2
        className={`mt-5 font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl lg:text-[2.9rem] lg:leading-[1.08] ${
          claro ? 'text-deep-800' : 'text-offwhite-50'
        }`}
      >
        {titulo}
      </h2>
      {lead && (
        <p
          className={`mt-5 font-body text-base leading-relaxed sm:text-lg ${
            alinhamento === 'centro' ? 'mx-auto' : ''
          } ${claro ? 'text-charcoal-700' : 'text-offwhite-100/70'}`}
        >
          {lead}
        </p>
      )}
    </Reveal>
  )
}
