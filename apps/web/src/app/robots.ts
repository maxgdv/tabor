import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

// Rastreadores que no traen lectores (herramientas SEO, buscadores sin
// audiencia aquí, scrapers de IA para entrenamiento) y sí gastan cuota de
// Vercel: cada visita a una página caducada la regenera. Los buscadores
// (Google, Bing, DuckDuckGo) y los bots de búsqueda con IA siguen entrando.
const BLOCKED_BOTS = [
  'SemrushBot',
  'AhrefsBot',
  'MJ12bot',
  'DotBot',
  'Bytespider',
  'Reflectionbot',
  'Amazonbot',
  'PetalBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: BLOCKED_BOTS, disallow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
