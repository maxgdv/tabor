// Capa de datos del dominio bíblico.
//
// Todo viene de Postgres vía @tabor/db: el texto de los versículos
// (verse_text), los lugares y los vínculos versículo↔lugar (verse_location).
//
// El texto procede de versiones católicas de dominio público (Straubinger en
// español, CPDV en inglés). Los datos geográficos proceden de
// OpenBible.info Bible Geocoding Data (CC-BY 4.0) — la atribución se
// muestra en la página del lector.

import { cache } from 'react';
import {
  getChapterGeo,
  getChapterText,
  listBooks as _listBooks,
  type DbBookSummary,
  type DbPlace,
} from '@tabor/db';

export type Place = DbPlace;
export type BookSummary = DbBookSummary;

/**
 * Lista de libros memoizada por petición. El SiteHeader (vía layout) y las
 * páginas de índice y selector de capítulo necesitan los 73 libros; sin
 * `cache()` cada petición HTTP dispararía la query 2-3 veces. Con argumento
 * primitivo (versionCode) para que React.cache pueda deduplicar.
 */
export const getBooks = cache(async (versionCode: string): Promise<BookSummary[]> => {
  return _listBooks({ versionCode });
});

/** Versión bíblica preferida para un locale de la interfaz. */
export function versionForLocale(locale: string): string {
  const map: Record<string, string> = { es: 'STRA', en: 'CPDV' };
  return map[locale] ?? 'STRA';
}

export type Verse = {
  number: number;
  text: string;
  placeSlugs: string[]; // lugares mencionados (vacío si el versículo no tiene vínculos)
};

export type Chapter = {
  bookCanonicalId: string;
  bookName: string;
  number: number;
  versionCode: string;
  versionFullName: string;
  copyright: string;
  verses: Verse[];
  places: Place[]; // lugares únicos del capítulo, en orden de aparición
};

/**
 * Devuelve un capítulo con su texto y los lugares mencionados.
 * `null` si el libro/capítulo no existe en la versión correspondiente.
 */
export async function getChapter(
  bookCanonicalId: string,
  number: number,
  locale: string,
): Promise<Chapter | null> {
  const versionCode = versionForLocale(locale);
  const upperBook = bookCanonicalId.toUpperCase();

  // Texto y geografía se piden en paralelo: dos round-trips a la BD sin esperar.
  const [text, geo] = await Promise.all([
    getChapterText({
      bookCanonicalId: upperBook,
      chapterNumber: number,
      versionCode,
    }),
    getChapterGeo({ bookCanonicalId: upperBook, chapterNumber: number }),
  ]);
  if (!text) return null;

  return {
    bookCanonicalId: text.bookCanonicalId,
    bookName: text.bookName,
    number: text.number,
    versionCode: text.versionCode,
    versionFullName: text.versionFullName,
    copyright: text.copyright,
    verses: text.verses.map((v) => ({
      number: v.number,
      text: v.text,
      placeSlugs: geo.placeSlugsByVerse[v.number] ?? [],
    })),
    places: geo.places,
  };
}

/** Atajo conveniente para la página del lector. */
export function getPlacesForChapter(chapter: Chapter): Place[] {
  return chapter.places;
}
