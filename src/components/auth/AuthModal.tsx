import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { KeyRound, TriangleAlert, X } from 'lucide-react'

type AuthModalProps = {
  aberto: boolean
  modo: 'pendente' | 'erro'
  erro?: string
  fechar: () => void
}

/**
 * Estado honesto da autenticação: sem credenciais de Supabase/Google no ambiente,
 * o login não é simulado — o aluno vê exatamente o que falta configurar.
 */
export function AuthModal({ aberto, modo, erro, fechar }: AuthModalProps) {
  useEffect(() => {
    if (!aberto) return
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar()
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [aberto, fechar])

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-deep-950/80 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={fechar}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-auth"
            className="card-surface relative w-full max-w-md bg-deep-900/95 p-6 sm:p-8"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={fechar}
              aria-label="Fechar"
              className="absolute top-4 right-4 rounded-lg p-2 text-offwhite-100/60 transition-colors hover:bg-offwhite-50/5 hover:text-offwhite-50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-skill-500/15 text-accent-400">
              {modo === 'erro' ? <TriangleAlert className="h-5 w-5" aria-hidden="true" /> : <KeyRound className="h-5 w-5" aria-hidden="true" />}
            </span>

            <h3 id="titulo-modal-auth" className="mt-4 font-display text-xl font-extrabold text-offwhite-50">
              {modo === 'erro' ? 'Não foi possível iniciar o login' : 'Login com Google — configuração pendente'}
            </h3>

            {modo === 'erro' ? (
              <p className="mt-3 font-body text-sm leading-relaxed text-offwhite-100/75">
                O Supabase respondeu com um erro ao iniciar o OAuth: <strong className="text-offwhite-50">{erro}</strong>.
                Verifique se o provedor Google está ativado em{' '}
                <span className="font-caption">Authentication → Providers → Google</span> e se os redirecionamentos estão
                autorizados.
              </p>
            ) : (
              <>
                <p className="mt-3 font-body text-sm leading-relaxed text-offwhite-100/75">
                  A autenticação real com Google (Supabase Auth) já está implementada no site, mas este ambiente ainda não
                  possui credenciais. Nenhuma simulação é apresentada como login funcional.
                </p>
                <ol className="mt-4 space-y-2 font-body text-sm text-offwhite-100/75">
                  {[
                    'Crie um projeto no Supabase e copie URL e chave anon.',
                    'Ative o provedor Google com um cliente OAuth do Google Cloud.',
                    'Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env (ou na Vercel).',
                    'Passo a passo completo em docs/CONFIGURACAO.md.',
                  ].map((passo, i) => (
                    <li key={passo} className="flex gap-2.5">
                      <span className="font-display text-xs font-bold text-accent-400">{i + 1}.</span>
                      {passo}
                    </li>
                  ))}
                </ol>
                <p className="mt-4 rounded-xl border border-accent-400/25 bg-accent-400/10 px-3 py-2 font-caption text-xs text-accent-300">
                  Assim que as variáveis existirem, este botão passa a funcionar automaticamente — sem alteração de código.
                </p>
              </>
            )}

            <button type="button" onClick={fechar} className="btn-ghost mt-6 w-full !py-2.5">
              Entendi
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
