import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { routeReadingHref, routeReadingLabel } from '@/lib/routes';
import { SITE_URL, localeAlternates, openGraphFor } from '@/lib/seo';
import { AREA_COLORS, groupSitesByArea } from '@/lib/visit';
import { visitablePlaces } from '@/lib/visit-data';
import { sitesInRegion } from '@/lib/visitable';
import { VisitMapClient, type VisitMapPoint } from '@/components/visit/VisitMapClient';

type Params = Promise<{ locale: string }>;

const REGION = 'tierra-santa' as const;
const PATH = 'visitar/tierra-santa';

/**
 * Título y descripción para lo que de verdad se escribe en el buscador.
 *
 * Las consultas de esta página no son bíblicas sino de viaje —«qué ver en
 * Tierra Santa», «peregrinación a Tierra Santa», «lugares de Jesús en
 * Galilea»— y ninguna de ellas la haría alguien que ya sabe lo que quiere
 * leer. De ahí que el título empiece por «Qué ver» y no por «Lugares
 * bíblicos», y que lleve el número: es el dato que distingue este resultado de
 * los cien blogs de agencias con los que compite.
 */
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'visit' });
  const count = sitesInRegion(REGION).length;
  const title = t('holyLand.metaTitle', { count });
  const description = t('holyLand.metaDescription', { count });
  return {
    title,
    description,
    alternates: localeAlternates(locale, PATH),
    openGraph: openGraphFor(locale, `${title} · Tabor`, description, PATH),
  };
}

/**
 * La guía de Tierra Santa.
 *
 * Una consulta y una sola: `visitablePlaces` trae de golpe el nombre
 * localizado y las coordenadas de los ~50 lugares. Todo lo demás —qué se
 * conserva, dónde está, qué leer— es estático y no toca la BD.
 */
export default async function HolyLandGuidePage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, places] = await Promise.all([
    getTranslations('visit'),
    visitablePlaces(REGION, locale),
  ]);
  const lang = locale === 'en' ? 'en' : 'es';

  // Un slug caído del atlas no debe dejar la guía a medias: se omite y se
  // avisa por consola, como hacen las rutas.
  const sites = sitesInRegion(REGION).filter((site) => {
    if (places.has(site.slug)) return true;
    console.warn(`[visitar] lugar desconocido en tierra-santa: ${site.slug}`);
    return false;
  });

  const groups = groupSitesByArea(sites, (slug) => places.get(slug) ?? null);

  const points: VisitMapPoint[] = groups.flatMap((group) =>
    group.sites.flatMap((site) => {
      const place = places.get(site.slug);
      return place
        ? [
            {
              slug: site.slug,
              name: place.name,
              lng: place.lng,
              lat: place.lat,
              color: AREA_COLORS[group.area],
            },
          ]
        : [];
    }),
  );

  const url = `${SITE_URL}/${locale}/${PATH}`;
  // Una `ItemList` de lugares es exactamente lo que esta página es: un listado
  // ordenado de sitios, cada uno con su ficha. Nada inventado — sólo
  // `BreadcrumbList` e `ItemList`, ambos con las propiedades que definen.
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: t('holyLand.title'),
      description: t('holyLand.lede'),
      url,
      numberOfItems: sites.length,
      itemListOrder: 'https://schema.org/ItemListUnordered',
      itemListElement: groups
        .flatMap((group) => group.sites)
        .map((site, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: places.get(site.slug)?.name ?? site.slug,
          url: `${SITE_URL}/${locale}/lugares/${site.slug}`,
        })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: t('title'),
          item: `${SITE_URL}/${locale}/visitar`,
        },
        { '@type': 'ListItem', position: 2, name: t('holyLand.title') },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        // Escape de '<' como en el lector y en la ficha: un nombre con markup
        // no debe poder cerrar el <script>.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:py-14">
        <nav
          aria-label={t('breadcrumbLabel')}
          className="font-sans text-xs uppercase tracking-[0.18em] text-stone-600 dark:text-stone-300"
        >
          <Link
            href="/visitar"
            className="inline-flex min-h-11 items-center underline-offset-4 hover:text-stone-800 hover:underline dark:hover:text-sand-200"
          >
            {t('title')}
          </Link>
        </nav>

        <header className="mt-1">
          <h1 className="font-serif text-3xl text-stone-800 sm:text-4xl dark:text-sand-100">
            {t('holyLand.title')}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-stone-700 dark:text-sand-200">
            {t('holyLand.lede')}
          </p>
          {/* Aquí hubo un párrafo explicando el criterio editorial (sin
              horarios ni precios; sólo topónimos bíblicos, de ahí que falten
              Masada o Qumrán). Se retiró: quien llega a esta página está
              preparando un viaje y no viene a leer nuestras reglas de
              inclusión, y nombrar lo que no está sólo servía para despedir a
              quien buscaba justamente eso. El criterio sigue documentado
              donde corresponde, en la cabecera de `lib/visitable.ts`. */}
        </header>

        {points.length > 0 && (
          <section aria-label={t('holyLand.mapLabel')} className="mt-8">
            <div className="h-72 overflow-hidden rounded-lg border border-sand-200 sm:h-96 dark:border-stone-700">
              <VisitMapClient points={points} label={t('holyLand.mapLabel')} />
            </div>
            {/* La leyenda dice el nombre de la zona junto a la muestra: el
                color acompaña, no informa por sí solo. */}
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
              {groups.map((group) => (
                <li
                  key={group.area}
                  className="flex items-center gap-1.5 font-sans text-xs text-stone-600 dark:text-stone-300"
                >
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-stone-500 dark:ring-stone-400"
                    style={{ backgroundColor: AREA_COLORS[group.area] }}
                  />
                  {t(`areas.${group.area}.name`)}
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-8 leading-relaxed text-stone-600 dark:text-sand-200">
          {t('holyLand.howOrganized')}
        </p>

        {groups.map((group) => (
          <section key={group.area} aria-labelledby={`zona-${group.area}`} className="mt-12">
            <h2
              id={`zona-${group.area}`}
              className="scroll-mt-4 border-b border-sand-200 pb-2 font-serif text-2xl text-stone-800 dark:border-stone-700 dark:text-sand-100"
            >
              {t(`areas.${group.area}.name`)}
            </h2>
            <p className="mt-3 leading-relaxed text-stone-600 dark:text-sand-200">
              {t(`areas.${group.area}.lede`)}
            </p>

            <ul className="mt-6 space-y-6">
              {group.sites.map((site) => {
                const place = places.get(site.slug);
                if (!place) return null;
                return (
                  <li
                    key={site.slug}
                    className="rounded-lg border border-sand-200 bg-white/60 p-5 dark:border-stone-700 dark:bg-stone-800/60"
                  >
                    <h3 className="font-serif text-xl text-stone-800 dark:text-sand-100">
                      <Link
                        href={`/lugares/${site.slug}`}
                        className="underline-offset-4 hover:text-lapis-600 hover:underline dark:hover:text-lapis-300"
                      >
                        {place.name}
                      </Link>
                    </h3>
                    <p className="mt-1 font-sans text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                      {site.whereItIs[lang]}
                    </p>
                    <p className="mt-3 leading-relaxed text-stone-700 dark:text-sand-200">
                      {site.preserved[lang]}
                    </p>
                    <p className="mt-3">
                      <Link
                        href={routeReadingHref(site.reading)}
                        className="inline-flex min-h-11 items-center font-sans text-sm font-medium text-lapis-600 underline-offset-2 hover:underline dark:text-lapis-300"
                      >
                        {t('holyLand.readingLink', {
                          reference: routeReadingLabel(site.reading, lang),
                        })}
                      </Link>
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <section
          aria-labelledby="seguir"
          className="mt-14 border-t border-sand-200 pt-8 dark:border-stone-700"
        >
          <h2 id="seguir" className="font-serif text-2xl text-stone-800 dark:text-sand-100">
            {t('holyLand.nextHeading')}
          </h2>
          <ul className="mt-3 space-y-1">
            <li>
              <Link
                href="/rutas"
                className="inline-flex min-h-11 items-center font-sans text-sm text-lapis-600 underline-offset-2 hover:underline dark:text-lapis-300"
              >
                {t('holyLand.nextRoutes')}
              </Link>
            </li>
            <li>
              <Link
                href="/lugares"
                className="inline-flex min-h-11 items-center font-sans text-sm text-lapis-600 underline-offset-2 hover:underline dark:text-lapis-300"
              >
                {t('holyLand.nextPlaces')}
              </Link>
            </li>
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
            {t('sourceNote')}
          </p>
        </section>
      </div>
    </>
  );
}
