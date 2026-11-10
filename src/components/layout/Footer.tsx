import { ArrowUp, AtSign, GraduationCap, Mail, MessageCircle } from 'lucide-react'
import { CONTATO, NAV_LINKS, SERVICOS } from '../../config/site'
import { irParaSecao, type Rota } from '../../hooks/useHashRoute'
import { Logo } from '../brand/Logo'

type FooterProps = { rota: Rota; irParaHome: () => void }

export function Footer({ rota, irParaHome }: FooterProps) {
  const irPara = (id: string) => {
    if (rota !== 'home') {
      irParaHome()
      window.setTimeout(() => irParaSecao(id), 90)
      return
    }
    irParaSecao(id)
  }

  const canais = [
    CONTATO.email ? { icone: Mail, rotulo: CONTATO.email, href: `mailto:${CONTATO.email}` } : null,
    CONTATO.whatsapp
      ? { icone: MessageCircle, rotulo: `WhatsApp +${CONTATO.whatsapp}`, href: `https://wa.me/${CONTATO.whatsapp}` }
      : null,
    CONTATO.instagram
      ? { icone: AtSign, rotulo: `@${CONTATO.instagram}`, href: `https://instagram.com/${CONTATO.instagram}` }
      : null,
  ].filter((c): c is NonNullable<typeof c> => c !== null)

  return (
    <footer className="relative overflow-hidden bg-deep-950">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-400/50 to-transparent" />
      <div aria-hidden="true" className="padrao-iso absolute right-0 bottom-0 h-72 w-[36rem] opacity-25 [mask-image:linear-gradient(to_left,black,transparent)]" />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -left-24 h-80 w-80 opacity-[0.06]"
        viewBox="0 0 120 132"
        fill="none"
      >
        <path d="M60 4 L114 35 L114 97 L60 128 L6 97 L6 35 Z" stroke="#6B8CFF" strokeWidth="1.2" />
        <path d="M60 26 L94 46 L94 86 L60 106 L26 86 L26 46 Z" stroke="#6B8CFF" strokeWidth="0.8" />
      </svg>

      <div className="container-site relative grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-8">
        <div>
          <Logo variante="lockup-white" className="h-16 w-auto" />
          <p className="mt-5 max-w-sm font-body text-sm leading-relaxed text-offwhite-100/60">
            Agência estudantil de apoio acadêmico, tecnológico e criativo. Unimos Administração, Tecnologia da
            Informação e Design Gráfico para ajudar estudantes a aprender, desenvolver e entregar mais.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-lg border border-offwhite-50/10 bg-offwhite-50/[0.03] px-3 py-1.5 font-caption text-xs text-offwhite-100/55">
            <GraduationCap className="h-3.5 w-3.5 text-accent-400" aria-hidden="true" />
            Projeto Integrador 2026 · Colégio Raphael Di Santo
          </p>
        </div>

        <nav aria-label="Rodapé — navegação">
          <h3 className="kicker text-accent-400">
            <span aria-hidden="true" className="kicker-dot" />
            Navegação
          </h3>
          <ul className="mt-5 space-y-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    irPara(link.id)
                  }}
                  className="group inline-flex items-center gap-2 font-body text-sm text-offwhite-100/60 transition-colors duration-300 hover:text-offwhite-50"
                >
                  <span aria-hidden="true" className="h-px w-0 bg-accent-400 transition-all duration-300 group-hover:w-4" />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Rodapé — serviços">
          <h3 className="kicker text-accent-400">
            <span aria-hidden="true" className="kicker-dot" />
            Serviços
          </h3>
          <ul className="mt-5 space-y-2.5">
            {SERVICOS.map((servico) => (
              <li key={servico.id}>
                <button
                  type="button"
                  onClick={() => irPara('servicos')}
                  className="group inline-flex items-center gap-2 text-left font-body text-sm text-offwhite-100/60 transition-colors duration-300 hover:text-offwhite-50"
                >
                  <span aria-hidden="true" className="h-px w-0 bg-accent-400 transition-all duration-300 group-hover:w-4" />
                  {servico.titulo}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="kicker text-accent-400">
            <span aria-hidden="true" className="kicker-dot" />
            Contato
          </h3>
          {canais.length > 0 ? (
            <ul className="mt-5 space-y-2.5">
              {canais.map((canal) => (
                <li key={canal.rotulo}>
                  <a
                    href={canal.href}
                    target={canal.href.startsWith('http') ? '_blank' : undefined}
                    rel={canal.href.startsWith('http') ? 'noreferrer' : undefined}
                    className="inline-flex items-center gap-2.5 font-body text-sm text-offwhite-100/60 transition-colors duration-300 hover:text-offwhite-50"
                  >
                    <canal.icone className="h-4 w-4 text-accent-400" aria-hidden="true" />
                    {canal.rotulo}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 font-body text-sm leading-relaxed text-offwhite-100/60">
              Operação 100% digital. Os canais oficiais de atendimento (WhatsApp e Instagram) são informados pela
              equipe no primeiro contato — e podem ser fixados aqui via variáveis de ambiente.
            </p>
          )}
          <p className="mt-5 font-caption text-xs leading-relaxed text-offwhite-100/40">
            Solicitações pelo formulário do site são respondidas pelo meio de contato escolhido por você.
          </p>
        </div>
      </div>

      <div className="relative border-t border-offwhite-50/8">
        <div className="container-site flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="font-caption text-xs text-offwhite-100/45">
            © {new Date().getFullYear()} Skill Craft · Conhecimento que conecta, tecnologia que transforma.
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-offwhite-50/10 px-3.5 py-2 font-caption text-xs text-offwhite-100/60 transition-all duration-300 hover:border-accent-400/50 hover:bg-accent-400/10 hover:text-offwhite-50"
          >
            Voltar ao topo
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  )
}
