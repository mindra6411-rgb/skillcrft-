import { useId, useState, type FormEvent } from 'react'
import { CheckCircle2, Circle, CircleAlert, ListChecks, Plus, RotateCcw, Sparkles, Trash2 } from 'lucide-react'
import { useLocalState } from '../../hooks/useLocalState'
import { ToolCard } from './ToolCard'

type Tarefa = { id: string; texto: string; concluida: boolean }

/**
 * Etapas que costumam faltar em trabalhos acadêmicos. Não são uma promessa de
 * nota nem uma regra oficial — são um ponto de partida editável.
 */
const SUGESTAO: string[] = [
  'Ler o enunciado e anotar os requisitos',
  'Pesquisar e separar as fontes',
  'Fazer o rascunho do conteúdo',
  'Revisar escrita, coerência e formatação',
  'Conferir capa, citações e referências',
  'Preparar a entrega ou a apresentação final',
]

function novoId() {
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

/** Checklist de trabalho com progresso e persistência apenas no dispositivo. */
export function ChecklistTrabalho() {
  const idBase = useId()
  const { valor: estado, setValor: setEstado, limpar, disponivel } = useLocalState<{
    titulo: string
    tarefas: Tarefa[]
  }>('skillcraft:ferramenta:checklist', { titulo: '', tarefas: [] })
  const [nova, setNova] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  const aoMudarTitulo = (titulo: string) => setEstado((atual) => ({ ...atual, titulo }))

  const adicionar = (texto: string) => {
    const limpo = texto.trim()
    if (!limpo) {
      setErro('Escreva a tarefa antes de adicionar.')
      return
    }
    if (limpo.length > 120) {
      setErro('Máximo de 120 caracteres por tarefa.')
      return
    }
    setErro(null)
    setNova('')
    setEstado((atual) => ({ ...atual, tarefas: [...atual.tarefas, { id: novoId(), texto: limpo, concluida: false }] }))
  }

  const aoEnviar = (evento: FormEvent) => {
    evento.preventDefault()
    adicionar(nova)
  }

  const alternar = (id: string) =>
    setEstado((atual) => ({
      ...atual,
      tarefas: atual.tarefas.map((t) => (t.id === id ? { ...t, concluida: !t.concluida } : t)),
    }))

  const remover = (id: string) =>
    setEstado((atual) => ({ ...atual, tarefas: atual.tarefas.filter((t) => t.id !== id) }))

  const limparConcluidas = () =>
    setEstado((atual) => ({ ...atual, tarefas: atual.tarefas.filter((t) => !t.concluida) }))

  const usarSugestao = () =>
    setEstado((atual) => ({
      ...atual,
      tarefas: [
        ...atual.tarefas,
        ...SUGESTAO.filter((texto) => !atual.tarefas.some((t) => t.texto === texto)).map((texto) => ({
          id: novoId(),
          texto,
          concluida: false,
        })),
      ],
    }))

  const total = estado.tarefas.length
  const feitas = estado.tarefas.filter((t) => t.concluida).length
  const progresso = total > 0 ? Math.round((feitas / total) * 100) : 0

  return (
    <ToolCard
      id="checklist-trabalho"
      icone={ListChecks}
      titulo="Checklist de trabalho"
      descricao="Monte a lista de etapas do seu trabalho, marque o que já foi feito e acompanhe o progresso até a entrega."
      acoes={
        <>
          <button type="button" onClick={usarSugestao} className="btn-ghost px-4! py-2! text-xs!">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Usar lista sugerida
          </button>
          <button type="button" onClick={limpar} className="btn-ghost px-4! py-2! text-xs!">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Limpar tudo
          </button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-5">
          <div>
            <label htmlFor={`${idBase}-titulo`} className="field-label">
              Nome do trabalho (opcional)
            </label>
            <input
              id={`${idBase}-titulo`}
              className="field-input py-2.5!"
              placeholder="Ex.: Trabalho de Banco de Dados"
              value={estado.titulo}
              onChange={(e) => aoMudarTitulo(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="field-label mb-0">Progresso</span>
              <span className="font-caption text-xs text-offwhite-100/55">
                {feitas} de {total} {total === 1 ? 'etapa' : 'etapas'}
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progresso}
              aria-label={`Progresso do checklist: ${progresso}%`}
              className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-offwhite-50/8"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-skill-500 to-accent-400 transition-[width] duration-500"
                style={{ width: `${progresso}%` }}
              />
            </div>
            {total > 0 && feitas === total && (
              <p className="mt-3 font-caption text-xs font-bold text-emerald-300">
                Todas as etapas concluídas. Bom trabalho!
              </p>
            )}
          </div>

          {!disponivel && (
            <p className="flex items-start gap-2.5 rounded-xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 font-caption text-xs leading-relaxed text-amber-200">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Este navegador não permitiu salvar localmente: o checklist funciona, mas será perdido ao fechar a página.
            </p>
          )}
        </div>

        <div>
          <form onSubmit={aoEnviar} noValidate className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label htmlFor={`${idBase}-nova`} className="field-label">
                Nova etapa
              </label>
              <input
                id={`${idBase}-nova`}
                className={`field-input py-2.5! ${erro ? 'field-input-error' : ''}`}
                placeholder="O que falta fazer?"
                value={nova}
                onChange={(e) => {
                  setNova(e.target.value)
                  if (erro) setErro(null)
                }}
                aria-invalid={Boolean(erro)}
                aria-describedby={erro ? `${idBase}-nova-erro` : undefined}
              />
              {erro && (
                <p id={`${idBase}-nova-erro`} className="field-error" role="alert">
                  <CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                  {erro}
                </p>
              )}
            </div>
            <button type="submit" className="btn-primary self-end px-5! py-2.5! text-xs!">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Adicionar
            </button>
          </form>

          {total === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-offwhite-50/15 px-5 py-8 text-center font-body text-sm leading-relaxed text-offwhite-100/55">
              Nenhuma etapa ainda. Adicione a primeira ou use a lista sugerida para começar com as etapas que mais
              costumam ser esquecidas.
            </p>
          ) : (
            <ul className="mt-5 space-y-2">
              {estado.tarefas.map((tarefa) => (
                <li
                  key={tarefa.id}
                  className={`group flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors duration-300 ${
                    tarefa.concluida
                      ? 'border-emerald-400/20 bg-emerald-400/[0.06]'
                      : 'border-offwhite-50/10 bg-deep-950/40 hover:border-accent-400/30'
                  }`}
                >
                  <input
                    id={`${idBase}-${tarefa.id}`}
                    type="checkbox"
                    className="sr-only"
                    checked={tarefa.concluida}
                    onChange={() => alternar(tarefa.id)}
                  />
                  <label
                    htmlFor={`${idBase}-${tarefa.id}`}
                    className="flex flex-1 cursor-pointer items-center gap-3 font-body text-sm leading-snug text-offwhite-50"
                  >
                    {tarefa.concluida ? (
                      <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-300" aria-hidden="true" />
                    ) : (
                      <Circle className="h-4.5 w-4.5 shrink-0 text-offwhite-100/35" aria-hidden="true" />
                    )}
                    <span className={tarefa.concluida ? 'text-offwhite-100/45 line-through' : ''}>{tarefa.texto}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => remover(tarefa.id)}
                    aria-label={`Remover etapa: ${tarefa.texto}`}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-offwhite-100/35 transition-colors duration-300 hover:bg-red-400/10 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {feitas > 0 && (
            <button type="button" onClick={limparConcluidas} className="btn-ghost mt-5 px-4! py-2! text-xs!">
              Remover etapas concluídas
            </button>
          )}
        </div>
      </div>
    </ToolCard>
  )
}
