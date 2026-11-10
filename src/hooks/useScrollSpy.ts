import { useEffect, useState } from 'react'

/** Destaca o link da seção atualmente visível na navbar. */
export function useScrollSpy(ids: readonly string[]): string {
  const [ativo, setAtivo] = useState<string>(ids[0] ?? '')

  useEffect(() => {
    const observadores: IntersectionObserver[] = []
    const visiveis = new Map<string, number>()

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          visiveis.set(entrada.target.id, entrada.isIntersecting ? entrada.intersectionRatio : 0)
        }
        let melhor = ''
        let melhorRatio = 0
        visiveis.forEach((ratio, id) => {
          if (ratio > melhorRatio) {
            melhorRatio = ratio
            melhor = id
          }
        })
        if (melhor && melhorRatio > 0) setAtivo(melhor)
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.2, 0.5, 1] },
    )

    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) {
        observador.observe(el)
        observadores.push(observador)
      }
    }
    return () => observadores.forEach((o) => o.disconnect())
  }, [ids])

  return ativo
}
