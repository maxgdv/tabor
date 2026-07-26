import type { MetadataRoute } from 'next';
import { listBooks, listPlacesWithMentions } from '@tabor/db';
import { routing } from '@/i18n/routing';
import { isListedPlace } from '@/lib/places';
import { PLANS } from '@/lib/plans';
import { ROUTES } from '@/lib/routes';
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
  // basta consultar una. Los lugares se piden con el mismo criterio que el
  // índice (`listedPlaces` sin idioma: aquí solo hacen falta los slugs).
  // Dos consultas en paralelo, muy por debajo del `max` del pool.
  const [books, places] = await Promise.all([
    listBooks({ versionCode: 'STRA' }),
    listPlacesWithMentions({ minMentions: 1 }).then((all) => all.filter(isListedPlace)),
  ]);

  const entries: MetadataRoute.Sitemap = [
    ...perLocale('', 'monthly', 1),
    ...perLocale('leer', 'monthly', 0.9),
    // Cambia de pasaje cada día: es la URL que más merece recrawl frecuente.
    ...perLocale('versiculo-del-dia', 'daily', 0.9),
    ...perLocale('planes', 'monthly', 0.8),
    ...PLANS.flatMap((plan) => perLocale(`planes/${plan.slug}`, 'monthly', 0.7)),
    ...perLocale('rutas', 'monthly', 0.8),
    ...ROUTES.flatMap((route) => perLocale(`rutas/${route.slug}`, 'monthly', 0.7)),
    // Los lugares son contenido propio (coordenadas, nombre curado y los
    // versículos exactos): por encima de los capítulos, cuyo texto está en
    // medio internet. El índice manda sobre las fichas, y 'monthly' es
    // honesto — el atlas cambia poco, pero cambia.
    ...perLocale('lugares', 'monthly', 0.9),
    ...places.flatMap((place) => perLocale(`lugares/${place.slug}`, 'monthly', 0.8)),
  ];

  for (const book of books) {
    entries.push(...perLocale(`leer/${book.urlSegment}`, 'monthly', 0.7));
    for (let n = 1; n <= book.chapterCount; n++) {
      entries.push(...perLocale(`leer/${book.urlSegment}/${n}`, 'yearly', 0.6));
    }
  }

  return entries;
}
