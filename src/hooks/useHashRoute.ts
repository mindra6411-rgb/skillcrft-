import { useCallback, useEffect, useState } from 'react'

export type Rota = 'home' | 'app'

function lerRota(): Rota {
  const hash = window.location.hash
  if (hash.startsWith('#/')) return hash.slice(2) === 'app' ? 'app' : 'home'
  return 'home'
}

/**
 * Roteador mínimo baseado em hash (#/app = área do aluno).
 * Hashes de âncora (#servicos, #contato...) continuam funcionando nativamente
 * e levam de volta à página institucional.
 */
export function useHashRoute() {
  const [rota, setRota] = useState<Rota>(lerRota)

  useEffect(() => {
    const aoMudarHash = () => setRota(lerRota())
    window.addEventListener('hashchange', aoMudarHash)
    return () => window.removeEventListener('hashchange', aoMudarHash)
  }, [])

  const navegar = useCallback((destino: Rota) => {
    if (destino === 'app') {
      window.location.hash = '#/app'
      return
    }
    if (lerRota() !== 'home') {
      window.history.pushState(null, '', window.location.pathname + window.location.search)
      setRota('home')
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  return { rota, navegar }
}

export function irParaSecao(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduzido ? 'auto' : 'smooth', block: 'start' })
}
