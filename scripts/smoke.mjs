/**
 * Teste de fumaça da Skill Craft — roda em Node + jsdom, sem navegador.
 *
 * O que ele faz de verdade:
 *   1. empacota o App real com esbuild (o mesmo código que vai para o build);
 *   2. monta um DOM (jsdom) e renderiza cada rota com React;
 *   3. verifica conteúdo, navegação, 404, validação de formulário, ferramentas,
 *      área do aluno sem sessão, painel admin sem banco e movimento reduzido;
 *   4. captura console.error/warn durante tudo isso.
 *
 * Uso:  npm run test:smoke
 * Saída: relatório por verificação + código de saída 1 se algo falhar.
 *
 * Limitações honestas: jsdom não calcula layout — portanto NÃO mede quebras
 * responsivas, scroll horizontal, contraste nem desempenho de animação. Esses
 * pontos são verificados por inspeção em navegador (veja docs/TESTES.md).
 */
import { build } from 'esbuild'
import { JSDOM, VirtualConsole } from 'jsdom'
import { mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const PASTA_TMP = join(RAIZ, 'scripts', 'smoke', '.build')
const BUNDLE = join(PASTA_TMP, 'bundle.mjs')

/* ------------------------------------------------------------------ *
 * 1. Empacotar o app real
 * ------------------------------------------------------------------ */
mkdirSync(PASTA_TMP, { recursive: true })
await build({
  entryPoints: [join(RAIZ, 'scripts', 'smoke', 'entrada.tsx')],
  outfile: BUNDLE,
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  jsx: 'automatic',
  logLevel: 'warning',
  define: { 'import.meta.env': '{}' },
  loader: { '.css': 'empty', '.webp': 'dataurl', '.png': 'dataurl', '.mp4': 'dataurl' },
})

/* ------------------------------------------------------------------ *
 * 2. Ambiente DOM
 * ------------------------------------------------------------------ */
const problemasConsole = []
const consoleVirtual = new VirtualConsole()
consoleVirtual.on('jsdomError', (erro) => problemasConsole.push(`jsdomError: ${erro.message}`))
consoleVirtual.on('error', (...args) => problemasConsole.push(`console.error: ${args.join(' ')}`))
consoleVirtual.on('warn', (...args) => problemasConsole.push(`console.warn: ${args.join(' ')}`))

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost:5173/',
  pretendToBeVisual: true,
  virtualConsole: consoleVirtual,
})

const { window } = dom
let movimentoReduzido = false

window.matchMedia = (consulta) => ({
  matches: movimentoReduzido && /prefers-reduced-motion/.test(consulta),
  media: consulta,
  onchange: null,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent() {
    return false
  },
})
window.scrollTo = () => {}
window.HTMLElement.prototype.scrollIntoView = () => {}
window.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
window.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

for (const chave of [
  'window',
  'document',
  'navigator',
  'location',
  'history',
  'HTMLElement',
  'HTMLInputElement',
  'HTMLTextAreaElement',
  'HTMLSelectElement',
  'Element',
  'SVGElement',
  'Node',
  'DocumentFragment',
  'Event',
  'CustomEvent',
  'HashChangeEvent',
  'KeyboardEvent',
  'MouseEvent',
  'getComputedStyle',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'localStorage',
  'sessionStorage',
  'matchMedia',
  'IntersectionObserver',
  'ResizeObserver',
]) {
  // `navigator` e cia. são somente-leitura no Node 22: redefinimos com defineProperty.
  Object.defineProperty(globalThis, chave, {
    value: window[chave],
    configurable: true,
    writable: true,
  })
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const erroOriginal = console.error
const avisoOriginal = console.warn
console.error = (...args) => {
  problemasConsole.push(`console.error: ${args.map(String).join(' ')}`)
  erroOriginal(...args)
}
console.warn = (...args) => {
  problemasConsole.push(`console.warn: ${args.map(String).join(' ')}`)
  avisoOriginal(...args)
}

const { App, createElement, act, createRoot } = await import(BUNDLE)
const modulo = await import(BUNDLE)

// Módulos de validação/segurança exercitados pela bateria da seção 5.
const {
  validarEmailAuth,
  validarSenhaNova,
  validarSenhaLogin,
  validarNomeCompleto,
  validarConfirmacaoSenha,
  sanitizarTexto,
  normalizarEmail,
  EMAIL_MAX,
  SENHA_MIN,
  PAPEIS,
  PERFIS,
  PERFIL_VISITANTE,
  comoPapel,
  ehPapel,
  codificarErroAuth,
  mensagemDeErro,
  ehHashDeAutenticacao,
  lerRota,
} = modulo

/* ------------------------------------------------------------------ *
 * 3. Utilidades de verificação
 * ------------------------------------------------------------------ */
const resultados = []

function registrar(grupo, descricao, ok, detalhe = '') {
  resultados.push({ grupo, descricao, ok, detalhe })
  const marca = ok ? '✔' : '✘'
  console.log(`  ${marca} ${descricao}${detalhe ? ` — ${detalhe}` : ''}`)
}

function verificar(grupo, descricao, condicao, detalhe = '') {
  registrar(grupo, descricao, Boolean(condicao), detalhe)
}

let raizAtual = null
let containerAtual = null

async function montarRota(hash, { reduzido = false, introVista = true } = {}) {
  if (raizAtual) await desmontar()
  movimentoReduzido = reduzido
  window.localStorage.clear()
  window.sessionStorage.clear()
  if (introVista) window.sessionStorage.setItem('skillcraft:intro-vista', '1')
  window.history.replaceState(null, '', `/${hash}`)

  containerAtual = window.document.createElement('div')
  window.document.body.appendChild(containerAtual)
  raizAtual = createRoot(containerAtual)
  await act(async () => {
    raizAtual.render(createElement(App))
  })
  // aguarda chunks preguiçosos (área do aluno, ferramentas, ajuda, admin)
  for (let i = 0; i < 4; i += 1) {
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })
  }
  return containerAtual
}

async function desmontar() {
  if (!raizAtual) return
  await act(async () => {
    raizAtual.unmount()
  })
  containerAtual?.remove()
  raizAtual = null
  containerAtual = null
}

const textoDe = (container) => container.textContent ?? ''

function clicar(elemento) {
  return act(async () => {
    elemento.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))
    await new Promise((r) => setTimeout(r, 0))
  })
}

function digitar(elemento, valor) {
  const proto =
    elemento instanceof window.HTMLSelectElement
      ? window.HTMLSelectElement.prototype
      : elemento instanceof window.HTMLTextAreaElement
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(elemento, valor)
  return act(async () => {
    elemento.dispatchEvent(new window.Event('input', { bubbles: true }))
    elemento.dispatchEvent(new window.Event('change', { bubbles: true }))
    await new Promise((r) => setTimeout(r, 0))
  })
}

async function aguardar(ms = 0, vezes = 3) {
  for (let i = 0; i < vezes; i += 1) {
    await act(async () => {
      await new Promise((r) => setTimeout(r, ms))
    })
  }
}

function botaoExato(container, texto) {
  const alvo = texto.trim().toLowerCase()
  return [...container.querySelectorAll('button')].find((el) => (el.textContent ?? '').trim().toLowerCase() === alvo)
}

function botaoPorTexto(container, trecho) {
  const alvo = trecho.toLowerCase()
  return [...container.querySelectorAll('button, a')].find((el) =>
    (el.textContent ?? '').toLowerCase().includes(alvo),
  )
}

async function enviarFormulario(container, esperaMs = 0) {
  const formulario = container.querySelector('form')
  await act(async () => {
    formulario.dispatchEvent(
      Object.assign(new window.Event('submit', { bubbles: true, cancelable: true }), {
        preventDefault() {},
      }),
    )
    await new Promise((r) => setTimeout(r, esperaMs))
  })
  await aguardar(50, 2)
}

/* ------------------------------------------------------------------ *
 * 4. Verificações
 * ------------------------------------------------------------------ */
console.log('\nSkill Craft · teste de fumaça (Node + jsdom)\n')

console.log('Rotas (módulo puro src/lib/rotas.ts)')
verificar('rotas', '#/app → área do aluno', modulo.lerRota('#/app') === 'app')
verificar('rotas', '#/ferramentas → ferramentas', modulo.lerRota('#/ferramentas') === 'ferramentas')
verificar('rotas', '#/ajuda → ajuda', modulo.lerRota('#/ajuda') === 'ajuda')
verificar('rotas', '#/admin → admin', modulo.lerRota('#/admin') === 'admin')
verificar('rotas', '#/ ou vazio → home', modulo.lerRota('#/') === 'home' && modulo.lerRota('') === 'home')
verificar(
  'rotas',
  'rota desconhecida → 404 (sem cair em silêncio na home)',
  modulo.lerRota('#/pagina-que-nao-existe') === '404' && modulo.lerRota('#/APP2') === '404',
)
verificar(
  'rotas',
  'âncoras de seção continuam sendo home',
  modulo.lerRota('#servicos') === 'home' && modulo.lerRota('#conteudo') === 'home',
)
verificar(
  'rotas',
  'retorno do OAuth não vira rota',
  modulo.ehHashDeAutenticacao('#access_token=abc&type=recovery') === true &&
    modulo.lerRota('#access_token=abc') === 'home',
)
verificar('rotas', 'hashDaRota cobre todas as rotas', modulo.hashDaRota('home') === null && modulo.hashDaRota('ajuda') === '#/ajuda')

console.log('\nValidadores do formulário')
verificar('validação', 'nome vazio é recusado', modulo.validarNome('  ') !== null)
verificar('validação', 'nome válido é aceito', modulo.validarNome('Aluno Exemplo') === null)
verificar('validação', 'descrição curta é recusada', modulo.validarDescricao('oi') !== null)
verificar('validação', 'servico fora da lista é recusado', modulo.validarServico('hack') !== null)
verificar('validação', 'servicos oficiais são aceitos', modulo.SERVICOS.every((s) => modulo.validarServico(s.id) === null))
verificar('validação', 'prazo no passado é recusado', modulo.validarPrazo('2020-01-01') !== null)
verificar('validação', 'prazo opcional (vazio) é aceito', modulo.validarPrazo('') === null)
verificar('validação', 'informações acima de 300 caracteres são recusadas', modulo.validarInformacoes('a'.repeat(301)) !== null)
verificar('validação', 'contato exige e-mail válido', modulo.validarContato('sem-arroba', 'email') !== null)
verificar('validação', 'contato exige DDD + número', modulo.validarContato('98765', 'whatsapp') !== null)
verificar('validação', 'protocolo segue SC-ANO-XXXX', /^SC-\d{4}-[A-Z0-9]{4}$/.test(modulo.gerarProtocolo()))

console.log('\nConteúdo oficial')
verificar(
  'conteúdo',
  '5 serviços com preços oficiais (15/30/10/10/15)',
  modulo.SERVICOS.length === 5 &&
    JSON.stringify(modulo.SERVICOS.map((s) => s.preco)) === JSON.stringify([15, 30, 10, 10, 15]),
)
verificar(
  'conteúdo',
  'equipe: três áreas documentadas, sem nomes e sem contagem de integrantes',
  modulo.EQUIPE.length === 3 &&
    modulo.EQUIPE.every((a) => !('nomes' in a) && !('integrantes' in a)) &&
    ['administracao', 'ti', 'design'].every((id) => modulo.EQUIPE.some((a) => a.id === id)),
)
verificar(
  'conteúdo',
  '5 status oficiais de solicitação',
  modulo.STATUS_SOLICITACAO.length === 5 && modulo.rotuloStatus('em_andamento') === 'Em andamento',
)
verificar('conteúdo', 'FAQ da central de ajuda com 10 perguntas', modulo.AJUDA_FAQ.length === 10)

console.log('\nPágina institucional (#/)')
let tela = await montarRota('')
verificar('home', 'slogan oficial presente', textoDe(tela).includes('Aprenda, desenvolva e prepare-se para o mercado'))
verificar(
  'home',
  'todas as seções existem (inicio, sobre, servicos, como-funciona, diferenciais, equipe, recursos, contato)',
  modulo.NAV_LINKS.every((l) => tela.querySelector(`#${l.id}`)) && Boolean(tela.querySelector('#recursos')),
)
verificar(
  'home',
  'áreas oficiais: Administração, TI e Design (sem "Marketing")',
  textoDe(tela).includes('Design') && !textoDe(tela).includes('Marketing'),
)
verificar(
  'home',
  'preços de referência visíveis nos cinco serviços',
  ['R$ 15,00', 'R$ 30,00', 'R$ 10,00'].every((p) => textoDe(tela).includes(p)),
)
verificar(
  'home',
  'equipe: sem nomes de integrantes e sem contagem de pessoas',
  !textoDe(tela).includes('Ítalo') &&
    !textoDe(tela).includes('Emilyn') &&
    !textoDe(tela).includes('Ethan') &&
    !textoDe(tela).includes('Emily') &&
    !textoDe(tela).includes('integrantes'),
)
verificar('home', 'link "pular para o conteúdo" presente', Boolean(tela.querySelector('a[href="#conteudo"]')))
verificar(
  'home',
  'todo botão tem função e nome acessível (texto ou aria-label)',
  [...tela.querySelectorAll('button')].every((b) => {
    const temNome = Boolean((b.textContent ?? '').trim() || b.getAttribute('aria-label'))
    const temAcao = Boolean(b.getAttribute('aria-label') || (b.textContent ?? '').trim())
    return temNome && temAcao && b.type === 'button' || b.type === 'submit'
  }),
)

console.log('\nFormulário de solicitação (validação real)')
await enviarFormulario(tela)
verificar('formulário', 'envio vazio é bloqueado com mensagens de erro', textoDe(tela).includes('Informe seu nome.'))
verificar(
  'formulário',
  'campos obrigatórios marcados como inválidos (aria-invalid)',
  tela.querySelectorAll('[aria-invalid="true"]').length >= 3,
)
verificar('formulário', 'nenhuma tela de sucesso aparece sem dados válidos', !textoDe(tela).includes('Solicitação enviada'))

const campoNome = tela.querySelector('input[autocomplete="name"]')
const campoDescricao = tela.querySelector('textarea[maxlength="600"]')
const campoPrazo = tela.querySelector('input[type="date"]')
const campoInfo = tela.querySelector('textarea[maxlength="300"]')
verificar('formulário', 'campo de prazo desejado existe (opcional)', Boolean(campoPrazo))
verificar('formulário', 'campo de informações complementares existe (opcional)', Boolean(campoInfo))

const selecaoServico = tela.querySelector('select')
await digitar(selecaoServico, 'sites-simples')
await digitar(campoNome, 'Aluna de Teste')
await digitar(campoDescricao, 'Preciso de um site simples para o trabalho de conclusão do curso técnico.')
await digitar(campoInfo, 'Entrega em PDF e link publicado.')
const meio = tela.querySelectorAll('select')[1]
await digitar(meio, 'email')
const campoContato = tela.querySelector('input[type="email"]')
await digitar(campoContato, 'aluna@exemplo.com')
await enviarFormulario(tela, 700)
await aguardar(300, 4)
if (process.env.SMOKE_DEBUG) {
  console.log('--- DEBUG formulário ---')
  console.log('service select:', selecaoServico.value)
  console.log('nome:', campoNome.value, '| descricao:', campoDescricao.value.slice(0, 40))
  console.log('meio:', meio.value, '| contato:', campoContato?.value)
  console.log('erros visíveis:', [...tela.querySelectorAll('[role="alert"]')].map((e) => e.textContent).join(' | '))
  const t = textoDe(tela)
  console.log('form presente?', Boolean(tela.querySelector('form')))
  console.log('tem "Solicitação registrada"?', t.includes('Solicitação registrada'))
  console.log('tem "Registrando solicitação"?', t.includes('Registrando solicitação'))
  console.log('tem protocolo?', /SC-\d{4}-[A-Z0-9]{4}/.test(t))
  console.log('rascunhos no localStorage:', window.localStorage.getItem('skillcraft:solicitacoes:rascunhos'))
  console.log('trecho contato:', t.slice(t.indexOf('Solicite seu serviço'), t.indexOf('Solicite seu serviço') + 700))
}
verificar(
  'formulário',
  'preenchimento válido gera protocolo e aviso de rascunho local (sem backend)',
  /SC-\d{4}-[A-Z0-9]{4}/.test(textoDe(tela)) && textoDe(tela).includes('rascunho'),
)
verificar(
  'formulário',
  'nenhum envio real é simulado (mensagem explícita)',
  textoDe(tela).includes('nada foi enviado pela internet') || textoDe(tela).includes('Nenhum backend'),
)

console.log('\nPágina 404 (#/rota-inexistente)')
tela = await montarRota('#/rota-inexistente')
verificar('404', 'título da página 404', textoDe(tela).includes('Não encontramos esta página'))
verificar('404', 'mostra o endereço tentado (não esconde o erro)', textoDe(tela).includes('#/rota-inexistente'))
verificar('404', 'tem saída para o início', Boolean(botaoPorTexto(tela, 'Ir para o início')))
verificar('404', 'tem saída para serviços, ferramentas e ajuda', ['serviços', 'ferramentas', 'ajuda'].every((t) => Boolean(botaoPorTexto(tela, t))))
const voltarInicio = botaoPorTexto(tela, 'Ir para o início')
await clicar(voltarInicio)
await aguardar()
verificar('404', 'botão "Ir para o início" volta para a home', textoDe(tela).includes('Aprenda, desenvolva'))

console.log('\nNavegação entre páginas')
tela = await montarRota('')
const abrirFerramentas = botaoPorTexto(tela, 'Abrir ferramentas')
await clicar(abrirFerramentas)
await act(async () => {
  window.dispatchEvent(new window.HashChangeEvent('hashchange'))
})
await aguardar()
verificar('navegação', 'botão da faixa de recursos abre #/ferramentas', window.location.hash === '#/ferramentas')
verificar('navegação', 'página de ferramentas renderizou', textoDe(tela).includes('Calculadora de médias'))
const abrirAjuda = botaoPorTexto(tela, 'Central de ajuda')
await clicar(abrirAjuda)
await act(async () => {
  window.dispatchEvent(new window.HashChangeEvent('hashchange'))
})
await aguardar()
verificar('navegação', 'rodapé/atalho abre a central de ajuda', window.location.hash === '#/ajuda' && textoDe(tela).includes('Perguntas frequentes'))

console.log('\nFerramentas do estudante (#/ferramentas)')
tela = await montarRota('#/ferramentas')
verificar('ferramentas', 'três ferramentas presentes', ['Calculadora de médias', 'Planejador de cronograma de estudos', 'Checklist de trabalho'].every((t) => textoDe(tela).includes(t)))
verificar('ferramentas', 'declara que nada é enviado a servidores', textoDe(tela).includes('Nada é enviado para servidores'))

const camposNota = [...tela.querySelectorAll('input[inputmode="decimal"]')]
await digitar(camposNota[0], '8')
await digitar(camposNota[1], '1')
await digitar(camposNota[2], '6')
await digitar(camposNota[3], '2')
verificar('ferramentas', 'média ponderada calculada (8×1 + 6×2)/3 = 6,67', textoDe(tela).includes('6,67'))
await digitar(camposNota[0], '12')
verificar('ferramentas', 'nota fora de 0–10 mostra erro acessível', textoDe(tela).includes('entre 0 e 10'))

const campoMateria = tela.querySelector('input[placeholder="Ex.: Programação web"]')
await digitar(campoMateria, 'Programação web')
verificar('ferramentas', 'cronograma gerado inclui a matéria informada', textoDe(tela).includes('Programação web'))
verificar('ferramentas', 'cronograma monta grade semanal (dias disponíveis)', textoDe(tela).includes('Seg') && textoDe(tela).includes('Sex'))

const secaoChecklist = tela.querySelector('#checklist-trabalho')
const campoTarefa = secaoChecklist.querySelector('input[placeholder="O que falta fazer?"]')
const usarSugestao = botaoPorTexto(tela, 'Usar lista sugerida')
await clicar(usarSugestao)
verificar('ferramentas', 'checklist: lista sugerida adiciona etapas', textoDe(tela).includes('Ler o enunciado'))
await digitar(campoTarefa, 'Revisar antes de entregar')
const adicionarTarefa = botaoExato(tela, 'Adicionar')
await clicar(adicionarTarefa)
verificar('ferramentas', 'checklist: tarefa adicionada aparece na lista', textoDe(tela).includes('Revisar antes de entregar'))
verificar('ferramentas', 'checklist: progresso calculado', /%/.test(secaoChecklist.querySelector('[role="progressbar"]').getAttribute('aria-label')))
const primeiraTarefa = secaoChecklist.querySelector('input[type="checkbox"]')
await clicar(primeiraTarefa.closest('label') ?? primeiraTarefa)
verificar('ferramentas', 'checklist: marcar etapa atualiza o progresso', secaoChecklist.querySelector('[role="progressbar"]').getAttribute('aria-valuenow') !== '0')

console.log('\nCentral de ajuda (#/ajuda)')
tela = await montarRota('#/ajuda')
verificar('ajuda', 'passo a passo de solicitação', textoDe(tela).includes('Como solicitar um serviço'))
verificar('ajuda', 'passo a passo de acompanhamento', textoDe(tela).includes('Como acompanhar o pedido'))
verificar('ajuda', 'explica os cinco status', ['Aguardando análise', 'Em análise', 'Em andamento', 'Concluído', 'Cancelado'].every((s) => textoDe(tela).includes(s)))
verificar('ajuda', 'não promete prazo fixo', textoDe(tela).includes('não promete prazo fixo'))
const primeiraPergunta = modulo.AJUDA_FAQ[1].pergunta
const gatilho = botaoPorTexto(tela, primeiraPergunta)
const painelAntes = tela.querySelector(`#${gatilho.getAttribute('aria-controls')}`)
verificar('ajuda', 'FAQ: resposta começa recolhida', painelAntes.hidden === true && gatilho.getAttribute('aria-expanded') === 'false')
await clicar(gatilho)
const painelDepois = tela.querySelector(`#${gatilho.getAttribute('aria-controls')}`)
verificar('ajuda', 'FAQ: clique expande a resposta (aria-expanded)', painelDepois.hidden === false && gatilho.getAttribute('aria-expanded') === 'true')

console.log('\nÁrea do aluno sem sessão (#/app)')
tela = await montarRota('#/app')
verificar(
  'área do aluno',
  'explica que precisa de login (não finge sessão)',
  textoDe(tela).includes('Entre com seu e-mail e senha'),
)
verificar('área do aluno', 'oferece ferramentas e ajuda mesmo sem login', textoDe(tela).includes('Ferramentas') && textoDe(tela).includes('Ajuda'))
verificar('área do aluno', 'não expõe histórico de outra pessoa', !textoDe(tela).includes('Minhas solicitações'))

console.log('\nPainel administrativo sem banco (#/admin)')
tela = await montarRota('#/admin')
verificar('admin', 'declara que exige banco configurado', textoDe(tela).includes('Painel indisponível neste ambiente'))
verificar('admin', 'explica que a permissão é validada no banco', textoDe(tela).includes('validada no próprio Supabase'))
verificar('admin', 'não mostra solicitações sem autorização', !textoDe(tela).includes('Solicitações recebidas'))

console.log('\nAcessibilidade e movimento reduzido')
tela = await montarRota('', { reduzido: true })
verificar('a11y', 'com movimento reduzido não há abertura animada', !textoDe(tela).includes('Pular introdução'))
verificar('a11y', 'com movimento reduzido o site continua completo', textoDe(tela).includes('Aprenda, desenvolva'))
verificar('a11y', 'todos os campos de formulário têm rótulo', [...tela.querySelectorAll('input:not([type="hidden"]), textarea, select')].every((campo) => {
  const id = campo.getAttribute('id')
  const temLabel = id && tela.querySelector(`label[for="${CSS_escape(id)}"]`)
  const temAria = campo.getAttribute('aria-label') || campo.getAttribute('aria-labelledby')
  const temLabelPai = campo.closest('label')
  return Boolean(temLabel || temAria || temLabelPai)
}))
verificar('a11y', 'botão de menu tem nome acessível e aria-expanded', Boolean(tela.querySelector('[aria-label="Abrir menu"][aria-expanded]')))
verificar('a11y', 'ícones decorativos marcados com aria-hidden', tela.querySelectorAll('svg[aria-hidden="true"]').length > 5)
verificar('a11y', 'imagens com texto alternativo declarado', [...tela.querySelectorAll('img')].every((img) => img.hasAttribute('alt')))

tela = await montarRota('', { introVista: false })
verificar('abertura', 'abertura aparece na primeira visita', textoDe(tela).includes('Pular introdução'))
const pular = botaoPorTexto(tela, 'Pular introdução')
await clicar(pular)
await aguardar(120, 6)
verificar('abertura', 'botão "Pular" encerra a abertura imediatamente', !textoDe(tela).includes('Pular introdução'))


/* ------------------------------------------------------------------ *
 * 5. Segurança da autenticação — testes obrigatórios
 *
 * Cobre os 12 itens pedidos: cadastro, login, senha incorreta,
 * recuperação, logout, visitante em página privada, aluno tentando
 * admin, manipulação de URL, alteração de permissão, requisições
 * diretas, injeção (SQLi/XSS) e acesso a dados de terceiros.
 *
 * IMPORTANTE (limite honesto): este ambiente NÃO tem um Supabase
 * ativo. Os testes abaixo verificam o que é verificável sem servidor:
 * validadores, saneamento, códigos de erro, regras de papel, o
 * documento de RLS e o comportamento da interface sem sessão. Os
 * testes que exigem banco de verdade estão listados em
 * docs/SEGURANCA.md com o SQL exato — e não são declarados como
 * aprovados aqui.
 * ------------------------------------------------------------------ */

console.log('\n[1-5] Validação de cadastro, login e senhas')

const emailsValidos = ['aluno@raphaeldisanto.com.br', 'a.b+c@dominio.com', 'x@y.co']
const emailsInvalidos = [
  '',
  'sem-arroba',
  'a@b',
  'a@@b.com',
  'a b@c.com',
  'a@b..com',
  '<script>@x.com',
  `${'a'.repeat(EMAIL_MAX)}@x.com`,
  'a@b.com\nalguem',
]
verificar(
  'auth-entrada',
  'aceita e-mails em formato válido',
  emailsValidos.every((e) => validarEmailAuth(e) === null),
  emailsValidos.join(' · '),
)
verificar(
  'auth-entrada',
  'rejeita e-mails malformados ou com injeção',
  emailsInvalidos.every((e) => validarEmailAuth(e) !== null),
  `${emailsInvalidos.length} casos`,
)
verificar(
  'auth-entrada',
  'normaliza e-mail (trim + minúsculas)',
  normalizarEmail('  Aluno@Dominio.COM ') === 'aluno@dominio.com' &&
    validarEmailAuth('a@b.com ') === null,
  'espaço nas pontas é removido, não rejeitado',
)
verificar('auth-entrada', 'remove caracteres invisíveis/controle', sanitizarTexto('  a\u200Bb\u0000c  ') === 'abc')

// Senhas
verificar('auth-entrada', 'rejeita senha curta', validarSenhaNova('abc1') !== null)
verificar('auth-entrada', 'rejeita senha sem número', validarSenhaNova('somenteletras') !== null)
verificar('auth-entrada', 'rejeita senha sem letra', validarSenhaNova('1234567890') !== null)
verificar('auth-entrada', 'rejeita senha óbvia', validarSenhaNova('senha123') !== null)
verificar('auth-entrada', 'aceita senha forte', validarSenhaNova('SkillCraft2026') === null)
verificar(
  'auth-entrada',
  `exige mínimo de ${SENHA_MIN} caracteres`,
  validarSenhaNova('Minha1') !== null && validarSenhaNova('MinhaSenha2026') === null,
)
verificar(
  'auth-entrada',
  'confirmação divergente é rejeitada',
  validarConfirmacaoSenha('MinhaSenha2026', 'MinhaSenha2027') !== null,
)
verificar('auth-entrada', 'login não valida regra de força (evita vazar a regra)', validarSenhaLogin('a') === null)
verificar('auth-entrada', 'login rejeita senha vazia', validarSenhaLogin('') !== null)

// Nome
verificar('auth-entrada', 'exige nome e sobrenome', validarNomeCompleto('Ana') !== null)
verificar('auth-entrada', 'aceita nome completo com acento', validarNomeCompleto('Júlia Cordeiro Cherilli') === null)
verificar('auth-entrada', 'rejeita tags/scripts no nome', validarNomeCompleto('<script>alert(1)</script>') !== null)
verificar('auth-entrada', 'rejeita nome com dígitos', validarNomeCompleto('Aluno123 Teste') !== null)

console.log('\n[6-9] Erros seguros, papéis e manipulação de permissão')

verificar(
  'auth-erros',
  'senha errada e e-mail inexistente dão a MESMA mensagem',
  mensagemDeErro('credenciais') === mensagemDeErro(codificarErroAuth({ code: 'invalid_credentials' })),
)
verificar(
  'auth-erros',
  'erro do provedor não vaza texto original',
  (() => {
    const vazamento = 'relation "public.perfis" does not exist'
    const traduzido = mensagemDeErro(codificarErroAuth({ message: vazamento, status: 500 }))
    return !traduzido.includes('relation') && !traduzido.includes('public.perfis')
  })(),
)
verificar(
  'auth-erros',
  'mapeia códigos conhecidos do Supabase',
  codificarErroAuth({ code: 'email_not_confirmed' }) === 'email_nao_confirmado' &&
    codificarErroAuth({ code: 'weak_password' }) === 'senha_fraca' &&
    codificarErroAuth({ code: 'user_already_exists' }) === 'email_em_uso' &&
    codificarErroAuth({ status: 429 }) === 'muitas_tentativas',
)
verificar(
  'auth-erros',
  'toda mensagem é curta e em português (sem stack/SQL)',
  ['credenciais', 'muitas_tentativas', 'nao_configurado', 'rede'].every((c) => {
    const m = mensagemDeErro(c)
    return m.length < 160 && !/SQL|postgres|relation|policy|undefined/i.test(m)
  }),
)

// Papéis: a interface nunca concede admin por dado local
verificar('auth-papeis', 'existem exatamente 3 papéis graváveis', PAPEIS.length === 3)
verificar('auth-papeis', 'visitante não tem painel administrativo', PERFIL_VISITANTE.painelAdministrativo === false)
verificar('auth-papeis', 'aluno não tem painel administrativo', PERFIS.aluno.painelAdministrativo === false)
verificar('auth-papeis', 'professor não tem painel administrativo', PERFIS.professor.painelAdministrativo === false)
verificar('auth-papeis', 'somente administrador gerencia perfis', PERFIS.administrador.gerenciaPerfis === true)
verificar(
  'auth-papeis',
  'papel inválido/forjado cai em aluno (privilégio mínimo)',
  comoPapel('superadmin') === 'aluno' && comoPapel(undefined) === 'aluno' && comoPapel('administrador') === 'administrador',
)
verificar('auth-papeis', 'validação de papel é estrita', ehPapel('administrador') && !ehPapel('Administrador') && !ehPapel('root'))

// URL: hash com token nunca vira rota
verificar(
  'rotas',
  'token de recuperação/confirmação na URL não vira rota',
  ehHashDeAutenticacao('#access_token=abc&refresh_token=def&type=recovery') &&
    ehHashDeAutenticacao('#code=xyz&type=signup'),
)
verificar('rotas', 'rota de redefinição de senha existe', lerRota('#/redefinir-senha') === 'redefinir-senha')
verificar(
  'rotas',
  'rota administrativa não é alcançável por variação de URL',
  lerRota('#/ADMIN') === 'admin' &&
    lerRota('#/admin/../app') === 'admin' &&
    lerRota('#/admin%20') === '404' &&
    lerRota('#/admin?papel=administrador') === 'admin',
  'normaliza caixa/query; caminho estranho vira 404',
)

console.log('\n[10-12] Rotas protegidas, interface e RLS declarada')

tela = await montarRota('#/app')
verificar(
  'seguranca',
  'visitante em #/app: sem dados, sem histórico',
  textoDe(tela).includes('Área do aluno') && !textoDe(tela).includes('Minhas solicitações'),
)
verificar('seguranca', 'visitante em #/app: nenhum e-mail de terceiro exibido', !/@raphaeldisanto\.com\.br/.test(textoDe(tela)))

tela = await montarRota('#/admin')
verificar('seguranca', 'visitante em #/admin: acesso negado declarado', textoDe(tela).includes('Painel indisponível'))
verificar('seguranca', 'visitante em #/admin: nenhuma solicitação listada', !textoDe(tela).includes('Solicitações recebidas'))

tela = await montarRota('#/redefinir-senha')
verificar(
  'seguranca',
  'link de redefinição inválido não finge sucesso',
  textoDe(tela).includes('não está mais válido') || textoDe(tela).includes('não está configurada'),
)

// A interface não oferece login social
tela = await montarRota('')
verificar('seguranca', 'não existe mais "Entrar com Google"', !textoDe(tela).includes('Entrar com Google'))
verificar('seguranca', 'botão de conta oferece "Entrar"', textoDe(tela).includes('Entrar'))

// Nenhum sink de XSS / login social no NOSSO código.
//
// Por que checar a fonte e não o bundle: `react-dom` contém
// `dangerouslySetInnerHTML` por definição, e `@supabase/auth-js` contém
// `signInWithOAuth` e a palavra `service_role` (na API de admin do SDK).
// Procurar essas strings no bundle acusaria a biblioteca, não o projeto.
// O que importa é que o NOSSO código não as use — e que o bundle final
// publicado não traga segredo nenhum.
const { readdirSync, readFileSync } = await import('node:fs')
const { readFile } = await import('node:fs/promises')

async function lerFontes(pasta) {
  const saida = []
  for (const entrada of readdirSync(pasta, { withFileTypes: true })) {
    const caminho = join(pasta, entrada.name)
    if (entrada.isDirectory()) saida.push(...(await lerFontes(caminho)))
    else if (/\.(ts|tsx)$/.test(entrada.name)) saida.push({ caminho, texto: await readFile(caminho, 'utf8') })
  }
  return saida
}
const fontes = await lerFontes(join(RAIZ, 'src'))
const codigoApp = readFileSync(BUNDLE, 'utf8')

verificar(
  'seguranca',
  'nosso código não usa dangerouslySetInnerHTML',
  fontes.every((f) => !f.texto.includes('dangerouslySetInnerHTML')),
  `${fontes.length} arquivos verificados`,
)
verificar(
  'seguranca',
  'nosso código não usa eval/new Function',
  fontes.every((f) => !/\beval\(|new Function\(/.test(f.texto)),
)
verificar(
  'seguranca',
  'nosso código não usa login social',
  fontes.every((f) => !f.texto.includes('signInWithOAuth') && !f.texto.includes("provider: 'google'")),
)
verificar(
  'seguranca',
  'nenhuma chave privilegiada no bundle publicado',
  // Só a anon key é pública. service_role e JWTs de serviço não podem existir.
  !/SUPABASE_SERVICE_ROLE/i.test(codigoApp) &&
    !/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/.test(codigoApp),
  'sem service_role e sem JWT embutido',
)
verificar(
  'seguranca',
  'nenhuma variável de ambiente sensível embutida no bundle',
  !/VITE_SUPABASE_(SERVICE|SECRET)/i.test(codigoApp) && !/postgres:\/\//i.test(codigoApp),
)

// Políticas RLS declaradas nas migrações (documento, não servidor)
const lerMigracoes = async () => {
  const pasta = join(RAIZ, 'supabase', 'migrations')
  const arquivos = readdirSync(pasta).filter((f) => f.endsWith('.sql')).sort()
  const conteudo = await Promise.all(arquivos.map((f) => readFile(`${pasta}/${f}`, 'utf8')))
  return { arquivos, sql: conteudo.join('\n') }
}
const { arquivos: migracoes, sql } = await lerMigracoes()
verificar('rls', 'migrações presentes e versionadas', migracoes.length >= 6, migracoes.join(', '))
verificar(
  'rls',
  'toda tabela criada ativa RLS',
  (() => {
    const tabelas = [...sql.matchAll(/create table if not exists public\.(\w+)/gi)].map((m) => m[1])
    const comRls = [...sql.matchAll(/alter table public\.(\w+)\s+enable row level security/gi)].map((m) => m[1])
    return tabelas.length > 0 && tabelas.every((t) => comRls.includes(t))
  })(),
)
verificar('rls', 'sem política de DELETE exposta', !/for delete/i.test(sql))
verificar(
  'rls',
  'perfis: usuário não escreve o próprio papel',
  /skillcraft_protege_papel/.test(sql) && /usuario_id <> auth\.uid\(\)/.test(sql),
)
verificar('rls', 'rate limit de login existe no banco', /skillcraft_pode_tentar_login/.test(sql))
verificar('rls', 'tabela de perfis não é legível por terceiros', /for select\s+to authenticated\s+using \(usuario_id = auth\.uid\(\)\)/.test(sql))
verificar('rls', 'inserção pública exige status inicial', /status = 'aguardando_analise'/.test(sql))
verificar('rls', 'service_role não aparece nas migrações', !/service_role/i.test(sql))

/* ------------------------------------------------------------------ *
 * 6. Relatório
 * ------------------------------------------------------------------ */
function CSS_escape(valor) {
  return valor.replace(/[:.]/g, '\\$&')
}

await desmontar()
console.error = erroOriginal
console.warn = avisoOriginal

const falhas = resultados.filter((r) => !r.ok)
const porGrupo = resultados.reduce((acc, r) => {
  acc[r.grupo] = acc[r.grupo] ?? { total: 0, falhas: 0 }
  acc[r.grupo].total += 1
  if (!r.ok) acc[r.grupo].falhas += 1
  return acc
}, {})

console.log('\n——————————————————————————————————————————————')
console.log('Resumo por grupo')
for (const [grupo, info] of Object.entries(porGrupo)) {
  console.log(`  ${grupo.padEnd(16)} ${info.total - info.falhas}/${info.total} ok`)
}
console.log(`\nTotal: ${resultados.length - falhas.length}/${resultados.length} verificações ok`)

const ruidoConhecido = /Not implemented: HTMLMediaElement|Could not parse CSS|Error: Not implemented/i
const problemasReais = problemasConsole.filter((p) => !ruidoConhecido.test(p))
if (problemasReais.length > 0) {
  console.log(`\nConsole (erros/avisos capturados): ${problemasReais.length}`)
  for (const p of problemasReais.slice(0, 12)) console.log(`  • ${p.slice(0, 220)}`)
} else {
  console.log('\nConsole: nenhum erro ou aviso inesperado durante as verificações.')
}

if (falhas.length > 0) {
  console.log('\nFalhas:')
  for (const f of falhas) console.log(`  ✘ [${f.grupo}] ${f.descricao}`)
}

rmSync(PASTA_TMP, { recursive: true, force: true })

const saiu = falhas.length > 0 || problemasReais.length > 0 ? 1 : 0
console.log(`\nResultado: ${saiu === 0 ? 'APROVADO' : 'COM FALHAS'}\n`)
process.exit(saiu)
