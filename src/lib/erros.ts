/**
 * Erros de autenticação — tradução e mensagens seguras.
 *
 * Duas regras que este módulo garante:
 *
 * 1. **Nunca repassar a mensagem crua do provedor para a tela.** Mensagens de
 *    backend podem revelar detalhes internos (nomes de políticas, detalhes de
 *    SQL, existência de tabela). Aqui cada código vira uma frase curta em
 *    português, sem informação de infraestrutura.
 *
 * 2. **Não confirmar se um e-mail existe.** Login com senha errada e login com
 *    e-mail não cadastrado devolvem a MESMA mensagem ("E-mail ou senha
 *    incorretos"). Recuperação de senha também responde igual nos dois casos,
 *    evitando enumeração de contas.
 */

export type CodigoErroAuth =
  | 'credenciais'
  | 'email_nao_confirmado'
  | 'email_em_uso'
  | 'senha_fraca'
  | 'email_invalido'
  | 'muitas_tentativas'
  | 'nao_autenticado'
  | 'sessao_expirada'
  | 'nao_configurado'
  | 'rede'
  | 'desconhecido'

const MENSAGENS: Record<CodigoErroAuth, string> = {
  credenciais: 'E-mail ou senha incorretos.',
  email_nao_confirmado: 'Confirme seu e-mail antes de entrar. Verifique a caixa de entrada e o spam.',
  email_em_uso: 'Este e-mail já possui conta. Use "Entrar" ou recupere a senha.',
  senha_fraca: 'A senha não atende aos requisitos mínimos de segurança.',
  email_invalido: 'Informe um e-mail válido.',
  muitas_tentativas: 'Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.',
  nao_autenticado: 'Sua sessão não está ativa. Entre novamente.',
  sessao_expirada: 'Sua sessão expirou por segurança. Entre novamente.',
  nao_configurado: 'A autenticação ainda não está configurada neste ambiente.',
  rede: 'Não foi possível falar com o servidor. Verifique sua conexão e tente de novo.',
  desconhecido: 'Não foi possível concluir a operação. Tente novamente.',
}

export function mensagemDeErro(codigo: CodigoErroAuth): string {
  return MENSAGENS[codigo]
}

/**
 * Converte o erro do Supabase Auth em um código nosso.
 *
 * A comparação é feita no `code` (estável) e, como reserva, no texto — sem
 * nunca exibir o texto original.
 */
export function codificarErroAuth(erro: unknown): CodigoErroAuth {
  const bruto = erro as { code?: string; status?: number; message?: string } | null | undefined
  const codigo = (bruto?.code ?? '').toLowerCase()
  const status = bruto?.status ?? 0
  const texto = (bruto?.message ?? '').toLowerCase()

  if (codigo === 'invalid_credentials' || texto.includes('invalid login credentials')) return 'credenciais'
  if (codigo === 'email_not_confirmed' || texto.includes('email not confirmed')) return 'email_nao_confirmado'
  if (
    codigo === 'user_already_exists' ||
    codigo === 'email_exists' ||
    texto.includes('already registered') ||
    texto.includes('already been registered') ||
    texto.includes('user already exists')
  ) {
    return 'email_em_uso'
  }
  if (codigo === 'weak_password' || texto.includes('password should be') || texto.includes('weak password')) {
    return 'senha_fraca'
  }
  if (codigo === 'email_address_invalid' || texto.includes('invalid email') || texto.includes('unable to validate email')) {
    return 'email_invalido'
  }
  if (
    codigo === 'over_email_send_rate_limit' ||
    codigo === 'over_request_rate_limit' ||
    status === 429 ||
    texto.includes('rate limit') ||
    texto.includes('too many requests')
  ) {
    return 'muitas_tentativas'
  }
  if (codigo === 'session_not_found' || codigo === 'refresh_token_not_found' || texto.includes('session')) {
    return 'sessao_expirada'
  }
  if (status >= 500 || texto.includes('fetch') || texto.includes('network')) return 'rede'
  return 'desconhecido'
}

/** Erro de autenticação com código + mensagem segura (nunca inclui detalhe interno). */
export class ErroAuth extends Error {
  readonly codigo: CodigoErroAuth

  constructor(codigo: CodigoErroAuth) {
    super(MENSAGENS[codigo])
    this.name = 'ErroAuth'
    this.codigo = codigo
  }
}

export function erroAuth(codigo: CodigoErroAuth): ErroAuth {
  return new ErroAuth(codigo)
}
