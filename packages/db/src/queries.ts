// Consultas de dominio reutilizables. Viven en el paquete @tabor/db para que
// la app web no tenga que conocer Drizzle ni el esquema: importa funciones,
// no tablas.

import { and, asc, desc, eq, sql } from 'drizzle-orm';
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

// --- Navegación (índices de libros y capítulos, prev/next) ---------------

export type DbBookSummary = {
  canonicalId: string; // 'GEN', '1SA', ...
  urlSegment: string; // 'gen', '1sa' — lo que va en la URL del lector
  testament: string; // 'OT' | 'NT'
  category: string; // 'pentateuch', 'gospels', ...
  orderIndex: number;
  name: string; // nombre del libro en la versión solicitada
  shortName: string;
  chapterCount: number;
};

/**
 * Devuelve los 73 libros del canon en orden canónico, con su nombre localizado
 * para la versión indicada y el nº de capítulos. Si un libro no tiene
 * traducción para esa versión, cae al canonicalId como nombre.
 */
export async function listBooks(opts: { versionCode: string }): Promise<DbBookSummary[]> {
  const [ver] = await db.select().from(version).where(eq(version.code, opts.versionCode));
  if (!ver) return [];

  // Una sola pasada: book LEFT JOIN book_translation (de esa versión).
  const bookRows = await db
    .select({
      id: book.id,
      canonicalId: book.canonicalId,
      testament: book.testament,
      category: book.category,
      orderIndex: book.orderIndex,
      name: bookTranslation.name,
      shortName: bookTranslation.shortName,
    })
    .from(book)
    .leftJoin(
      bookTranslation,
      and(eq(bookTranslation.bookId, book.id), eq(bookTranslation.versionId, ver.id)),
    )
    .orderBy(asc(book.orderIndex));

  // Conteos en una sola query agrupada.
  const counts = await db
    .select({ bookId: chapter.bookId, count: sql<number>`count(*)::int` })
    .from(chapter)
    .groupBy(chapter.bookId);
  const countByBookId = new Map(counts.map((c) => [c.bookId, c.count]));

  return bookRows.map((b) => ({
    canonicalId: b.canonicalId,
    urlSegment: b.canonicalId.toLowerCase(),
    testament: b.testament,
    category: b.category,
    orderIndex: b.orderIndex,
    name: b.name ?? b.canonicalId,
    shortName: b.shortName ?? b.canonicalId,
    chapterCount: countByBookId.get(b.id) ?? 0,
  }));
}

/** Resumen de un único libro (mismo shape que listBooks). */
export async function getBookSummary(opts: {
  bookCanonicalId: string;
  versionCode: string;
}): Promise<DbBookSummary | null> {
  const [bk] = await db.select().from(book).where(eq(book.canonicalId, opts.bookCanonicalId));
  if (!bk) return null;

  const [ver] = await db.select().from(version).where(eq(version.code, opts.versionCode));
  const versionId = ver?.id;

  const [bt] = versionId
    ? await db
        .select()
        .from(bookTranslation)
        .where(
          and(eq(bookTranslation.bookId, bk.id), eq(bookTranslation.versionId, versionId)),
        )
    : [];

  const [cnt] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(chapter)
    .where(eq(chapter.bookId, bk.id));

  return {
    canonicalId: bk.canonicalId,
    urlSegment: bk.canonicalId.toLowerCase(),
    testament: bk.testament,
    category: bk.category,
    orderIndex: bk.orderIndex,
    name: bt?.name ?? bk.canonicalId,
    shortName: bt?.shortName ?? bk.canonicalId,
    chapterCount: cnt?.c ?? 0,
  };
}

/**
 * Capítulo inmediatamente anterior o posterior al dado, cruzando libros
 * si hace falta. Usa comparación de tuplas (orderIndex, chapter.number)
 * para encontrar el vecino global en orden canónico.
 * Si `versionCode` se proporciona, incluye el nombre localizado del libro vecino.
 * Devuelve `null` en los extremos (Gn 1 prev / Ap último-cap next).
 */
export async function getAdjacentChapter(opts: {
  bookCanonicalId: string;
  chapterNumber: number;
  direction: 'prev' | 'next';
  versionCode?: string;
}): Promise<{
  bookCanonicalId: string;
  bookUrlSegment: string;
  chapterNumber: number;
  bookName: string;
} | null> {
  const [bk] = await db.select().from(book).where(eq(book.canonicalId, opts.bookCanonicalId));
  if (!bk) return null;

  const versionId = opts.versionCode
    ? (await db.select().from(version).where(eq(version.code, opts.versionCode)))[0]?.id
    : undefined;

  const cmp =
    opts.direction === 'next'
      ? sql`(${book.orderIndex}, ${chapter.number}) > (${bk.orderIndex}, ${opts.chapterNumber})`
      : sql`(${book.orderIndex}, ${chapter.number}) < (${bk.orderIndex}, ${opts.chapterNumber})`;
  const order =
    opts.direction === 'next'
      ? [asc(book.orderIndex), asc(chapter.number)]
      : [desc(book.orderIndex), desc(chapter.number)];

  const query = db
    .select({
      bookCanonicalId: book.canonicalId,
      chapterNumber: chapter.number,
      bookName: bookTranslation.name,
    })
    .from(chapter)
    .innerJoin(book, eq(book.id, chapter.bookId))
    .leftJoin(
      bookTranslation,
      and(
        eq(bookTranslation.bookId, book.id),
        // Si no hay versionId, el join no aporta nada pero no rompe.
        versionId !== undefined ? eq(bookTranslation.versionId, versionId) : sql`false`,
      ),
    )
    .where(cmp)
    .orderBy(...order)
    .limit(1);

  const [row] = await query;
  if (!row) return null;
  return {
    bookCanonicalId: row.bookCanonicalId,
    bookUrlSegment: row.bookCanonicalId.toLowerCase(),
    chapterNumber: row.chapterNumber,
    bookName: row.bookName ?? row.bookCanonicalId,
  };
}
