// Capa de datos del dominio bíblico.
//
// Todo viene de Postgres vía @tabor/db: el texto de los versículos
// (verse_text), los lugares y los vínculos versículo↔lugar (verse_location).
//
// El texto procede de versiones católicas de dominio público (Straubinger en
// español, CPDV en inglés). Los datos geográficos proceden de
// OpenBible.info Bible Geocoding Data (CC-BY 4.0) — la atribución se
// muestra en la página del lector.

import { getChapterGeo, getChapterText, type DbPlace } from '@tabor/db';

export type Place = DbPlace;

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

// Versión bíblica por defecto para cada idioma de la interfaz.
// Ambas son de dominio público y de canon católico completo (73 libros).
const VERSION_BY_LOCALE: Record<string, string> = {
  es: 'STRA', // Biblia Platense (Straubinger)
  en: 'CPDV', // Catholic Public Domain Version
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
  const versionCode = VERSION_BY_LOCALE[locale] ?? VERSION_BY_LOCALE.es!;
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
