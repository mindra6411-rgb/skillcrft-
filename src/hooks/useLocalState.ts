import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Estado persistido no próprio dispositivo (localStorage).
 *
 * Usado pelas ferramentas gratuitas do estudante: nada é enviado para nenhum
 * servidor e nenhum dado pessoal é coletado. Se o armazenamento estiver
 * indisponível (modo privado, cota cheia), o hook segue funcionando apenas em
 * memória e informa isso por `disponivel`.
 */
export function useLocalState<T>(chave: string, inicial: T) {
  const [valor, setValor] = useState<T>(() => {
    try {
      const bruto = window.localStorage.getItem(chave)
      if (!bruto) return inicial
      return JSON.parse(bruto) as T
    } catch {
      return inicial
    }
  })
  const [disponivel, setDisponivel] = useState(true)
  const primeira = useRef(true)

  useEffect(() => {
    if (primeira.current) {
      primeira.current = false
      return
    }
    try {
      window.localStorage.setItem(chave, JSON.stringify(valor))
      setDisponivel(true)
    } catch {
      setDisponivel(false)
    }
  }, [chave, valor])

  const limpar = useCallback(() => {
    try {
      window.localStorage.removeItem(chave)
    } catch {
      /* ignora: o estado em memória já foi reiniciado por quem chamou */
    }
    setValor(inicial)
  }, [chave, inicial])

  return { valor, setValor, limpar, disponivel }
}
