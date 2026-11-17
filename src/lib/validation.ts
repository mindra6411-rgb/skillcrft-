import { MEIOS_CONTATO, SERVICOS, type MeioContato } from '../config/site'

export type CampoFormulario = 'nome' | 'servico' | 'descricao' | 'prazo' | 'informacoes' | 'meio' | 'contato'

export const CAMPOS_OBRIGATORIOS: CampoFormulario[] = ['nome', 'servico', 'descricao', 'meio', 'contato']

export function validarNome(valor: string): string | null {
  const v = valor.trim()
  if (!v) return 'Informe seu nome.'
  if (v.length < 2) return 'O nome precisa ter pelo menos 2 caracteres.'
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ'´^~\s.-]+$/.test(v)) return 'Use apenas letras, espaços e pontuação simples.'
  return null
}

export function validarServico(valor: string): string | null {
  if (!valor) return 'Escolha o serviço desejado.'
  if (!SERVICOS.some((s) => s.id === valor)) return 'Serviço inválido. Escolha uma opção da lista.'
  return null
}

export function validarDescricao(valor: string): string | null {
  const v = valor.trim()
  if (!v) return 'Descreva o pedido.'
  if (v.length < 10) return 'Descreva com pelo menos 10 caracteres para a equipe entender o pedido.'
  if (v.length > 600) return 'Máximo de 600 caracteres.'
  return null
}

/** Prazo desejado é opcional; quando informado, precisa ser uma data futura válida. */
export function validarPrazo(valor: string): string | null {
  const v = valor.trim()
  if (!v) return null
  const data = new Date(`${v}T00:00:00`)
  if (Number.isNaN(data.getTime())) return 'Informe uma data válida.'
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  if (data.getTime() < hoje.getTime()) return 'O prazo desejado não pode ser uma data passada.'
  return null
}

/** Informações complementares: opcionais, com limite para não virar um segundo pedido. */
export function validarInformacoes(valor: string): string | null {
  const v = valor.trim()
  if (!v) return null
  if (v.length > 300) return 'Máximo de 300 caracteres.'
  return null
}

export function validarMeio(valor: string): string | null {
  if (!valor) return 'Escolha como prefere ser contatado.'
  if (!MEIOS_CONTATO.some((m) => m.id === valor)) return 'Meio de contato inválido.'
  return null
}

export function validarContato(valor: string, meio: MeioContato | ''): string | null {
  const v = valor.trim()
  if (!v) return 'Informe o contato para retorno.'
  if (meio === 'email') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? null : 'Informe um e-mail válido (ex.: nome@dominio.com).'
  }
  const digitos = v.replace(/\D/g, '')
  if (digitos.length < 10 || digitos.length > 11) {
    return 'Informe DDD + número (ex.: 11 98765-4321).'
  }
  return null
}

export function gerarProtocolo(): string {
  const ano = new Date().getFullYear()
  const aleatorio = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `SC-${ano}-${aleatorio}`
}

/** Data desejada no formato brasileiro (dia/mês/ano), sem horário. */
export function formatarData(iso: string | null): string | null {
  if (!iso) return null
  try {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
      new Date(`${iso}T00:00:00`),
    )
  } catch {
    return iso
  }
}

export function formatarDataHora(iso: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

/* ------------------------------------------------------------------ *
 * Validação de entrada da autenticação (e-mail, senha, nome)
 *
 * Objetivo: barrar entrada malformada ANTES de chegar ao Supabase, com
 * mensagens em português e sem nunca ecoar o valor digitado. Nada aqui
 * substitui a validação do servidor — é a primeira camada.
 * ------------------------------------------------------------------ */

/** Limite de e-mail do padrão (RFC 5321) e das colunas do Supabase. */
export const EMAIL_MAX = 254
export const SENHA_MIN = 8
export const SENHA_MAX = 72 // limite do bcrypt usado pelo Supabase Auth

/** Caracteres de controle (C0/C1) e zero-width: não têm uso legítimo aqui. */
const CARACTERES_INVISIVEIS = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028\u2029\uFEFF]/g

export function contemCaracteresInvisiveis(valor: string): boolean {
  return CARACTERES_INVISIVEIS.test(valor)
}

/**
 * Remove espaços nas pontas e caracteres de controle/invisíveis.
 * Não tenta "escapar HTML": quem previne XSS aqui é o React (que escapa na
 * renderização por padrão) e a ausência de injeção de HTML cru na árvore.
 */
export function sanitizarTexto(valor: string): string {
  // A regex tem flag /g: sem ela, só o primeiro caractere seria removido.
  return valor.replace(CARACTERES_INVISIVEIS, '').trim()
}

export function normalizarEmail(valor: string): string {
  return sanitizarTexto(valor).toLowerCase()
}

export function validarEmailAuth(valor: string): string | null {
  const v = normalizarEmail(valor)
  if (!v) return 'Informe seu e-mail.'
  if (v.length > EMAIL_MAX) return 'E-mail muito longo.'
  if (contemCaracteresInvisiveis(valor)) return 'O e-mail contém caracteres inválidos.'
  // Formato intencionalmente simples e restritivo: sem espaços, sem `<>`, um @.
  if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/.test(v)) {
    return 'Informe um e-mail válido (ex.: nome@dominio.com).'
  }
  if (v.includes('..')) return 'Informe um e-mail válido (ex.: nome@dominio.com).'
  return null
}

const SENHAS_OBVIAS = new Set([
  '12345678',
  '123456789',
  '1234567890',
  'senha123',
  'password',
  'password1',
  'qwertyui',
  'abc12345',
  'admin123',
  'skillcraft',
  'skillcraft123',
])

export function validarSenhaNova(valor: string): string | null {
  if (!valor) return 'Informe uma senha.'
  if (valor.length < SENHA_MIN) return `A senha precisa ter pelo menos ${SENHA_MIN} caracteres.`
  if (valor.length > SENHA_MAX) return `A senha pode ter no máximo ${SENHA_MAX} caracteres.`
  if (contemCaracteresInvisiveis(valor)) return 'A senha contém caracteres inválidos.'
  if (!/[A-Za-zÀ-ÿ]/.test(valor) || !/\d/.test(valor)) {
    return 'Use pelo menos uma letra e um número.'
  }
  if (SENHAS_OBVIAS.has(valor.toLowerCase())) return 'Essa senha é fácil de adivinhar. Escolha outra.'
  return null
}

/** No login só se exige presença — validar formato aqui revelaria a regra de cadastro. */
export function validarSenhaLogin(valor: string): string | null {
  if (!valor) return 'Informe sua senha.'
  if (valor.length > SENHA_MAX) return 'Senha incorreta.'
  return null
}

export function validarNomeCompleto(valor: string): string | null {
  const v = sanitizarTexto(valor)
  if (!v) return 'Informe seu nome.'
  if (v.length < 3) return 'Informe seu nome completo.'
  if (v.length > 120) return 'Nome muito longo (máximo 120 caracteres).'
  if (contemCaracteresInvisiveis(valor)) return 'O nome contém caracteres inválidos.'
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ'´^~\s.-]+$/.test(v)) return 'Use apenas letras, espaços e pontuação simples.'
  if (!v.includes(' ')) return 'Informe nome e sobrenome.'
  return null
}

/** Senha repetida no cadastro/alteração — comparação exata, sem trim. */
export function validarConfirmacaoSenha(senha: string, confirmacao: string): string | null {
  if (!confirmacao) return 'Repita a senha.'
  if (senha !== confirmacao) return 'As senhas não coincidem.'
  return null
}
