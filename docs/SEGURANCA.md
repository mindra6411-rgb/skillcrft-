# Segurança e Autenticação — Skill Craft

**Última revisão:** 17/11/2026
**Modelo:** autenticação própria com e-mail e senha (Supabase Auth) + autorização no PostgreSQL (RLS)
**Escopo:** o que foi implementado, o que foi verificado de fato e o que ainda depende de configuração externa.

---

## 1. O que mudou nesta etapa

| Antes | Depois |
| --- | --- |
| Login social com Google (OAuth) | **Removido.** Sem provedor externo, sem cliente OAuth, sem `GoogleIcon` |
| `user_metadata`/provedor como fonte de identidade | **E-mail + senha** no Supabase Auth (hash bcrypt, feito pelo próprio Supabase) |
| Apenas 1 papel efetivo (admin ou não) | **4 perfis**: Visitante, Aluno, Professor, Administrador — em `public.perfis` |
| Sem limite de tentativas | **Rate limit** no banco: 5 falhas / 15 min por e-mail |
| Sem cabeçalhos de segurança | **`vercel.json`** com CSP, HSTS, `X-Frame-Options`, `Referrer-Policy` etc. |
| Erros do provedor exibidos crus | **`lib/erros.ts`**: códigos traduzidos, sem vazar infraestrutura |

Nada foi reconstruído: React, Vite, TypeScript, Supabase, rotas, formulário,
ferramentas, ajuda e painel continuam os mesmos.

---

## 2. Fluxos implementados

| Fluxo | Onde | Observação de segurança |
| --- | --- | --- |
| Cadastro (nome, e-mail, senha) | `AuthModal` → `lib/auth.cadastrar` | perfil criado por **trigger** como `aluno`; papel nunca vem do cliente |
| Confirmação de e-mail | `AuthContext` + rota `#/app` | fluxo PKCE; tokens do fragmento são limpos da URL |
| Login | `lib/auth.entrar` | consulta o rate limit **antes**; mesma mensagem para e-mail inexistente e senha errada |
| Senha incorreta | `lib/erros.codificarErroAuth` | registra a falha e devolve “E-mail ou senha incorretos.” |
| Recuperação de senha | `lib/auth.recuperarSenha` | resposta **idêntica** exista ou não a conta (não enumera usuários) |
| Redefinição (link) | rota `#/redefinir-senha` | link expirado/usado não finge sucesso |
| Alteração de senha | `AuthModal` modo `trocar-senha` | exige a senha atual (reautenticação) antes de trocar |
| Logout | `lib/auth.sair` | encerra o estado local mesmo se a rede falhar |
| Sessão persistida | `lib/supabase.ts` | `persistSession` + `autoRefreshToken` + `flowType: 'pkce'` |

**Senhas:** nunca são lidas, comparadas, logadas ou gravadas pelo site. Vão
direto para o Supabase Auth, que aplica hash bcrypt e não devolve a senha em
nenhuma resposta.

---

## 3. Modelo de autorização (4 perfis)

Definidos em `public.perfis` (migração `0004`) e descritos em `src/lib/papeis.ts`
apenas para a interface. **A interface não decide nada.**

| Perfil | Origem | Área do aluno | Painel | Gerencia perfis |
| --- | --- | --- | --- | --- |
| Visitante | sem sessão | — | — | — |
| Aluno | padrão no cadastro | próprio histórico | — | — |
| Professor | e-mail em `professores_autorizados` | próprio histórico | — | — |
| Administrador | promoção manual no SQL Editor | sim | sim | sim |

Garantias no banco:

1. `skillcraft_papel()` devolve o papel do **próprio** `auth.uid()`; qualquer
   falha na aplicação cai em `aluno` (privilégio mínimo).
2. `skillcraft_eh_admin()` é consultada a **cada** carregamento do painel — não
   basta o papel em memória.
3. Política de `UPDATE` em `perfis` exige `skillcraft_eh_admin()` **e**
   `usuario_id <> auth.uid()`.
4. Trigger `trg_protege_papel` repete a regra: mesmo que uma política futura
   seja relaxada por engano, a autopromoção continua bloqueada.
5. O caminho aluno → professor passa por `skillcraft_promove_professor()`, que
   confere a lista fechada e só promove **o próprio** usuário.

---

## 4. Matriz de superfícies e proteções

| Superfície | Risco | Proteção |
| --- | --- | --- |
| `solicitacoes` (INSERT) | gravar pedido como “concluído” ou na conta de outro | `with check (status = 'aguardando_analise' and (usuario_id is null or usuario_id = auth.uid()))` |
| `solicitacoes` (SELECT) | ler pedidos de terceiros | política `usuario_id = auth.uid()`; admin via `skillcraft_eh_admin()` |
| `solicitacoes` (UPDATE/DELETE) | alterar/apagar pedido alheio | update só admin; **nenhuma política de delete** |
| `perfis` | autopromoção a administrador | política + trigger (acima) |
| `tentativas_login` | enumerar e-mails/IPs | nenhuma política de SELECT |
| `professores_autorizados` | descobrir e-mails da escola | nenhuma política; só via função booleana |
| `usuarios_publico` (view) | ler dados de outros usuários | `where u.id = auth.uid() or skillcraft_eh_admin()` |
| Funções `skillcraft_*` | execução indevida | `SECURITY DEFINER` + `set search_path = public` + `revoke all from public` + `grant` só a quem usa |
| Front-end | XSS | nenhum sink de HTML cru; React escapa por padrão; CSP sem `unsafe-eval` |
| Bundle | vazamento de segredo | só a chave `anon`; teste falha se aparecer `service_role` ou JWT embutido |

### Sobre CSRF

A aplicação usa **token de sessão em header `Authorization`** (padrão do
`supabase-js`), e não cookies de sessão enviados automaticamente pelo navegador.
Sem cookie ambiente, não existe o cenário clássico de CSRF. Além disso o CSP
restringe `form-action` e `connect-src` à própria origem e ao domínio Supabase.
**Se algum dia a autenticação passar a usar cookies**, será necessário um token
anti-CSRF — está registrado aqui para não ser esquecido.

---

## 5. Rate limiting — o que é e o que não é

- **Implementado:** 5 falhas por e-mail em janela de 15 minutos, contadas no
  banco (`skillcraft_pode_tentar_login`), com aviso na interface
  (“Muitas tentativas seguidas…”). A limpeza de registros antigos roda na
  própria consulta.
- **Também ativo:** o limite nativo de requisições do Supabase Auth.
- **Não implementado (e não fingido):** limite por **IP**. O PostgREST não vê o
  IP do visitante, então a coluna `ip` existe mas fica nula. Limite por IP de
  verdade exige *edge function* ou o recurso nativo de rate limit do Supabase —
  registrado como pendência.

---

## 6. Cabeçalhos HTTP (`vercel.json`)

CSP (`default-src 'self'`, `script-src 'self'`, sem `unsafe-eval`, conectando
apenas à própria origem e a `https://*.supabase.co`), HSTS (2 anos),
`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` + `frame-ancestors 'none'`,
`Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`
(câmera/microfone/geolocalização/pagamento desligados), COOP/CORP.

> **Ponto de atenção real:** `style-src` inclui `'unsafe-inline'` porque o
> Tailwind e o Framer Motion aplicam estilos inline. Isso é comum e de baixo
> risco (não executa script), mas é uma concessão consciente, não um esquecimento.

---

## 7. Testes executados neste repositório

`npm run test:smoke` — **127/127 verificações**, incluindo a bateria de segurança:

| Item exigido | Verificação automática | Situação |
| --- | --- | --- |
| 1. Cadastro | validadores de nome/e-mail/senha + confirmação divergente | ✅ |
| 2. Login correto | fluxo sem sessão não finge login; mensagem de sucesso tratada | ✅ (sem servidor) |
| 3. Senha incorreta | mesma mensagem de “e-mail inexistente”; não vaza detalhe | ✅ |
| 4. Recuperação de senha | resposta idêntica nos dois casos; rota `#/redefinir-senha` existe; link inválido não finge sucesso | ✅ |
| 5. Logout | estado local limpo e papel volta a `aluno` | ✅ |
| 6. Visitante em página privada | `#/app` e `#/admin` sem dados e sem histórico | ✅ |
| 7. Aluno tentando admin | `PERFIS.aluno.painelAdministrativo === false`; painel consulta o banco | ✅ |
| 8. Manipulação de URL | `#/admin?papel=administrador`, `#/ADMIN`, caminho estranho → 404/normalizado; hash de token nunca vira rota | ✅ |
| 9. Alteração de permissão | `comoPapel('superadmin') === 'aluno'`; trigger + política de autopromoção nas migrações | ✅ |
| 10. Requisições diretas | migrações conferidas: RLS em todas as tabelas, sem política de DELETE, inserção restrita | ✅ (documento) |
| 11. SQL Injection / XSS | entrada com `<script>`, controle e caracteres invisíveis rejeitada; nenhum sink de HTML cru; sem `eval` | ✅ |
| 12. Dados de outros usuários | políticas por `auth.uid()`; view restrita | ✅ (documento) |

### Limite honesto destes testes

Não existe um Supabase ativo neste ambiente (a conta do conector está **sem
projetos**). Portanto **nenhum teste acima autenticou de verdade contra um
PostgreSQL**. O que foi verificado: validadores, saneamento, tradução de erros,
regras de papel, comportamento da interface sem sessão, ausência de sinks de
XSS, ausência de segredos no bundle e a **presença/correção das políticas** nos
arquivos de migração.

---

## 8. Como validar no banco, quando houver projeto Supabase

Rode cada bloco no SQL Editor e confira o esperado:

```sql
-- 1. RLS ligado em todas as tabelas públicas (esperado: rowsecurity = true em todas)
select tablename, rowsecurity from pg_tables where schemaname = 'public';

-- 2. Políticas existentes
select tablename, policyname, cmd, roles from pg_policies where schemaname = 'public' order by tablename;

-- 3. Nenhuma política de DELETE (esperado: 0 linhas)
select tablename, policyname from pg_policies where schemaname = 'public' and cmd = 'DELETE';

-- 4. Autopromoção bloqueada — teste como usuário autenticado comum:
--    deve falhar com "Não é permitido alterar o próprio perfil."
update public.perfis set papel = 'administrador' where usuario_id = auth.uid();

-- 5. Rate limit ativo
select public.skillcraft_pode_tentar_login('teste@exemplo.com');

-- 6. Papel padrão de um usuário novo (esperado: aluno)
select public.skillcraft_papel();
```

### Testes que exigem servidor (Checklist manual)

1. Cadastrar com e-mail novo → deve pedir confirmação (se **Confirm email** ligado).
2. Entrar com senha errada 5× → a 6ª deve avisar “Muitas tentativas seguidas”.
3. Pedir recuperação para e-mail inexistente → mesma mensagem de sucesso.
4. Abrir `#/admin` com conta de aluno → “Acesso não autorizado”, sem dados.
5. Com conta de aluno, chamar direto a API REST do Supabase
   (`GET /rest/v1/solicitacoes?select=*`) → deve retornar **apenas** os próprios pedidos.
6. Tentar `PATCH /rest/v1/perfis` com o próprio `usuario_id` → deve ser negado.
7. Rebaixar um admin para aluno no SQL Editor e recarregar `#/admin` → perde o acesso.

---

## 9. Pendências reais (não declaradas como resolvidas)

1. **Supabase sem projeto na conta** — nada de login/banco está ativo no site
   publicado. É configuração, não código (passo 2 de `CONFIGURACAO.md`).
2. **Rate limit por IP** — exige edge function; hoje existe por e-mail.
3. **`style-src 'unsafe-inline'`** — concessão consciente (Tailwind/Framer).
4. **MFA / 2FA** — não implementado.
5. **SMTP próprio** — o envio padrão do Supabase tem limite por hora.
6. **Testes contra banco real** — precisam de projeto ativo (seção 8).
7. **`supabase/migrations` aplicadas?** — a auditoria não pôde confirmar porque
   não há projeto acessível. Verifique a coluna `rowsecurity` acima.
