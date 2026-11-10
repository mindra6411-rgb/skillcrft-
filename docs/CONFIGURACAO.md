# Configuração — Skill Craft

Guia completo para rodar o site, ativar o **login com Google (Supabase Auth)** e
publicar na **Vercel**. Nenhuma credencial vem embutida no código: tudo é lido de
variáveis de ambiente (`.env` local / painel da Vercel).

---

## 1. Rodar localmente

```bash
npm install
cp .env.example .env   # preencha se quiser ativar login/contatos
npm run dev            # http://localhost:5173
npm run build          # build de produção (gera dist/)
npm run preview        # serve o build de produção
```

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

Execute o arquivo [`supabase/migrations/0001_solicitacoes.sql`](../supabase/migrations/0001_solicitacoes.sql)
no **SQL Editor** do Supabase. Ele cria a tabela `solicitacoes` com RLS:

- inserção pública (formulário do site, com ou sem login);
- leitura apenas do próprio aluno logado (Área do Aluno).

Sem a tabela, o formulário grava **rascunhos locais** e avisa isso com clareza.

### 2.5 Variáveis de ambiente

```env
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<chave anon pública>
```

> Nunca commitar `.env` preenchido. Nunca usar a chave `service_role` no front-end.

---

## 3. Contatos do rodapé (opcional)

| Variável                  | Exemplo                  | Efeito                              |
| ------------------------- | ------------------------ | ----------------------------------- |
| `VITE_CONTACT_EMAIL`      | `equipe@exemplo.com`     | Link `mailto:` no rodapé            |
| `VITE_CONTACT_WHATSAPP`   | `5511999998888`          | Link `wa.me` no rodapé              |
| `VITE_CONTACT_INSTAGRAM`  | `skillcraft.oficial`     | Link do perfil no rodapé            |

Sem essas variáveis, o rodapé exibe apenas o texto institucional (nenhuma rede
social ou número inventado).

---

## 4. Publicar na Vercel

**Pelo painel (recomendado):**

1. [vercel.com/new](https://vercel.com/new) → importe o repositório deste projeto.
2. Framework detectado: **Vite** (build `npm run build`, saída `dist`).
3. Em **Environment Variables** adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
   (e os contatos, se quiser) — e repita o passo 2.3 trocando as URLs para o domínio da Vercel.
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
| Solicitação vira “rascunho local”              | Tabela `solicitacoes` não criada: rode a migração 0001.                |
| Sessão não volta após o Google                 | Site URL/Redirects do Supabase diferentes da URL onde o site roda.     |
