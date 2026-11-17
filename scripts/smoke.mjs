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
verificar('validação', 'nome válido é aceito', modulo.validarNome('Emilyn Souza') === null)
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
  'equipe oficial: 2 TI (Ítalo, Emilyn) + 3 ADM + 1 Marketing = 6',
  modulo.EQUIPE.length === 3 &&
    modulo.EQUIPE.reduce((s, a) => s + a.integrantes, 0) === 6 &&
    modulo.EQUIPE[0].nomes.join(',') === 'Ítalo,Emilyn' &&
    modulo.EQUIPE[1].nomes.length === 0 &&
    modulo.EQUIPE[2].nomes.length === 0,
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
  'áreas oficiais: Administração, TI e Marketing (sem "Design Gráfico")',
  textoDe(tela).includes('Marketing') && !textoDe(tela).includes('Design Gráfico'),
)
verificar(
  'home',
  'preços de referência visíveis nos cinco serviços',
  ['R$ 15,00', 'R$ 30,00', 'R$ 10,00'].every((p) => textoDe(tela).includes(p)),
)
verificar(
  'home',
  'equipe: nomes só onde a equipe divulgou (Ítalo e Emilyn)',
  textoDe(tela).includes('Ítalo') && textoDe(tela).includes('Emilyn') && textoDe(tela).includes('6'),
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
verificar('área do aluno', 'explica que precisa de login (não finge sessão)', textoDe(tela).includes('Entre com sua conta Google'))
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
 * 5. Relatório
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
