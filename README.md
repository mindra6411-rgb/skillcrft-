# Skill Craft — Site Institucional

> **Aprenda, desenvolva e prepare-se para o mercado.**
> Agência estudantil de apoio acadêmico, tecnológico e criativo —
> Projeto Integrador 2026 (Administração · Tecnologia da Informação · Design Gráfico).

Site institucional completo da **Skill Craft**: apresentação da agência, serviços
oficiais com preços de referência, fluxo de atendimento, diferenciais, formulário
de solicitação com validação, login real com Google (Supabase Auth) e área do aluno.

---

## ✨ Funcionalidades

- **Abertura cinematográfica** — linhas geométricas, construção do símbolo SC,
  encaixe das formas e revelação do logotipo oficial; pulável (clique/Esc),
  uma vez por sessão e desativada com `prefers-reduced-motion`.
- **Página institucional** — hero, sobre nós (missão + 3 áreas), serviços (5 cards
  oficiais), como funciona (5 etapas), diferenciais (integração ADM·TI·Design),
  contato e rodapé.
- **Formulário de solicitação** — nome, serviço, descrição, meio de contato e dado
  de retorno; validação campo a campo com feedback visual; estados de carregamento,
  erro e sucesso com protocolo. Com Supabase configurado grava na tabela
  `solicitacoes`; sem backend, salva **rascunho local declarado** (nenhuma simulação
  de envio real).
- **Login com Google (Supabase Auth)** — OAuth real, sessão persistida, retorno
  redirecionado para a **Área do Aluno** (`#/app`) com histórico de solicitações e
  botão de sair. Sem credenciais no ambiente, o botão explica a pendência —
  nunca apresenta autenticação simulada como funcional.
- **Identidade visual oficial** — logotipo original otimizado (versões colorida e
  monocromática branca, conforme o Guia v1.0), paleta *Electric Blue* e tipografias
  Montserrat / Roboto / Lato auto-hospedadas.
- **UX e acessibilidade** — navegação suave com scroll-spy, menu responsivo,
  foco visível, `aria-*` nos formulários, skip-link, animações de entrada por seção.
- **Responsivo** — testado conceitualmente em 360, 390, 768, 1024 e 1440 px.

## 🧰 Tecnologias

React 19 · TypeScript · Vite 7 · Tailwind CSS 4 · Framer Motion 12 ·
Lucide React · Supabase Auth (`@supabase/supabase-js`) · Fontsource
(Montserrat Variable, Roboto, Lato).

## 📁 Estrutura

```
├── index.html                  # HTML base (SEO, OG, favicon)
├── public/brand/               # Logotipo oficial otimizado (webp/png/favicon)
├── docs/
│   ├── CONFIGURACAO.md         # Supabase + Google OAuth + Vercel passo a passo
│   └── brand/                  # Originais da identidade visual (referência)
├── supabase/migrations/
│   └── 0001_solicitacoes.sql   # Tabela de solicitações + RLS
└── src/
    ├── App.tsx                 # Shell, rotas (hash) e composição das seções
    ├── config/site.ts          # Conteúdo oficial: serviços, etapas, áreas, contatos
    ├── context/AuthContext.tsx # Sessão Supabase, login Google, logout
    ├── hooks/                  # useHashRoute, useScrollSpy
    ├── lib/                    # supabase.ts, solicitations.ts, validation.ts
    └── components/
        ├── intro/              # Animação de abertura
        ├── layout/             # Navbar, Footer
        ├── sections/           # Hero, About, Services, HowItWorks, Differentials, Contact
        ├── auth/               # AuthButton, AuthModal, StudentArea, GoogleIcon
        ├── brand/              # Logo (variantes oficiais)
        └── ui/                 # Reveal, SectionHeader
```

## ▶️ Como executar

```bash
npm install
npm run dev        # desenvolvimento em http://localhost:5173
npm run build      # build de produção (tsc + vite)
npm run preview    # serve o build
```

Variáveis de ambiente (opcionais para o site institucional; necessárias para o login):
veja [`.env.example`](.env.example) e o guia
[`docs/CONFIGURACAO.md`](docs/CONFIGURACAO.md).

## ☁️ Publicação (Vercel)

Importe o repositório em [vercel.com/new](https://vercel.com/new) — framework Vite,
build `npm run build`, saída `dist`. Adicione as variáveis `VITE_*` no projeto e
atualize as URLs de redirect no Supabase/Google. Detalhes em `docs/CONFIGURACAO.md`.

## 🧪 Testes realizados

- `tsc -b` (typecheck estrito) e `vite build` de produção sem erros.
- Servidor de desenvolvimento e preview servindo HTML/assets (HTTP 200).
- Revisão manual de links/âncoras, botões (todos com ação), formulário (validações
  e estados) e quebras responsivas nos pontos 360–1440 px.
- Console: sem chamadas de rede inventadas; sem Supabase configurado o app
  inicializa em modo institucional sem erros.

## 👥 Equipe (Projeto Integrador 2026)

Ytalo Gabriel (TI) · Mateus Gama (TI) · Júlia Cordeiro (ADM) · Alana Princy (ADM) ·
Laura Valim (Design Gráfico) — orientação: Prof. Anderson Nunes.
Colégio Raphael Di Santo.
