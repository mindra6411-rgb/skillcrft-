import { MEIOS_CONTATO, SERVICOS, type MeioContato } from '../config/site'

export type CampoFormulario = 'nome' | 'servico' | 'descricao' | 'meio' | 'contato'

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
