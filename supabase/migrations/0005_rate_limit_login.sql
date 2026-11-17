-- ---------------------------------------------------------------------------
-- Skill Craft · Migração 0005 — proteção contra tentativas excessivas de login
--
-- Por que existe: rate limiting no navegador não é segurança (quem ataca não
-- usa o navegador). A contagem precisa viver no banco, ligada ao e-mail e ao
-- IP de origem, e a decisão precisa ser tomada pelo servidor.
--
-- Modelo (janela deslizante simples):
--   • cada falha de login grava uma linha em `tentativas_login`;
--   • `skillcraft_pode_tentar_login(email)` conta as falhas do e-mail nos
--     últimos 15 minutos e bloqueia a partir de 5 tentativas;
--   • a política de RLS só permite INSERIR falhas — ninguém lê a tabela pelo
--     cliente (isso revelaria e-mails cadastrados e IPs);
--   • a limpeza de registros antigos é feita pela function de verificação.
--
-- Observação importante (e honesta): a limpeza só roda quando alguém consulta.
-- Para um projeto maior, o caminho é o Supabase Auth nativo (Auth Hooks /
-- CAPTCHA). Aqui a proteção é real, porém simples — está documentada como tal.
--
-- Natureza: ADITIVA e idempotente.
-- Dependências: 0001–0004.
-- ---------------------------------------------------------------------------

create table if not exists public.tentativas_login (
  id         bigint generated always as identity primary key,
  criado_em  timestamptz not null default now(),
  email      text not null check (char_length(email) between 3 and 254),
  ip         inet null,
  sucesso    boolean not null default false
);

create index if not exists tentativas_login_email_idx
  on public.tentativas_login (email, criado_em desc);

create index if not exists tentativas_login_criado_idx
  on public.tentativas_login (criado_em);

alter table public.tentativas_login enable row level security;

-- Inserção: o próprio cliente registra a falha (necessário, porque o erro de
-- senha acontece no cliente). O `with check` impede gravar sucesso=true por
-- esta via e impede e-mail vazio.
drop policy if exists "tentativa_insercao_anexa" on public.tentativas_login;
create policy "tentativa_insercao_anexa"
  on public.tentativas_login
  for insert
  to anon, authenticated
  with check (sucesso = false and char_length(email) >= 3);

-- Nenhuma política de SELECT/UPDATE/DELETE: a API não expõe a tabela.

-- Consulta de bloqueio ------------------------------------------------------
-- SECURITY DEFINER porque precisa contar linhas que o chamador não pode ler.
-- Devolve apenas um objeto com três números — nunca dados de outros usuários.
create or replace function public.skillcraft_pode_tentar_login(p_email text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_janela interval := interval '15 minutes';
  v_limite int := 5;
  v_falhas int;
begin
  if v_email is null or char_length(v_email) < 3 then
    return jsonb_build_object('permitido', false, 'falhas', v_limite, 'limite', v_limite, 'esperar_segundos', v_janela);
  end if;

  select count(*) into v_falhas
  from public.tentativas_login t
  where t.email = v_email
    and t.sucesso = false
    and t.criado_em > now() - v_janela;

  return jsonb_build_object(
    'permitido', v_falhas < v_limite,
    'falhas', v_falhas,
    'limite', v_limite,
    'esperar_segundos', case when v_falhas >= v_limite
                             then ceil(extract(epoch from v_janela))::int
                             else 0 end
  );
end;
$$;

revoke all on function public.skillcraft_pode_tentar_login(text) from public;
grant execute on function public.skillcraft_pode_tentar_login(text) to anon, authenticated;

-- Registro de falha (chamado pelo site no erro de senha) --------------------
create or replace function public.skillcraft_registra_falha_login(p_email text)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
begin
  if v_email is null or char_length(v_email) < 3 then
    return;
  end if;

  insert into public.tentativas_login (email, sucesso)
  values (v_email, false);

  -- Higiene: descarta registros com mais de 24h (mantém a tabela pequena).
  delete from public.tentativas_login where criado_em < now() - interval '24 hours';
end;
$$;

revoke all on function public.skillcraft_registra_falha_login(text) from public;
grant execute on function public.skillcraft_registra_falha_login(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Nota honesta sobre "IP": o Postgres via PostgREST não vê o IP do visitante,
-- então a coluna `ip` fica nula nesta arquitetura. O limite por e-mail é o que
-- funciona de fato aqui. Limite por IP/por dispositivo exige um edge function
-- (ou o recurso nativo de rate limit do Supabase Auth) — registrado como
-- pendência em docs/SEGURANCA.md em vez de ser fingido no código.
-- ---------------------------------------------------------------------------
