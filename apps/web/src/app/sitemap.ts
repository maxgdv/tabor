import type { MetadataRoute } from 'next';
import { listBooks } from '@tabor/db';
import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/lib/seo';

// El sitemap consulta Postgres (nº de capítulos por libro): generación en
// petición, no en build — el build de CI no tiene BD. Con ~2.800 URLs cabe
// holgadamente en un único sitemap (límite del protocolo: 50.000).
export const dynamic = 'force-dynamic';

type Freq = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;

/** Una entrada por locale para el mismo path, con hreflang cruzado. */
function perLocale(path: string, changeFrequency: Freq, priority: number): MetadataRoute.Sitemap {
  const suffix = path ? `/${path}` : '';
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, `${SITE_URL}/${l}${suffix}`]),
  );
  return routing.locales.map((locale) => ({
    url: `${SITE_URL}/${locale}${suffix}`,
    changeFrequency,
    priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Los urlSegment y chapterCount son canónicos: iguales en ambas versiones,
  // basta consultar una.
  const books = await listBooks({ versionCode: 'STRA' });

  const entries: MetadataRoute.Sitemap = [
    ...perLocale('', 'monthly', 1),
    ...perLocale('leer', 'monthly', 0.9),
  ];

  for (const book of books) {
    entries.push(...perLocale(`leer/${book.urlSegment}`, 'monthly', 0.7));
    for (let n = 1; n <= book.chapterCount; n++) {
      entries.push(...perLocale(`leer/${book.urlSegment}/${n}`, 'yearly', 0.6));
    }
  }

  return entries;
}
