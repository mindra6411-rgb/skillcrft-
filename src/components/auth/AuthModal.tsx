import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  TriangleAlert,
  UserRound,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { mensagemDeErro, type CodigoErroAuth } from '../../lib/erros'
import {
  SENHA_MIN,
  normalizarEmail,
  validarConfirmacaoSenha,
  validarEmailAuth,
  validarNomeCompleto,
  validarSenhaLogin,
  validarSenhaNova,
} from '../../lib/validation'

export type ModoAuth = 'entrar' | 'cadastrar' | 'recuperar' | 'redefinir' | 'trocar-senha'

type Props = {
  aberto: boolean
  modo: ModoAuth
  fechar: () => void
  /** Chamado quando o modo precisa mudar (ex.: "esqueci minha senha"). */
  irParaModo: (modo: ModoAuth) => void
  /** Sucesso em fluxos que não são login (ex.: cadastro pedindo confirmação). */
  aoConcluir?: () => void
}

const TITULOS: Record<ModoAuth, string> = {
  entrar: 'Entrar na sua conta',
  cadastrar: 'Criar conta',
  recuperar: 'Recuperar senha',
  redefinir: 'Definir nova senha',
  'trocar-senha': 'Alterar senha',
}

const DESCRICOES: Record<ModoAuth, string> = {
  entrar: 'Use o e-mail e a senha cadastrados para acompanhar suas solicitações.',
  cadastrar: 'Crie sua conta para acompanhar pedidos e o status de cada um.',
  recuperar: 'Enviaremos um link para o seu e-mail. O link expira por segurança.',
  redefinir: 'Escolha uma nova senha para concluir a recuperação.',
  'trocar-senha': 'Confirme a senha atual e escolha uma nova.',
}

/** Campo de senha com botão de mostrar/ocultar (acessível). */
function Campo({
  id,
  rotulo,
  tipo = 'text',
  valor,
  aoMudar,
  erro,
  autoComplete,
  icone: Icone,
  senha = false,
  dica,
  desabilitado,
}: {
  id: string
  rotulo: string
  tipo?: string
  valor: string
  aoMudar: (v: string) => void
  erro?: string | null
  autoComplete?: string
  icone: typeof Mail
  senha?: boolean
  dica?: string
  desabilitado?: boolean
}) {
  const [visivel, setVisivel] = useState(false)
  const idErro = `${id}-erro`
  const idDica = `${id}-dica`

  return (
    <div>
      <label htmlFor={id} className="font-caption text-xs font-semibold tracking-wide text-offwhite-100/70 uppercase">
        {rotulo}
      </label>
      <div className="relative mt-1.5">
        <Icone
          className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-offwhite-100/40"
          aria-hidden="true"
        />
        <input
          id={id}
          type={senha && !visivel ? 'password' : tipo}
          className="field-input py-2.5! pr-11! pl-10!"
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
          autoComplete={autoComplete}
          aria-invalid={Boolean(erro)}
          aria-describedby={[erro ? idErro : null, dica ? idDica : null].filter(Boolean).join(' ') || undefined}
          disabled={desabilitado}
          // Sem `maxLength` agressivo em senha; o limite real é validado.
          spellCheck={false}
        />
        {senha && (
          <button
            type="button"
            onClick={() => setVisivel((v) => !v)}
            aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={visivel}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg p-2 text-offwhite-100/50 transition-colors hover:bg-offwhite-50/5 hover:text-offwhite-50"
          >
            {visivel ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        )}
      </div>
      {dica && !erro && (
        <p id={idDica} className="mt-1.5 font-caption text-[0.7rem] text-offwhite-100/45">
          {dica}
        </p>
      )}
      {erro && (
        <p id={idErro} role="alert" className="mt-1.5 font-caption text-[0.7rem] text-rose-300">
          {erro}
        </p>
      )}
    </div>
  )
}

/**
 * Caixa de autenticação — e-mail e senha (Supabase Auth).
 *
 * Não há login social. Toda mensagem de erro vem de `lib/erros.ts`, que traduz
 * códigos sem expor detalhes internos e sem confirmar se um e-mail existe.
 */
export function AuthModal({ aberto, modo, fechar, irParaModo, aoConcluir }: Props) {
  const { cadastrar, entrar, recuperarSenha, definirNovaSenha, trocarSenha, consultarRateLimit, configurado } = useAuth()
  const idBase = useId()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [senhaAtual, setSenhaAtual] = useState('')
  const [souProfessor, setSouProfessor] = useState(false)
  const [tocados, setTocados] = useState<Record<string, boolean>>({})
  const [enviando, setEnviando] = useState(false)
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [bloqueado, setBloqueado] = useState<{ falhas: number; limite: number } | null>(null)
  const refPrimeiro = useRef<HTMLInputElement>(null)

  // Reseta ao trocar de modo/abrir — evita carregar senha de um fluxo no outro.
  useEffect(() => {
    if (!aberto) return
    setSenha('')
    setConfirmacao('')
    setSenhaAtual('')
    setErroGeral(null)
    setSucesso(null)
    setBloqueado(null)
    setTocados({})
    if (modo !== 'entrar') setEmail((e) => e)
  }, [aberto, modo])

  useEffect(() => {
    if (!aberto) return
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar()
    }
    window.addEventListener('keydown', aoTeclar)
    const t = window.setTimeout(() => refPrimeiro.current?.focus(), 60)
    return () => {
      window.removeEventListener('keydown', aoTeclar)
      window.clearTimeout(t)
    }
  }, [aberto, fechar])

  const erroEmail = useMemo(() => validarEmailAuth(email), [email])
  const erroNome = useMemo(() => (modo === 'cadastrar' ? validarNomeCompleto(nome) : null), [modo, nome])
  const erroSenhaNova = useMemo(
    () => (modo === 'cadastrar' || modo === 'redefinir' || modo === 'trocar-senha' ? validarSenhaNova(senha) : null),
    [modo, senha],
  )
  const erroSenhaLogin = useMemo(() => (modo === 'entrar' ? validarSenhaLogin(senha) : null), [modo, senha])
  const erroConfirmacao = useMemo(
    () =>
      modo === 'cadastrar' || modo === 'redefinir' || modo === 'trocar-senha'
        ? validarConfirmacaoSenha(senha, confirmacao)
        : null,
    [modo, senha, confirmacao],
  )

  const mostrar = (campo: string) => (tocados[campo] ? true : false)

  async function aoEnviar(e: React.FormEvent) {
    e.preventDefault()
    setErroGeral(null)
    setSucesso(null)

    // marca tudo como tocado para exibir os erros de uma vez
    setTocados({ nome: true, email: true, senha: true, senhaAtual: true, confirmacao: true })

    if (modo === 'entrar') {
      if (erroEmail || erroSenhaLogin) return
      setEnviando(true)
      const limite = await consultarRateLimit(email)
      if (!limite.indisponivel && !limite.permitido) {
        setEnviando(false)
        setBloqueado({ falhas: limite.falhas, limite: limite.limite })
        setErroGeral(mensagemDeErro('muitas_tentativas'))
        return
      }
      const resultado = await entrar(email, senha)
      setEnviando(false)
      if (!resultado.ok) {
        setErroGeral(mensagemDeErro(resultado.codigo))
        if (resultado.codigo === 'muitas_tentativas') setBloqueado({ falhas: limite.falhas + 1, limite: limite.limite })
        if (resultado.codigo === 'email_nao_confirmado') setSucesso(null)
        return
      }
      setSucesso('Login realizado.')
      aoConcluir?.()
      window.setTimeout(fechar, 350)
      return
    }

    if (modo === 'cadastrar') {
      if (erroNome || erroEmail || erroSenhaNova || erroConfirmacao) return
      setEnviando(true)
      const resultado = await cadastrar({ nome, email, senha, solicitarProfessor: souProfessor })
      setEnviando(false)
      if (!resultado.ok) {
        setErroGeral(mensagemDeErro(resultado.codigo))
        return
      }
      setSucesso(
        resultado.dados.precisaConfirmarEmail
          ? 'Conta criada. Enviamos um link de confirmação para o seu e-mail — confirme para poder entrar.'
          : 'Conta criada e sessão iniciada.',
      )
      aoConcluir?.()
      return
    }

    if (modo === 'recuperar') {
      if (erroEmail) return
      setEnviando(true)
      const resultado = await recuperarSenha(email)
      setEnviando(false)
      // Mensagem idêntica exista ou não a conta (evita enumeração de usuários).
      setSucesso(
        resultado.ok
          ? 'Se este e-mail tiver conta, o link de recuperação chegará em alguns minutos. Confira também o spam.'
          : mensagemDeErro(resultado.codigo),
      )
      return
    }

    if (modo === 'redefinir') {
      if (erroSenhaNova || erroConfirmacao) return
      setEnviando(true)
      const resultado = await definirNovaSenha(senha)
      setEnviando(false)
      if (!resultado.ok) {
        setErroGeral(mensagemDeErro(resultado.codigo))
        return
      }
      setSucesso('Senha alterada. Use a nova senha para entrar.')
      window.setTimeout(fechar, 900)
      return
    }

    if (modo === 'trocar-senha') {
      if (!senhaAtual.trim()) {
        setErroGeral('Informe a senha atual.')
        return
      }
      if (erroSenhaNova || erroConfirmacao) return
      setEnviando(true)
      const resultado = await trocarSenha(senhaAtual, senha)
      setEnviando(false)
      if (!resultado.ok) {
        setErroGeral(
          resultado.codigo === 'credenciais' ? 'A senha atual está incorreta.' : mensagemDeErro(resultado.codigo),
        )
        return
      }
      setSucesso('Senha alterada com sucesso.')
      window.setTimeout(fechar, 900)
    }
  }

  const idTitulo = `${idBase}-titulo`

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-deep-950/80 p-4 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={fechar}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={idTitulo}
            className="card-surface relative my-auto w-full max-w-md bg-deep-900/95 p-6 sm:p-8"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={fechar}
              aria-label="Fechar"
              className="absolute top-4 right-4 rounded-lg p-2 text-offwhite-100/60 transition-colors hover:bg-offwhite-50/5 hover:text-offwhite-50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            {modo === 'recuperar' && (
              <button
                type="button"
                onClick={() => irParaModo('entrar')}
                className="mb-4 inline-flex items-center gap-1.5 font-caption text-xs text-offwhite-100/60 transition-colors hover:text-offwhite-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Voltar para o login
              </button>
            )}

            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-skill-500/15 text-accent-400">
              {modo === 'recuperar' || modo === 'redefinir' || modo === 'trocar-senha' ? (
                <KeyRound className="h-5 w-5" aria-hidden="true" />
              ) : (
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              )}
            </span>

            <h3 id={idTitulo} className="mt-4 font-display text-xl font-extrabold text-offwhite-50">
              {TITULOS[modo]}
            </h3>
            <p className="mt-2 font-body text-sm leading-relaxed text-offwhite-100/70">{DESCRICOES[modo]}</p>

            {!configurado && (
              <p className="mt-4 rounded-xl border border-amber-300/25 bg-amber-300/10 px-3 py-2.5 font-caption text-xs leading-relaxed text-amber-100">
                A autenticação ainda não está configurada neste ambiente. Nenhuma simulação é apresentada como login
                real — veja <span className="font-semibold">docs/CONFIGURACAO.md</span>.
              </p>
            )}

            <form onSubmit={aoEnviar} className="mt-5 space-y-4" noValidate>
              {modo === 'cadastrar' && (
                <Campo
                  id={`${idBase}-nome`}
                  rotulo="Nome completo"
                  valor={nome}
                  aoMudar={setNome}
                  erro={mostrar('nome') ? erroNome : null}
                  autoComplete="name"
                  icone={UserRound}
                  desabilitado={enviando}
                />
              )}

              {modo !== 'trocar-senha' && modo !== 'redefinir' && (
                <Campo
                  id={`${idBase}-email`}
                  rotulo="E-mail"
                  tipo="email"
                  valor={email}
                  aoMudar={setEmail}
                  erro={mostrar('email') ? erroEmail : null}
                  autoComplete="email"
                  icone={Mail}
                  desabilitado={enviando}
                />
              )}

              {modo === 'trocar-senha' && (
                <Campo
                  id={`${idBase}-senha-atual`}
                  rotulo="Senha atual"
                  tipo="password"
                  senha
                  valor={senhaAtual}
                  aoMudar={setSenhaAtual}
                  autoComplete="current-password"
                  icone={Lock}
                  desabilitado={enviando}
                />
              )}

              {modo !== 'recuperar' && (
                <Campo
                  id={`${idBase}-senha`}
                  rotulo={modo === 'trocar-senha' ? 'Nova senha' : 'Senha'}
                  tipo="password"
                  senha
                  valor={senha}
                  aoMudar={setSenha}
                  erro={mostrar('senha') ? (modo === 'entrar' ? erroSenhaLogin : erroSenhaNova) : null}
                  dica={
                    modo === 'entrar'
                      ? undefined
                      : `Mínimo ${SENHA_MIN} caracteres, com pelo menos uma letra e um número.`
                  }
                  autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
                  icone={Lock}
                  desabilitado={enviando}
                />
              )}

              {(modo === 'cadastrar' || modo === 'redefinir' || modo === 'trocar-senha') && (
                <Campo
                  id={`${idBase}-confirmacao`}
                  rotulo="Repita a senha"
                  tipo="password"
                  senha
                  valor={confirmacao}
                  aoMudar={setConfirmacao}
                  erro={mostrar('confirmacao') ? erroConfirmacao : null}
                  autoComplete="new-password"
                  icone={Lock}
                  desabilitado={enviando}
                />
              )}

              {modo === 'cadastrar' && (
                <label className="flex cursor-pointer items-start gap-2.5 font-caption text-xs leading-relaxed text-offwhite-100/70">
                  <input
                    type="checkbox"
                    checked={souProfessor}
                    onChange={(e) => setSouProfessor(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-offwhite-50/25"
                    disabled={enviando}
                  />
                  <span>
                    Sou professor. O perfil de professor só é liberado para e-mails previamente autorizados pela equipe.
                  </span>
                </label>
              )}

              {erroGeral && (
                <p
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2.5 font-caption text-xs leading-relaxed text-rose-200"
                >
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    {erroGeral}
                    {bloqueado && (
                      <>
                        {' '}
                        ({bloqueado.falhas} de {bloqueado.limite} tentativas nesta janela de 15 minutos.)
                      </>
                    )}
                  </span>
                </p>
              )}

              {sucesso && (
                <p
                  role="status"
                  className="flex items-start gap-2.5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2.5 font-caption text-xs leading-relaxed text-emerald-200"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {sucesso}
                </p>
              )}

              <button
                type="submit"
                disabled={enviando}
                className="btn-primary w-full py-3! text-sm! disabled:pointer-events-none disabled:opacity-60"
              >
                {enviando ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                )}
                {enviando
                  ? 'Aguarde…'
                  : modo === 'entrar'
                    ? 'Entrar'
                    : modo === 'cadastrar'
                      ? 'Criar conta'
                      : modo === 'recuperar'
                        ? 'Enviar link'
                        : 'Salvar nova senha'}
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 font-caption text-xs">
              {modo === 'entrar' && (
                <>
                  <button
                    type="button"
                    onClick={() => irParaModo('cadastrar')}
                    className="text-accent-400 transition-colors hover:text-accent-300"
                  >
                    Criar conta
                  </button>
                  <button
                    type="button"
                    onClick={() => irParaModo('recuperar')}
                    className="text-offwhite-100/60 transition-colors hover:text-offwhite-50"
                  >
                    Esqueci a senha
                  </button>
                </>
              )}
              {modo === 'cadastrar' && (
                <button
                  type="button"
                  onClick={() => irParaModo('entrar')}
                  className="text-accent-400 transition-colors hover:text-accent-300"
                >
                  Já tenho conta
                </button>
              )}
            </div>

            <p className="mt-4 border-t border-offwhite-50/8 pt-3 font-caption text-[0.7rem] leading-relaxed text-offwhite-100/40">
              Sua senha é processada pelo Supabase Auth e nunca é armazenada pelo site. Sessão protegida e permissões
              validadas no banco de dados.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Helper para outras telas que precisam exibir o erro traduzido. */
export function textoDeErro(codigo: CodigoErroAuth | null): string | null {
  return codigo ? mensagemDeErro(codigo) : null
}

export { normalizarEmail }
