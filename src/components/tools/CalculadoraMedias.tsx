import { useId } from 'react'
import { CircleAlert, Plus, RotateCcw, Sigma } from 'lucide-react'
import { useLocalState } from '../../hooks/useLocalState'
import { ToolCard } from './ToolCard'

type LinhaNota = { id: string; rotulo: string; nota: string; peso: string }

const MEDIA_MINIMA_PADRAO = '6'

const LINHAS_INICIAIS: LinhaNota[] = [
  { id: 'n1', rotulo: '', nota: '', peso: '1' },
  { id: 'n2', rotulo: '', nota: '', peso: '1' },
]

function novoId(prefixo: string) {
  return `${prefixo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

/** Aceita "7,5" ou "7.5" e devolve o número ou null quando inválido. */
function parseDecimal(valor: string): number | null {
  const limpo = valor.trim().replace(',', '.')
  if (!limpo) return null
  const numero = Number(limpo)
  return Number.isFinite(numero) ? numero : null
}

function erroNota(valor: string): string | null {
  if (!valor.trim()) return null
  const numero = parseDecimal(valor)
  if (numero === null) return 'Use apenas números (ex.: 7,5).'
  if (numero < 0 || numero > 10) return 'A nota deve ficar entre 0 e 10.'
  return null
}

function erroPeso(valor: string): string | null {
  if (!valor.trim()) return 'Informe o peso.'
  const numero = parseDecimal(valor)
  if (numero === null) return 'Use apenas números (ex.: 2).'
  if (numero <= 0) return 'O peso precisa ser maior que zero.'
  return null
}

/**
 * Calculadora de média ponderada.
 * Roda 100% no navegador e salva apenas neste dispositivo — nenhum dado é
 * enviado e nenhuma nota oficial é consultada.
 */
export function CalculadoraMedias() {
  const idBase = useId()
  const { valor: linhas, setValor: setLinhas, limpar } = useLocalState<LinhaNota[]>(
    'skillcraft:ferramenta:medias',
    LINHAS_INICIAIS,
  )
  const { valor: mediaMinima, setValor: setMediaMinima } = useLocalState<string>(
    'skillcraft:ferramenta:medias:minima',
    MEDIA_MINIMA_PADRAO,
  )

  const aoMudar = (id: string, campo: 'rotulo' | 'nota' | 'peso', valor: string) => {
    setLinhas((atual) => atual.map((l) => (l.id === id ? { ...l, [campo]: valor } : l)))
  }

  const adicionar = () => setLinhas((atual) => [...atual, { id: novoId('n'), rotulo: '', nota: '', peso: '1' }])

  const remover = (id: string) => setLinhas((atual) => (atual.length > 1 ? atual.filter((l) => l.id !== id) : atual))

  const reiniciar = () => {
    limpar()
    setMediaMinima(MEDIA_MINIMA_PADRAO)
  }

  const validas = linhas.flatMap<{ rotulo: string; nota: number; peso: number }>((l) => {
    const nota = parseDecimal(l.nota)
    const peso = parseDecimal(l.peso)
    if (nota === null || peso === null) return []
    if (erroNota(l.nota) || erroPeso(l.peso)) return []
    return [{ rotulo: l.rotulo.trim(), nota, peso }]
  })

  const somaPesos = validas.reduce((s, l) => s + l.peso, 0)
  const somaPonderada = validas.reduce((s, l) => s + l.nota * l.peso, 0)
  const media = somaPesos > 0 ? somaPonderada / somaPesos : null
  const minima = parseDecimal(mediaMinima) ?? 6
  const aprovado = media !== null ? media >= minima : null

  const formatar = (n: number) => n.toFixed(2).replace('.', ',')

  return (
    <ToolCard
      id="calculadora-medias"
      icone={Sigma}
      titulo="Calculadora de médias"
      descricao="Calcule sua média ponderada por disciplina, com o peso de cada nota e a média mínima que você precisa alcançar."
      acoes={
        <>
          <button type="button" onClick={adicionar} className="btn-ghost px-4! py-2! text-xs!">
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Adicionar nota
          </button>
          <button type="button" onClick={reiniciar} className="btn-ghost px-4! py-2! text-xs!">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Limpar
          </button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div>
          <div className="hidden gap-3 sm:grid sm:grid-cols-[1.4fr_0.8fr_0.8fr_2.5rem]">
            <span className="field-label mb-0">Disciplina (opcional)</span>
            <span className="field-label mb-0">Nota (0–10)</span>
            <span className="field-label mb-0">Peso</span>
            <span className="sr-only">Remover</span>
          </div>

          <ul className="mt-3 space-y-3">
            {linhas.map((linha, indice) => {
              const eNota = erroNota(linha.nota)
              const ePeso = erroPeso(linha.peso)
              return (
                <li
                  key={linha.id}
                  className="grid gap-3 rounded-xl border border-offwhite-50/8 bg-deep-950/40 p-3 sm:grid-cols-[1.4fr_0.8fr_0.8fr_2.5rem] sm:items-start sm:border-0 sm:bg-transparent sm:p-0"
                >
                  <div>
                    <label htmlFor={`${idBase}-${linha.id}-rotulo`} className="field-label sm:sr-only">
                      Disciplina {indice + 1}
                    </label>
                    <input
                      id={`${idBase}-${linha.id}-rotulo`}
                      className="field-input py-2.5!"
                      placeholder="Ex.: Banco de dados"
                      value={linha.rotulo}
                      onChange={(e) => aoMudar(linha.id, 'rotulo', e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${idBase}-${linha.id}-nota`} className="field-label sm:sr-only">
                      Nota {indice + 1}
                    </label>
                    <input
                      id={`${idBase}-${linha.id}-nota`}
                      className={`field-input py-2.5! ${eNota ? 'field-input-error' : ''}`}
                      inputMode="decimal"
                      placeholder="7,5"
                      value={linha.nota}
                      onChange={(e) => aoMudar(linha.id, 'nota', e.target.value)}
                      aria-invalid={Boolean(eNota)}
                      aria-describedby={eNota ? `${idBase}-${linha.id}-nota-erro` : undefined}
                    />
                    {eNota && (
                      <p id={`${idBase}-${linha.id}-nota-erro`} className="field-error" role="alert">
                        <CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                        {eNota}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor={`${idBase}-${linha.id}-peso`} className="field-label sm:sr-only">
                      Peso {indice + 1}
                    </label>
                    <input
                      id={`${idBase}-${linha.id}-peso`}
                      className={`field-input py-2.5! ${ePeso ? 'field-input-error' : ''}`}
                      inputMode="decimal"
                      placeholder="1"
                      value={linha.peso}
                      onChange={(e) => aoMudar(linha.id, 'peso', e.target.value)}
                      aria-invalid={Boolean(ePeso)}
                      aria-describedby={ePeso ? `${idBase}-${linha.id}-peso-erro` : undefined}
                    />
                    {ePeso && (
                      <p id={`${idBase}-${linha.id}-peso-erro`} className="field-error" role="alert">
                        <CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                        {ePeso}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => remover(linha.id)}
                    disabled={linhas.length <= 1}
                    aria-label={`Remover nota ${indice + 1}${linha.rotulo ? ` (${linha.rotulo})` : ''}`}
                    className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-offwhite-50/12 text-offwhite-100/55 transition-colors duration-300 hover:border-red-400/50 hover:text-red-300 disabled:pointer-events-none disabled:opacity-30 sm:mt-0"
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

        <div className="space-y-4">
          <div className="rounded-2xl border border-offwhite-50/10 bg-deep-950/45 p-5">
            <label htmlFor={`${idBase}-minima`} className="field-label">
              Média mínima para aprovação
            </label>
            <input
              id={`${idBase}-minima`}
              className="field-input py-2.5!"
              inputMode="decimal"
              value={mediaMinima}
              onChange={(e) => setMediaMinima(e.target.value)}
              aria-describedby={`${idBase}-minima-ajuda`}
            />
            <p id={`${idBase}-minima-ajuda`} className="mt-2 font-caption text-xs leading-relaxed text-offwhite-100/45">
              Use a regra da sua escola ou curso. A Skill Craft não define nem altera critérios de aprovação.
            </p>
          </div>

          <div className="rounded-2xl border border-accent-400/20 bg-accent-400/[0.07] p-5" aria-live="polite">
            <p className="font-caption text-xs tracking-[0.18em] text-accent-300 uppercase">Média ponderada</p>
            {media === null ? (
              <p className="mt-3 font-body text-sm leading-relaxed text-offwhite-100/65">
                Preencha pelo menos uma nota válida com o peso para ver o resultado.
              </p>
            ) : (
              <>
                <p className="mt-2 font-display text-4xl font-extrabold tracking-tight text-offwhite-50">
                  {formatar(media)}
                </p>
                <p
                  className={`mt-2 inline-flex items-center rounded-full px-3 py-1 font-caption text-[0.7rem] font-bold tracking-wide uppercase ${
                    aprovado ? 'bg-emerald-400/15 text-emerald-300' : 'bg-amber-300/15 text-amber-200'
                  }`}
                >
                  {aprovado ? 'Acima da média mínima' : 'Abaixo da média mínima'}
                </p>
                <dl className="mt-4 space-y-1.5 font-caption text-xs text-offwhite-100/55">
                  <div className="flex justify-between gap-3">
                    <dt>Notas consideradas</dt>
                    <dd className="text-offwhite-50">{validas.length}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Soma dos pesos</dt>
                    <dd className="text-offwhite-50">{formatar(somaPesos)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Média simples</dt>
                    <dd className="text-offwhite-50">
                      {formatar(validas.reduce((s, l) => s + l.nota, 0) / validas.length)}
                    </dd>
                  </div>
                </dl>
              </>
            )}
          </div>
        </div>
      </div>
    </ToolCard>
  )
}
