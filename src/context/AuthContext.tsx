import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

type ResultadoLogin = { ok: boolean; pendente?: boolean; erro?: string }

type AuthContexto = {
  session: Session | null
  usuario: User | null
  carregando: boolean
  configurado: boolean
  entrarComGoogle: () => Promise<ResultadoLogin>
  sair: () => Promise<void>
}

const Contexto = createContext<AuthContexto | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [carregando, setCarregando] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) {
      setCarregando(false)
      return
    }
    let ativo = true

    supabase.auth.getSession().then(({ data }) => {
      if (!ativo) return
      setSession(data.session)
      setCarregando(false)
    })

    const { data: inscricao } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      if (!ativo) return
      setSession(novaSessao)
      setCarregando(false)
      // Retorno do OAuth: limpa os tokens da URL e leva o aluno à área dele.
      if (novaSessao && /(?:access_token|code)=/.test(window.location.hash)) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search + '#/app')
        window.dispatchEvent(
          typeof HashChangeEvent !== 'undefined' ? new HashChangeEvent('hashchange') : new Event('hashchange'),
        )
      }
    })

    return () => {
      ativo = false
      inscricao.subscription.unsubscribe()
    }
  }, [])

  const entrarComGoogle = useCallback(async (): Promise<ResultadoLogin> => {
    if (!supabase) return { ok: false, pendente: true }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${window.location.pathname}`,
      },
    })
    if (error) return { ok: false, erro: error.message }
    return { ok: true }
  }, [])

  const sair = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }, [])

  const valor = useMemo<AuthContexto>(
    () => ({
      session,
      usuario: session?.user ?? null,
      carregando,
      configurado: isSupabaseConfigured,
      entrarComGoogle,
      sair,
    }),
    [session, carregando, entrarComGoogle, sair],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useAuth(): AuthContexto {
  const ctx = useContext(Contexto)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.')
  return ctx
}
