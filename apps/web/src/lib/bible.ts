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
  getBookSummary as _getBookSummary,
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

/**
 * Resumen de un libro memoizado por petición: `generateMetadata` y el cuerpo
 * de la página del libro piden lo mismo en la misma petición HTTP.
 */
export const getBookSummaryCached = cache(
  async (bookCanonicalId: string, versionCode: string): Promise<DbBookSummary | null> => {
    return _getBookSummary({ bookCanonicalId, versionCode });
  },
);

/** Versión bíblica preferida para un locale de la interfaz. */
export function versionForLocale(locale: string): string {
  const map: Record<string, string> = { es: 'STRA', en: 'CPDV' };
  return map[locale] ?? 'STRA';
}

// --- Lectura comparada ------------------------------------------------------
// Versiones disponibles como segunda columna. `param` viaja en ?vs= y `lang`
// alimenta el atributo lang del texto secundario (a11y: pronunciación).

export type CompareOption = { code: string; param: string; lang: string };

export const COMPARE_VERSIONS: CompareOption[] = [
  { code: 'STRA', param: 'stra', lang: 'es' },
  { code: 'CPDV', param: 'cpdv', lang: 'en' },
  { code: 'VUL', param: 'vul', lang: 'la' },
];

/** Opción de comparación válida para `?vs=`, o `null` (incluye "contra sí misma"). */
export function resolveCompare(
  param: string | undefined,
  primaryVersionCode: string,
): CompareOption | null {
  if (!param) return null;
  const option = COMPARE_VERSIONS.find((v) => v.param === param.toLowerCase());
  return option && option.code !== primaryVersionCode ? option : null;
}

export type SecondaryChapter = {
  versionCode: string;
  versionFullName: string;
  copyright: string;
  lang: string;
  /** Texto por número de versículo (los huecos de versificación quedan fuera). */
  byVerse: Record<number, string>;
};

/** Texto de un capítulo en la versión de comparación, alineado por versículo. */
export async function getSecondaryChapter(
  bookCanonicalId: string,
  number: number,
  option: CompareOption,
): Promise<SecondaryChapter | null> {
  const text = await getChapterText({
    bookCanonicalId: bookCanonicalId.toUpperCase(),
    chapterNumber: number,
    versionCode: option.code,
  });
  if (!text) return null;
  const byVerse: Record<number, string> = {};
  for (const v of text.verses) byVerse[v.number] = v.text;
  return {
    versionCode: text.versionCode,
    versionFullName: text.versionFullName,
    copyright: text.copyright,
    lang: option.lang,
    byVerse,
  };
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
 * Memoizada por petición: `generateMetadata` y el cuerpo de la página
 * comparten el resultado sin repetir queries.
 */
export const getChapter = cache(async (
  bookCanonicalId: string,
  number: number,
  locale: string,
): Promise<Chapter | null> => {
  const versionCode = versionForLocale(locale);
  const upperBook = bookCanonicalId.toUpperCase();

  // Texto y geografía se piden en paralelo: dos round-trips a la BD sin esperar.
  const [text, geo] = await Promise.all([
    getChapterText({
      bookCanonicalId: upperBook,
      chapterNumber: number,
      versionCode,
    }),
    getChapterGeo({ bookCanonicalId: upperBook, chapterNumber: number, language: locale }),
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
});

/** Atajo conveniente para la página del lector. */
export function getPlacesForChapter(chapter: Chapter): Place[] {
  return chapter.places;
}
