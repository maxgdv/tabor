// Consultas de dominio reutilizables. Viven en el paquete @tabor/db para que
// la app web no tenga que conocer Drizzle ni el esquema: importa funciones,
// no tablas.

import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { db } from './index';
import { book, bookTranslation, chapter, verse, verseText, version } from './schema/bible';
import { place, placeAlternateName, verseLocation } from './schema/geo';

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
  /** Nombre para mostrar: la traducción al idioma pedido si existe; si no,
   *  el canónico sin el sufijo numérico de desambiguación ("Bethel 1" → "Bethel"). */
  name: string;
  canonicalName: string;
  modernName: string | null;
  description: string | null;
  lng: number;
  lat: number;
};

/** "Bethel 1" → "Bethel". El sufijo numérico desambigua homónimos en el
 *  dataset de OpenBible; es metadato, no parte del nombre visible. */
function stripDisambiguation(canonicalName: string): string {
  return canonicalName.replace(/\s+\d+$/, '');
}

export type DbChapterGeo = {
  /** Lugares únicos del capítulo, en orden de primera aparición. */
  places: DbPlace[];
  /** Mapa nº de versículo → slugs de los lugares mencionados en él. */
  placeSlugsByVerse: Record<number, string[]>;
};

/**
 * Devuelve los lugares mencionados en un capítulo y los vínculos
 * versículo→lugar, leyendo `verse_location` (poblado desde OpenBible.info).
 * Si se pasa `language`, resuelve el nombre visible contra
 * `place_alternate_name` (dataset curado); sin traducción disponible cae al
 * nombre canónico limpio.
 * Devuelve `{ places: [], placeSlugsByVerse: {} }` si no hay vínculos.
 */
export async function getChapterGeo(opts: {
  bookCanonicalId: string;
  chapterNumber: number;
  language?: string; // 'es', 'en', ...
}): Promise<DbChapterGeo> {
  const [bk] = await db.select().from(book).where(eq(book.canonicalId, opts.bookCanonicalId));
  if (!bk) return { places: [], placeSlugsByVerse: {} };

  const [ch] = await db
    .select()
    .from(chapter)
    .where(and(eq(chapter.bookId, bk.id), eq(chapter.number, opts.chapterNumber)));
  if (!ch) return { places: [], placeSlugsByVerse: {} };

  // Una sola consulta: versículo + lugar (con lon/lat extraídos del geography)
  // + nombre traducido si lo hay para el idioma pedido.
  const rows = await db
    .select({
      verseNumber: verse.number,
      slug: place.slug,
      canonicalName: place.canonicalName,
      localizedName: placeAlternateName.name,
      modernName: place.modernName,
      description: place.description,
      lng: sql<number>`ST_X(${place.geom}::geometry)`,
      lat: sql<number>`ST_Y(${place.geom}::geometry)`,
    })
    .from(verse)
    .innerJoin(verseLocation, eq(verseLocation.verseId, verse.id))
    .innerJoin(place, eq(place.id, verseLocation.placeId))
    .leftJoin(
      placeAlternateName,
      and(
        eq(placeAlternateName.placeId, place.id),
        eq(placeAlternateName.language, opts.language ?? '__none__'),
      ),
    )
    .where(eq(verse.chapterId, ch.id))
    .orderBy(asc(verse.number), asc(place.slug));

  const placeBySlug = new Map<string, DbPlace>();
  const placeSlugsByVerse: Record<number, string[]> = {};
  for (const r of rows) {
    if (!placeBySlug.has(r.slug)) {
      placeBySlug.set(r.slug, {
        slug: r.slug,
        name: r.localizedName ?? stripDisambiguation(r.canonicalName),
        canonicalName: r.canonicalName,
        modernName: r.modernName,
        description: r.description,
        lng: Number(r.lng),
        lat: Number(r.lat),
      });
    }
    const slugsOfVerse = (placeSlugsByVerse[r.verseNumber] ??= []);
    // El LEFT JOIN podría duplicar filas si un lugar tuviera varios nombres
    // en el mismo idioma; deduplicamos por si acaso.
    if (!slugsOfVerse.includes(r.slug)) slugsOfVerse.push(r.slug);
  }
  return { places: Array.from(placeBySlug.values()), placeSlugsByVerse };
}

// --- Búsqueda de lugares ---------------------------------------------------

export type DbPlaceSearchResult = {
  slug: string;
  /** Nombre visible: traducción si existe, canónico sin sufijo si no. */
  name: string;
  canonicalName: string;
  modernName: string | null;
  /** Capítulo con más menciones del lugar — destino natural al hacer click. */
  bookCanonicalId: string;
  bookUrlSegment: string;
  bookName: string;
  chapterNumber: number;
  mentionCount: number;
};

/** Escapa los metacaracteres de LIKE para usar entrada del usuario en ILIKE. */
function escapeLike(input: string): string {
  return input.replace(/[\\%_]/g, (c) => `\\${c}`);
}

// Folding de acentos para que "jerico" encuentre "Jericó". Se hace igual en
// SQL (translate, sin depender de la extensión unaccent) y en JS (NFD).
const ACCENTED = 'áàâäãéèêëíìîïóòôöõúùûüñç';
const PLAIN = 'aaaaaeeeeiiiiooooouuuunc';

function foldSql(col: unknown) {
  return sql`translate(lower(${col}), ${ACCENTED}, ${PLAIN})`;
}

function foldJs(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/**
 * Busca lugares por nombre (canónico o traducido al idioma pedido) con
 * coincidencia por subcadena, y devuelve para cada uno el capítulo que más
 * lo menciona. Los que empiezan por el término buscado van primero.
 * El dataset es pequeño (~1.335 lugares), así que ILIKE es suficiente:
 * no necesita motor de búsqueda externo.
 */
export async function searchPlaces(opts: {
  query: string;
  language?: string; // 'es', 'en', ...
  versionCode: string; // para el nombre localizado del libro destino
  limit?: number;
}): Promise<DbPlaceSearchResult[]> {
  const q = foldJs(opts.query.trim());
  if (q.length < 2) return [];
  const limit = opts.limit ?? 5;
  const contains = `%${escapeLike(q)}%`;
  const prefix = `${escapeLike(q)}%`;

  const [ver] = await db.select().from(version).where(eq(version.code, opts.versionCode));
  if (!ver) return [];

  // Lugares cuyo nombre canónico o traducido contiene el término.
  const matches = await db
    .select({
      id: place.id,
      slug: place.slug,
      canonicalName: place.canonicalName,
      localizedName: placeAlternateName.name,
      modernName: place.modernName,
    })
    .from(place)
    .leftJoin(
      placeAlternateName,
      and(
        eq(placeAlternateName.placeId, place.id),
        eq(placeAlternateName.language, opts.language ?? '__none__'),
      ),
    )
    .where(
      sql`(${foldSql(place.canonicalName)} LIKE ${contains} OR ${foldSql(placeAlternateName.name)} LIKE ${contains})`,
    )
    .orderBy(
      sql`(${foldSql(sql`coalesce(${placeAlternateName.name}, ${place.canonicalName})`)} LIKE ${prefix}) DESC`,
      sql`length(coalesce(${placeAlternateName.name}, ${place.canonicalName})) ASC`,
      asc(place.slug),
    )
    .limit(limit);
  if (matches.length === 0) return [];

  // Para cada lugar, el capítulo con más menciones (una fila por lugar).
  const ids = matches.map((m) => m.id);
  const topChapters = await db.execute<{
    place_id: number;
    canonical_id: string;
    number: number;
    book_name: string | null;
    cnt: number;
  }>(sql`
    SELECT DISTINCT ON (t.place_id)
      t.place_id, t.canonical_id, t.number, bt.name AS book_name, t.cnt
    FROM (
      SELECT vl.place_id, b.id AS book_id, b.canonical_id, b.order_index,
             c.number, count(*)::int AS cnt
      FROM ${verseLocation} vl
      JOIN ${verse} v ON v.id = vl.verse_id
      JOIN ${chapter} c ON c.id = v.chapter_id
      JOIN ${book} b ON b.id = c.book_id
      WHERE vl.place_id IN (${sql.join(ids, sql`, `)})
      GROUP BY vl.place_id, b.id, b.canonical_id, b.order_index, c.number
    ) t
    LEFT JOIN ${bookTranslation} bt
      ON bt.book_id = t.book_id AND bt.version_id = ${ver.id}
    ORDER BY t.place_id, t.cnt DESC, t.order_index ASC, t.number ASC
  `);
  const topByPlaceId = new Map(topChapters.map((r) => [r.place_id, r]));

  const results: DbPlaceSearchResult[] = [];
  for (const m of matches) {
    const top = topByPlaceId.get(m.id);
    if (!top) continue; // lugar sin menciones vinculadas: no hay destino útil
    results.push({
      slug: m.slug,
      name: m.localizedName ?? stripDisambiguation(m.canonicalName),
      canonicalName: m.canonicalName,
      modernName: m.modernName,
      bookCanonicalId: top.canonical_id,
      bookUrlSegment: top.canonical_id.toLowerCase(),
      bookName: top.book_name ?? top.canonical_id,
      chapterNumber: top.number,
      mentionCount: top.cnt,
    });
  }
  return results;
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
