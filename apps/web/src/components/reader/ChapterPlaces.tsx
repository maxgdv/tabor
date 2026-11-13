import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import type { Chapter } from '@/lib/bible';
import { chapterPlaceEntries } from '@/lib/places';

/**
 * «Lugares de este capítulo»: la lista, bajo el texto, de los lugares que el
 * capítulo nombra, con enlace a la ficha de cada uno.
 *
 * Componente de servidor a propósito. El mapa ya muestra estos lugares, pero
 * sus marcadores se pintan con JavaScript: un buscador que lee el HTML no
 * veía ningún enlace del capítulo a `/lugares`, y un lector en el móvil —con
 * el mapa recogido en la hoja inferior— tampoco tenía cómo saltar a la ficha.
 * Aquí los enlaces son `<a>` de verdad en el HTML estático.
 *
 * El criterio de qué se enlaza y qué solo se nombra está en
 * `chapterPlaceEntries` (lib/places.ts).
 */
export async function ChapterPlaces({ chapter }: { chapter: Chapter }) {
  const entries = chapterPlaceEntries(chapter);
  if (entries.length === 0) return null;

  const t = await getTranslations('reader');

  return (
    <section
      aria-labelledby="lugares-del-capitulo"
      className="mt-14 border-t border-sand-200 pt-8 dark:border-stone-700"
    >
      <h2 id="lugares-del-capitulo" className="font-serif text-xl text-stone-800 dark:text-sand-100">
        {t('placesHeading')}
      </h2>
      <p className="mt-2 font-sans text-sm leading-relaxed text-stone-600 dark:text-stone-300">
        {t('placesLede')}
      </p>
      <ul className="mt-4 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
        {entries.map((entry) => (
          <li
            key={entry.slug}
            className="flex items-baseline justify-between gap-3 border-b border-sand-200/70 py-2 dark:border-stone-700/70"
          >
            {entry.hasPage ? (
              <Link
                href={`/lugares/${entry.slug}`}
                // Sin precarga: un capítulo como Josué 15 nombra 163 lugares
                // y cada precarga es una petición (y, si la ficha aún no está
                // generada, una escritura de ISR) por cada lector que llega
                // al final del texto.
                prefetch={false}
                className="font-serif text-base text-lapis-600 underline decoration-lapis-500/40 underline-offset-4 hover:decoration-lapis-500 dark:text-lapis-300"
              >
                {entry.name}
              </Link>
            ) : (
              <span className="font-serif text-base text-stone-700 dark:text-sand-200">
                {entry.name}
              </span>
            )}
            {entry.verseCount > 0 && (
              <span className="shrink-0 font-sans text-xs text-stone-500 dark:text-stone-400">
                {t('placesVerses', { count: entry.verseCount, refs: entry.verseRefs })}
              </span>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-5">
        <Link
          href="/lugares"
          prefetch={false}
          className="font-sans text-sm text-stone-600 underline underline-offset-4 hover:text-lapis-600 dark:text-stone-300 dark:hover:text-lapis-300"
        >
          {t('placesAll')}
        </Link>
      </p>
    </section>
  );
}
