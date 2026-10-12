import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site'

// Diz aos buscadores o que podem visitar (tudo, menos as rotas internas da API).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${SITE.url}/sitemap.xml`,
  }
}
