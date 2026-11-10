type LogoProps = {
  variante: 'lockup-color' | 'lockup-white' | 'symbol-color' | 'symbol-white' | 'navbar'
  className?: string
  rotulo?: string
}

const ARQUIVOS: Record<Exclude<LogoProps['variante'], 'navbar'>, { src: string; w: number; h: number }> = {
  'lockup-color': { src: '/brand/logo-color.webp', w: 669, h: 592 },
  'lockup-white': { src: '/brand/logo-white.webp', w: 669, h: 592 },
  'symbol-color': { src: '/brand/symbol-color.webp', w: 669, h: 449 },
  'symbol-white': { src: '/brand/symbol-white.webp', w: 669, h: 449 },
}

/**
 * Logotipo oficial da Skill Craft (asset original otimizado).
 * Versão colorida para fundos claros; monocromática branca para fundos escuros,
 * conforme o Guia de Identidade Visual v1.0.
 */
export function Logo({ variante, className = '', rotulo = 'Skill Craft' }: LogoProps) {
  if (variante === 'navbar') {
    return (
      <span className={`flex items-center gap-2.5 ${className}`}>
        <img src="/brand/symbol-white.webp" alt="" aria-hidden="true" className="h-9 w-9 shrink-0" width={36} height={24} />
        <span className="font-display text-lg font-extrabold tracking-tight lowercase text-offwhite-50">
          skill craft
        </span>
      </span>
    )
  }
  const arq = ARQUIVOS[variante]
  return (
    <img
      src={arq.src}
      alt={rotulo}
      width={arq.w}
      height={arq.h}
      className={className}
      loading="eager"
      decoding="async"
    />
  )
}
