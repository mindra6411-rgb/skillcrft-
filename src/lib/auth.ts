import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from './supabase'
import { codificarErroAuth, erroAuth, type CodigoErroAuth } from './erros'
import { comoPapel, type Papel } from './papeis'
import { normalizarEmail, sanitizarTexto } from './validation'

/**
 * Camada de autenticação do Skill Craft (e-mail + senha via Supabase Auth).
 *
 * Regras que valem para TODO este arquivo:
 *
 * • senha nunca é lida, comparada, guardada ou registrada aqui — ela vai direto
 *   para o Supabase Auth, que aplica bcrypt e nunca a devolve;
 * • nenhuma mensagem crua do provedor chega à interface (ver `lib/erros.ts`);
 * • nenhuma chave privilegiada: só a `anon` pública, e todas as decisões de
 *   permissão acontecem no banco (RLS + funções `skillcraft_*`);
 * • sessão persistida pelo SDK com refresh automático e detecção de retorno
 *   por e-mail (confirmação/reset chegam no fragmento da URL).
 */

export type Resultado<T = void> = { ok: true; dados: T } | { ok: false; codigo: CodigoErroAuth }

function falha(codigo: CodigoErroAuth): { ok: false; codigo: CodigoErroAuth } {
  return { ok: false, codigo }
}

/** URL de retorno dos e-mails (confirmação e recuperação). Sempre a origem atual. */
function urlDeRetorno(): string {
  const { origin, pathname } = window.location
  return `${origin}${pathname}`
}

export function authDisponivel(): boolean {
  return isSupabaseConfigured && supabase !== null
}

/* ------------------------------------------------------------------ *
 * Rate limiting de login (servidor)
 * ------------------------------------------------------------------ */

export type EstadoRateLimit = {
  permitido: boolean
  falhas: number
  limite: number
  esperarSegundos: number
  /** true quando não foi possível consultar (banco ausente/sem migration). */
  indisponivel?: boolean
}

/**
 * Consulta o bloqueio no BANCO (`skillcraft_pode_tentar_login`).
 *
 * Se a função ainda não existir (migration 0005 não aplicada), devolvemos
 * `indisponivel: true` e permitimos a tentativa — o Supabase Auth já tem o
 * próprio limite de requisições. Preferimos degradar de forma declarada a
 * bloquear todo mundo por causa de uma migration pendente.
 */
export async function consultarRateLimit(email: string): Promise<EstadoRateLimit> {
  const neutro: EstadoRateLimit = { permitido: true, falhas: 0, limite: 5, esperarSegundos: 0, indisponivel: true }
  if (!supabase) return neutro

  const { data, error } = await supabase.rpc('skillcraft_pode_tentar_login', { p_email: normalizarEmail(email) })
  if (error) return neutro

  const bruto = (data ?? {}) as Record<string, unknown>
  return {
    permitido: bruto.permitido === true,
    falhas: typeof bruto.falhas === 'number' ? bruto.falhas : 0,
    limite: typeof bruto.limite === 'number' ? bruto.limite : 5,
    esperarSegundos: typeof bruto.esperar_segundos === 'number' ? bruto.esperar_segundos : 0,
  }
}

async function registrarFalhaLogin(email: string): Promise<void> {
  if (!supabase) return
  // Silencioso de propósito: se falhar, o login continua funcionando.
  await supabase.rpc('skillcraft_registra_falha_login', { p_email: normalizarEmail(email) })
}

/* ------------------------------------------------------------------ *
 * Cadastro
 * ------------------------------------------------------------------ */

export type DadosCadastro = {
  nome: string
  email: string
  senha: string
  /** O aluno pode se declarar professor do ensino? Só com e-mail autorizado. */
  solicitarProfessor?: boolean
}

/**
 * Cria a conta. O papel NUNCA é enviado pelo cliente:
 *   • o trigger `trg_cria_perfil_padrao` cria o perfil como 'aluno';
 *   • o pedido de professor é conferido contra `professores_autorizados` no
 *     banco, e só então o perfil é ajustado por uma rotina privilegiada.
 * Ver `promoverProfessorSeAutorizado`.
 */
export async function cadastrar(dados: DadosCadastro): Promise<Resultado<{ precisaConfirmarEmail: boolean }>> {
  if (!supabase) return falha('nao_configurado')

  const email = normalizarEmail(dados.email)
  const nome = sanitizarTexto(dados.nome)

  const { data, error } = await supabase.auth.signUp({
    email,
    password: dados.senha,
    options: {
      // Metadados aqui são apenas informativos (nome de exibição).
      // `papel` jamais é enviado: user_metadata é forjável pelo cliente.
      data: { nome },
      emailRedirectTo: urlDeRetorno(),
    },
  })

  if (error) return falha(codificarErroAuth(error))

  // Com confirmação de e-mail ligada, `session` vem nulo e `user` existe.
  const precisaConfirmarEmail = !data.session

  if (dados.solicitarProfessor && data.user) {
    // Só tem efeito se o e-mail estiver na lista do banco.
    await promoverProfessorSeAutorizado(email)
  }

  return { ok: true, dados: { precisaConfirmarEmail } }
}

/**
 * Pede ao banco a promoção para professor. A function responde `false` quando
 * o e-mail não está em `professores_autorizados` — nesse caso nada muda.
 * Usada no cadastro e disponível para reaplicar depois.
 */
export async function promoverProfessorSeAutorizado(email: string): Promise<boolean> {
  if (!supabase) return false
  const { data, error } = await supabase.rpc('skillcraft_promove_professor', {
    p_email: normalizarEmail(email),
  })
  if (error) return false
  return data === true
}

/* ------------------------------------------------------------------ *
 * Login
 * ------------------------------------------------------------------ */

export async function entrar(email: string, senha: string): Promise<Resultado<Session | null>> {
  if (!supabase) return falha('nao_configurado')

  const limite = await consultarRateLimit(email)
  if (!limite.indisponivel && !limite.permitido) return falha('muitas_tentativas')

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizarEmail(email),
    password: senha,
  })

  if (error) {
    const codigo = codificarErroAuth(error)
    if (codigo === 'credenciais') await registrarFalhaLogin(email)
    return falha(codigo)
  }

  return { ok: true, dados: data.session }
}

/* ------------------------------------------------------------------ *
 * Recuperação e alteração de senha
 * ------------------------------------------------------------------ */

/**
 * Envia o e-mail de recuperação.
 *
 * SEGURANÇA: a resposta é sempre de sucesso, exista ou não a conta. Assim o
 * site não vira um oráculo de "quem tem conta aqui". O Supabase já faz o mesmo
 * internamente; aqui garantimos que a interface não vaze a diferença.
 */
export async function recuperarSenha(email: string): Promise<Resultado> {
  if (!supabase) return falha('nao_configurado')
  await supabase.auth.resetPasswordForEmail(normalizarEmail(email), { redirectTo: urlDeRetorno() })
  return { ok: true, dados: undefined }
}

/** Define uma nova senha para a sessão atual (link de recuperação ou troca voluntária). */
export async function definirNovaSenha(novaSenha: string): Promise<Resultado> {
  if (!supabase) return falha('nao_configurado')
  const { error } = await supabase.auth.updateUser({ password: novaSenha })
  if (error) {
    const codigo = codificarErroAuth(error)
    // "Mesma senha" chega como weak_password ou erro genérico do provedor.
    return falha(codigo === 'desconhecido' ? 'senha_fraca' : codigo)
  }
  return { ok: true, dados: undefined }
}

/**
 * Troca de senha com confirmação da senha atual.
 *
 * O Supabase não expõe "verificar senha atual". A verificação é feita
 * reautenticando com as credenciais informadas — o que já serviu para provar
 * que a sessão pertence a quem sabe a senha. Isso também passa pelo rate limit.
 */
export async function trocarSenha(
  email: string,
  senhaAtual: string,
  novaSenha: string,
): Promise<Resultado> {
  if (!supabase) return falha('nao_configurado')

  const limite = await consultarRateLimit(email)
  if (!limite.indisponivel && !limite.permitido) return falha('muitas_tentativas')

  const { error: erroReauth } = await supabase.auth.signInWithPassword({
    email: normalizarEmail(email),
    password: senhaAtual,
  })
  if (erroReauth) {
    const codigo = codificarErroAuth(erroReauth)
    if (codigo === 'credenciais') await registrarFalhaLogin(email)
    return falha(codigo === 'credenciais' ? 'credenciais' : codigo)
  }

  return definirNovaSenha(novaSenha)
}

/* ------------------------------------------------------------------ *
 * Reenvio de confirmação e logout
 * ------------------------------------------------------------------ */

export async function reenviarConfirmacao(email: string): Promise<Resultado> {
  if (!supabase) return falha('nao_configurado')
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: normalizarEmail(email),
    options: { emailRedirectTo: urlDeRetorno() },
  })
  if (error) return falha(codificarErroAuth(error))
  return { ok: true, dados: undefined }
}

/**
 * Logout. Sempre encerra o estado local, mesmo se a chamada de rede falhar —
 * deixar o usuário "meio logado" por causa de um timeout seria pior.
 */
export async function sair(): Promise<void> {
  if (!supabase) return
  try {
    await supabase.auth.signOut()
  } catch {
    /* rede indisponível: a sessão local já foi limpa pelo SDK */
  }
}

/* ------------------------------------------------------------------ *
 * Sessão e papel (sempre do banco)
 * ------------------------------------------------------------------ */

export async function sessaoAtual(): Promise<Session | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function aoMudarSessao(
  callback: (evento: AuthChangeEvent, sessao: Session | null) => void,
): () => void {
  if (!supabase) return () => undefined
  const { data } = supabase.auth.onAuthStateChange(callback)
  return () => data.subscription.unsubscribe()
}

/** Nome de exibição: metadado `nome` (definido no cadastro) ou prefixo do e-mail. */
export function nomeDoUsuario(usuario: User | null): string {
  if (!usuario) return ''
  const meta = usuario.user_metadata?.nome
  if (typeof meta === 'string' && meta.trim()) return sanitizarTexto(meta)
  return (usuario.email ?? '').split('@')[0]
}

/**
 * Lê o papel atual do BANCO. Qualquer falha cai em 'aluno' (privilégio mínimo).
 * Nunca confia em `user_metadata.papel` nem em nada vindo do navegador.
 */
export async function consultarPapel(): Promise<Papel> {
  if (!supabase) return 'aluno'
  const { data, error } = await supabase.rpc('skillcraft_papel')
  if (error) return 'aluno'
  return comoPapel(data)
}

/** true apenas quando o banco confirma o papel de administrador. */
export async function confirmarAdministrador(): Promise<boolean> {
  if (!supabase) return false
  const { data, error } = await supabase.rpc('skillcraft_eh_admin')
  if (error) return false
  return data === true
}

export { erroAuth }
