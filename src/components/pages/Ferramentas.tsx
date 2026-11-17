import { CalendarDays, ListChecks, Lock, Sigma } from 'lucide-react'
import { irParaSecao } from '../../hooks/useHashRoute'
import { PageShell } from '../ui/PageShell'
import { CalculadoraMedias } from '../tools/CalculadoraMedias'
import { PlanejadorEstudos } from '../tools/PlanejadorEstudos'
import { ChecklistTrabalho } from '../tools/ChecklistTrabalho'

const ATALHOS = [
  { id: 'calculadora-medias', rotulo: 'Calculadora de médias', icone: Sigma },
  { id: 'planejador-estudos', rotulo: 'Cronograma de estudos', icone: CalendarDays },
  { id: 'checklist-trabalho', rotulo: 'Checklist de trabalho', icone: ListChecks },
]

/**
 * Ferramentas gratuitas do estudante.
 * Regras: poucas ferramentas bem construídas (não dezenas superficiais), sem
 * coleta de dados pessoais, sem login obrigatório e sem prometer o que não
 * entregam — são apoios de organização, não serviços da Skill Craft.
 */
export function Ferramentas({ irParaHome }: { irParaHome: () => void }) {
  return (
    <PageShell
      kicker="Ferramentas do estudante"
      titulo="Três ferramentas gratuitas para organizar seus estudos"
      lead="Calculadora de médias, gerador de cronograma e checklist de trabalho. Funcionam direto no navegador, sem cadastro e sem custo — e as informações ficam apenas no seu dispositivo."
      irParaHome={irParaHome}
      aside={
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <ul className="flex flex-wrap gap-2">
            {ATALHOS.map((atalho) => (
              <li key={atalho.id}>
                {/* Âncoras nativas mudariam o hash e o roteador sairia da página:
                    por isso o salto interno usa rolagem programática. */}
                <button
                  type="button"
                  onClick={() => irParaSecao(atalho.id)}
                  className="inline-flex items-center gap-2 rounded-xl border border-offwhite-50/12 bg-offwhite-50/[0.03] px-4 py-2.5 font-caption text-xs font-bold text-offwhite-100/70 transition-colors duration-300 hover:border-accent-400/50 hover:bg-accent-400/10 hover:text-offwhite-50"
                >
                  <atalho.icone className="h-3.5 w-3.5 text-accent-400" aria-hidden="true" />
                  {atalho.rotulo}
                </button>
              </li>
            ))}
          </ul>
          <p className="inline-flex items-start gap-2.5 rounded-xl border border-offwhite-50/10 bg-deep-950/40 px-4 py-3 font-caption text-xs leading-relaxed text-offwhite-100/55 lg:max-w-sm">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-400" aria-hidden="true" />
            Nada é enviado para servidores: os dados ficam salvos neste navegador e podem ser apagados a qualquer
            momento pelo botão “Limpar”.
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        <CalculadoraMedias />
        <PlanejadorEstudos />
        <ChecklistTrabalho />
      </div>
    </PageShell>
  )
}
