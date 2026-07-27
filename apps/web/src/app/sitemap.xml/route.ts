import { listBooks, listPlacesWithMentions } from '@tabor/db';
import { routing } from '@/i18n/routing';
import { isListedPlace } from '@/lib/places';
import { PLANS } from '@/lib/plans';
import { ROUTES } from '@/lib/routes';
import { SITE_URL } from '@/lib/seo';

// Por qué esto es un route handler y no el `sitemap.ts` de Next:
//
// Con `sitemap.ts` no se pueden fijar cabeceras, y Next servía el sitemap con
// `cache-control: public, max-age=0, must-revalidate`. Es decir: cada vez que
// un buscador lo pedía —y lo piden a menudo— se ejecutaba la función,
// se consultaba Postgres y se serializaba más de un megabyte de XML. Con 3.560
// URLs y varios rastreadores, eso se come el presupuesto de CPU del plan
// gratuito, que en Hobby son 4 horas al mes y al agotarse **pausa el
// proyecto**.
//
// Aquí sí se controla la caché: la CDN sirve la copia guardada y la función
// se ejecuta como mucho una vez al día. `stale-while-revalidate` evita que
// nadie espere a la regeneración.
//
// Sigue siendo dinámico a propósito: el build de CI no tiene base de datos,
// así que el sitemap no puede prerenderizarse (por eso tampoco vale ISR).

export const dynamic = 'force-dynamic';

type Freq = 'daily' | 'monthly' | 'yearly';

type Entry = {
  url: string;
  changefreq: Freq;
  priority: number;
  /** hreflang → URL, para el bloque xhtml:link. */
  alternates: Record<string, string>;
};

/** Una entrada por locale para el mismo path, con hreflang cruzado. */
function perLocale(path: string, changefreq: Freq, priority: number): Entry[] {
  const suffix = path ? `/${path}` : '';
  const alternates = Object.fromEntries(
    routing.locales.map((l) => [l, `${SITE_URL}/${l}${suffix}`]),
  );
  return routing.locales.map((locale) => ({
    url: `${SITE_URL}/${locale}${suffix}`,
    changefreq,
    priority,
    alternates,
  }));
}

/** Los cinco caracteres que XML no admite en crudo. */
function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function renderSitemap(entries: readonly Entry[]): string {
  const parts: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ];
  for (const entry of entries) {
    parts.push('<url>');
    parts.push(`<loc>${xmlEscape(entry.url)}</loc>`);
    for (const [lang, href] of Object.entries(entry.alternates)) {
      parts.push(
        `<xhtml:link rel="alternate" hreflang="${xmlEscape(lang)}" href="${xmlEscape(href)}" />`,
      );
    }
    parts.push(`<changefreq>${entry.changefreq}</changefreq>`);
    parts.push(`<priority>${entry.priority}</priority>`);
    parts.push('</url>');
  }
  parts.push('</urlset>');
  // Salto final, igual que emitía el `sitemap.ts` de Next: así el fichero es
  // byte a byte el mismo que llevan meses rastreando los buscadores.
  return `${parts.join('\n')}\n`;
}

async function buildEntries(): Promise<Entry[]> {
  // Los urlSegment y chapterCount son canónicos: iguales en ambas versiones,
  // basta consultar una. Los lugares se piden con el mismo criterio que el
  // índice (`isListedPlace`; aquí solo hacen falta los slugs).
  // Dos consultas en paralelo, muy por debajo del `max` del pool.
  const [books, places] = await Promise.all([
    listBooks({ versionCode: 'STRA' }),
    listPlacesWithMentions({ minMentions: 1 }).then((all) => all.filter(isListedPlace)),
  ]);

  const entries: Entry[] = [
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

export async function GET(): Promise<Response> {
  const xml = renderSitemap(await buildEntries());
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // La CDN guarda la copia un día y puede seguir sirviéndola una semana
      // mientras se regenera por detrás: los rastreadores no despiertan la
      // función y nadie espera nunca a que se reconstruya.
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
