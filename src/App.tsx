import { useCallback, useState } from 'react'
import { MotionConfig } from 'framer-motion'
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
import { Contact } from './components/sections/Contact'
import { StudentArea } from './components/auth/StudentArea'

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

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[110] focus:rounded-xl focus:bg-skill-500 focus:px-4 focus:py-2 focus:font-display focus:text-sm focus:font-bold focus:text-offwhite-50"
      >
        Pular para o conteúdo
      </a>

      <IntroOverlay onConcluir={() => setIntroConcluida(true)} />
      <Navbar rota={rota} irParaHome={irParaHome} />

      <main id="conteudo">
        {rota === 'home' ? (
          <>
            <Hero iniciar={introConcluida} />
            <About />
            <Services onSolicitar={aoSolicitar} />
            <HowItWorks />
            <Differentials />
            <Contact preSelecao={preSelecao} />
          </>
        ) : (
          <StudentArea irParaHome={irParaHome} />
        )}
      </main>

      <Footer rota={rota} irParaHome={irParaHome} />
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
