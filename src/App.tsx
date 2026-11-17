import { Suspense, lazy, useCallback, useState, type ReactNode } from 'react'
import { MotionConfig } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { AuthProvider } from './context/AuthContext'
import { irParaSecao, useHashRoute } from './hooks/useHashRoute'
import { IntroOverlay } from './components/intro/IntroOverlay'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { Hero } from './components/sections/Hero'
import { About } from './components/sections/About'
import { Services } from './components/sections/Services'
import { HowItWorks } from './components/sections/HowItWorks'
import { Differentials } from './components/sections/Differentials'
import { Team } from './components/sections/Team'
import { Resources } from './components/sections/Resources'
import { Contact } from './components/sections/Contact'
import { NotFound } from './components/pages/NotFound'

/* Páginas internas carregadas sob demanda: quem visita só a página
   institucional não baixa o código da área do aluno, das ferramentas,
   da ajuda nem do painel administrativo. */
const StudentArea = lazy(() => import('./components/auth/StudentArea').then((m) => ({ default: m.StudentArea })))
const Ferramentas = lazy(() => import('./components/pages/Ferramentas').then((m) => ({ default: m.Ferramentas })))
const Ajuda = lazy(() => import('./components/pages/Ajuda').then((m) => ({ default: m.Ajuda })))
const Admin = lazy(() => import('./components/pages/Admin').then((m) => ({ default: m.Admin })))
const RedefinirSenha = lazy(() =>
  import('./components/pages/RedefinirSenha').then((m) => ({ default: m.RedefinirSenha })),
)

function CarregandoPagina() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="inline-flex items-center gap-2 font-body text-sm text-offwhite-100/70">
        <Loader2 className="h-5 w-5 animate-spin text-accent-400" aria-hidden="true" />
        Carregando página…
      </span>
    </div>
  )
}

function Shell() {
  const { rota, navegar } = useHashRoute()
  const [introConcluida, setIntroConcluida] = useState(false)
  const [preSelecao, setPreSelecao] = useState<{ id: string; nonce: number } | null>(null)

  const irParaHome = useCallback(() => navegar('home'), [navegar])

  const aoSolicitar = useCallback(
    (servicoId: string) => {
      setPreSelecao({ id: servicoId, nonce: Date.now() })
      if (rota !== 'home') {
        navegar('home')
        window.setTimeout(() => irParaSecao('contato'), 120)
        return
      }
      irParaSecao('contato')
    },
    [rota, navegar],
  )

  const enderecoTentado = typeof window === 'undefined' ? '' : window.location.hash || '(sem hash)'

  const conteudo = (): ReactNode => {
    switch (rota) {
      case 'app':
        return <StudentArea irParaHome={irParaHome} navegar={navegar} />
      case 'ferramentas':
        return <Ferramentas irParaHome={irParaHome} />
      case 'ajuda':
        return <Ajuda irParaHome={irParaHome} navegar={navegar} />
      case 'admin':
        return <Admin irParaHome={irParaHome} />
      case 'redefinir-senha':
        return <RedefinirSenha irParaHome={irParaHome} />
      case '404':
        return (
          <NotFound enderecoTentado={enderecoTentado} irParaHome={irParaHome} navegar={navegar} />
        )
      default:
        return (
          <>
            <Hero iniciar={introConcluida} />
            <About />
            <Services onSolicitar={aoSolicitar} />
            <HowItWorks />
            <Differentials />
            <Team />
            <Resources navegar={navegar} />
            <Contact preSelecao={preSelecao} />
          </>
        )
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[110] focus:rounded-xl focus:bg-skill-500 focus:px-4 focus:py-2 focus:font-display focus:text-sm focus:font-bold focus:text-offwhite-50"
      >
        Pular para o conteúdo
      </a>

      <IntroOverlay onConcluir={() => setIntroConcluida(true)} />
      <Navbar rota={rota} irParaHome={irParaHome} navegar={navegar} />

      <main id="conteudo">
        <Suspense fallback={<CarregandoPagina />}>{conteudo()}</Suspense>
      </main>

      <Footer rota={rota} irParaHome={irParaHome} navegar={navegar} onSolicitar={aoSolicitar} />
    </MotionConfig>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  )
}
