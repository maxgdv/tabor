import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { VerseOfDayContent } from '@/lib/verse-of-day-content';

type Props = { content: VerseOfDayContent; locale: string };

/**
 * Bloque del versículo del día en la portada: el texto tal cual, sereno, con
 * salida a la página propia. Recibe el contenido ya resuelto para no repetir
 * el cálculo ni la query del capítulo (lo hace la página que lo monta).
 */
export function VerseOfDayCard({ content, locale }: Props) {
  const t = useTranslations('verseOfDay');
  // El texto bíblico va en el idioma de su versión (STRA es, CPDV en), que
  // coincide con el de la interfaz; explícito para el lector de pantalla.
  const textLang = locale === 'en' ? 'en' : 'es';

  return (
    <section
      aria-labelledby="verse-of-day-heading"
      className="mt-14 rounded-lg border border-sand-200 bg-white/60 p-6 sm:p-8 dark:border-stone-700 dark:bg-stone-800/60"
    >
      <h2
        id="verse-of-day-heading"
        className="font-sans text-xs uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400"
      >
        {t('title')}
      </h2>
      <figure className="mt-4">
        <blockquote
          lang={textLang}
          className="font-serif text-xl leading-relaxed text-stone-800 sm:text-2xl dark:text-sand-100"
        >
          {content.verses.map((verse) => (
            <span key={verse.number}>{verse.text} </span>
          ))}
        </blockquote>
        <figcaption className="mt-3 font-sans text-sm text-stone-600 dark:text-sand-200">
          <cite className="not-italic">{content.reference}</cite>
        </figcaption>
      </figure>
      <p className="mt-5">
        <Link
          href="/versiculo-del-dia"
          className="inline-flex items-center gap-1.5 font-sans text-sm text-lapis-600 underline-offset-2 hover:underline dark:text-lapis-300"
        >
          {t('cardLink')}
          <span aria-hidden="true">→</span>
        </Link>
      </p>
    </section>
  );
}
