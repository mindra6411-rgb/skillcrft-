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
    CONTATO.email
      ? { icone: Mail, rotulo: CONTATO.email, href: `mailto:${CONTATO.email}` }
      : null,
    CONTATO.whatsapp
      ? {
          icone: MessageCircle,
          rotulo: `WhatsApp +${CONTATO.whatsapp}`,
          href: `https://wa.me/${CONTATO.whatsapp}`,
        }
      : null,
    CONTATO.instagram
      ? { icone: AtSign, rotulo: `@${CONTATO.instagram}`, href: `https://instagram.com/${CONTATO.instagram}` }
      : null,
  ].filter((c): c is NonNullable<typeof c> => c !== null)

  return (
    <footer className="border-t border-offwhite-50/10 bg-deep-950">
      <div className="container-site grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-8">
        <div>
          <Logo variante="lockup-white" className="h-16 w-auto" />
          <p className="mt-4 max-w-sm font-body text-sm leading-relaxed text-offwhite-100/65">
            Agência estudantil de apoio acadêmico, tecnológico e criativo. Unimos Administração, Tecnologia da
            Informação e Design Gráfico para ajudar estudantes a aprender, desenvolver e entregar mais.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-offwhite-50/10 px-3 py-1.5 font-caption text-xs text-offwhite-100/55">
            <GraduationCap className="h-3.5 w-3.5 text-accent-400" aria-hidden="true" />
            Projeto Integrador 2026 · Colégio Raphael Di Santo
          </p>
        </div>

        <nav aria-label="Rodapé — navegação">
          <h3 className="kicker text-accent-400">Navegação</h3>
          <ul className="mt-4 space-y-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    irPara(link.id)
                  }}
                  className="font-body text-sm text-offwhite-100/65 transition-colors hover:text-offwhite-50"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Rodapé — serviços">
          <h3 className="kicker text-accent-400">Serviços</h3>
          <ul className="mt-4 space-y-2.5">
            {SERVICOS.map((servico) => (
              <li key={servico.id}>
                <button
                  type="button"
                  onClick={() => irPara('servicos')}
                  className="text-left font-body text-sm text-offwhite-100/65 transition-colors hover:text-offwhite-50"
                >
                  {servico.titulo}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="kicker text-accent-400">Contato</h3>
          {canais.length > 0 ? (
            <ul className="mt-4 space-y-2.5">
              {canais.map((canal) => (
                <li key={canal.rotulo}>
                  <a
                    href={canal.href}
                    target={canal.href.startsWith('http') ? '_blank' : undefined}
                    rel={canal.href.startsWith('http') ? 'noreferrer' : undefined}
                    className="inline-flex items-center gap-2 font-body text-sm text-offwhite-100/65 transition-colors hover:text-offwhite-50"
                  >
                    <canal.icone className="h-4 w-4 text-accent-400" aria-hidden="true" />
                    {canal.rotulo}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 font-body text-sm leading-relaxed text-offwhite-100/65">
              Operação 100% digital. Os canais oficiais de atendimento (WhatsApp e Instagram) são informados pela equipe
              no primeiro contato — e podem ser fixados aqui via variáveis de ambiente.
            </p>
          )}
          <p className="mt-4 font-caption text-xs leading-relaxed text-offwhite-100/45">
            Solicitações pelo formulário do site são respondidas pelo meio de contato escolhido por você.
          </p>
        </div>
      </div>

      <div className="border-t border-offwhite-50/10">
        <div className="container-site flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
          <p className="font-caption text-xs text-offwhite-100/50">
            © {new Date().getFullYear()} Skill Craft · Conhecimento que conecta, tecnologia que transforma.
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-offwhite-50/10 px-3 py-1.5 font-caption text-xs text-offwhite-100/60 transition-colors hover:border-accent-400/50 hover:text-offwhite-50"
          >
            Voltar ao topo
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  )
}
