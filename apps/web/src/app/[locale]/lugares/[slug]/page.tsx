import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { versionForLocale } from '@/lib/bible';
import {
  groupMentionsByBook,
  isListedPlace,
  modernNameDisplay,
  routesForPlace,
} from '@/lib/places';
import { placeBySlug, placeMentions } from '@/lib/places-data';
import { routeReadingHref, routeReadingLabel } from '@/lib/routes';
import { SITE_URL, localeAlternates, openGraphFor, verseSnippet } from '@/lib/seo';
import { visitableSite } from '@/lib/visitable';
import { PlaceMapClient } from '@/components/places/PlaceMapClient';
import { VisitableSiteBlock } from '@/components/visit/VisitableSiteBlock';

type Params = Promise<{ locale: string; slug: string }>;

// Vacío a propósito: habilita la generación estática bajo demanda (ISR) de
// las páginas de lugar sin exigir BD en el build.
export function generateStaticParams() {
  return [];
}

export const revalidate = 86400;

/** Caracteres del versículo que caben en la meta description sin comerse el resto. */
const SNIPPET_MAX = 58;

/** Caracteres de «qué se conserva» que caben en la descripción sin que Google la corte. */
const PRESERVED_MAX = 74;

/**
 * Título y descripción con datos reales de este lugar y de ningún otro.
 *
 * El problema que estas páginas vienen a resolver es que Google ya decidió no
 * mostrar 859 capítulos cuyo texto está en decenas de sitios: una plantilla
 * vacía repetida 300 veces correría la misma suerte. Así que la descripción
 * lleva tres hechos que solo salen de la BD —cuántos versículos nombran el
 * lugar, cuál es el primero en orden bíblico y cómo suena— y el título
 * responde a las dos búsquedas que de verdad se hacen: «X en la Biblia» y
 * «dónde está X».
 */
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const place = await placeBySlug(slug, locale);
  if (!place) return {};

  const [t, tVisit, mentions] = await Promise.all([
    getTranslations({ locale, namespace: 'places' }),
    getTranslations({ locale, namespace: 'visit' }),
    placeMentions(slug, versionForLocale(locale)),
  ]);

  const first = mentions[0];
  const title = t('placeTitle', { name: place.name });

  // En un sitio visitable la descripción no la manda el versículo sino lo que
  // se conserva. Quien escribe «Cafarnaúm» en el buscador puede querer el
  // pasaje o el yacimiento; quien llega a estas cincuenta fichas desde una
  // búsqueda de viaje quiere saber qué va a ver, y eso —a diferencia del
  // texto bíblico, que está en decenas de sitios— sólo lo dice Tabor. El
  // título no cambia: «X en la Biblia: dónde está» ya responde a la otra
  // mitad de las búsquedas y es el mismo en las 314 fichas del atlas.
  const site = visitableSite(slug);
  const description = site
    ? tVisit('site.metaDescription', {
        name: place.name,
        snippet: verseSnippet(
          [{ text: site.preserved[locale === 'en' ? 'en' : 'es'] }],
          PRESERVED_MAX,
        ),
      })
    : first
      ? t('placeDescription', {
          name: place.name,
          count: place.mentionCount,
          reference: t('reference', {
            book: first.bookName,
            chapter: first.chapterNumber,
            verse: first.verseNumber,
          }),
          snippet: verseSnippet([{ text: first.text }], SNIPPET_MAX),
        })
      : t('placeDescriptionNoMentions', { name: place.name });

  const path = `lugares/${place.slug}`;
  return {
    title,
    description,
    alternates: localeAlternates(locale, path),
    openGraph: openGraphFor(locale, `${title} · Tabor`, description, path),
    // Los lugares que no llegan al corte del índice (una o dos menciones y
    // sin ruta) tienen página —el enlace desde otras partes debe funcionar—
    // pero no se ofrecen al buscador: contenido demasiado corto.
    ...(isListedPlace(place) ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function PlacePage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const place = await placeBySlug(slug, locale);
  if (!place) notFound();

  // Dos consultas (ficha y versículos), memoizadas y compartidas con
  // generateMetadata. Nada de queries dentro de bucles: el resto —libros,
  // rutas— sale de datos ya cargados o de módulos estáticos.
  const [t, mentions] = await Promise.all([
    getTranslations('places'),
    placeMentions(slug, versionForLocale(locale)),
  ]);

  const modern = modernNameDisplay(place);
  const byBook = groupMentionsByBook(mentions);
  const routes = routesForPlace(place.slug);
  const lang = locale === 'en' ? 'en' : 'es';
  const truncated = place.mentionCount > mentions.length;
  // Módulo estático, resolución en O(1): ni una consulta más.
  const site = visitableSite(place.slug);

  // Datos estructurados: el `Place` con sus coordenadas es exactamente lo que
  // Google necesita para entender que esto es un sitio geográfico y no una
  // página más de texto bíblico; el `BreadcrumbList` le da la ruta
  // «Lugares bíblicos › Cafarnaúm» en el resultado en vez de la URL cruda.
  //
  // Cuando el lugar es además un sitio visitable, el nodo dice tres cosas más,
  // todas con vocabulario que schema.org define de verdad:
  //   · los tipos `TouristAttraction` y `LandmarksOrHistoricalBuildings`, que
  //     son subtipos de `Place` y describen justo esto (un sitio al que se va
  //     a ver algo que sigue en pie);
  //   · `publicAccess`, la propiedad booleana de `Place` para «abierto a
  //     visitantes», que es la pregunta exacta que trae a esta página;
  //   · `description` con lo que se conserva, y `subjectOf` apuntando al
  //     pasaje en el lector — la obra que habla de este lugar.
  // Lo que NO se emite, a propósito: `address` ni `containedInPlace`. Situar
  // estos sitios en un país es tomar partido sobre soberanías, y Tabor no lo
  // hace ni en el texto ni en los metadatos.
  const url = `${SITE_URL}/${locale}/lugares/${place.slug}`;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': site ? ['Place', 'TouristAttraction', 'LandmarksOrHistoricalBuildings'] : 'Place',
      name: place.name,
      alternateName: place.canonicalName.replace(/\s+\d+$/, ''),
      url,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: place.lat,
        longitude: place.lng,
      },
      // Sólo la identificación de verdad: un `additionalProperty` con el
      // punto representativo de una región lo leería una máquina como si
      // Egipto fuera Ain Shams.
      ...(modern?.identifies
        ? {
            additionalProperty: {
              '@type': 'PropertyValue',
              name: t('modernLabel'),
              value: modern.name,
            },
          }
        : {}),
      ...(site
        ? {
            description: site.preserved[lang],
            publicAccess: true,
            subjectOf: {
              '@type': 'CreativeWork',
              name: routeReadingLabel(site.reading, lang),
              url: `${SITE_URL}/${locale}${routeReadingHref(site.reading)}`,
            },
          }
        : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: t('title'),
          item: `${SITE_URL}/${locale}/lugares`,
        },
        { '@type': 'ListItem', position: 2, name: place.name },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        // Escape de '<' como en el lector: un nombre de lugar con markup no
        // debe poder cerrar el <script>.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:py-14">
        <nav
          aria-label={t('breadcrumbLabel')}
          className="font-sans text-xs uppercase tracking-[0.18em] text-stone-600 dark:text-stone-300"
        >
          <Link
            href="/lugares"
            className="inline-flex min-h-11 items-center underline-offset-4 hover:text-stone-800 hover:underline dark:hover:text-sand-200"
          >
            {t('title')}
          </Link>
        </nav>

        <header className="mt-1">
          <h1 className="font-serif text-3xl text-stone-800 sm:text-4xl dark:text-sand-100">
            {place.name}
          </h1>
          <p className="mt-3 max-w-2xl text-stone-600 dark:text-sand-200">
            {t('placeLede', { name: place.name, count: place.mentionCount })}
          </p>
        </header>

        <section aria-label={t('mapSection', { name: place.name })} className="mt-6">
          {/* Alto fijo y no aspect-ratio: en móvil apaisado un 4:3 dejaría el
              mapa más alto que la pantalla. */}
          <div className="h-72 overflow-hidden rounded-lg border border-sand-200 sm:h-96 dark:border-stone-700">
            <PlaceMapClient
              name={place.name}
              lng={place.lng}
              lat={place.lat}
              label={t('mapSection', { name: place.name })}
            />
          </div>

          {/* Todo lo que dice el mapa, también en texto: sin él la página
              sigue completa. */}
          <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            {/* En una región el nombre moderno no identifica nada: es la
                localidad bajo el punto que el atlas marca (Egipto → Ain
                Shams). Se dice eso y no otra cosa. */}
            {modern && (
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-sans text-stone-600 dark:text-stone-300">
                  {modern.identifies ? t('modernLabel') : t('mapPointLabel')}
                </dt>
                <dd className="text-stone-800 dark:text-sand-100">{modern.name}</dd>
              </div>
            )}
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-sans text-stone-600 dark:text-stone-300">
                {t('coordinatesLabel')}
              </dt>
              <dd className="text-stone-800 dark:text-sand-100">
                {t('coordinates', { lat: place.lat.toFixed(4), lng: place.lng.toFixed(4) })}
              </dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-sans text-stone-600 dark:text-stone-300">{t('mentionsLabel')}</dt>
              <dd className="text-stone-800 dark:text-sand-100">
                {t('mentions', { count: place.mentionCount })}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
            {t('sourceNote')}
          </p>
        </section>

        {/* Justo después del mapa y antes de los pasajes: quien llega
            preguntándose si esto se puede ver no debería tener que bajar por
            ciento veinte versículos para averiguarlo. */}
        {site && <VisitableSiteBlock site={site} locale={locale} />}

        <section aria-labelledby="pasajes" className="mt-12">
          <h2 id="pasajes" className="font-serif text-2xl text-stone-800 dark:text-sand-100">
            {t('passages')}
          </h2>
          {mentions.length === 0 ? (
            <p className="mt-3 text-stone-600 dark:text-sand-200">{t('noPassages')}</p>
          ) : (
            <>
              <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
                {truncated
                  ? t('passagesTruncated', {
                      shown: mentions.length,
                      total: place.mentionCount,
                    })
                  : t('passagesAll', { count: mentions.length })}
              </p>

              {byBook.map((group) => (
                <section key={group.bookCanonicalId} className="mt-8">
                  <h3 className="font-serif text-lg text-stone-800 dark:text-sand-100">
                    <Link
                      href={`/leer/${group.bookUrlSegment}`}
                      className="underline-offset-4 hover:text-lapis-600 hover:underline dark:hover:text-lapis-300"
                    >
                      {group.bookName}
                    </Link>
                  </h3>
                  <ul className="mt-1">
                    {group.mentions.map((mention) => (
                      <li
                        key={`${mention.chapterNumber}-${mention.verseNumber}`}
                        className="border-t border-sand-200 py-2 dark:border-stone-700"
                      >
                        <Link
                          href={`/leer/${mention.bookUrlSegment}/${mention.chapterNumber}#v${mention.verseNumber}`}
                          className="inline-flex min-h-11 items-center font-sans text-sm font-medium text-lapis-600 underline-offset-2 hover:underline dark:text-lapis-300"
                        >
                          {t('reference', {
                            book: group.bookName,
                            chapter: mention.chapterNumber,
                            verse: mention.verseNumber,
                          })}
                        </Link>
                        <p
                          lang={lang}
                          className="leading-relaxed text-stone-700 dark:text-sand-200"
                        >
                          {mention.text}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </>
          )}
        </section>

        {routes.length > 0 && (
          <section aria-labelledby="rutas" className="mt-12">
            <h2 id="rutas" className="font-serif text-2xl text-stone-800 dark:text-sand-100">
              {t('routesHeading')}
            </h2>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{t('routesLede')}</p>
            <ul className="mt-4 space-y-3">
              {routes.map((route) => (
                <li key={route.slug}>
                  <Link
                    href={`/rutas/${route.slug}`}
                    className="block rounded-lg border border-sand-200 bg-white/60 px-4 py-3 transition-colors hover:border-lapis-500 dark:border-stone-700 dark:bg-stone-800/60"
                  >
                    <span className="font-serif text-lg text-stone-800 dark:text-sand-100">
                      {route.name[lang]}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-stone-600 dark:text-sand-200">
                      {route.description[lang]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-12 border-t border-sand-200 pt-6 dark:border-stone-700">
          <Link
            href="/lugares"
            className="inline-flex min-h-11 items-center font-sans text-sm text-lapis-600 underline-offset-2 hover:underline dark:text-lapis-300"
          >
            {t('backToIndex')}
          </Link>
        </p>
      </div>
    </>
  );
}
