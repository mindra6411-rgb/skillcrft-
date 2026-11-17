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
        <img
          src="/brand/symbol-white.webp"
          alt=""
          aria-hidden="true"
          className="h-9 w-auto shrink-0 object-contain"
          width={36}
          height={24}
        />
        <span className="font-display text-lg font-extrabold tracking-tight lowercase text-offwhite-50">
          skill craft
        </span>
      </span>
    )
  }
  const arq = ARQUIVOS[variante]
  return (
    // w-auto + object-contain são obrigatórios: os call sites passam só a altura
    // (h-12, h-16, h-32…). Sem `w-auto`, o atributo width=669 vira largura de
    // layout e a imagem é esticada para ~669px de largura por 64px de altura.
    <img
      src={arq.src}
      alt={rotulo}
      width={arq.w}
      height={arq.h}
      className={`w-auto shrink-0 object-contain ${className}`.trim()}
      loading="eager"
      decoding="async"
    />
  )
}
