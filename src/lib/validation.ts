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
