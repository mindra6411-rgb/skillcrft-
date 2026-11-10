/**
 * Conteúdo institucional oficial da Skill Craft.
 * Fontes: modelo_de_negocio_skillscraft.md, servicos_precos.xlsx (consolidado),
 * slogans_frases_impacto.txt e Guia de Identidade Visual v1.0.
 * NÃO alterar serviços ou preços oficiais.
 */

export type Servico = {
  id: string
  titulo: string
  descricao: string
  preco: number
  precoLabel: string
  area: string
  icone: 'presentation' | 'globe' | 'file-check' | 'book' | 'palette'
}

export const SERVICOS: Servico[] = [
  {
    id: 'apresentacoes',
    titulo: 'Criação de apresentações',
    descricao:
      'Slides organizados e visualmente atrativos, com hierarquia clara de informações para seminários e trabalhos.',
    preco: 15,
    precoLabel: 'R$ 15,00',
    area: 'Design Gráfico',
    icone: 'presentation',
  },
  {
    id: 'sites-simples',
    titulo: 'Criação de sites simples',
    descricao:
      'Sites simples para trabalhos e projetos escolares, com layout responsivo e aparência profissional.',
    preco: 30,
    precoLabel: 'R$ 30,00',
    area: 'Tecnologia da Informação',
    icone: 'globe',
  },
  {
    id: 'revisao-de-trabalhos',
    titulo: 'Revisão de trabalhos',
    descricao:
      'Correção de escrita, organização e formatação, com olhar atento a coerência, normas e clareza.',
    preco: 10,
    precoLabel: 'R$ 10,00',
    area: 'Administração',
    icone: 'file-check',
  },
  {
    id: 'resumos-tecnicos',
    titulo: 'Resumos técnicos',
    descricao:
      'Resumos de conteúdos de TI, Design e ADM, objetivos e bem estruturados para facilitar seus estudos.',
    preco: 10,
    precoLabel: 'R$ 10,00',
    area: 'Três áreas integradas',
    icone: 'book',
  },
  {
    id: 'artes-e-logotipos',
    titulo: 'Criação de artes e logotipos',
    descricao:
      'Cartazes, logotipos e materiais de divulgação com identidade visual consistente para sua ideia.',
    preco: 15,
    precoLabel: 'R$ 15,00',
    area: 'Design Gráfico',
    icone: 'palette',
  },
]

export type Etapa = {
  numero: string
  titulo: string
  descricao: string
  icone: 'clipboard' | 'send' | 'file-search' | 'laptop' | 'package-check'
}

export const ETAPAS: Etapa[] = [
  {
    numero: '01',
    titulo: 'Escolha do serviço',
    descricao: 'O aluno escolhe o serviço no site ou entra em contato com a equipe.',
    icone: 'clipboard',
  },
  {
    numero: '02',
    titulo: 'Envio das informações',
    descricao: 'Levantamento do curso, da disciplina e dos detalhes do pedido.',
    icone: 'send',
  },
  {
    numero: '03',
    titulo: 'Recebimento do orçamento',
    descricao: 'Apresentação dos valores de referência, prazos e condições.',
    icone: 'file-search',
  },
  {
    numero: '04',
    titulo: 'Desenvolvimento do pedido',
    descricao: 'A equipe desenvolve o pedido ou realiza a orientação online.',
    icone: 'laptop',
  },
  {
    numero: '05',
    titulo: 'Entrega e pós-venda',
    descricao: 'O serviço é entregue ao aluno, com acompanhamento e coleta de feedback.',
    icone: 'package-check',
  },
]

export type Area = {
  id: string
  titulo: string
  resumo: string
  itens: string[]
  icone: 'briefcase' | 'code' | 'pen-tool'
}

export const AREAS: Area[] = [
  {
    id: 'administracao',
    titulo: 'Administração',
    resumo:
      'Organização, processos e visão de negócio: a base que mantém cada pedido dentro de prazo, escopo e qualidade.',
    itens: [
      'Gestão e empreendedorismo',
      'Orientação em Excel e planilhas',
      'Organização e revisão de trabalhos',
    ],
    icone: 'briefcase',
  },
  {
    id: 'ti',
    titulo: 'Tecnologia da Informação',
    resumo:
      'Lógica, dados e web: a camada técnica que transforma ideias em soluções digitais funcionais.',
    itens: [
      'Lógica de programação e bancos de dados',
      'Informática básica e ferramentas digitais',
      'Criação de sites simples',
    ],
    icone: 'code',
  },
  {
    id: 'design',
    titulo: 'Design Gráfico',
    resumo:
      'Estética, comunicação e identidade: o cuidado visual que faz cada entrega transmitir profissionalismo.',
    itens: [
      'Design gráfico e digital',
      'Apresentações, artes e logotipos',
      'Orientação para portfólio',
    ],
    icone: 'pen-tool',
  },
] as Area[]

export const NAV_LINKS = [
  { id: 'inicio', label: 'Início' },
  { id: 'sobre', label: 'Sobre nós' },
  { id: 'servicos', label: 'Serviços' },
  { id: 'como-funciona', label: 'Como funciona' },
  { id: 'diferenciais', label: 'Diferenciais' },
  { id: 'contato', label: 'Contato' },
] as const

export const SLOGAN_PRINCIPAL = 'Aprenda, desenvolva e prepare-se para o mercado.'

export const FRASES_APOIO = [
  'Conhecimento que conecta, tecnologia que transforma.',
  'Da sala de aula ao mercado de trabalho: desenvolva seu potencial.',
] as const

export const MISSAO =
  'Oferecer serviços de apoio educacional, orientação e desenvolvimento de habilidades, contribuindo para a aprendizagem e o crescimento acadêmico e profissional dos estudantes.'

/** Canais de contato configuráveis por variáveis de ambiente (veja .env.example). */
export const CONTATO = {
  email: (import.meta.env.VITE_CONTACT_EMAIL as string | undefined)?.trim() || null,
  whatsapp: (import.meta.env.VITE_CONTACT_WHATSAPP as string | undefined)?.replace(/\D/g, '') || null,
  instagram: (import.meta.env.VITE_CONTACT_INSTAGRAM as string | undefined)?.trim().replace(/^@/, '') || null,
}

export const MEIOS_CONTATO = [
  { id: 'email', label: 'E-mail' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'telefone', label: 'Telefone' },
] as const

export type MeioContato = (typeof MEIOS_CONTATO)[number]['id']
