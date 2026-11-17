import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import {
  authDisponivel,
  cadastrar as cadastrarNoBanco,
  consultarPapel,
  consultarRateLimit as consultarRateLimitNoBanco,
  definirNovaSenha as definirNovaSenhaNoBanco,
  entrar as entrarNoBanco,
  recuperarSenha as recuperarSenhaNoBanco,
  reenviarConfirmacao as reenviarConfirmacaoNoBanco,
  sair as sairNoBanco,
  sessaoAtual,
  trocarSenha as trocarSenhaNoBanco,
  aoMudarSessao,
  type DadosCadastro,
  type EstadoRateLimit,
  type Resultado,
} from '../lib/auth'
import type { CodigoErroAuth } from '../lib/erros'
import { comoPapel, type Papel } from '../lib/papeis'

export type AcaoAuth = Resultado

type AuthContexto = {
  session: Session | null
  usuario: User | null
  /** Papel confirmado pelo banco. 'aluno' enquanto não houver sessão/consulta. */
  papel: Papel
  /** true enquanto o papel do usuário está sendo confirmado no banco. */
  carregandoPapel: boolean
  carregando: boolean
  configurado: boolean
  cadastrar: (dados: DadosCadastro) => Promise<Resultado<{ precisaConfirmarEmail: boolean }>>
  entrar: (email: string, senha: string) => Promise<AcaoAuth>
  recuperarSenha: (email: string) => Promise<AcaoAuth>
  definirNovaSenha: (novaSenha: string) => Promise<AcaoAuth>
  trocarSenha: (senhaAtual: string, novaSenha: string) => Promise<AcaoAuth>
  reenviarConfirmacao: (email: string) => Promise<AcaoAuth>
  sair: () => Promise<void>
  consultarRateLimit: (email: string) => Promise<EstadoRateLimit>
  /** Reconsulta o papel no banco (ex.: depois de o admin ser promovido). */
  recarregarPapel: () => Promise<Papel>
  /** Último erro, já traduzido para mensagem segura. */
  ultimoErro: CodigoErroAuth | null
  limparErro: () => void
}

const Contexto = createContext<AuthContexto | null>(null)

/**
 * Estado global de autenticação.
 *
 * Duas decisões de segurança importantes:
 *
 * 1. **O papel vem do banco, sempre.** Não existe "setPapel" público, não há
 *    leitura de localStorage e o `user_metadata` é ignorado para autorização.
 *    Alterar o JavaScript no navegador muda a tela, nunca o que o PostgreSQL
 *    permite ler ou escrever.
 * 2. **Sessão é do SDK.** O Supabase persiste o token com refresh automático;
 *    aqui só reagimos a `onAuthStateChange`. Tokens que chegam no fragmento da
 *    URL (confirmação de e-mail / recuperação) são limpos em seguida.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [papel, setPapel] = useState<Papel>('aluno')
  const [carregando, setCarregando] = useState(authDisponivel())
  const [carregandoPapel, setCarregandoPapel] = useState(false)
  const [ultimoErro, setUltimoErro] = useState<CodigoErroAuth | null>(null)
  const montado = useRef(true)

  const recarregarPapel = useCallback(async (): Promise<Papel> => {
    if (!authDisponivel()) {
      setPapel('aluno')
      return 'aluno'
    }
    setCarregandoPapel(true)
    try {
      const confirmado = await consultarPapel()
      if (montado.current) setPapel(comoPapel(confirmado))
      return confirmado
    } finally {
      if (montado.current) setCarregandoPapel(false)
    }
  }, [])

  useEffect(() => {
    montado.current = true
    if (!authDisponivel()) {
      setCarregando(false)
      return
    }

    void (async () => {
      const atual = await sessaoAtual()
      if (!montado.current) return
      setSession(atual)
      setCarregando(false)
      if (atual) await recarregarPapel()
    })()

    const cancelar = aoMudarSessao((_evento, novaSessao) => {
      if (!montado.current) return
      setSession(novaSessao)
      setCarregando(false)

      if (!novaSessao) {
        // Sem sessão não há papel: privilégio mínimo.
        setPapel('aluno')
        return
      }

      void recarregarPapel()

      // Retorno de e-mail (confirmação/recuperação) chega no fragmento.
      // Limpa os tokens da URL e, se o usuário estava numa rota com hash de
      // token, devolve-o a uma rota conhecida.
      const hash = window.location.hash
      if (hash && !hash.startsWith('#/') && /(access_token|refresh_token|code|error|type)=/.test(hash)) {
        const tipo = new URLSearchParams(hash.replace(/^#/, '')).get('type')
        const destino = tipo === 'recovery' ? 'redefinir-senha' : 'app'
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/${destino}`)
        window.dispatchEvent(
          typeof HashChangeEvent !== 'undefined' ? new HashChangeEvent('hashchange') : new Event('hashchange'),
        )
      }
    })

    return () => {
      montado.current = false
      cancelar()
    }
  }, [recarregarPapel])

  /** Executa uma ação, guarda o erro traduzido e devolve o resultado. */
  const executar = useCallback(async <T,>(acao: () => Promise<Resultado<T>>): Promise<Resultado<T>> => {
    setUltimoErro(null)
    const resultado = await acao()
    if (!resultado.ok) setUltimoErro(resultado.codigo)
    return resultado
  }, [])

  const cadastrar = useCallback(
    (dados: DadosCadastro) => executar(() => cadastrarNoBanco(dados)),
    [executar],
  )

  const entrar = useCallback(
    async (email: string, senha: string): Promise<AcaoAuth> => {
      const resultado = await entrarNoBanco(email, senha)
      if (!resultado.ok) {
        setUltimoErro(resultado.codigo)
        return { ok: false, codigo: resultado.codigo }
      }
      setUltimoErro(null)
      await recarregarPapel()
      return { ok: true, dados: undefined }
    },
    [recarregarPapel],
  )

  const recuperarSenha = useCallback((email: string) => executar(() => recuperarSenhaNoBanco(email)), [executar])

  const definirNovaSenha = useCallback(
    (novaSenha: string) => executar(() => definirNovaSenhaNoBanco(novaSenha)),
    [executar],
  )

  const trocarSenha = useCallback(
    (senhaAtual: string, novaSenha: string) =>
      executar(() => trocarSenhaNoBanco(session?.user.email ?? '', senhaAtual, novaSenha)),
    [executar, session],
  )

  const reenviarConfirmacao = useCallback(
    (email: string) => executar(() => reenviarConfirmacaoNoBanco(email)),
    [executar],
  )

  const sair = useCallback(async () => {
    await sairNoBanco()
    setSession(null)
    setPapel('aluno')
    setUltimoErro(null)
  }, [])

  const consultarRateLimit = useCallback(
    (email: string) => consultarRateLimitNoBanco(email),
    [],
  )

  const limparErro = useCallback(() => setUltimoErro(null), [])

  const valor = useMemo<AuthContexto>(
    () => ({
      session,
      usuario: session?.user ?? null,
      papel,
      carregandoPapel,
      carregando,
      configurado: authDisponivel(),
      cadastrar,
      entrar,
      recuperarSenha,
      definirNovaSenha,
      trocarSenha,
      reenviarConfirmacao,
      sair,
      consultarRateLimit,
      recarregarPapel,
      ultimoErro,
      limparErro,
    }),
    [
      session,
      papel,
      carregandoPapel,
      carregando,
      cadastrar,
      entrar,
      recuperarSenha,
      definirNovaSenha,
      trocarSenha,
      reenviarConfirmacao,
      sair,
      consultarRateLimit,
      recarregarPapel,
      ultimoErro,
      limparErro,
    ],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useAuth(): AuthContexto {
  const ctx = useContext(Contexto)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.')
  return ctx
}
