// Consultas de dominio reutilizables. Viven en el paquete @tabor/db para que
// la app web no tenga que conocer Drizzle ni el esquema: importa funciones,
// no tablas.

import { and, asc, eq, sql } from 'drizzle-orm';
import { db } from './index';
import { book, bookTranslation, chapter, verse, verseText, version } from './schema/bible';
import { place, verseLocation } from './schema/geo';

export type DbVerse = {
  number: number;
  text: string;
};

export type DbChapter = {
  bookCanonicalId: string;
  bookName: string;
  number: number;
  versionCode: string;
  versionFullName: string;
  copyright: string;
  verses: DbVerse[];
};

/**
 * Devuelve un capítulo completo en una versión dada, o `null` si no existe
 * el libro, el capítulo, la versión o no hay texto importado para esa combinación.
 */
export async function getChapterText(opts: {
  bookCanonicalId: string; // 'GEN', 'MAT', ... (mayúsculas)
  chapterNumber: number;
  versionCode: string; // 'STRA', 'CPDV', ...
}): Promise<DbChapter | null> {
  const [ver] = await db.select().from(version).where(eq(version.code, opts.versionCode));
  if (!ver) return null;

  const [bk] = await db.select().from(book).where(eq(book.canonicalId, opts.bookCanonicalId));
  if (!bk) return null;

  const [ch] = await db
    .select()
    .from(chapter)
    .where(and(eq(chapter.bookId, bk.id), eq(chapter.number, opts.chapterNumber)));
  if (!ch) return null;

  const rows = await db
    .select({ number: verse.number, text: verseText.text })
    .from(verse)
    .innerJoin(
      verseText,
      and(eq(verseText.verseId, verse.id), eq(verseText.versionId, ver.id)),
    )
    .where(eq(verse.chapterId, ch.id))
    .orderBy(asc(verse.number));
  if (rows.length === 0) return null;

  const [bt] = await db
    .select()
    .from(bookTranslation)
    .where(and(eq(bookTranslation.bookId, bk.id), eq(bookTranslation.versionId, ver.id)));

  return {
    bookCanonicalId: bk.canonicalId,
    bookName: bt?.name ?? bk.canonicalId,
    number: ch.number,
    versionCode: ver.code,
    versionFullName: ver.fullName,
    copyright: ver.copyright,
    verses: rows,
  };
}

// --- Geografía ------------------------------------------------------------

export type DbPlace = {
  slug: string;
  canonicalName: string;
  modernName: string | null;
  description: string | null;
  lng: number;
  lat: number;
};

export type DbChapterGeo = {
  /** Lugares únicos del capítulo, en orden de primera aparición. */
  places: DbPlace[];
  /** Mapa nº de versículo → slugs de los lugares mencionados en él. */
  placeSlugsByVerse: Record<number, string[]>;
};

/**
 * Devuelve los lugares mencionados en un capítulo y los vínculos
 * versículo→lugar, leyendo `verse_location` (poblado desde OpenBible.info).
 * Devuelve `{ places: [], placeSlugsByVerse: {} }` si no hay vínculos.
 */
export async function getChapterGeo(opts: {
  bookCanonicalId: string;
  chapterNumber: number;
}): Promise<DbChapterGeo> {
  const [bk] = await db.select().from(book).where(eq(book.canonicalId, opts.bookCanonicalId));
  if (!bk) return { places: [], placeSlugsByVerse: {} };

  const [ch] = await db
    .select()
    .from(chapter)
    .where(and(eq(chapter.bookId, bk.id), eq(chapter.number, opts.chapterNumber)));
  if (!ch) return { places: [], placeSlugsByVerse: {} };

  // Una sola consulta: versículo + lugar (con lon/lat extraídos del geography).
  const rows = await db
    .select({
      verseNumber: verse.number,
      slug: place.slug,
      canonicalName: place.canonicalName,
      modernName: place.modernName,
      description: place.description,
      lng: sql<number>`ST_X(${place.geom}::geometry)`,
      lat: sql<number>`ST_Y(${place.geom}::geometry)`,
    })
    .from(verse)
    .innerJoin(verseLocation, eq(verseLocation.verseId, verse.id))
    .innerJoin(place, eq(place.id, verseLocation.placeId))
    .where(eq(verse.chapterId, ch.id))
    .orderBy(asc(verse.number), asc(place.slug));

  const placeBySlug = new Map<string, DbPlace>();
  const placeSlugsByVerse: Record<number, string[]> = {};
  for (const r of rows) {
    if (!placeBySlug.has(r.slug)) {
      placeBySlug.set(r.slug, {
        slug: r.slug,
        canonicalName: r.canonicalName,
        modernName: r.modernName,
        description: r.description,
        lng: Number(r.lng),
        lat: Number(r.lat),
      });
    }
    (placeSlugsByVerse[r.verseNumber] ??= []).push(r.slug);
  }
  return { places: Array.from(placeBySlug.values()), placeSlugsByVerse };
}

/** Nº de capítulos de un libro en una versión — útil para navegación. */
export async function getChapterCount(bookCanonicalId: string): Promise<number> {
  const [bk] = await db.select().from(book).where(eq(book.canonicalId, bookCanonicalId));
  if (!bk) return 0;
  const chapters = await db.select({ id: chapter.id }).from(chapter).where(eq(chapter.bookId, bk.id));
  return chapters.length;
}
