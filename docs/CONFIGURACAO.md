# Configuração — Skill Craft

Guia completo para rodar o site, ativar o **login com Google (Supabase Auth)** e
publicar na **Vercel**. Nenhuma credencial vem embutida no código: tudo é lido de
variáveis de ambiente (`.env` local / painel da Vercel).

---

## 1. Rodar localmente

```bash
npm install
cp .env.example .env   # preencha se quiser ativar login/contatos/SEO
npm run dev            # http://localhost:5173
npm run typecheck      # tsc -b (checagem estrita de tipos)
npm run build          # build de produção (tsc + vite → dist/)
npm run preview        # serve o build de produção
npm run test:smoke     # verifica rotas, 404, formulário, ferramentas, a11y (Node + jsdom)
```

### Rotas do site

| Endereço | Página |
| --- | --- |
| `/` (ou `#/`) | Página institucional (seções com âncoras `#sobre`, `#servicos`, `#como-funciona`, `#diferenciais`, `#equipe`, `#recursos`, `#contato`) |
| `#/app` | Área do aluno (histórico, busca, filtro por status e detalhes) |
| `#/ferramentas` | Ferramentas gratuitas: médias, cronograma de estudos, checklist |
| `#/ajuda` | Central de ajuda: como pedir, como acompanhar, status e FAQ |
| `#/admin` | Painel administrativo (só para perfis validados no banco — passo 2.6) |
| qualquer outro `#/…` | Página 404 própria (sem redirecionamento silencioso para a home) |

Como o roteamento é por hash, F5, URL direta e botão voltar funcionam em qualquer
hospedagem estática, sem regra de rewrite.

Sem `.env` preenchido o site funciona 100% institucional; o botão
“Entrar com Google” abre um painel explicando a pendência (nunca um login falso).

---

## 2. Supabase Auth + Google OAuth

### 2.1 Projeto Supabase

1. Em [database.new](https://database.new) (ou no painel do Supabase) crie um projeto.
2. Em **Project Settings → API** copie:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public key` → `VITE_SUPABASE_ANON_KEY` (chave pública; a segurança real vem do RLS).

### 2.2 Cliente OAuth no Google Cloud

1. [console.cloud.google.com](https://console.cloud.google.com) → crie/selecione um projeto.
2. **APIs e serviços → Tela de consentimento OAuth**: tipo *External*, preencha nome e
   e-mails de suporte; publique (modo teste basta para demonstração).
3. **Credenciais → Criar credenciais → ID do cliente OAuth → Aplicativo da Web**:
   - **Origens JavaScript autorizadas**:
     - `http://localhost:5173`
     - `https://<SEU-PROJETO>.vercel.app`
     - `https://<REF-DO-PROJETO>.supabase.co`
   - **URIs de redirecionamento autorizados**:
     - `https://<REF-DO-PROJETO>.supabase.co/auth/v1/callback`
4. Copie **ID do cliente** e **Secret**.

### 2.3 Ativar o provedor Google no Supabase

**Authentication → Providers → Google** → habilitar e colar ID do cliente e secret.

Em **Authentication → URL Configuration** defina:

- **Site URL**: `http://localhost:5173` (troque para a URL da Vercel em produção).
- **Redirect URLs (allowlist)**: adicione `http://localhost:5173`,
  `https://<SEU-PROJETO>.vercel.app` e previews `https://*-skill-craft.vercel.app` se usar.

### 2.4 Banco de dados (solicitações do formulário)

Execute **em ordem** os arquivos de [`supabase/migrations/`](../supabase/migrations) no
**SQL Editor** do Supabase (ou via CLI, `supabase db push`):

| Migração | O que faz | Natureza |
| --- | --- | --- |
| `0001_solicitacoes.sql` | Cria a tabela `solicitacoes` com RLS: inserção pública e leitura apenas do próprio aluno logado | criação |
| `0002_status_prazo_informacoes.sql` | Acrescenta `status` (5 situações oficiais), `prazo` e `informacoes`; endurece a inserção pública (só status inicial e só o próprio `usuario_id`) | **aditiva**, não perde dados |
| `0003_administradores.sql` | Cria a tabela `administradores`, a function `skillcraft_eh_admin()` e as políticas que permitem leitura geral e atualização de status **somente** a administradores | **aditiva** |

Todas são seguras para reaplicar (`IF NOT EXISTS`, `CREATE OR REPLACE`,
`DROP POLICY IF EXISTS`) e nenhuma desativa RLS.

Sem as tabelas, o formulário grava **rascunhos locais** e avisa isso com clareza.

### 2.5 Perfil administrativo (painel `#/admin`)

O painel só existe se a autorização for decidida **no banco** — não por esconder
botões no front-end. Depois de aplicar a migração 0003:

1. Entre no site com a conta Google que será administradora.
2. No **SQL Editor**, localize o id: `select id, email from auth.users order by created_at desc;`
3. Registre o perfil:

   ```sql
   insert into public.administradores (usuario_id, observacao)
   values ('COLE-O-UUID-AQUI', 'Administrador — equipe Skill Craft');
   ```

4. Abra `#/admin`: a permissão passa a ser confirmada pelo banco e o painel lista
   as solicitações com atualização de status.

Para revogar: `delete from public.administradores where usuario_id = 'UUID';`

Quem não está na tabela vê apenas “Acesso não autorizado” — nenhum dado é exibido.

### 2.6 Variáveis de ambiente

```env
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<chave anon pública>
VITE_SITE_URL=https://<seudominio>        # opcional: canonical, og:url e sitemap
```

> Nunca commitar `.env` preenchido. Nunca usar a chave `service_role` no front-end.

---

## 3. SEO, contatos do rodapé e URL pública (opcionais)

| Variável                  | Exemplo                  | Efeito                              |
| ------------------------- | ------------------------ | ----------------------------------- |
| `VITE_CONTACT_EMAIL`      | `equipe@exemplo.com`     | Link `mailto:` no rodapé            |
| `VITE_CONTACT_WHATSAPP`   | `5511999998888`          | Link `wa.me` no rodapé              |
| `VITE_CONTACT_INSTAGRAM`  | `skillcraft.oficial`     | Link do perfil no rodapé            |

Sem essas variáveis, o rodapé exibe apenas o texto institucional (nenhuma rede
social ou número inventado).

| Variável           | Efeito no build                                                                 |
| ------------------ | -------------------------------------------------------------------------------- |
| `VITE_SITE_URL`    | Injeta `<link rel="canonical">` e `og:url`, gera `dist/sitemap.xml` e a linha `Sitemap:` do `dist/robots.txt`. Sem ela, nada é declarado (nenhuma URL é inventada). |

`title`, `description`, Open Graph, Twitter Card e o JSON-LD com os cinco serviços
e preços oficiais ficam em [`index.html`](../index.html).

---

## 4. Publicar na Vercel

> **Situação atual (nov/2026):** o projeto Vercel anterior e os dois projetos
> Supabase usados no desenvolvimento foram **removidos a pedido do cliente** na
> desmobilização da fase anterior. Publicar de novo exige criar um projeto novo
> na Vercel e um projeto novo no Supabase (passos 2.1 a 2.6) — o código, as
> migrações e os backups estão íntegros no repositório.

**Pelo painel (recomendado):**

1. [vercel.com/new](https://vercel.com/new) → importe o repositório deste projeto.
2. Framework detectado: **Vite** (build `npm run build`, saída `dist`).
3. Em **Environment Variables** adicione `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
   `VITE_SITE_URL` (com a URL gerada pela Vercel) e os contatos, se quiser — e repita
   o passo 2.3 trocando as URLs para o domínio da Vercel.
4. Deploy. Cada push em `main` publica produção; demais branches geram preview.

**Pela CLI:**

```bash
npm i -g vercel
vercel login
vercel            # preview
vercel --prod     # produção
vercel env add VITE_SUPABASE_URL production
```

Como o roteamento usa hash (`#/app`), não é necessária nenhuma regra de rewrite.

---

## 5. Solução de problemas

| Sintoma                                        | Causa provável / correção                                              |
| ---------------------------------------------- | ---------------------------------------------------------------------- |
| Botão de login abre “configuração pendente”    | `.env` sem `VITE_SUPABASE_URL`/`ANON_KEY` (ou ausentes na Vercel).      |
| Erro `provider not enabled`                    | Ativar Google em Authentication → Providers (passo 2.3).               |
| Erro `redirect URI not allowed`                 | URLs faltando na allowlist do Supabase ou do Google (passos 2.2/2.3).  |
| Solicitação vira “rascunho local”              | Tabela `solicitacoes` não criada: rode as migrações 0001 e 0002.       |
| Sessão não volta após o Google                 | Site URL/Redirects do Supabase diferentes da URL onde o site roda.     |
| Status não aparece / erro ao gravar `status`   | Migração 0002 não aplicada.                                            |
| `#/admin` diz “Painel indisponível”            | Sem `VITE_SUPABASE_URL`/`ANON_KEY` no ambiente.                        |
| `#/admin` diz “Acesso não autorizado”          | Migração 0003 aplicada, mas o seu usuário não está em `administradores` (passo 2.5). |
| Erro ao chamar `skillcraft_eh_admin()`         | Migração 0003 não aplicada.                                            |
