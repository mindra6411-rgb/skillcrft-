import { useState } from 'react'
import {
  ChevronDown,
  ClipboardList,
  HelpCircle,
  LifeBuoy,
  ListChecks,
  MessageSquareText,
  Radio,
  Search,
} from 'lucide-react'
import { AJUDA_COMO_ACOMPANHAR, AJUDA_COMO_PEDIR, AJUDA_FAQ } from '../../config/site'
import { irParaSecao, type Rota } from '../../hooks/useHashRoute'
import { PageShell } from '../ui/PageShell'

const STATUS = [
  { nome: 'Aguardando análise', texto: 'O pedido foi registrado e ainda não foi avaliado pela equipe.' },
  { nome: 'Em análise', texto: 'A equipe está conferindo o escopo para montar o orçamento.' },
  { nome: 'Em andamento', texto: 'O serviço está sendo desenvolvido.' },
  { nome: 'Concluído', texto: 'A entrega foi finalizada com o aluno.' },
  { nome: 'Cancelado', texto: 'O pedido foi encerrado — a pedido do aluno ou por falta de retorno.' },
]

type AjudaProps = {
  irParaHome: () => void
  navegar: (destino: Rota) => void
}

/**
 * Central de ajuda: como pedir, como acompanhar, o que significam os status e
 * as dúvidas frequentes. Sem promessa de prazo fixo e sem garantia de resultado
 * — apenas o que o produto realmente faz hoje.
 */
export function Ajuda({ irParaHome, navegar }: AjudaProps) {
  const [abertas, setAbertas] = useState<string[]>([AJUDA_FAQ[0].pergunta])

  const alternar = (pergunta: string) =>
    setAbertas((atual) =>
      atual.includes(pergunta) ? atual.filter((p) => p !== pergunta) : [...atual, pergunta],
    )

  const irParaFormulario = () => {
    irParaHome()
    window.setTimeout(() => irParaSecao('contato'), 120)
  }

  return (
    <PageShell
      kicker="Central de ajuda"
      titulo="Como pedir, acompanhar e tirar dúvidas"
      lead="Tudo o que você precisa saber para usar a Skill Craft: o caminho da solicitação, o acompanhamento na área do aluno, o significado de cada status e as perguntas que mais aparecem."
      irParaHome={irParaHome}
      aside={
        <ul className="grid gap-3 sm:grid-cols-3">
          {[
            {
              icone: MessageSquareText,
              rotulo: 'Fazer uma solicitação',
              texto: 'Abre o formulário oficial, com validação e protocolo.',
              acao: irParaFormulario,
            },
            {
              icone: ClipboardList,
              rotulo: 'Área do aluno',
              texto: 'Histórico, busca e status dos seus pedidos.',
              acao: () => navegar('app'),
            },
            {
              icone: ListChecks,
              rotulo: 'Ferramentas gratuitas',
              texto: 'Médias, cronograma de estudos e checklist.',
              acao: () => navegar('ferramentas'),
            },
          ].map((item) => (
            <li key={item.rotulo}>
              <button
                type="button"
                onClick={item.acao}
                className="flex h-full w-full flex-col items-start gap-2 rounded-xl border border-offwhite-50/10 bg-offwhite-50/[0.03] p-5 text-left transition-colors duration-300 hover:border-accent-400/45 hover:bg-accent-400/10"
              >
                <item.icone className="h-4.5 w-4.5 text-accent-400" aria-hidden="true" />
                <span className="font-display text-sm font-bold text-offwhite-50">{item.rotulo}</span>
                <span className="font-body text-xs leading-relaxed text-offwhite-100/60">{item.texto}</span>
              </button>
            </li>
          ))}
        </ul>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="ajuda-como-pedir" className="card-surface p-6 sm:p-8">
          <h2 id="ajuda-como-pedir" className="flex items-center gap-2.5 font-display text-lg font-extrabold text-offwhite-50">
            <Search className="h-5 w-5 text-accent-400" aria-hidden="true" />
            Como solicitar um serviço
          </h2>
          <ol className="mt-6 space-y-5">
            {AJUDA_COMO_PEDIR.map((passo, i) => (
              <li key={passo.titulo} className="flex gap-4">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent-400/30 bg-accent-400/10 font-display text-xs font-extrabold text-accent-300">
                  {i + 1}
                </span>
                <div>
                  <p className="font-display text-sm font-bold text-offwhite-50">{passo.titulo}</p>
                  <p className="mt-1 font-body text-sm leading-relaxed text-offwhite-100/65">{passo.texto}</p>
                </div>
              </li>
            ))}
          </ol>
          <button type="button" onClick={irParaFormulario} className="btn-primary mt-7 w-full py-2.5! text-xs! sm:w-auto">
            Ir para o formulário
          </button>
        </section>

        <section aria-labelledby="ajuda-como-acompanhar" className="card-surface p-6 sm:p-8">
          <h2
            id="ajuda-como-acompanhar"
            className="flex items-center gap-2.5 font-display text-lg font-extrabold text-offwhite-50"
          >
            <Radio className="h-5 w-5 text-accent-400" aria-hidden="true" />
            Como acompanhar o pedido
          </h2>
          <ol className="mt-6 space-y-5">
            {AJUDA_COMO_ACOMPANHAR.map((passo, i) => (
              <li key={passo.titulo} className="flex gap-4">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent-400/30 bg-accent-400/10 font-display text-xs font-extrabold text-accent-300">
                  {i + 1}
                </span>
                <div>
                  <p className="font-display text-sm font-bold text-offwhite-50">{passo.titulo}</p>
                  <p className="mt-1 font-body text-sm leading-relaxed text-offwhite-100/65">{passo.texto}</p>
                </div>
              </li>
            ))}
          </ol>
          <button type="button" onClick={() => navegar('app')} className="btn-ghost mt-7 w-full py-2.5! text-xs! sm:w-auto">
            Abrir a área do aluno
          </button>
        </section>
      </div>

      <section aria-labelledby="ajuda-status" className="card-surface mt-6 p-6 sm:p-8">
        <h2 id="ajuda-status" className="flex items-center gap-2.5 font-display text-lg font-extrabold text-offwhite-50">
          <ClipboardList className="h-5 w-5 text-accent-400" aria-hidden="true" />
          O que cada status significa
        </h2>
        <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STATUS.map((item) => (
            <div key={item.nome} className="rounded-xl border border-offwhite-50/10 bg-deep-950/40 p-4">
              <dt className="font-display text-sm font-bold text-accent-300">{item.nome}</dt>
              <dd className="mt-1.5 font-body text-xs leading-relaxed text-offwhite-100/65">{item.texto}</dd>
            </div>
          ))}
          <div className="rounded-xl border border-dashed border-offwhite-50/15 p-4">
            <dt className="font-display text-sm font-bold text-offwhite-100/70">Rascunho local</dt>
            <dd className="mt-1.5 font-body text-xs leading-relaxed text-offwhite-100/55">
              Aparece quando o banco de dados não está configurado no ambiente: o pedido fica salvo apenas neste
              navegador e o site avisa isso explicitamente.
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="ajuda-faq" className="card-surface mt-6 p-6 sm:p-8">
        <h2 id="ajuda-faq" className="flex items-center gap-2.5 font-display text-lg font-extrabold text-offwhite-50">
          <HelpCircle className="h-5 w-5 text-accent-400" aria-hidden="true" />
          Perguntas frequentes
        </h2>
        <div className="mt-6 divide-y divide-offwhite-50/8 border-y border-offwhite-50/8">
          {AJUDA_FAQ.map((item, i) => {
            const aberta = abertas.includes(item.pergunta)
            const painel = `faq-painel-${i}`
            return (
              <div key={item.pergunta}>
                <h3>
                  <button
                    type="button"
                    onClick={() => alternar(item.pergunta)}
                    aria-expanded={aberta}
                    aria-controls={painel}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left"
                  >
                    <span className="font-display text-sm font-bold text-offwhite-50 sm:text-[0.95rem]">
                      {item.pergunta}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-accent-400 transition-transform duration-300 ${
                        aberta ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <div
                  id={painel}
                  role="region"
                  aria-label={item.pergunta}
                  hidden={!aberta}
                  className="pb-5 font-body text-sm leading-relaxed text-offwhite-100/70"
                >
                  {item.resposta}
                </div>
              </div>
            )
          })}
        </div>
        <p className="mt-6 flex items-start gap-2.5 rounded-xl border border-offwhite-50/10 bg-deep-950/40 px-4 py-3 font-caption text-xs leading-relaxed text-offwhite-100/55">
          <LifeBuoy className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" />
          Não achou o que procurava? Use o formulário de contato e descreva sua dúvida — a equipe responde pelo meio de
          contato que você escolher.
        </p>
      </section>
    </PageShell>
  )
}
