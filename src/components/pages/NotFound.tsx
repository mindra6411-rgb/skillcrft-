import { motion } from 'framer-motion'
import { Compass, Home, LifeBuoy, Search, Wrench } from 'lucide-react'
import { irParaSecao } from '../../hooks/useHashRoute'
import type { Rota } from '../../hooks/useHashRoute'
import { Logo } from '../brand/Logo'

type NotFoundProps = {
  /** Hash que o visitante tentou abrir — exibido com transparência, sem esconder o erro. */
  enderecoTentado: string
  irParaHome: () => void
  navegar: (destino: Rota) => void
}

const CAMINHOS = [
  { icone: Search, rotulo: 'Ver os serviços e preços', acao: 'servicos' as const },
  { icone: Wrench, rotulo: 'Ferramentas do estudante', acao: 'ferramentas' as const },
  { icone: LifeBuoy, rotulo: 'Central de ajuda', acao: 'ajuda' as const },
]

/**
 * Página 404 da Skill Craft: identidade da marca, mensagem clara, o endereço
 * que falhou e saídas reais de navegação. Nenhuma rota desconhecida é
 * redirecionada em silêncio para a home.
 */
export function NotFound({ enderecoTentado, irParaHome, navegar }: NotFoundProps) {
  const abrir = (destino: 'servicos' | 'ferramentas' | 'ajuda') => {
    if (destino === 'servicos') {
      irParaHome()
      window.setTimeout(() => irParaSecao('servicos'), 120)
      return
    }
    navegar(destino)
  }

  return (
    <div className="container-site flex min-h-screen flex-col items-center justify-center px-5 pt-28 pb-20 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-2xl"
      >
        <span aria-hidden="true" className="relative mx-auto flex h-32 w-32 items-center justify-center sm:h-36 sm:w-36">
          <svg viewBox="0 0 120 132" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <path d="M60 4 L114 35 L114 97 L60 128 L6 97 L6 35 Z" fill="none" stroke="#6B8CFF" strokeOpacity="0.28" strokeWidth="1.4" />
            <path d="M60 26 L94 46 L94 86 L60 106 L26 86 L26 46 Z" fill="none" stroke="#3155D9" strokeOpacity="0.35" strokeWidth="1" />
          </svg>
          <Compass className="relative h-11 w-11 text-accent-400" aria-hidden="true" />
        </span>

        <p className="mt-8 font-caption text-xs font-bold tracking-[0.28em] text-accent-400 uppercase">Erro 404</p>
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-balance text-offwhite-50 sm:text-5xl">
          Não encontramos esta página
        </h1>
        <p className="mx-auto mt-5 max-w-xl font-body text-base leading-relaxed text-offwhite-100/70">
          O endereço acessado não faz parte do site da Skill Craft. Ele pode ter sido digitado com um caractere a mais
          ou a menos — ou o link que você seguiu está desatualizado.
        </p>

        {enderecoTentado && (
          <p className="mx-auto mt-5 inline-flex max-w-full items-center gap-2 rounded-lg border border-offwhite-50/10 bg-deep-950/50 px-3.5 py-2 font-caption text-xs break-all text-offwhite-100/55">
            <span className="shrink-0 text-offwhite-100/40">Endereço tentado:</span>
            <code className="text-accent-300">{enderecoTentado}</code>
          </p>
        )}

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button type="button" onClick={irParaHome} className="btn-primary w-full sm:w-auto">
            <Home className="h-4 w-4" aria-hidden="true" />
            Ir para o início
          </button>
          <button type="button" onClick={() => abrir('servicos')} className="btn-ghost w-full sm:w-auto">
            Conhecer os serviços
          </button>
        </div>

        <div className="mt-12 border-t border-offwhite-50/8 pt-8">
          <p className="font-caption text-xs tracking-[0.18em] text-offwhite-100/45 uppercase">Ou siga direto para</p>
          <ul className="mx-auto mt-5 grid max-w-xl gap-2.5 sm:grid-cols-3">
            {CAMINHOS.map((caminho) => (
              <li key={caminho.rotulo}>
                <button
                  type="button"
                  onClick={() => abrir(caminho.acao)}
                  className="flex h-full w-full flex-col items-center gap-2 rounded-xl border border-offwhite-50/10 bg-offwhite-50/[0.03] px-4 py-4 font-body text-xs leading-snug text-offwhite-100/70 transition-colors duration-300 hover:border-accent-400/45 hover:bg-accent-400/10 hover:text-offwhite-50"
                >
                  <caminho.icone className="h-4 w-4 text-accent-400" aria-hidden="true" />
                  {caminho.rotulo}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <Logo variante="lockup-white" className="mx-auto mt-12 h-12 w-auto opacity-70" />
      </motion.div>
    </div>
  )
}
