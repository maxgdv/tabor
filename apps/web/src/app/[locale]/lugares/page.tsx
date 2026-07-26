import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { groupPlacesByLetter, modernNameDisplay, mostMentioned } from '@/lib/places';
import { listedPlaces } from '@/lib/places-data';
import { localeAlternates, openGraphFor } from '@/lib/seo';

type Params = Promise<{ locale: string }>;

/** Cuántos lugares destacar arriba antes del alfabeto. */
const FEATURED = 12;

/**
 * Nombre moderno para la línea suelta bajo el nombre del lugar, y sólo cuando
 * de verdad identifica. En una región el dato del atlas es el punto que marca
 * dentro de la zona (Egipto → Ain Shams) y aquí no hay sitio para explicarlo:
 * en una lista de trescientos, «identificado con» sería mentira y cualquier
 * matiz, ruido. La ficha del lugar sí lo muestra, con su etiqueta propia.
 */
function identifiedModernName(place: {
  slug: string;
  name: string;
  canonicalName: string;
  modernName: string | null;
}): string | null {
  const modern = modernNameDisplay(place);
  return modern?.identifies ? modern.name : null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const [t, places] = await Promise.all([
    getTranslations({ locale, namespace: 'places' }),
    listedPlaces(locale),
  ]);
  const title = t('title');
  const description = t('metaDescription', { count: places.length });
  return {
    title,
    description,
    alternates: localeAlternates(locale, 'lugares'),
    openGraph: openGraphFor(locale, `${title} · Tabor`, description, 'lugares'),
  };
}

/**
 * Índice de lugares bíblicos.
 *
 * Con 300 elementos una lista plana no vale: quien llega buscando «Cafarnaúm»
 * necesita encontrarlo en dos gestos, y quien llega sin nombre en la cabeza
 * necesita que la página le proponga por dónde empezar. De ahí las dos
 * secciones: un destacado con los más nombrados (que además da a los mejores
 * candidatos de posicionamiento un enlace directo desde arriba) y el listado
 * completo alfabético partido por inicial, con una barra de letras para
 * saltar. Alfabético y no por región porque el dataset no trae región y
 * deducirla de las coordenadas sería inventarla.
 */
export default async function PlacesIndexPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('places');

  const places = await listedPlaces(locale);
  const featured = mostMentioned(places, FEATURED);
  const groups = groupPlacesByLetter(places, locale);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 sm:py-16">
      <header className="mb-10">
        <h1 className="font-serif text-3xl text-stone-800 sm:text-4xl dark:text-sand-100">
          {t('title')}
        </h1>
        <p className="mt-4 max-w-2xl text-stone-600 dark:text-sand-200">
          {t('lede', { count: places.length })}
        </p>
      </header>

      <section aria-labelledby="lugares-destacados">
        <h2
          id="lugares-destacados"
          className="font-serif text-2xl text-stone-800 dark:text-sand-100"
        >
          {t('featured')}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-stone-600 dark:text-sand-200">
          {t('featuredLede')}
        </p>
        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((place) => {
            const modern = identifiedModernName(place);
            return (
              <li key={place.slug}>
                <Link
                  href={`/lugares/${place.slug}`}
                  className="flex h-full flex-col rounded-lg border border-sand-200 bg-white/60 px-4 py-3 transition-colors hover:border-lapis-500 dark:border-stone-700 dark:bg-stone-800/60"
                >
                  <span className="font-serif text-lg text-stone-800 dark:text-sand-100">
                    {place.name}
                  </span>
                  {modern && (
                    <span className="mt-0.5 font-sans text-xs text-stone-600 dark:text-stone-300">
                      {t('modernShort', { modern })}
                    </span>
                  )}
                  <span className="mt-1.5 font-sans text-xs uppercase tracking-wide text-stone-600 dark:text-stone-300">
                    {t('mentions', { count: place.mentionCount })}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="lugares-todos" className="mt-14">
        <h2 id="lugares-todos" className="font-serif text-2xl text-stone-800 dark:text-sand-100">
          {t('all')}
        </h2>

        {/* Barra de iniciales: en móvil es la diferencia entre encontrar un
            lugar y hacer scroll por trescientos. */}
        <nav aria-label={t('letterNav')} className="mt-4">
          <ul className="flex flex-wrap gap-1">
            {groups.map((group) => (
              <li key={group.letter}>
                <a
                  href={`#letra-${group.letter}`}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-sand-200 px-2 font-sans text-sm font-medium text-stone-700 transition-colors hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-700 dark:text-sand-100 dark:hover:border-lapis-500"
                >
                  {group.letter}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {groups.map((group) => (
          <section key={group.letter} aria-labelledby={`letra-${group.letter}`} className="mt-8">
            {/* scroll-mt: el ancla no queda pegada al borde superior. */}
            <h3
              id={`letra-${group.letter}`}
              className="scroll-mt-4 border-b border-sand-200 pb-1 font-serif text-xl text-stone-800 dark:border-stone-700 dark:text-sand-100"
            >
              {group.letter}
            </h3>
            <ul className="mt-2 grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.places.map((place) => {
                const modern = identifiedModernName(place);
                return (
                  <li key={place.slug}>
                    <Link
                      href={`/lugares/${place.slug}`}
                      className="flex min-h-11 flex-col justify-center py-1.5 text-stone-700 underline-offset-2 hover:text-lapis-600 hover:underline dark:text-sand-100 dark:hover:text-lapis-300"
                    >
                      <span>
                        {place.name}{' '}
                        {/* El número suelto se lee «Cafarnaúm 18» en un
                            lector de pantalla: se oculta y se sustituye por
                            el texto completo. */}
                        <span
                          aria-hidden="true"
                          className="font-sans text-xs text-stone-600 dark:text-stone-300"
                        >
                          ({place.mentionCount})
                        </span>
                        <span className="sr-only">
                          — {t('mentions', { count: place.mentionCount })}
                        </span>
                      </span>
                      {modern && (
                        <span className="font-sans text-xs text-stone-600 dark:text-stone-300">
                          {t('modernShort', { modern })}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </section>

      <p className="mt-12 text-sm text-stone-600 dark:text-stone-300">{t('sourceNote')}</p>
    </div>
  );
}
