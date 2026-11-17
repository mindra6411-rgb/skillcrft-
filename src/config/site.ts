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
    area: 'Design',
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
    area: 'Design',
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
  icone: 'briefcase' | 'code' | 'palette'
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
    titulo: 'Design',
    resumo:
      'Cria a identidade visual da Skill Craft e os materiais de divulgação: é a área que dá forma, cor e consistência a cada entrega.',
    itens: [
      'Criação de apresentações, artes e logotipos',
      'Design gráfico e design digital',
      'Aulas de Canva e orientação de portfólio',
    ],
    icone: 'palette',
  },
] as Area[]

/** Todas as âncoras da página institucional (rodapé, menu e scroll-spy). */
export const NAV_LINKS = [
  { id: 'inicio', label: 'Início' },
  { id: 'sobre', label: 'Sobre nós' },
  { id: 'servicos', label: 'Serviços' },
  { id: 'como-funciona', label: 'Como funciona' },
  { id: 'diferenciais', label: 'Diferenciais' },
  { id: 'equipe', label: 'Equipe' },
  { id: 'recursos', label: 'Recursos' },
  { id: 'contato', label: 'Contato' },
] as const

/** Subconjunto exibido na barra principal em telas largas (evita excesso de itens). */
export const NAV_PRINCIPAL = ['inicio', 'servicos', 'como-funciona', 'equipe', 'recursos', 'contato'] as const

/** Páginas próprias (rotas em hash), separadas da página institucional. */
export const NAV_PAGINAS = [
  { rota: 'ferramentas', label: 'Ferramentas' },
  { rota: 'ajuda', label: 'Ajuda' },
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

/* ------------------------------------------------------------------ *
 * Equipe — três áreas de atuação, conforme o documento-base do
 * Projeto Integrador (divisão do trabalho por área) e o modelo de
 * negócio enviado pela equipe (docs/originais/).
 *
 * Decisão do responsável pelo projeto (17/11/2026): a seção NÃO exibe
 * nomes de integrantes nem quantidade de pessoas — apenas as áreas e
 * suas responsabilidades documentadas. A composição real da equipe
 * está preservada no documento original
 * (docs/originais/equipe_envolvidos.md) e poderá ser divulgada aqui
 * quando a equipe confirmar.
 * ------------------------------------------------------------------ */
export type EquipeArea = {
  id: 'administracao' | 'ti' | 'design'
  titulo: string
  sigla: string
  responsabilidade: string
  entregas: string[]
  icone: 'briefcase' | 'code' | 'palette'
}

export const EQUIPE: EquipeArea[] = [
  {
    id: 'administracao',
    titulo: 'Administração',
    sigla: 'ADM',
    responsabilidade:
      'Define o modelo do negócio, o público-alvo, os serviços, os preços e o fluxo de atendimento.',
    entregas: [
      'Plano simplificado de negócio',
      'Público-alvo e serviços definidos',
      'Preços de referência e etapas do atendimento',
    ],
    icone: 'briefcase',
  },
  {
    id: 'ti',
    titulo: 'Tecnologia da Informação',
    sigla: 'TI',
    responsabilidade: 'Cria a presença digital da agência e facilita o contato com os alunos.',
    entregas: [
      'Site institucional com serviços e preços',
      'Formulário de solicitação de atendimento',
      'Login com Google e área do aluno',
    ],
    icone: 'code',
  },
  {
    id: 'design',
    titulo: 'Design',
    sigla: 'Design',
    responsabilidade: 'Cria a identidade visual consistente e os materiais básicos de divulgação.',
    entregas: [
      'Logotipo e paleta de cores oficiais',
      'Guia de identidade visual da marca',
      'Peças de divulgação para redes sociais',
    ],
    icone: 'palette',
  },
]

/* ------------------------------------------------------------------ *
 * Central de ajuda — conteúdo oficial. Sem promessa de prazo fixo,
 * sem garantia de resultado e sem informação que o produto não entrega.
 * ------------------------------------------------------------------ */
export type AjudaPasso = { titulo: string; texto: string }

export const AJUDA_COMO_PEDIR: AjudaPasso[] = [
  {
    titulo: 'Escolha o serviço',
    texto: 'Veja os cinco serviços oficiais e o preço de referência de cada um na seção Serviços.',
  },
  {
    titulo: 'Preencha a solicitação',
    texto: 'Informe nome, serviço, descrição do pedido, prazo desejado e como prefere ser contatado.',
  },
  {
    titulo: 'Guarde o protocolo',
    texto: 'Ao concluir, o site mostra um protocolo no formato SC-ANO-XXXX. Ele identifica o seu pedido.',
  },
  {
    titulo: 'Aguarde o retorno',
    texto: 'A equipe retorna pelo meio de contato escolhido com o orçamento e as condições — etapa 3 do fluxo.',
  },
]

export const AJUDA_COMO_ACOMPANHAR: AjudaPasso[] = [
  {
    titulo: 'Entre com a conta Google',
    texto: 'O login usa a autenticação do Google (Supabase Auth) e dá acesso à área do aluno.',
  },
  {
    titulo: 'Abra a área do aluno',
    texto: 'A área do aluno reúne o seu histórico: pedidos enviados com a sessão ativa e rascunhos salvos neste navegador.',
  },
  {
    titulo: 'Busque e filtre',
    texto: 'Use a busca por protocolo, serviço ou descrição e o filtro por status para achar um pedido específico.',
  },
  {
    titulo: 'Consulte os detalhes',
    texto: 'Cada pedido abre com descrição completa, prazo desejado, meio de contato e situação atual.',
  },
]

export type PerguntaFaq = { pergunta: string; resposta: string }

export const AJUDA_FAQ: PerguntaFaq[] = [
  {
    pergunta: 'Preciso criar conta para pedir um serviço?',
    resposta:
      'Não. O formulário de solicitação funciona sem login. A conta Google serve para acompanhar o histórico e o status dos seus pedidos na área do aluno.',
  },
  {
    pergunta: 'O que significam os status de uma solicitação?',
    resposta:
      'Aguardando análise: o pedido chegou e ainda não foi avaliado. Em análise: a equipe está conferindo escopo e orçamento. Em andamento: o serviço está sendo desenvolvido. Concluído: a entrega foi finalizada. Cancelado: o pedido foi encerrado a pedido do aluno ou por falta de retorno.',
  },
  {
    pergunta: 'Em quanto tempo meu pedido fica pronto?',
    resposta:
      'O prazo é combinado com você na etapa de orçamento, de acordo com o serviço e com a demanda da equipe. O site não promete prazo fixo nem entrega imediata — preferimos combinar algo que possa ser cumprido.',
  },
  {
    pergunta: 'Como funciona o pagamento?',
    resposta:
      'Não há pagamento online no site. Os valores da tabela oficial são preços de referência; o valor e a forma de pagamento são confirmados diretamente com a equipe na etapa de orçamento.',
  },
  {
    pergunta: 'Posso alterar ou cancelar um pedido depois de enviar?',
    resposta:
      'Sim. Use o meio de contato que você informou na solicitação e cite o protocolo. Cancelamentos ficam registrados com o status Cancelado no seu histórico.',
  },
  {
    pergunta: 'Quais dados o site coleta?',
    resposta:
      'Apenas o necessário para executar e retornar o pedido: nome, serviço, descrição, prazo desejado e um contato de retorno. Quando você entra com Google, o provedor fornece nome, e-mail e foto de perfil para identificar a sua conta.',
  },
  {
    pergunta: 'Outro aluno consegue ver meus pedidos?',
    resposta:
      'Não. As solicitações ficam em um banco com Row Level Security: a regra é aplicada no próprio banco, então cada aluno lê apenas os pedidos vinculados à conta dele.',
  },
  {
    pergunta: 'O que é um "rascunho local"?',
    resposta:
      'Quando o ambiente não tem o banco de dados configurado, ou quando a gravação falha, o pedido é salvo apenas no seu navegador e marcado como rascunho local. O site avisa isso com clareza — ele nunca simula um envio que não aconteceu.',
  },
  {
    pergunta: 'As ferramentas do estudante são gratuitas?',
    resposta:
      'Sim. Calculadora de médias, planejador de cronograma e checklist de trabalhos rodam no seu navegador, não pedem dados pessoais e guardam as informações apenas no seu dispositivo.',
  },
  {
    pergunta: 'Vocês fazem serviços que não estão na tabela?',
    resposta:
      'A tabela oficial tem cinco serviços com preços fixos de referência. Necessidades diferentes são conversadas na etapa de orçamento, dentro do que a equipe consegue entregar com qualidade.',
  },
]
