# Configuração — Skill Craft

Guia completo para rodar o site, ativar o **cadastro/login com e-mail e senha (Supabase Auth)** e
publicar na **Vercel**. Nenhuma credencial vem embutida no código: tudo é lido de
variáveis de ambiente (`.env` local / painel da Vercel).

> **Site no ar:** <https://skill-craft-site.vercel.app> — projeto Vercel
> `skill-craft-site`, publicado a partir do branch `main` deste repositório.
> Detalhes e como republicar no **passo 4**.

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
“Entrar” abre o painel de e-mail e senha; se o Supabase não estiver configurado, o painel explica a pendência (nunca um login falso).

---

## 2. Supabase Auth — cadastro e login com e-mail e senha

> **Mudança importante:** o login com Google (OAuth) foi **removido**. Não há
> mais provedor externo, nem cliente OAuth no Google Cloud, nem `GoogleIcon`.
> A autenticação é 100% e-mail + senha via Supabase Auth (PostgreSQL).

### 2.1 Projeto Supabase

1. Em [database.new](https://database.new) (ou no painel do Supabase) crie um projeto.
2. Em **Project Settings → API** copie:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public key` → `VITE_SUPABASE_ANON_KEY` (chave pública; a segurança real vem do RLS).

> **Nunca** coloque a chave `service_role` no front-end nem em variável `VITE_*`:
> tudo que começa com `VITE_` é embutido no JavaScript publicado.

### 2.2 Configurar e-mail e senha no Supabase

Em **Authentication → Providers → Email**: mantenha **habilitado** e deixe
**Confirm email** ligado (o site trata o estado “confirme seu e-mail”).

Em **Authentication → URL Configuration**:

- **Site URL**: `https://skill-craft-site.vercel.app` (dev: `http://localhost:5173`)
- **Redirect URLs (allowlist)**: `https://skill-craft-site.vercel.app/**` e
  `http://localhost:5173/**`

O site usa o **fluxo PKCE** e devolve o usuário para as rotas `#/app`
(confirmação) e `#/redefinir-senha` (recuperação).

> **E-mails de confirmação/recuperação**: no plano gratuito o Supabase tem limite
> de envio por hora. Para produção real, configure um SMTP próprio em
> **Project Settings → Auth → SMTP**.

### 2.3 Aplicar as migrações (em ordem)

Execute no **SQL Editor** (ou `supabase db push`):

| Migração | O que faz | Natureza |
| --- | --- | --- |
| `0001_solicitacoes.sql` | Tabela `solicitacoes` com RLS: inserção pública e leitura só do próprio aluno | criação |
| `0002_status_prazo_informacoes.sql` | `status` (5 situações), `prazo`, `informacoes`; endurece a inserção pública | **aditiva** |
| `0003_administradores.sql` | Tabela `administradores`, `skillcraft_eh_admin()` e políticas de leitura/atualização administrativa | **aditiva** |
| `0004_perfis_papeis.sql` | Tabela `perfis` (aluno/professor/administrador), `skillcraft_papel()`, trigger que **impede autopromoção** e criação automática de perfil no cadastro | **aditiva** |
| `0005_rate_limit_login.sql` | `tentativas_login` + `skillcraft_pode_tentar_login()` (5 falhas / 15 min por e-mail) | **aditiva** |
| `0006_perfil_usuario_publico.sql` | View `usuarios_publico` (nome/e-mail só para o próprio usuário ou admin) e `professores_autorizados` | **aditiva** |
| `0007_promocao_professor.sql` | `skillcraft_promove_professor()`: aluno → professor **somente** para e-mail da lista autorizada | **aditiva** |

Todas são seguras para reaplicar e nenhuma desativa RLS.

### 2.4 Perfis de acesso

| Perfil | Como é obtido | O que pode fazer |
| --- | --- | --- |
| **Visitante** | sem sessão | navegar, usar ferramentas, enviar solicitação |
| **Aluno** | padrão no cadastro (trigger) | ver **apenas** o próprio histórico |
| **Professor** | e-mail em `professores_autorizados` + “Sou professor” no cadastro | área do aluno com o próprio histórico |
| **Administrador** | promoção manual no SQL Editor | painel, leitura geral, atualização de status |

**Promover o primeiro administrador** (SQL Editor, como dono):
```sql
select id, email from auth.users order by created_at desc;      -- 1. descubra o id
update public.perfis set papel = 'administrador'
where usuario_id = 'COLE-O-UUID-AQUI';                          -- 2. promova
```

**Cadastrar um professor autorizado** (antes do cadastro dele):
```sql
insert into public.professores_autorizados (email, observacao)
values ('professor@raphaeldisanto.com.br', 'Orientador do PI')
on conflict (email) do nothing;
```

Para revogar o admin: `update public.perfis set papel = 'aluno' where usuario_id = 'UUID';`

### 2.5 O que o banco garante (não a interface)

- usuário **não** altera o próprio papel: existe política *e* trigger bloqueando;
- ninguém lista perfis, tentativas de login ou a lista de professores;
- `solicitacoes`: aluno lê só as suas; admin lê todas; exclusão não é exposta;
- toda função `skillcraft_*` é `SECURITY DEFINER` com `search_path` fixo e
  `EXECUTE` concedido apenas a quem precisa.

O detalhamento e o SQL de verificação estão em [`SEGURANCA.md`](./SEGURANCA.md).

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

## 4. Publicação na Vercel — site no ar

O site está publicado em **<https://skill-craft-site.vercel.app>**, no projeto
Vercel `skill-craft-site` (conta `mindra6411-8699`, plano Hobby), ligado ao
repositório [`mindra6411-rgb/skillcrft-`](https://github.com/mindra6411-rgb/skillcrft-)
com branch de produção `main`.

| Configuração do projeto | Valor |
| --- | --- |
| Framework preset | **Vite** |
| Install command | `npm install` |
| Build command | `npm run build` (`tsc -b && vite build`) |
| Output directory | `dist` |
| Root directory | raiz do repositório (sem monorepo) |
| Branch de produção | `main` |
| Variáveis definidas | `VITE_SITE_URL=https://skill-craft-site.vercel.app` (production + preview) |

Como o roteamento usa hash (`#/app`, `#/ferramentas`, `#/ajuda`, `#/admin`), não
é necessária nenhuma regra de rewrite nem arquivo `vercel.json`.

### 4.1 Como publicar uma nova versão

O deploy é **automático a partir do Git** (verificado na prática nesta publicação):

- push ou merge em **`main`** → deployment de **produção**, promovido em seguida
  para <https://skill-craft-site.vercel.app>;
- push em **qualquer outro branch** → deployment de **preview**
  (`skill-craft-site-git-<branch>-mindra6411-8699.vercel.app`), que não altera a
  produção;
- **pull request** aberto → o preview fica associado ao PR para conferência.

Ou seja: atualizar o site = fazer merge em `main`. Para republicar o mesmo commit
sem novo push:

- **Painel:** Vercel → projeto `skill-craft-site` → *Deployments* → ⋯ →
  **Redeploy**.
- **CLI:** `npm i -g vercel && vercel login && vercel --prod`.

Voltar atrás: em *Deployments*, os deployments de produção anteriores prontos
ficam marcados como candidatos a rollback (opção de promover novamente).

### 4.2 Endereço público × endereços protegidos

O projeto tem proteção de deploy para os endereços `*.vercel.app` com o sufixo da
conta — por exemplo `skill-craft-site-mindra6411-8699.vercel.app` abre a tela de
login da Vercel. O endereço **público** do site é
**`skill-craft-site.vercel.app`**: use sempre este em divulgação, no
`VITE_SITE_URL`, no canonical e na allowlist do OAuth. Para liberar também os
demais endereços, ajuste *Deployment Protection* nas configurações do projeto
(opção indisponível na integração usada para publicar).

### 4.3 Ativar login e banco no site publicado

1. Execute os passos **2.1 a 2.5** (projeto Supabase, e-mail/senha, migrations,
   perfil administrativo).
2. No passo **2.3**, use como Site URL `https://skill-craft-site.vercel.app` e
   coloque esse mesmo endereço na allowlist de redirect.
3. No painel da Vercel → *Settings → Environment Variables*, adicione
   `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (targets *Production* e
   *Preview*) e, se quiser, `VITE_CONTACT_EMAIL`, `VITE_CONTACT_WHATSAPP` e
   `VITE_CONTACT_INSTAGRAM`.
4. Faça push em `main` — o deploy de produção é automático (4.1). As variáveis
   `VITE_*` só entram no bundle durante o build: mudar a variável sem um novo
   deploy não altera o site no ar.

Sem essas credenciais o site continua publicado e útil: formulário valida e grava
rascunho local declarado, ferramentas e central de ajuda funcionam integralmente,
e login/banco/painel mostram o estado real de pendência (nunca um sucesso falso).

### 4.4 Publicar do zero em outra conta (referência)

1. [vercel.com/new](https://vercel.com/new) → importe o repositório deste projeto.
2. Framework **Vite**, build `npm run build`, saída `dist`, raiz do repositório.
3. Adicione as variáveis `VITE_*` (passos 2.6 e 3), incluindo `VITE_SITE_URL` com
   a URL pública gerada.
4. Deploy — e repita o passo 2.3 trocando as URLs para o domínio da Vercel.

```bash
npm i -g vercel
vercel login
vercel            # preview
vercel --prod     # produção
vercel env add VITE_SUPABASE_URL production
```

---

## 5. Solução de problemas

| Sintoma                                        | Causa provável / correção                                              |
| ---------------------------------------------- | ---------------------------------------------------------------------- |
| Botão de login abre “configuração pendente”    | `.env` sem `VITE_SUPABASE_URL`/`ANON_KEY` (ou ausentes na Vercel).      |
| Erro `provider not enabled`                    | Ativar o provedor **Email** em Authentication → Providers (passo 2.2). |
| Erro `redirect URI not allowed`                 | URLs faltando na allowlist do Supabase (passo 2.2).                    |
| Solicitação vira “rascunho local”              | Tabela `solicitacoes` não criada: rode as migrações 0001 e 0002.       |
| Sessão não volta após confirmar e-mail         | Site URL/Redirects do Supabase diferentes da URL onde o site roda.     |
| Status não aparece / erro ao gravar `status`   | Migração 0002 não aplicada.                                            |
| `#/admin` diz “Painel indisponível”            | Sem `VITE_SUPABASE_URL`/`ANON_KEY` no ambiente.                        |
| `#/admin` diz “Acesso não autorizado”          | Migração 0003 aplicada, mas o seu usuário não está em `administradores` (passo 2.5). |
| Erro ao chamar `skillcraft_eh_admin()`         | Migração 0003 não aplicada.                                            |
