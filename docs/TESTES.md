# Testes realizados — Skill Craft

Registro honesto do que foi testado, com quais comandos reais, e do que **não**
pôde ser testado por depender de credenciais externas. Nenhum resultado foi
inventado: tudo aqui saiu da execução dos comandos listados.

Ambiente: Node v22.22.3, npm, Linux (sandbox) · data da execução: 17/11/2026.

---

## 1. Comandos executados (scripts reais do `package.json`)

| Comando | O que verifica | Resultado |
| --- | --- | --- |
| `npm install` | instalação das dependências | ✅ concluído, 0 vulnerabilidades |
| `npm run typecheck` (`tsc -b --pretty`) | checagem estrita de tipos | ✅ 0 erros |
| `npm run build` (`tsc -b && vite build`) | build de produção | ✅ `✓ built in ~5 s`, sem erros |
| `npm run dev` (Vite) | servidor de desenvolvimento | ✅ pronto em ~317 ms, porta 5173 |
| `npm run preview` (Vite) | serve o build de produção | ✅ porta 4173, HTTP 200 |
| `npm run test:smoke` (`scripts/smoke.mjs`) | rotas, 404, navegação, formulário, ferramentas, ajuda, área do aluno, admin, a11y, console | ✅ **76/76 verificações ok** |

Saída do build de produção (tamanhos reais):

```
dist/assets/index.css        136,42 kB │ gzip: 37,98 kB
dist/assets/index.js         315,15 kB │ gzip: 95,20 kB
dist/assets/motion.js        150,13 kB │ gzip: 50,18 kB
dist/assets/supabase.js      225,35 kB │ gzip: 59,15 kB
dist/assets/StudentArea.js    16,85 kB │ gzip:  4,68 kB   (carregado sob demanda)
dist/assets/Ferramentas.js    25,63 kB │ gzip:  7,34 kB   (carregado sob demanda)
dist/assets/Admin.js           9,94 kB │ gzip:  3,49 kB   (carregado sob demanda)
dist/assets/Ajuda.js           7,85 kB │ gzip:  2,55 kB   (carregado sob demanda)
```

Área do aluno, ferramentas, ajuda e painel admin ficam em chunks separados: quem
visita só a página institucional não baixa esse código.

---

## 2. Verificações HTTP (servidores reais)

Desenvolvimento (`npm run dev`, porta 5173):

| Requisição | Status | Observação |
| --- | --- | --- |
| `/` | 200 · 4.092 B · `text/html` | shell da aplicação |
| `/index.html` | 200 | idem |
| `/brand/logo-white.webp` | 200 · 7.750 B · `image/webp` | logotipo oficial |
| `/brand/favicon.png` | 200 · 5.923 B | favicon |
| `/video/hero-loop.mp4` | 200 · 446.050 B · `video/mp4` | vídeo do hero (~436 KB) |
| `/video/hero-poster.webp` | 200 · 19.386 B | pôster de fallback |
| `/src/App.tsx` | 200 · `text/javascript` | módulo transformado pelo Vite |
| `/rota-inexistente` | 200 · shell HTML | fallback de SPA — quem trata rota inválida é o 404 do cliente |
| `/app` | 200 · shell HTML | idem (a rota real é `#/app`) |

Produção (`npm run preview`, porta 4173):

| Requisição | Status | Observação |
| --- | --- | --- |
| `/` | 200 · 4.167 B | `<title>` correto no HTML servido |
| `/robots.txt` | 200 · 206 B · `text/plain` | gerado no build |
| `/assets/index-*.js` | 200 · 315.145 B | bundle principal |
| `/brand/og-cover.png` | 200 · 45.424 B | imagem de Open Graph |
| `/qualquer-rota` | 200 · shell HTML | sem 404 de servidor quebrando o app |

SEO em build com `VITE_SITE_URL=https://exemplo-de-teste.invalid/`:

```
<link rel="canonical" href="https://exemplo-de-teste.invalid/">
<meta property="og:url" content="https://exemplo-de-teste.invalid/">
dist/sitemap.xml  → gerado com a URL raiz
dist/robots.txt   → inclui "Sitemap: https://exemplo-de-teste.invalid/sitemap.xml"
```

Sem `VITE_SITE_URL`, o build **não** declara canonical/og:url e **não** gera
sitemap.xml — nenhuma URL é inventada.

---

## 3. Teste de fumaça automatizado (`npm run test:smoke`)

Como funciona: o script empacota o **App real** com esbuild (sem mock de
componente), monta um DOM com jsdom e renderiza cada rota, interagindo com
campos e botões. Também captura `console.error`/`console.warn` durante todo o
processo.

Resultado: **76/76 verificações ok · console sem erros ou avisos**.

| Grupo | Verificações | Cobertura |
| --- | --- | --- |
| `rotas` | 9/9 | `#/app`, `#/ferramentas`, `#/ajuda`, `#/admin`, `#/` e vazio → home, rota desconhecida → **404** (nunca cai em silêncio na home), âncoras de seção → home, hash de retorno do OAuth (`#access_token=…`) não vira rota |
| `validação` | 11/11 | nome, descrição, serviço fora da lista, prazo no passado, prazo opcional, informações > 300, e-mail inválido, telefone sem DDD, formato do protocolo `SC-ANO-XXXX` |
| `conteúdo` | 4/4 | 5 serviços com preços 15/30/10/10/15, equipe oficial (2 TI Ítalo+Emilyn, 3 ADM, 1 Marketing = 6), 5 status, 10 perguntas de FAQ |
| `home` | 7/7 | slogan oficial, 8 seções presentes, áreas ADM/TI/**Marketing** (sem “Design Gráfico”), preços visíveis, nomes só onde foram divulgados, skip-link, botões com nome acessível |
| `formulário` | 7/7 | envio vazio bloqueado com mensagens e `aria-invalid`, campos de prazo e informações existem, preenchimento válido gera protocolo + rascunho local, mensagem explícita de que nada foi enviado pela internet |
| `navegação` | 3/3 | faixa de recursos abre `#/ferramentas`, página renderiza, atalho abre `#/ajuda` |
| `ferramentas` | 10/10 | três ferramentas presentes, aviso de que nada sai do dispositivo, média ponderada `(8×1 + 6×2)/3 = 6,67`, nota fora de 0–10 mostra erro, cronograma inclui a matéria e monta a grade seg–sex, checklist: lista sugerida, nova tarefa, progresso e marcação |
| `ajuda` | 6/6 | como pedir, como acompanhar, os cinco status explicados, texto não promete prazo fixo, FAQ recolhido com `aria-expanded="false"` e expande ao clicar |
| `área do aluno` | 3/3 | sem sessão pede login com Google (não finge sessão), oferece ferramentas e ajuda, não expõe histórico |
| `admin` | 3/3 | sem banco declara “Painel indisponível neste ambiente”, explica que a permissão é validada no Supabase, não lista solicitações |
| `a11y` | 6/6 | com `prefers-reduced-motion` a abertura não aparece e o site continua completo, todos os campos têm rótulo, botão de menu com `aria-expanded`, ícones decorativos com `aria-hidden`, imagens com `alt` |
| `abertura` | 2/2 | aparece na primeira visita e o botão “Pular” encerra imediatamente |

### Cenários de navegação cobertos

- **URL direta / F5:** o roteamento é por hash, então qualquer rota (`#/app`,
  `#/ferramentas`, `#/ajuda`, `#/admin`) sobrevive a recarregar — confirmado pelo
  servidor respondendo 200 com o shell e pelo teste de rota.
- **Botão voltar:** o hook ouve `hashchange` **e** `popstate`.
- **Rota desconhecida:** `#/rota-inexistente` mostra a página 404 com o endereço
  tentado e saídas reais de navegação (testado).
- **Retorno do OAuth:** hash com `access_token`/`code` não é interpretado como
  rota; o `AuthContext` limpa a URL e leva para `#/app`.

---

## 4. O que NÃO pôde ser testado (dependência externa)

Nada disso foi simulado nem apresentado como funcionando:

| Item | Motivo | O que é necessário |
| --- | --- | --- |
| **Login com Google de ponta a ponta** | O projeto Supabase usado no desenvolvimento foi **excluído** na desmobilização anterior; sem projeto não há provedor OAuth | Criar projeto Supabase, ativar o provedor Google e definir `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` (passo a passo em [`CONFIGURACAO.md`](./CONFIGURACAO.md)) |
| **Callback do OAuth (`/auth/v1/callback`)** | Idem — depende do projeto ativo e da allowlist de redirect | Configurar Site URL e Redirect URLs no Supabase e no Google Cloud |
| **Leitura/escrita no banco (`solicitacoes`)** | Sem banco ativo; o código trata isso degradando com aviso de “rascunho local” | Aplicar `0001`, `0002` e `0003` em um projeto Supabase |
| **Painel administrativo autorizado** | Exige a function `skillcraft_eh_admin()` e a tabela `administradores` no banco | Aplicar a migração 0003 e registrar o usuário (passo 2.5) |
| **RLS na prática (um aluno não lê o outro)** | Só é verificável com banco ativo | Rodar as consultas com duas contas diferentes |
| **Responsivo medido em aparelho real (360–1440 px)** | Não há navegador no ambiente de testes; jsdom não calcula layout | Abrir o site em celular/tablet/notebook ou usar o DevTools — pontos de atenção revisados no código (grades que viram coluna, tabela do cronograma com rolagem interna, menu mobile a partir de `xl`) |
| **Contraste, foco visível e desempenho de animação** | Idem (exigem renderização real) | Inspeção visual + Lighthouse/DevTools |

Quando o site roda **sem** credenciais, ele declara isso na interface: o botão de
login abre um painel de “configuração pendente”, o formulário grava rascunho local
com aviso e a área do aluno informa que o banco não está configurado. Nenhuma
dessas telas finge sucesso.

---

## 5. Verificações na publicação (Vercel)

O site foi publicado em **<https://skill-craft-site.vercel.app>** — projeto Vercel
`skill-craft-site`, deployment de produção `dpl_2SwDNESGBPSbUGuJ6CkVFwUJbLBm`,
commit `12069d0` do branch `main`. O que foi conferido de verdade:

| Verificação | Resultado |
| --- | --- |
| Build na Vercel (`npm install` + `tsc -b && vite build`) | `READY`/`PROMOTED` para produção, sem erros; `found 0 vulnerabilities` no install; 2129 módulos transformados |
| Artefatos emitidos no build público | `dist/index.html` 4,31 kB · `dist/robots.txt` 0,26 kB · `dist/sitemap.xml` 0,25 kB; chunks idênticos aos do build local verificado (`Ferramentas` 25,63 kB · `StudentArea` 16,85 kB · `Admin` 9,94 kB · `Ajuda` 7,85 kB · `motion` 150,13 kB · `supabase` 225,35 kB) |
| `VITE_SITE_URL` no build | presente na lista de variáveis do deployment (`https://skill-craft-site.vercel.app`) |
| `GET /` no endereço público | HTML do site servido, `<title>` *Skill Craft — Aprenda, desenvolva e prepare-se para o mercado* e o conteúdo das seções (hero, sobre, serviços com os cinco preços oficiais, etapas, diferenciais, equipe, recursos, contato) |
| `GET /robots.txt` | 200, conteúdo gerado no build, com a linha `Sitemap: https://skill-craft-site.vercel.app/sitemap.xml` |
| `GET /sitemap.xml` | 200, uma `<loc>` com `https://skill-craft-site.vercel.app/` — gerado porque `VITE_SITE_URL` está definida |
| Endereços `*.vercel.app` com sufixo da conta | protegidos pelo login da Vercel (proteção de deploy do projeto); o endereço público é `skill-craft-site.vercel.app` |

**Não verificado no ar** — e tratado no site como pendência declarada, não como
funcionando: login com Google, callback do OAuth, gravação/leitura em
`solicitacoes`, RLS e painel administrativo, porque `VITE_SUPABASE_URL` e
`VITE_SUPABASE_ANON_KEY` não estão definidas na Vercel (passo 4.3 de
[`CONFIGURACAO.md`](./CONFIGURACAO.md)).

As verificações acima foram feitas por requisição HTTP ao endereço público, não
por navegador: layout, contraste, foco visível e desempenho de animação continuam
pendentes de inspeção em aparelho real (seção 4).

---

## 6. Como reproduzir

```bash
npm install
npm run typecheck
npm run build
npm run test:smoke     # relatório com 76 verificações
npm run dev            # conferir no navegador: /, #/app, #/ferramentas, #/ajuda, #/admin, #/rota-qualquer
```

Roteiro de conferência manual sugerido no navegador:

1. `/` → abertura (uma vez por sessão), hero com vídeo, oito seções.
2. Clique em **Solicitar** num card de serviço → formulário com o serviço pré-selecionado.
3. Envie o formulário vazio → mensagens de erro por campo; preencha → protocolo na tela.
4. `#/rota-inexistente` → página 404 → **Ir para o início**.
5. `#/ferramentas` → calcule uma média, gere um cronograma, marque uma etapa do checklist; recarregue a página (os dados continuam lá).
6. `#/ajuda` → abra e feche perguntas do FAQ.
7. `#/app` → estado sem login; `#/admin` → estado sem banco.
8. DevTools → alterne 360 px, 768 px, 1024 px, 1440 px e confira ausência de rolagem horizontal.
9. Ative “reduzir movimento” no sistema → a abertura não aparece e tudo continua funcional.
