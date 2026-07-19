import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/lib/routes';
import { localeAlternates, openGraphFor } from '@/lib/seo';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'routes' });
  return {
    title: t('title'),
    description: t('lede'),
    alternates: localeAlternates(locale, 'rutas'),
    openGraph: openGraphFor(locale, `${t('title')} · Tabor`, t('lede'), 'rutas'),
  };
}

export default async function RoutesIndexPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('routes');
  const lang = locale === 'en' ? 'en' : 'es';

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
      <header className="mb-10">
        <h1 className="font-serif text-3xl text-stone-800 sm:text-4xl dark:text-sand-100">
          {t('title')}
        </h1>
        <p className="mt-4 max-w-2xl text-stone-600 dark:text-sand-200">{t('lede')}</p>
      </header>

      <ul className="space-y-4">
        {ROUTES.map((route) => (
          <li key={route.slug}>
            <Link
              href={`/rutas/${route.slug}`}
              className="block rounded-lg border border-sand-200 bg-white/60 p-5 transition-colors hover:border-lapis-500 dark:border-stone-700 dark:bg-stone-800/60"
            >
              <h2 className="font-serif text-xl text-stone-800 dark:text-sand-100">
                {route.name[lang]}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-600 dark:text-sand-200">
                {route.description[lang]}
              </p>
              <p className="mt-2 font-sans text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
                {t('stops', { count: route.stops.length })}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
