# Skill Craft — Site Institucional

> **Aprenda, desenvolva e prepare-se para o mercado.**
> Agência estudantil de apoio acadêmico, tecnológico e criativo —
> Projeto Integrador 2026 · Administração · Tecnologia da Informação · Marketing.

Site institucional completo da **Skill Craft**, com solicitação de serviços,
login real com Google, área do aluno com acompanhamento, ferramentas gratuitas de
estudo, central de ajuda e página 404 própria.

**Site no ar:** <https://skill-craft-site.vercel.app> (Vercel · build de produção
do branch `main`).

---

<div align="center">

## 🎤 APRESENTAÇÃO DO PROJETO

**Material completo para a apresentação à banca — acesso imediato.**

| Documento | Para que serve |
| --- | --- |
| 📑 [**Índice da apresentação**](docs/apresentacao/README.md) | Ponto de partida: o que tem em cada documento |
| 🗣️ [**Roteiro completo (13 partes)**](docs/apresentacao/ROTEIRO_COMPLETO.md) | Fala corrida da abertura ao encerramento |
| 🧩 [Roteiro por área (TI · ADM · Marketing)](docs/apresentacao/ROTEIRO_POR_AREA.md) | A fala de cada área, com as transições |
| 🖥️ [Roteiro de demonstração do site](docs/apresentacao/ROTEIRO_DEMONSTRACAO_SITE.md) | Passo a passo da demo ao vivo + planos B |
| ❓ [Perguntas da banca](docs/apresentacao/PERGUNTAS_DA_BANCA.md) | 18 perguntas prováveis, por área |
| ✅ [Respostas da banca](docs/apresentacao/RESPOSTAS_DA_BANCA.md) | Respostas alinhadas ao que o projeto **realmente** faz |
| 📄 [Resumo executivo](docs/apresentacao/RESUMO_EXECUTIVO.md) | Uma página com o projeto inteiro |
| 💼 [Plano de negócio](docs/apresentacao/PLANO_DE_NEGOCIO.md) | Estrutura, operação, riscos e simulações **hipotéticas** |
| ⏱️ [Guia de apresentação](docs/apresentacao/GUIA_DE_APRESENTACAO.md) | Ordem, tempos, transições e roteiro de ensaio |

</div>

---

## 1. O que é a Skill Craft

Agência estudantil formada por 6 integrantes, organizada em três áreas —
**Tecnologia da Informação**, **Administração** e **Marketing** — que presta
serviços digitais e acadêmicos para estudantes: apresentações, sites simples,
revisão de trabalhos, resumos técnicos e artes/logotipos.

O site é o produto central: apresenta a agência, recebe solicitações com
protocolo, permite acompanhamento pelo aluno, oferece ferramentas gratuitas de
estudo e explica o próprio funcionamento na central de ajuda.

## 2. Funcionalidades

**Página institucional**

- Abertura animada curta (2,5 s), exibida uma vez por sessão, pulável com clique
  ou `Esc` e **inexistente** quando o sistema pede movimento reduzido.
- Hero com vídeo de fundo em loop (12 s, sem áudio, ~436 KB, pôster de fallback,
  pausa automática ao sair da tela).
- Seções: Sobre nós (missão + 3 áreas) · Serviços (5 cards oficiais) · Como
  funciona (5 etapas) · Diferenciais · **Equipe** · **Recursos** · Contato · Rodapé.
- Navegação com scroll-spy, indicador de seção ativa, progresso de leitura e
  menu mobile acessível.

**Solicitação e acompanhamento**

- Formulário validado campo a campo: nome, serviço, descrição, **prazo desejado**
  (opcional), **informações complementares** (opcional), meio de contato e contato
  de retorno — com `aria-invalid`, mensagens específicas e foco no primeiro erro.
- Pré-seleção do serviço ao clicar em “Solicitar” em qualquer card; nome vindo da
  conta Google quando há sessão; último contato lembrado **neste navegador**.
- Protocolo `SC-ANO-XXXX`, estados de carregamento, sucesso e erro.
- Sem backend configurado (ou se a gravação falhar), o pedido vira **rascunho
  local declarado** — nenhum envio é simulado como real.
- **Área do aluno** (`#/app`): histórico com **busca**, **filtro por status**,
  contador por situação e **detalhes completos** de cada pedido.
- Status oficiais: aguardando análise · em análise · em andamento · concluído ·
  cancelado.

**Autenticação e administração**

- Login com **Google (Supabase Auth)** — OAuth real, sessão persistida, retorno
  redirecionado para `#/app` com limpeza dos tokens da URL, e logout.
- Sem credenciais no ambiente, o botão **explica a pendência** em vez de fingir login.
- **Painel administrativo** (`#/admin`) com autorização validada **no banco**
  (function `skillcraft_eh_admin()` + políticas de RLS): lista as solicitações e
  atualiza o status. Não há “botão escondido” no front-end decidindo acesso.

**Serviços ao estudante**

- **Ferramentas gratuitas** (`#/ferramentas`): calculadora de médias ponderadas,
  gerador de cronograma de estudos e checklist de trabalho — tudo no navegador,
  sem cadastro, sem envio de dados e com persistência local.
- **Central de ajuda** (`#/ajuda`): como solicitar, como acompanhar, o que cada
  status significa e 10 perguntas frequentes (sem prometer prazo fixo).
- **Página 404** com a identidade da marca, o endereço tentado e saídas reais de
  navegação — rotas desconhecidas **não** são redirecionadas em silêncio.

**Qualidade**

- Identidade visual oficial (Guia v1.0): paleta *Electric Blue*, Montserrat /
  Roboto / Lato auto-hospedadas e logotipo original nas versões oficial e
  monocromática.
- Responsivo de 360 a 1440 px, sem rolagem horizontal; acessibilidade com
  skip-link, foco visível, rótulos associados, `aria-*` e `prefers-reduced-motion`.
- SEO: `title`, `description`, Open Graph, Twitter Card, JSON-LD com os serviços e
  preços oficiais, `robots.txt` e `sitemap.xml` gerados no build quando
  `VITE_SITE_URL` existe.
- Teste de fumaça automatizado com **76 verificações** (`npm run test:smoke`).

## 3. Equipe e áreas (composição oficial)

| Área | Integrantes | Responsabilidades |
| --- | --- | --- |
| **TI** | **2** — Ítalo e Emilyn | Site, autenticação, banco de dados, ferramentas digitais, infraestrutura |
| **ADM** | **3** | Organização dos serviços e processos, atendimento, acompanhamento dos pedidos, controle financeiro |
| **Marketing** | **1** | Identidade visual, comunicação, apresentação dos serviços e divulgação |

Total: **6 integrantes**. Os nomes de ADM e Marketing não foram divulgados no
material oficial e, por isso, não aparecem no site nem nos roteiros — nada foi
inventado. A composição anterior consta apenas como histórico em
[`docs/originais/equipe_envolvidos.md`](docs/originais/equipe_envolvidos.md).

> **Divergência registrada:** o modelo de negócio original
> ([`docs/originais/modelo_de_negocio_skillscraft.md`](docs/originais/modelo_de_negocio_skillscraft.md))
> descreve as áreas como Administração, TI e **Design**. A composição oficial
> atual, confirmada pela equipe, é TI, ADM e **Marketing** — e foi ela a adotada
> no site e em todo o material de apresentação.

## 4. Serviços e preços oficiais

| Serviço | Preço de referência | Área |
| --- | --- | --- |
| Criação de apresentações | **R$ 15,00** | Marketing |
| Criação de sites simples | **R$ 30,00** | Tecnologia da Informação |
| Revisão de trabalhos | **R$ 10,00** | Administração |
| Resumos técnicos | **R$ 10,00** | Três áreas integradas |
| Criação de artes e logotipos | **R$ 15,00** | Marketing |

Valores da tabela oficial consolidada pelo Projeto Integrador, comunicados sempre
como **preço de referência** e confirmados na etapa de orçamento. Não há planos,
pacotes, descontos nem serviços além destes cinco. Ideias futuras ficam registradas
apenas em [`docs/apresentacao/PLANO_DE_NEGOCIO.md`](docs/apresentacao/PLANO_DE_NEGOCIO.md),
fora da tabela oficial.

## 5. Rotas e páginas

| Endereço | Página |
| --- | --- |
| `/` ou `#/` | Página institucional (`#sobre`, `#servicos`, `#como-funciona`, `#diferenciais`, `#equipe`, `#recursos`, `#contato`) |
| `#/app` | Área do aluno |
| `#/ferramentas` | Ferramentas gratuitas do estudante |
| `#/ajuda` | Central de ajuda |
| `#/admin` | Painel administrativo (permissão validada no banco) |
| qualquer outro `#/…` | **Página 404** própria |

Roteamento por hash: funciona em hospedagem estática sem rewrite e sobrevive a
F5, URL direta e botão voltar (`hashchange` + `popstate`). As regras ficam no
módulo puro [`src/lib/rotas.ts`](src/lib/rotas.ts), coberto pelo teste de fumaça.

## 6. Tecnologias e arquitetura

React 19 · TypeScript (estrito) · Vite 7 · Tailwind CSS 4 · Framer Motion 12 ·
Lucide React · Supabase Auth (`@supabase/supabase-js`) · Fontsource (Montserrat
Variable, Roboto, Lato) · jsdom + esbuild (teste de fumaça).

Decisões que valem menção:

- **Componentes por responsabilidade**, com conteúdo oficial centralizado em
  [`src/config/site.ts`](src/config/site.ts) — serviços, preços, etapas, áreas,
  equipe, ajuda e navegação num único lugar.
- **Code splitting** por rota: área do aluno, ferramentas, ajuda e admin só são
  baixados quando usados.
- **Estado honesto**: `src/lib/supabase.ts` devolve `null` sem credenciais e a
  interface passa a declarar a pendência em vez de simular.
- **Segurança no banco**, não na tela: RLS em todas as políticas e função
  `SECURITY DEFINER` para o perfil administrativo.
- **Nenhum segredo no repositório**: somente variáveis `VITE_*` públicas (anon key).

## 7. Estrutura do repositório

```
├── index.html                     # SEO: title, meta, OG, Twitter, JSON-LD
├── vite.config.ts                 # build, dev/preview e plugin de SEO (canonical/sitemap/robots)
├── public/
│   ├── brand/                     # logotipo oficial, símbolo, favicon, OG cover
│   └── video/                     # hero-loop.mp4 (~436 KB) + pôsteres
├── docs/
│   ├── apresentacao/              # 9 documentos da apresentação (roteiros, banca, plano)
│   ├── originais/                 # arquivos originais da equipe, íntegros (histórico)
│   ├── CONFIGURACAO.md            # Supabase, Google OAuth, migrações, admin, Vercel
│   └── TESTES.md                  # o que foi testado, com quais comandos, e o que está pendente
├── scripts/
│   ├── generate_hero_video.py     # gera o vídeo do hero a partir da identidade
│   ├── smoke.mjs                  # teste de fumaça (Node + jsdom)
│   └── smoke/entrada.tsx          # entrada empacotada pelo teste
├── supabase/migrations/
│   ├── 0001_solicitacoes.sql      # tabela + RLS (inserção pública, leitura do próprio aluno)
│   ├── 0002_status_prazo_informacoes.sql   # status, prazo, informações (aditiva)
│   └── 0003_administradores.sql   # administradores + skillcraft_eh_admin() + políticas
└── src/
    ├── App.tsx                    # shell, rotas e composição das páginas
    ├── config/site.ts             # conteúdo oficial (serviços, preços, equipe, ajuda)
    ├── context/AuthContext.tsx    # sessão Supabase, login Google, logout
    ├── hooks/                     # useHashRoute, useScrollSpy, useLocalState
    ├── lib/                       # rotas, status, supabase, solicitations, validation
    └── components/
        ├── intro/                 # abertura animada
        ├── layout/                # Navbar, Footer
        ├── sections/              # Hero, About, Services, HowItWorks, Differentials, Team, Resources, Contact
        ├── pages/                 # Ferramentas, Ajuda, Admin, NotFound (404)
        ├── tools/                 # CalculadoraMedias, PlanejadorEstudos, ChecklistTrabalho, ToolCard
        ├── auth/                  # AuthButton, AuthModal, StudentArea, GoogleIcon
        ├── brand/                 # Logo (variantes oficiais)
        └── ui/                    # Reveal, SectionHeader, CountUp, PageShell
```

## 8. Como executar

```bash
npm install
npm run dev          # desenvolvimento em http://localhost:5173
npm run typecheck    # checagem estrita de tipos
npm run build        # build de produção (tsc + vite → dist/)
npm run preview      # serve o build de produção
npm run test:smoke   # 76 verificações de rota, 404, formulário, ferramentas, a11y
```

Variáveis de ambiente em [`.env.example`](.env.example): copie para `.env` e
preencha o que quiser ativar (login, contatos do rodapé e URL pública para SEO).

## 9. Configuração de ambiente (Supabase + Google)

Passo a passo completo em [`docs/CONFIGURACAO.md`](docs/CONFIGURACAO.md):

1. Criar o projeto Supabase e copiar `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
2. Criar o cliente OAuth no Google Cloud (origens e redirect URI).
3. Ativar o provedor Google no Supabase e configurar Site URL / Redirect URLs.
4. Aplicar as três migrações de `supabase/migrations/`.
5. Registrar o perfil administrativo (opcional) e abrir `#/admin`.
6. Definir `VITE_SITE_URL` para gerar canonical, `og:url` e `sitemap.xml`.

## 10. Banco de dados, segurança e painel administrativo

- Tabela `solicitacoes` com **RLS ativo**: inserção pública limitada ao status
  inicial e ao próprio `usuario_id`; leitura do próprio aluno; leitura geral e
  atualização de status **apenas** para administradores.
- Tabela `administradores` + function `skillcraft_eh_admin()` (`SECURITY DEFINER`)
  — a decisão de acesso acontece no banco.
- Migrações **aditivas** e reaplicáveis: nada renomeia, remove ou reescreve dados
  existentes; registros anteriores recebem o status inicial automaticamente.
- Nenhuma chave `service_role` no front-end; nenhum token ou segredo no repositório.

## 11. Testes realizados e pendências

Relatório completo em [`docs/TESTES.md`](docs/TESTES.md).

- ✅ `npm install`, `npm run typecheck` (0 erros), `npm run build`, `npm run dev`,
  `npm run preview` — todos executados.
- ✅ `npm run test:smoke`: **76/76 verificações ok**, console sem erros ou avisos
  (rotas, 404, navegação, validação do formulário, ferramentas, ajuda, área do
  aluno sem sessão, admin sem banco, acessibilidade, movimento reduzido).
- ✅ Verificações HTTP reais em dev e preview (assets, vídeo, `robots.txt`,
  fallback de SPA) e geração de canonical/sitemap com `VITE_SITE_URL`.
- ✅ **Site publicado na Vercel:** <https://skill-craft-site.vercel.app> — build de
  produção a partir de `main`, `VITE_SITE_URL` definida, `robots.txt` e
  `sitemap.xml` servidos no ar (verificações em
  [`docs/TESTES.md`](docs/TESTES.md), seção 5).
- ⏳ **Pendentes de credenciais externas:** login Google de ponta a ponta, callback
  do OAuth, leitura/escrita no banco, RLS na prática e painel administrativo
  autorizado — os projetos Supabase usados no desenvolvimento foram **removidos a
  pedido do cliente** na fase anterior e ainda não há variáveis `VITE_SUPABASE_*`
  na Vercel. O código trata essa ausência declarando o estado real na interface,
  inclusive no site publicado.
- ⏳ **Responsivo e contraste medidos em aparelho real:** revisados no código
  (grades, tabela com rolagem interna, menu mobile), mas exigem navegador — o
  ambiente de testes não tem.

## 12. Documentação original e histórico

Os arquivos enviados pela equipe estão preservados **na íntegra** em
[`docs/originais/`](docs/originais/LEIA-ME.md): modelo de negócio, guia de
identidade visual, logotipo, paleta, slogans, prompts originais, o PDF do Projeto
Integrador e a composição antiga de equipe.

- Nada foi sobrescrito ou substituído: são a fonte documental do projeto.
- Itens desatualizados (como a composição de equipe) estão **marcados como
  histórico** e não são usados no site nem nos roteiros.
- O logotipo e a identidade seguem o Guia v1.0: símbolo SC em hexágono isométrico,
  paleta Deep Slate `#101B3D`, Skill Blue `#3155D9`, Accent Blue `#6B8CFF`, Dark
  Charcoal `#20232C` e Off-White `#F7F8FC`, com Montserrat, Roboto e Lato.

---

## ☁️ Publicação (Vercel)

O site está no ar em **<https://skill-craft-site.vercel.app>** — projeto Vercel
`skill-craft-site` (framework **Vite**, build `npm run build`, saída `dist`),
ligado ao branch `main` deste repositório, com `VITE_SITE_URL` definida para que
canonical, `og:url` e `sitemap.xml` sejam gerados no build.

Ainda sem backend: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` **não** estão
definidas na Vercel (os projetos Supabase anteriores foram removidos a pedido do
cliente), então login, banco e painel administrativo seguem em modo de
**pendência declarada** também no ar. Para ativar, siga os passos 2.1 a 2.6 e o
passo 4 de [`docs/CONFIGURACAO.md`](docs/CONFIGURACAO.md) e faça um novo deploy —
os deploys automáticos por push estão desativados nesse projeto (passo 4.1).

## 👥 Créditos

Projeto Integrador 2026 · Colégio Raphael Di Santo — equipe Skill Craft
(TI · ADM · Marketing). Documentação original da equipe em
[`docs/originais/`](docs/originais/LEIA-ME.md).
