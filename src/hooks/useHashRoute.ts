import { useCallback, useEffect, useRef, useState } from 'react'
import { hashDaRota, lerRota, type Rota } from '../lib/rotas'

export type { Rota } from '../lib/rotas'

/**
 * Roteador mínimo baseado em hash.
 *
 * As regras de interpretação de rota vivem em `src/lib/rotas.ts` (módulo puro,
 * testável). Aqui ficam apenas os efeitos: ouvir hashchange/popstate, manter a
 * rota no estado e trocar de página com rolagem para o topo.
 *
 * Hash routing foi escolhido de propósito: funciona em hospedagem estática sem
 * rewrite, sobrevive a F5, URL direta e botão voltar — e não precisa de
 * configuração extra na Vercel.
 */
export function useHashRoute() {
  const [rota, setRota] = useState<Rota>(() => lerRota(window.location.hash))
  const rotaAtual = useRef<Rota>(rota)
  rotaAtual.current = rota

  useEffect(() => {
    const aoMudarHash = () => {
      const hash = window.location.hash
      // Âncora interna de uma página que não é a home (ex.: "pular para o
      // conteúdo" em #/ferramentas): mantém a rota e deixa o navegador rolar.
      if (
        !hash.startsWith('#/') &&
        hash.length > 1 &&
        rotaAtual.current !== 'home' &&
        document.getElementById(hash.slice(1))
      ) {
        return
      }
      const proxima = lerRota(hash)
      setRota(proxima)
      // troca de página volta ao topo; âncoras cuidam da própria rolagem
      if (proxima !== 'home') window.scrollTo({ top: 0, behavior: 'auto' })
    }
    window.addEventListener('hashchange', aoMudarHash)
    window.addEventListener('popstate', aoMudarHash)
    return () => {
      window.removeEventListener('hashchange', aoMudarHash)
      window.removeEventListener('popstate', aoMudarHash)
    }
  }, [])

  const navegar = useCallback((destino: Rota) => {
    const hash = hashDaRota(destino)
    if (hash) {
      if (window.location.hash !== hash) window.location.hash = hash
      return
    }
    if (lerRota(window.location.hash) !== 'home') {
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
