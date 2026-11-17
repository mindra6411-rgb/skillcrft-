/**
 * Definição e interpretação das rotas do site.
 *
 * Módulo puro (sem React, sem DOM obrigatório) para que a regra de roteamento
 * possa ser testada isoladamente — veja `scripts/smoke.mjs`.
 *
 * - `#/` ou hash vazio          → home (página institucional)
 * - `#/app`                     → área do aluno
 * - `#/ferramentas`             → ferramentas gratuitas de estudo
 * - `#/ajuda`                   → central de ajuda
 * - `#/admin`                   → painel administrativo (permissão validada no banco)
 * - qualquer outro `#/xxx`      → 404 (página própria; nunca redireciona em
 *                                 silêncio para a home escondendo o erro)
 *
 * Âncoras nativas (`#servicos`, `#contato`, `#conteudo`…) NÃO começam com `#/`
 * e são tratadas como rolagem para a seção da página institucional.
 */
export type Rota = 'home' | 'app' | 'ferramentas' | 'ajuda' | 'admin' | '404'

export const ROTAS_CONHECIDAS = ['app', 'ferramentas', 'ajuda', 'admin'] as const

export type RotaConhecida = (typeof ROTAS_CONHECIDAS)[number]

export function ehRotaConhecida(valor: string): valor is RotaConhecida {
  return (ROTAS_CONHECIDAS as readonly string[]).includes(valor)
}

/** Interpreta um hash (por padrão, o hash atual do navegador). */
export function lerRota(hash: string): Rota {
  if (!hash.startsWith('#/')) return 'home'
  const caminho = hash
    .slice(2)
    .split('?')[0]
    .split('/')[0]
    .replace(/\/+$/, '')
    .toLowerCase()
  if (caminho === '') return 'home'
  return ehRotaConhecida(caminho) ? caminho : '404'
}

/** Hash correspondente a cada rota (null = URL limpa, sem hash). */
export function hashDaRota(destino: Rota): string | null {
  switch (destino) {
    case 'home':
      return null
    case '404':
      return '#/404'
    default:
      return `#/${destino}`
  }
}

/**
 * Retorno do OAuth: o provedor devolve tokens no fragmento
 * (`#access_token=…` / `#code=…`). Isso nunca pode ser lido como rota.
 */
export function ehHashDeAutenticacao(hash: string): boolean {
  return !hash.startsWith('#/') && /(?:access_token|refresh_token|code|error)=/.test(hash)
}
