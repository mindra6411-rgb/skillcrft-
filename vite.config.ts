import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * SEO em tempo de build.
 *
 * O site ainda não tem domínio fixo publicado, então canonical/og:url, robots.txt
 * e sitemap.xml só são gerados quando `VITE_SITE_URL` existe no ambiente
 * (ex.: VITE_SITE_URL=https://skill-craft.example). Nenhum endereço é inventado:
 * sem a variável, o build não declara URL canônica nem sitemap.
 */
function seoPlugin(urlSite: string): Plugin {
  return {
    name: 'skillcraft-seo',
    transformIndexHtml(html) {
      if (!urlSite) return html
      const tags = [
        { tag: 'link', attrs: { rel: 'canonical', href: `${urlSite}/` }, injectTo: 'head' as const },
        { tag: 'meta', attrs: { property: 'og:url', content: `${urlSite}/` }, injectTo: 'head' as const },
      ]
      return { html, tags }
    },
    generateBundle() {
      const robots = [
        'User-agent: *',
        'Allow: /',
        '',
        '# O roteamento do site usa hash (#/app, #/ferramentas, #/ajuda, #/admin).',
        '# Fragmentos não são endereços indexáveis separadamente; o conteúdo público',
        '# está todo na rota raiz.',
        urlSite ? `Sitemap: ${urlSite}/sitemap.xml` : '',
        '',
      ]
        .filter((linha) => linha !== '')
        .join('\n')

      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `${robots}\n` })

      if (urlSite) {
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${urlSite}/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const urlSite = (env.VITE_SITE_URL ?? '').trim().replace(/\/+$/, '')

  return {
    plugins: [react(), tailwindcss(), seoPlugin(urlSite)],
    server: {
      host: true, // permite acesso pelo preview proxy do sandbox
      port: 5173,
      allowedHosts: true,
    },
    preview: {
      host: true,
      port: 4173,
      allowedHosts: true,
    },
    build: {
      target: 'es2020',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            motion: ['framer-motion'],
            supabase: ['@supabase/supabase-js'],
          },
        },
      },
    },
  }
})
