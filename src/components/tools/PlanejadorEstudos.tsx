import { useId } from 'react'
import { CalendarDays, CircleAlert, Plus, RotateCcw } from 'lucide-react'
import { useLocalState } from '../../hooks/useLocalState'
import { ToolCard } from './ToolCard'

type Materia = { id: string; nome: string; horas: string }

const DIAS = [
  { id: 'seg', rotulo: 'Segunda' },
  { id: 'ter', rotulo: 'Terça' },
  { id: 'qua', rotulo: 'Quarta' },
  { id: 'qui', rotulo: 'Quinta' },
  { id: 'sex', rotulo: 'Sexta' },
  { id: 'sab', rotulo: 'Sábado' },
  { id: 'dom', rotulo: 'Domingo' },
] as const

const MATERIAS_INICIAIS: Materia[] = [
  { id: 'm1', nome: '', horas: '2' },
  { id: 'm2', nome: '', horas: '2' },
]

const CORES = [
  'border-accent-400/40 bg-accent-400/12 text-accent-300',
  'border-skill-500/45 bg-skill-500/14 text-offwhite-50',
  'border-emerald-400/35 bg-emerald-400/10 text-emerald-200',
  'border-amber-300/35 bg-amber-300/10 text-amber-200',
  'border-offwhite-50/20 bg-offwhite-50/[0.06] text-offwhite-100',
]

function novoId() {
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function parseDecimal(valor: string): number | null {
  const limpo = valor.trim().replace(',', '.')
  if (!limpo) return null
  const numero = Number(limpo)
  return Number.isFinite(numero) ? numero : null
}

function erroHoras(valor: string): string | null {
  if (!valor.trim()) return 'Informe as horas.'
  const horas = parseDecimal(valor)
  if (horas === null) return 'Use apenas números.'
  if (horas <= 0) return 'Deve ser maior que zero.'
  if (horas > 40) return 'Máximo de 40 horas por semana.'
  return null
}

/**
 * Gerador de cronograma de estudos: distribui as horas semanais de cada matéria
 * pelos dias disponíveis, em blocos de duração escolhida pelo estudante.
 * Tudo local — nenhum dado sai do dispositivo.
 */
export function PlanejadorEstudos() {
  const idBase = useId()
  const { valor: materias, setValor: setMaterias, limpar } = useLocalState<Materia[]>(
    'skillcraft:ferramenta:cronograma',
    MATERIAS_INICIAIS,
  )
  const { valor: dias, setValor: setDias } = useLocalState<string[]>('skillcraft:ferramenta:cronograma:dias', [
    'seg',
    'ter',
    'qua',
    'qui',
    'sex',
  ])
  const { valor: duracao, setValor: setDuracao } = useLocalState<number>('skillcraft:ferramenta:cronograma:duracao', 50)
  const { valor: blocosPorDia, setValor: setBlocosPorDia } = useLocalState<number>(
    'skillcraft:ferramenta:cronograma:blocos',
    2,
  )

  const aoMudar = (id: string, campo: 'nome' | 'horas', valor: string) =>
    setMaterias((atual) => atual.map((m) => (m.id === id ? { ...m, [campo]: valor } : m)))

  const adicionar = () => setMaterias((atual) => [...atual, { id: novoId(), nome: '', horas: '1' }])
  const remover = (id: string) =>
    setMaterias((atual) => (atual.length > 1 ? atual.filter((m) => m.id !== id) : atual))

  const alternarDia = (id: string) =>
    setDias((atual) => (atual.includes(id) ? atual.filter((d) => d !== id) : [...atual, id]))

  const validas = materias.flatMap<{ id: string; nome: string; horas: number }>((m) => {
    const horas = parseDecimal(m.horas)
    if (horas === null || erroHoras(m.horas)) return []
    return [{ id: m.id, nome: m.nome.trim() || 'Matéria sem nome', horas }]
  })

  const diasOrdenados = DIAS.filter((d) => dias.includes(d.id))
  const capacidade = diasOrdenados.length * blocosPorDia

  // Distribuição calculada a cada alteração (sem estado extra para sincronizar).
  const { grade, necessario, fila } = (() => {
    // blocos necessários por matéria (arredonda para cima: nunca planeja menos do que o pedido)
    const fila = validas
      .map((m, indice) => ({
        ...m,
        indice,
        blocos: Math.max(1, Math.ceil((m.horas * 60) / duracao)),
      }))
      .sort((a, b) => b.blocos - a.blocos)

    const necessario = fila.reduce((s, m) => s + m.blocos, 0)
    const restantes = new Map(fila.map((m) => [m.id, m.blocos]))
    const grade: ({ materia: (typeof fila)[number] } | { materia: null })[][] = diasOrdenados.map(() =>
      Array.from({ length: blocosPorDia }, () => ({ materia: null })),
    )

    // preenchimento round-robin ponderado: a matéria com mais blocos pendentes entra primeiro
    for (let bloco = 0; bloco < blocosPorDia; bloco += 1) {
      for (let dia = 0; dia < diasOrdenados.length; dia += 1) {
        const candidatas = fila
          .filter((m) => (restantes.get(m.id) ?? 0) > 0)
          .sort((a, b) => (restantes.get(b.id) ?? 0) - (restantes.get(a.id) ?? 0))
        const escolhida = candidatas[0]
        if (!escolhida) continue
        grade[dia][bloco] = { materia: escolhida }
        restantes.set(escolhida.id, (restantes.get(escolhida.id) ?? 1) - 1)
      }
    }

    return { grade, necessario, fila }
  })()

  const excedente = Math.max(0, necessario - capacidade)

  return (
    <ToolCard
      id="planejador-estudos"
      icone={CalendarDays}
      titulo="Planejador de cronograma de estudos"
      descricao="Informe as matérias, as horas semanais de cada uma e os dias disponíveis: o cronograma é montado em blocos de estudo."
      acoes={
        <>
          <button type="button" onClick={adicionar} className="btn-ghost px-4! py-2! text-xs!">
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Adicionar matéria
          </button>
          <button type="button" onClick={limpar} className="btn-ghost px-4! py-2! text-xs!">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Limpar
          </button>
        </>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <fieldset>
            <legend className="field-label">Dias disponíveis</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {DIAS.map((dia) => {
                const ativo = dias.includes(dia.id)
                return (
                  <label
                    key={dia.id}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 font-caption text-xs font-bold transition-colors duration-300 ${
                      ativo
                        ? 'border-accent-400/60 bg-accent-400/12 text-accent-300'
                        : 'border-offwhite-50/12 text-offwhite-100/55 hover:border-offwhite-50/25 hover:text-offwhite-100/80'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={ativo}
                      onChange={() => alternarDia(dia.id)}
                    />
                    <span aria-hidden="true" className={`h-2 w-2 rounded-full ${ativo ? 'bg-accent-400' : 'bg-offwhite-100/25'}`} />
                    {dia.rotulo.slice(0, 3)}
                  </label>
                )
              })}
            </div>
            {diasOrdenados.length === 0 && (
              <p className="field-error" role="alert">
                <CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                Selecione ao menos um dia para montar o cronograma.
              </p>
            )}
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${idBase}-duracao`} className="field-label">
                Duração do bloco
              </label>
              <select
                id={`${idBase}-duracao`}
                className="field-input py-2.5!"
                value={duracao}
                onChange={(e) => setDuracao(Number(e.target.value))}
              >
                {[25, 30, 45, 50, 60, 90].map((min) => (
                  <option key={min} value={min} className="text-offwhite-50">
                    {min} minutos
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`${idBase}-blocos`} className="field-label">
                Blocos por dia
              </label>
              <select
                id={`${idBase}-blocos`}
                className="field-input py-2.5!"
                value={blocosPorDia}
                onChange={(e) => setBlocosPorDia(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map((q) => (
                  <option key={q} value={q} className="text-offwhite-50">
                    {q} {q === 1 ? 'bloco' : 'blocos'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <p className="field-label">Matérias e horas por semana</p>
            <ul className="mt-2 space-y-3">
              {materias.map((materia, indice) => {
                const erro = erroHoras(materia.horas)
                return (
                  <li key={materia.id} className="grid gap-3 sm:grid-cols-[1fr_6.5rem_2.5rem] sm:items-start">
                    <div>
                      <label htmlFor={`${idBase}-${materia.id}-nome`} className="field-label sm:sr-only">
                        Nome da matéria {indice + 1}
                      </label>
                      <input
                        id={`${idBase}-${materia.id}-nome`}
                        className="field-input py-2.5!"
                        placeholder="Ex.: Programação web"
                        value={materia.nome}
                        onChange={(e) => aoMudar(materia.id, 'nome', e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor={`${idBase}-${materia.id}-horas`} className="field-label sm:sr-only">
                        Horas por semana da matéria {indice + 1}
                      </label>
                      <input
                        id={`${idBase}-${materia.id}-horas`}
                        className={`field-input py-2.5! ${erro ? 'field-input-error' : ''}`}
                        inputMode="decimal"
                        value={materia.horas}
                        onChange={(e) => aoMudar(materia.id, 'horas', e.target.value)}
                        aria-invalid={Boolean(erro)}
                        aria-describedby={erro ? `${idBase}-${materia.id}-horas-erro` : undefined}
                      />
                      {erro && (
                        <p id={`${idBase}-${materia.id}-horas-erro`} className="field-error" role="alert">
                          <CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                          {erro}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => remover(materia.id)}
                      disabled={materias.length <= 1}
                      aria-label={`Remover matéria ${indice + 1}${materia.nome ? ` (${materia.nome})` : ''}`}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-offwhite-50/12 text-offwhite-100/55 transition-colors duration-300 hover:border-red-400/50 hover:text-red-300 disabled:pointer-events-none disabled:opacity-30"
                    >
                      <span aria-hidden="true" className="font-display text-lg leading-none">
                        ×
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-offwhite-50/10 bg-deep-950/45 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-sm font-extrabold tracking-wide text-offwhite-50 uppercase">
              Seu cronograma
            </h3>
            <p className="font-caption text-xs text-offwhite-100/50">
              {capacidade} {capacidade === 1 ? 'bloco disponível' : 'blocos disponíveis'} · {necessario}{' '}
              {necessario === 1 ? 'necessário' : 'necessários'}
            </p>
          </div>

          {excedente > 0 && (
            <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 font-caption text-xs leading-relaxed text-amber-200">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Faltam {excedente} {excedente === 1 ? 'bloco' : 'blocos'} para caber tudo: inclua mais dias, aumente os
              blocos por dia ou reduza as horas semanais.
            </p>
          )}

          {diasOrdenados.length === 0 || fila.length === 0 ? (
            <p className="mt-6 font-body text-sm leading-relaxed text-offwhite-100/60">
              Selecione os dias disponíveis e preencha as matérias com as horas semanais para ver o cronograma montado
              aqui.
            </p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[26rem] border-separate border-spacing-1.5 text-left">
                <caption className="sr-only">Cronograma semanal de estudos gerado a partir das matérias informadas</caption>
                <thead>
                  <tr>
                    <th scope="col" className="w-16 font-caption text-[0.65rem] tracking-[0.16em] text-offwhite-100/40 uppercase">
                      Bloco
                    </th>
                    {diasOrdenados.map((dia) => (
                      <th
                        key={dia.id}
                        scope="col"
                        className="font-caption text-[0.65rem] font-bold tracking-[0.12em] text-offwhite-100/60 uppercase"
                      >
                        {dia.rotulo.slice(0, 3)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: blocosPorDia }, (_, bloco) => (
                    <tr key={bloco}>
                      <th
                        scope="row"
                        className="font-caption text-[0.65rem] font-bold text-offwhite-100/40 align-middle"
                      >
                        {bloco + 1}º
                      </th>
                      {diasOrdenados.map((dia, diaIndice) => {
                        const celula = grade[diaIndice]?.[bloco]?.materia ?? null
                        return (
                          <td key={dia.id} className="align-top">
                            {celula ? (
                              <span
                                className={`flex min-h-[3.25rem] items-center rounded-lg border px-2.5 py-2 font-body text-xs leading-snug ${
                                  CORES[celula.indice % CORES.length]
                                }`}
                              >
                                {celula.nome}
                              </span>
                            ) : (
                              <span className="flex min-h-[3.25rem] items-center rounded-lg border border-dashed border-offwhite-50/10 px-2.5 py-2 font-caption text-[0.65rem] text-offwhite-100/30">
                                livre
                              </span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-5 font-caption text-xs leading-relaxed text-offwhite-100/40">
            O cronograma é uma sugestão de organização gerada no seu navegador. Ele não cria compromissos com a equipe
            da Skill Craft e pode ser ajustado livremente.
          </p>
        </div>
      </div>
    </ToolCard>
  )
}
