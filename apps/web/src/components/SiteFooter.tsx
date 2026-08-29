import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export async function SiteFooter() {
  const [t, tVerse, tPlaces, tVisit, tFeedback] = await Promise.all([
    getTranslations('footer'),
    getTranslations('verseOfDay'),
    getTranslations('places'),
    getTranslations('visit'),
    getTranslations('feedback'),
  ]);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-sand-200 bg-sand-50/80 dark:border-stone-700 dark:bg-stone-900/80">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-start justify-between gap-2 px-6 py-6 text-xs text-stone-500 sm:flex-row sm:items-center dark:text-stone-400">
        <p>{t('copy', { year })}</p>
        <nav aria-label={t('navLabel')} className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <Link
            href="/versiculo-del-dia"
            className="underline-offset-2 hover:text-stone-700 hover:underline dark:hover:text-sand-200"
          >
            {tVerse('title')}
          </Link>
          {/* El índice de lugares vive aquí para que cada página del sitio
              enlace al contenido propio del proyecto: es la vía por la que
              Google alcanza las fichas de los lugares. */}
          <Link
            href="/lugares"
            className="underline-offset-2 hover:text-stone-700 hover:underline dark:hover:text-sand-200"
          >
            {tPlaces('title')}
          </Link>
          {/* El hub y no la guía de Tierra Santa: es el índice de la sección
              —como /lugares lo es del atlas— y no habrá que tocar el pie
              cuando lleguen los viajes de Pablo. La guía recibe desde la
              portada, desde /lugares y desde cada ficha visitable, que es
              donde el enlace además viene a cuento. */}
          <Link
            href="/visitar"
            className="underline-offset-2 hover:text-stone-700 hover:underline dark:hover:text-sand-200"
          >
            {tVisit('title')}
          </Link>
          <Link
            href="/comentarios"
            className="underline-offset-2 hover:text-stone-700 hover:underline dark:hover:text-sand-200"
          >
            {tFeedback('title')}
          </Link>
          <a
            href="https://github.com/maxgdv/tabor"
            target="_blank"
            rel="noreferrer noopener"
            className="underline-offset-2 hover:text-stone-700 hover:underline dark:hover:text-sand-200"
          >
            {t('spec')}
          </a>
        </nav>
      </div>
    </footer>
  );
}
