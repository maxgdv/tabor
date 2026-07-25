import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { SITE_URL, localeAlternates, openGraphFor, verseSnippet } from '@/lib/seo';
import { formatToday, getVerseOfDayContent } from '@/lib/verse-of-day-content';
import { SeasonBadge } from '@/components/SeasonBadge';

type Params = Promise<{ locale: string }>;

// El versículo es el mismo para todos durante todo el día, pero el día
// cambia: una hora de caché sirve la página al instante sin que el pasaje se
// quede congelado. (Hoy el layout declara `force-dynamic` por culpa del
// SiteHeader, así que esto solo entra en juego cuando esa restricción caiga;
// se deja declarado porque es lo que le corresponde a esta página.)
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'verseOfDay' });
  const content = await getVerseOfDayContent(locale);
  const title = t('title');

  if (!content) {
    return {
      title,
      description: t('lede'),
      alternates: localeAlternates(locale, 'versiculo-del-dia'),
      openGraph: openGraphFor(locale, `${title} · Tabor`, t('lede'), 'versiculo-del-dia'),
    };
  }

  // Título y descripción cambian cada día: el título lleva la referencia y la
  // descripción, el propio texto del versículo.
  const pageTitle = `${content.reference} · ${title}`;
  const description = t('metaDescription', {
    snippet: verseSnippet(content.verses),
    reference: content.reference,
  });

  return {
    title: pageTitle,
    description,
    alternates: localeAlternates(locale, 'versiculo-del-dia'),
    openGraph: openGraphFor(locale, `${pageTitle} · Tabor`, description, 'versiculo-del-dia'),
  };
}

export default async function VerseOfDayPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('verseOfDay');
  const content = await getVerseOfDayContent(locale);
  if (!content) notFound();

  // El texto bíblico va en el idioma de su versión (STRA es, CPDV en), que
  // coincide con el de la interfaz; explícito para el lector de pantalla.
  const textLang = locale === 'en' ? 'en' : 'es';
  const single = content.verses.length === 1;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
      <header className="mb-10">
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
          {formatToday(locale)}
        </p>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="font-serif text-3xl text-stone-800 sm:text-4xl dark:text-sand-100">
            {t('title')}
          </h1>
          {content.season && <SeasonBadge season={content.season} />}
        </div>
        <p className="mt-4 max-w-2xl text-stone-600 dark:text-sand-200">{t('lede')}</p>
      </header>

      {/* La pieza protagonista: el texto, grande y sin adornos alrededor. */}
      <figure className="rounded-lg border border-sand-200 bg-white/60 px-6 py-10 sm:px-10 sm:py-12 dark:border-stone-700 dark:bg-stone-800/60">
        <blockquote
          lang={textLang}
          // `cite` quiere la URL absoluta del origen de la cita.
          cite={`${SITE_URL}/${locale}${content.chapterHref}`}
          className="font-serif text-2xl leading-relaxed text-stone-800 sm:text-3xl sm:leading-[1.5] dark:text-sand-100"
        >
          {content.verses.map((verse) => (
            <span key={verse.number}>
              {/* Con un solo versículo el número es ruido: ya está en la
                  referencia de abajo. En un rango orienta la lectura. */}
              {!single && (
                <sup className="mr-1 select-none font-sans text-xs text-stone-500 dark:text-stone-400">
                  {verse.number}
                </sup>
              )}
              {verse.text}{' '}
            </span>
          ))}
        </blockquote>
        <figcaption className="mt-6 font-sans text-sm text-stone-600 dark:text-sand-200">
          <cite className="not-italic">{content.reference}</cite>
        </figcaption>
      </figure>

      <p className="mt-8">
        <Link
          href={content.chapterHref}
          aria-label={t('readChapterAria', { reference: content.reference })}
          className="inline-flex items-center gap-2 rounded-md bg-lapis-500 px-5 py-3 font-sans text-sm font-medium text-white hover:bg-lapis-600"
        >
          {t('readChapter')}
          <span aria-hidden="true">→</span>
        </Link>
      </p>

      {/* Honestidad: esto no es el leccionario del día (ver verse-of-day.ts). */}
      <p className="mt-6 max-w-2xl font-sans text-sm text-stone-600 dark:text-sand-200">
        {t('notLectionary')}
      </p>

      <section className="mt-12 border-t border-sand-200 pt-8 dark:border-stone-700">
        <h2 className="font-serif text-xl text-stone-800 dark:text-sand-100">
          {t('continueTitle')}
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          <li>
            <Link
              href="/planes"
              className="inline-block rounded-md border border-stone-300 px-4 py-2 font-sans text-sm text-stone-700 transition-colors hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-600 dark:text-sand-100 dark:hover:border-lapis-500"
            >
              {t('continuePlans')}
            </Link>
          </li>
          <li>
            <Link
              href="/rutas"
              className="inline-block rounded-md border border-stone-300 px-4 py-2 font-sans text-sm text-stone-700 transition-colors hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-600 dark:text-sand-100 dark:hover:border-lapis-500"
            >
              {t('continueRoutes')}
            </Link>
          </li>
        </ul>
      </section>

      <footer className="mt-12 border-t border-sand-200 pt-6 font-sans text-xs text-stone-500 dark:border-stone-700 dark:text-stone-400">
        <p>{content.versionFullName}</p>
        <p className="mt-1">{content.copyright}</p>
      </footer>
    </div>
  );
}
