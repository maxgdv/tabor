import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getLiturgicalSeason } from '@/lib/liturgical';
import type { LiturgicalSeason } from '@/lib/routes';
import { getVerseOfDayContent } from '@/lib/verse-of-day-content';
import { SeasonHighlight } from '@/components/SeasonHighlight';
import { SituationPlansSection } from '@/components/plans/SituationPlansSection';
import { VerseOfDayCard } from '@/components/VerseOfDayCard';

const SEASONS: readonly LiturgicalSeason[] = [
  'adviento',
  'navidad',
  'cuaresma',
  'semana-santa',
  'pascua',
];

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const [t, tPlaces, tVisit] = await Promise.all([
    getTranslations('home'),
    getTranslations('places'),
    getTranslations('visit'),
  ]);

  // Tiempo litúrgico actual; ?season= permite previsualizar cualquiera
  // fuera de fecha (útil para revisar el diseño en Tiempo Ordinario).
  const preview = typeof query.season === 'string' ? query.season : undefined;
  const season = SEASONS.includes(preview as LiturgicalSeason)
    ? (preview as LiturgicalSeason)
    : getLiturgicalSeason(new Date());

  const principles = ['rigor', 'calm', 'privacy', 'access'] as const;

  // Contenido fresco del día. Si el pasaje no estuviera disponible en la
  // versión de este idioma, la portada simplemente no muestra el bloque.
  const verse = await getVerseOfDayContent(locale);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-24">
      <section className="text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Tabor</p>
        <h1 className="mt-4 font-serif text-4xl font-semibold text-stone-800 sm:text-5xl dark:text-sand-100">
          {t('tagline')}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-stone-600 dark:text-sand-200">
          {t('lede')}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/leer"
            className="inline-flex items-center gap-2 rounded-md bg-lapis-500 px-5 py-3 font-sans text-sm font-medium text-white hover:bg-lapis-600"
          >
            {t('ctaRead')}
          </Link>
          <Link
            href="/leer/gen/12"
            className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-5 py-3 font-sans text-sm font-medium text-stone-700 hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-600 dark:text-sand-100 dark:hover:border-lapis-500"
          >
            {t('ctaExplore')}
            <span className="text-xs opacity-80">· Génesis 12</span>
          </Link>
          <Link
            href="/planes"
            className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-5 py-3 font-sans text-sm font-medium text-stone-700 hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-600 dark:text-sand-100 dark:hover:border-lapis-500"
          >
            {t('ctaPlans')}
          </Link>
          <Link
            href="/rutas"
            className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-5 py-3 font-sans text-sm font-medium text-stone-700 hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-600 dark:text-sand-100 dark:hover:border-lapis-500"
          >
            {t('ctaRoutes')}
          </Link>
          <Link
            href="/lugares"
            className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-5 py-3 font-sans text-sm font-medium text-stone-700 hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-600 dark:text-sand-100 dark:hover:border-lapis-500"
          >
            {tPlaces('title')}
          </Link>
        </div>
      </section>

      {/* Justo bajo el héroe: es lo único que cambia cada día, y quien vuelve
          a la portada viene a buscarlo. El destacado de temporada, que dura
          semanas, queda debajo. */}
      {verse && <VerseOfDayCard content={verse} locale={locale} />}

      {/* Antes del destacado de temporada: esto no se busca cuando toca el
          calendario, se busca el día que hace falta. */}
      <SituationPlansSection locale={locale} />

      {/* Enlace directo a la guía, no al hub: es la página que el proyecto
          quiere que se enlace desde fuera, y la portada es el sitio del que
          más fuerza recibe. Va aquí, por encima del destacado de temporada,
          porque no depende del calendario: quien planea un viaje lo planea en
          cualquier mes. Un botón más en la fila de arriba no valía —seis
          píldoras en un móvil no las lee nadie— y esto necesita dos líneas
          para explicarse. */}
      <section className="mt-16 rounded-lg border border-sand-300 bg-sand-100/70 p-8 dark:border-stone-600 dark:bg-stone-800/70">
        <h2 className="font-serif text-2xl text-stone-800 dark:text-sand-100">
          {tVisit('promo.homeTitle')}
        </h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-stone-700 dark:text-sand-200">
          {tVisit('promo.homeBody')}
        </p>
        <Link
          href="/visitar/tierra-santa"
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-lapis-500 px-5 py-3 font-sans text-sm font-medium text-white hover:bg-lapis-600"
        >
          {tVisit('promo.homeCta')}
        </Link>
      </section>

      {season && <SeasonHighlight season={season} locale={locale} />}

      <section className="mt-20 rounded-lg border border-sand-200 bg-white/60 p-8 dark:border-stone-700 dark:bg-stone-800/60">
        <h2 className="font-serif text-xl text-stone-800 dark:text-sand-100">{t('now.title')}</h2>
        <p className="mt-3 text-stone-600 dark:text-sand-200">{t('now.body')}</p>
      </section>

      <section className="mt-16">
        <h2 className="font-serif text-2xl text-stone-800 dark:text-sand-100">
          {t('principles.title')}
        </h2>
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {principles.map((key) => (
            <li
              key={key}
              className="rounded-lg border border-sand-200 bg-white/60 p-5 dark:border-stone-700 dark:bg-stone-800/60"
            >
              <h3 className="font-sans text-base font-semibold text-stone-800 dark:text-sand-100">
                {t(`principles.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-stone-600 dark:text-sand-200">
                {t(`principles.${key}.body`)}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
