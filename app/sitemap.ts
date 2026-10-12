import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site'

// Lista de páginas para o Google encontrar o site.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return ['', '/sobre', '/privacidade', '/contato'].map((p) => ({
    url: `${SITE.url}${p}`,
    lastModified: now,
  }))
}
