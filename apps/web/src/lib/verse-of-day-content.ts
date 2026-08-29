// Resolución del versículo del día a texto listo para pintar.
//
// `verse-of-day.ts` decide *qué* pasaje toca hoy (puro, testeable, sin BD);
// este módulo es la capa que lo convierte en contenido: carga el capítulo,
// recorta el rango de versículos y compone la referencia legible y el
// deep-link al lector.
//
// Vive aparte para que la portada y la página del versículo compartan una
// única fuente: si el cálculo o el formato cambian, cambian en los dos sitios
// a la vez. Memoizado con React.cache para que `generateMetadata` y el cuerpo
// de la página no repitan la query del capítulo en la misma petición.

import { cache } from 'react';
import { getChapter, type Verse } from './bible';
import { getLiturgicalSeason } from './liturgical';
import type { LiturgicalSeason } from './routes';
import {
  formatReference,
  stripUnpairedQuotes,
  verseOfDay,
  type VerseOfDayEntry,
} from './verse-of-day';

export type VerseOfDayContent = {
  entry: VerseOfDayEntry;
  /** Solo los versículos del rango, en orden. Nunca vacío. */
  verses: Verse[];
  /** «Juan 3, 16» / «Juan 3, 16-18». */
  reference: string;
  bookName: string;
  /** Ruta del lector con ancla al primer versículo: '/leer/jhn/3#v16'. */
  chapterHref: string;
  versionFullName: string;
  copyright: string;
  /** Tiempo litúrgico de hoy, o `null` en Tiempo Ordinario. */
  season: LiturgicalSeason | null;
};

/**
 * El versículo de hoy con su texto, o `null` si el capítulo no está en la
 * versión de este locale (pasaje mal referenciado en el pool, o versión
 * incompleta): quien llama decide si es un 404 o simplemente no pinta nada.
 */
export const getVerseOfDayContent = cache(
  async (locale: string): Promise<VerseOfDayContent | null> => {
    const today = new Date();
    const entry = verseOfDay(today);

    // urlSegment del lector = canonicalId en minúsculas (packages/db/src/queries.ts).
    const urlSegment = entry.book.toLowerCase();
    const chapter = await getChapter(urlSegment, entry.chapter, locale);
    if (!chapter) return null;

    const [from, to] = entry.verses;
    const inRange = chapter.verses.filter((v) => v.number >= from && v.number <= to);
    if (inRange.length === 0) return null;

    // Fuera de su capítulo, un diálogo abierto en el extracto puede quedarse
    // con comillas sin cerrar (Jn 14, 1 en CPDV): se retiran las huérfanas.
    const texts = stripUnpairedQuotes(inRange.map((v) => v.text));
    const verses = inRange.map((v, i) => ({ ...v, text: texts[i]! }));

    return {
      entry,
      verses,
      reference: formatReference(entry, chapter.bookName),
      bookName: chapter.bookName,
      chapterHref: `/leer/${urlSegment}/${entry.chapter}#v${from}`,
      versionFullName: chapter.versionFullName,
      copyright: chapter.copyright,
      season: getLiturgicalSeason(today),
    };
  },
);

/** Fecha de hoy en palabras, en la zona de referencia del versículo. */
export function formatToday(locale: string, date = new Date()): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeZone: 'Europe/Madrid',
  }).format(date);
}
