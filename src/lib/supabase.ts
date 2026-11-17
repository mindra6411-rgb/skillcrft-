import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Integração Supabase Auth (cadastro e login com e-mail e senha).
 *
 * As credenciais vêm SOMENTE de variáveis de ambiente (VITE_SUPABASE_URL e
 * VITE_SUPABASE_ANON_KEY — chave pública "anon"). Nenhum valor é inventado ou
 * embutido no código. Sem variáveis, `supabase` é `null` e a interface passa a
 * exibir um estado honesto de "configuração pendente" (nunca autenticação simulada).
 *
 * Passo a passo completo de configuração: docs/CONFIGURACAO.md
 */
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

export const isSupabaseConfigured = Boolean(url && anonKey && /^https?:\/\/.+/i.test(url))

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Fluxo PKCE: o retorno por e-mail (confirmação/recuperação) troca um
        // código de uso único por sessão, em vez de trafegar tokens implícitos.
        flowType: 'pkce',
      },
    })
  : null
