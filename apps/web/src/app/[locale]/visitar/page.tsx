import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { localeAlternates, openGraphFor } from '@/lib/seo';
import { REGION_PATH, VISIT_REGIONS } from '@/lib/visit';
import { sitesInRegion } from '@/lib/visitable';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'visit' });
  const title = t('metaTitle');
  const description = t('metaDescription');
  return {
    title,
    description,
    alternates: localeAlternates(locale, 'visitar'),
    openGraph: openGraphFor(locale, `${title} · Tabor`, description, 'visitar'),
  };
}

/**
 * Índice de las guías de lugares visitables.
 *
 * Hoy lleva a una sola —Tierra Santa—, y aun así existe: los viajes de Pablo
 * llegan en la siguiente tanda y ni la URL de la guía, ni el enlace del pie,
 * ni el rastro que deje el buscador tienen por qué cambiar cuando lleguen. Las
 * regiones se listan desde `VISIT_REGIONS`; la que aún no tiene sitios se
 * anuncia sin enlace, porque una tarjeta que no lleva a ninguna parte es peor
 * que una promesa honesta.
 */
export default async function VisitIndexPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('visit');

  const regions = VISIT_REGIONS.map((region) => ({
    region,
    count: sitesInRegion(region).length,
  }));

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
      <header className="mb-10">
        <h1 className="font-serif text-3xl text-stone-800 sm:text-4xl dark:text-sand-100">
          {t('title')}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-stone-700 dark:text-sand-200">
          {t('lede')}
        </p>
        <p className="mt-4 leading-relaxed text-stone-600 dark:text-sand-200">{t('criterion')}</p>
      </header>

      <ul className="space-y-4">
        {regions.map(({ region, count }) =>
          count > 0 ? (
            <li key={region}>
              <Link
                href={`/${REGION_PATH[region]}`}
                className="block rounded-lg border border-sand-200 bg-white/60 p-5 transition-colors hover:border-lapis-500 dark:border-stone-700 dark:bg-stone-800/60"
              >
                <h2 className="font-serif text-xl text-stone-800 dark:text-sand-100">
                  {t(`regions.${region}.name`)}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-600 dark:text-sand-200">
                  {t(`regions.${region}.lede`)}
                </p>
                <p className="mt-2 font-sans text-xs uppercase tracking-wide text-stone-600 dark:text-stone-300">
                  {t('sites', { count })}
                </p>
              </Link>
            </li>
          ) : (
            <li
              key={region}
              className="rounded-lg border border-dashed border-sand-300 p-5 dark:border-stone-600"
            >
              <h2 className="font-serif text-xl text-stone-700 dark:text-sand-200">
                {t(`regions.${region}.name`)}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-600 dark:text-sand-200">
                {t(`regions.${region}.lede`)}
              </p>
              <p className="mt-2 font-sans text-xs uppercase tracking-wide text-stone-600 dark:text-stone-300">
                {t('soon')}
              </p>
            </li>
          ),
        )}
      </ul>

      <p className="mt-10 border-t border-sand-200 pt-6 text-xs leading-relaxed text-stone-600 dark:border-stone-700 dark:text-stone-300">
        {t('sourceNote')}
      </p>
    </div>
  );
}
