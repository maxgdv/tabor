import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getPlanProgress, listPlacesBySlugs } from '@tabor/db';
import { Link } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import { getRoute, routeProgressSlug, routeReadingHref, routeReadingLabel } from '@/lib/routes';
import { localeAlternates, openGraphFor } from '@/lib/seo';
import { RouteExplorer, type ExplorerStop } from '@/components/routes/RouteExplorer';

type Params = Promise<{ locale: string; ruta: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, ruta: slug } = await params;
  const route = getRoute(slug);
  if (!route) return {};
  const lang = locale === 'en' ? 'en' : 'es';
  const path = `rutas/${route.slug}`;
  return {
    title: route.name[lang],
    description: route.description[lang],
    alternates: localeAlternates(locale, path),
    openGraph: openGraphFor(locale, `${route.name[lang]} · Tabor`, route.description[lang], path),
  };
}

export default async function RoutePage({ params }: { params: Params }) {
  const { locale, ruta: slug } = await params;
  setRequestLocale(locale);

  const route = getRoute(slug);
  if (!route) notFound();

  const t = await getTranslations('routes');
  const lang = locale === 'en' ? 'en' : 'es';
  const progressSlug = routeProgressSlug(route.slug);

  // Coordenadas y nombre localizado de las paradas + progreso, en paralelo.
  const session = await auth.api.getSession({ headers: await headers() });
  const [places, serverProgress] = await Promise.all([
    listPlacesBySlugs({ slugs: route.stops.map((s) => s.placeSlug), language: locale }),
    session
      ? getPlanProgress({ userId: session.user.id }).then((p) => p[progressSlug] ?? [])
      : null,
  ]);
  const placeBySlug = new Map(places.map((p) => [p.slug, p]));

  const stops: ExplorerStop[] = [];
  for (const stop of route.stops) {
    const place = placeBySlug.get(stop.placeSlug);
    if (!place) {
      // Un slug caído del dataset geográfico no debe romper la ruta entera.
      console.warn(`[rutas] lugar desconocido en ${route.slug}: ${stop.placeSlug}`);
      continue;
    }
    stops.push({
      slug: place.slug,
      name: place.name,
      lng: place.lng,
      lat: place.lat,
      title: stop.title[lang],
      note: stop.note[lang],
      readings: stop.readings.map((reading) => ({
        label: routeReadingLabel(reading, lang),
        href: routeReadingHref(reading),
      })),
    });
  }
  if (stops.length === 0) notFound();

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col">
      <div className="border-b border-sand-200 bg-sand-50/60 px-4 py-2.5 backdrop-blur sm:px-6 dark:border-stone-700 dark:bg-stone-900/60">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <nav aria-label={t('breadcrumb')} className="font-sans text-xs uppercase tracking-[0.18em] text-stone-500">
            <Link href="/rutas" className="hover:text-stone-800 dark:hover:text-sand-200">
              {t('title')}
            </Link>
          </nav>
          <h1 className="font-serif text-lg text-stone-800 dark:text-sand-100">
            {route.name[lang]}
          </h1>
        </div>
      </div>

      <RouteExplorer
        key={serverProgress ? `auth:${serverProgress.join('.')}` : 'guest'}
        progressSlug={progressSlug}
        stops={stops}
        serverProgress={serverProgress}
      />
    </div>
  );
}
