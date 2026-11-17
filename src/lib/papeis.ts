/**
 * Tabela de papéis de acesso (perfis) do Skill Craft.
 *
 * Regra de ouro: o papel usado pela INTERFACE vem sempre do banco
 * (`skillcraft_papel()`), nunca de localStorage, da URL ou de parâmetro de
 * requisição. O que existe aqui é só a descrição das permissões para fins de
 * experiência de usuário — a autorização de verdade está nas políticas de RLS
 * (`supabase/migrations/0004_perfis_papeis.sql`).
 *
 * "Visitante" não é um papel gravado: é a ausência de sessão.
 */
export const PAPEIS = ['aluno', 'professor', 'administrador'] as const

export type Papel = (typeof PAPEIS)[number]

export type Perfil = {
  id: Papel
  rotulo: string
  descricao: string
  /** Pode abrir a Área do Aluno (histórico dos próprios pedidos). */
  areaDoAluno: boolean
  /** Pode ler todas as solicitações e alterar status (painel). */
  painelAdministrativo: boolean
  /** Pode gerenciar papéis de outros usuários. */
  gerenciaPerfis: boolean
}

export const PERFIS: Record<Papel, Perfil> = {
  aluno: {
    id: 'aluno',
    rotulo: 'Aluno',
    descricao: 'Envia pedidos e acompanha apenas o próprio histórico.',
    areaDoAluno: true,
    painelAdministrativo: false,
    gerenciaPerfis: false,
  },
  professor: {
    id: 'professor',
    rotulo: 'Professor',
    descricao: 'Acompanha o próprio histórico e as solicitações dos alunos, como orientador.',
    areaDoAluno: true,
    painelAdministrativo: false,
    gerenciaPerfis: false,
  },
  administrador: {
    id: 'administrador',
    rotulo: 'Administrador',
    descricao: 'Acessa o painel, lê todas as solicitações e atualiza status.',
    areaDoAluno: true,
    painelAdministrativo: true,
    gerenciaPerfis: true,
  },
}

export const PERFIL_VISITANTE: Perfil = {
  id: 'aluno',
  rotulo: 'Visitante',
  descricao: 'Navega pelo site, usa as ferramentas e envia solicitações sem conta.',
  areaDoAluno: false,
  painelAdministrativo: false,
  gerenciaPerfis: false,
}

export function ehPapel(valor: unknown): valor is Papel {
  return typeof valor === 'string' && (PAPEIS as readonly string[]).includes(valor)
}

/** Normaliza o que vem do banco/RPC: qualquer valor inesperado vira 'aluno'. */
export function comoPapel(valor: unknown): Papel {
  return ehPapel(valor) ? valor : 'aluno'
}
