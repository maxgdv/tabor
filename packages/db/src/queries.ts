// Consultas de dominio reutilizables. Viven en el paquete @tabor/db para que
// la app web no tenga que conocer Drizzle ni el esquema: importa funciones,
// no tablas.

import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { db } from './index';
import { book, bookTranslation, chapter, verse, verseText, version } from './schema/bible';
import { place, placeAlternateName, verseLocation } from './schema/geo';
import { bookmark, highlight, note, planProgress } from './schema/user';
import { escapeLike, foldJs, foldSql } from './text';

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

// --- Búsqueda de texto libre (Postgres FTS) --------------------------------

export type DbVerseSearchResult = {
  bookCanonicalId: string;
  bookUrlSegment: string;
  bookName: string;
  chapterNumber: number;
  verseNumber: number;
  /** Texto con los términos encontrados entre los marcadores pedidos. */
  snippet: string;
};

// Config de FTS por idioma de la interfaz. Debe coincidir LITERALMENTE con
// la expresión de los índices de 0001_verse_fts_indexes.sql.
const FTS_CONFIG: Record<string, 'spanish' | 'english'> = {
  es: 'spanish',
  en: 'english',
};

/**
 * Búsqueda de texto libre sobre los versículos con el FTS nativo de
 * Postgres. Es el fallback de producción cuando no hay Meilisearch: con
 * stemming por idioma pero sin tolerancia a erratas. Los marcadores de
 * resaltado los pone ts_headline directamente.
 */
export async function searchVersesFts(opts: {
  query: string;
  language?: string; // 'es' | 'en'
  versionCode: string;
  highlightPre: string;
  highlightPost: string;
  limit?: number;
}): Promise<DbVerseSearchResult[]> {
  const q = opts.query.trim();
  if (q.length < 2) return [];
  const limit = opts.limit ?? 8;
  // Literal controlado por el mapa de arriba — nunca entrada del usuario —
  // porque el planner solo usa el índice si la config va inline.
  const cfg = sql.raw(`'${FTS_CONFIG[opts.language ?? 'es'] ?? 'spanish'}'`);
  const headlineOpts = `StartSel="${opts.highlightPre}", StopSel="${opts.highlightPost}", MaxWords=28, MinWords=12`;

  const rows = await db.execute<{
    canonical_id: string;
    book_name: string | null;
    chapter: number;
    verse: number;
    snippet: string;
  }>(sql`
    SELECT b.canonical_id, bt.name AS book_name, c.number AS chapter,
      v.number AS verse,
      ts_headline(${cfg}, vt.text, websearch_to_tsquery(${cfg}, ${q}), ${headlineOpts}) AS snippet
    FROM ${verseText} vt
    JOIN ${version} ver ON ver.id = vt.version_id
    JOIN ${verse} v ON v.id = vt.verse_id
    JOIN ${chapter} c ON c.id = v.chapter_id
    JOIN ${book} b ON b.id = c.book_id
    LEFT JOIN ${bookTranslation} bt
      ON bt.book_id = b.id AND bt.version_id = vt.version_id
    WHERE ver.code = ${opts.versionCode}
      AND to_tsvector(${cfg}, vt.text) @@ websearch_to_tsquery(${cfg}, ${q})
    ORDER BY
      ts_rank(to_tsvector(${cfg}, vt.text), websearch_to_tsquery(${cfg}, ${q})) DESC,
      b.order_index ASC, c.number ASC, v.number ASC
    LIMIT ${limit}
  `);

  return rows.map((r) => ({
    bookCanonicalId: r.canonical_id,
    bookUrlSegment: r.canonical_id.toLowerCase(),
    bookName: r.book_name ?? r.canonical_id,
    chapterNumber: r.chapter,
    verseNumber: r.verse,
    snippet: r.snippet,
  }));
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

// --- Marcadores del usuario -------------------------------------------------

export type DbBookmarkListItem = {
  bookCanonicalId: string;
  bookUrlSegment: string;
  bookName: string;
  chapterNumber: number;
  verseNumber: number;
  text: string;
  createdAt: Date;
};

/** Resuelve el id interno de un versículo por libro/capítulo/número. */
async function resolveVerseId(opts: {
  bookCanonicalId: string;
  chapterNumber: number;
  verseNumber: number;
}): Promise<number | null> {
  const [row] = await db
    .select({ id: verse.id })
    .from(verse)
    .innerJoin(chapter, eq(chapter.id, verse.chapterId))
    .innerJoin(book, eq(book.id, chapter.bookId))
    .where(
      and(
        eq(book.canonicalId, opts.bookCanonicalId),
        eq(chapter.number, opts.chapterNumber),
        eq(verse.number, opts.verseNumber),
      ),
    );
  return row?.id ?? null;
}

/** Números de versículo marcados por el usuario en un capítulo. */
export async function getBookmarkedVerseNumbers(opts: {
  userId: string;
  bookCanonicalId: string;
  chapterNumber: number;
}): Promise<number[]> {
  const rows = await db
    .select({ number: verse.number })
    .from(bookmark)
    .innerJoin(verse, eq(verse.id, bookmark.verseId))
    .innerJoin(chapter, eq(chapter.id, verse.chapterId))
    .innerJoin(book, eq(book.id, chapter.bookId))
    .where(
      and(
        eq(bookmark.userId, opts.userId),
        eq(book.canonicalId, opts.bookCanonicalId),
        eq(chapter.number, opts.chapterNumber),
      ),
    )
    .orderBy(asc(verse.number));
  return rows.map((r) => r.number);
}

/**
 * Marca o desmarca un versículo. Devuelve el estado resultante, o `null` si
 * el versículo no existe. El índice único (user_id, verse_id) absorbe los
 * dobles clicks concurrentes: el peor caso es un INSERT que no hace nada.
 */
export async function toggleBookmark(opts: {
  userId: string;
  bookCanonicalId: string;
  chapterNumber: number;
  verseNumber: number;
}): Promise<{ bookmarked: boolean } | null> {
  const verseId = await resolveVerseId(opts);
  if (verseId == null) return null;

  const deleted = await db
    .delete(bookmark)
    .where(and(eq(bookmark.userId, opts.userId), eq(bookmark.verseId, verseId)))
    .returning({ id: bookmark.id });
  if (deleted.length > 0) return { bookmarked: false };

  await db
    .insert(bookmark)
    .values({ userId: opts.userId, verseId })
    .onConflictDoNothing();
  return { bookmarked: true };
}

/**
 * Todos los marcadores del usuario, con el nombre del libro y el texto del
 * versículo en la versión pedida, en orden canónico de lectura.
 */
export async function listBookmarks(opts: {
  userId: string;
  versionCode: string;
}): Promise<DbBookmarkListItem[]> {
  const [ver] = await db.select().from(version).where(eq(version.code, opts.versionCode));
  if (!ver) return [];

  const rows = await db
    .select({
      canonicalId: book.canonicalId,
      bookName: bookTranslation.name,
      chapterNumber: chapter.number,
      verseNumber: verse.number,
      text: verseText.text,
      createdAt: bookmark.createdAt,
    })
    .from(bookmark)
    .innerJoin(verse, eq(verse.id, bookmark.verseId))
    .innerJoin(chapter, eq(chapter.id, verse.chapterId))
    .innerJoin(book, eq(book.id, chapter.bookId))
    .innerJoin(
      verseText,
      and(eq(verseText.verseId, verse.id), eq(verseText.versionId, ver.id)),
    )
    .leftJoin(
      bookTranslation,
      and(eq(bookTranslation.bookId, book.id), eq(bookTranslation.versionId, ver.id)),
    )
    .where(eq(bookmark.userId, opts.userId))
    .orderBy(asc(book.orderIndex), asc(chapter.number), asc(verse.number));

  return rows.map((r) => ({
    bookCanonicalId: r.canonicalId,
    bookUrlSegment: r.canonicalId.toLowerCase(),
    bookName: r.bookName ?? r.canonicalId,
    chapterNumber: r.chapterNumber,
    verseNumber: r.verseNumber,
    text: r.text,
    createdAt: r.createdAt,
  }));
}

// --- Progreso de planes de lectura ------------------------------------------

/** Todo el progreso del usuario: { slug: [índices de día 0-based ordenados] }. */
export async function getPlanProgress(opts: {
  userId: string;
}): Promise<Record<string, number[]>> {
  const rows = await db
    .select({ planSlug: planProgress.planSlug, dayIndex: planProgress.dayIndex })
    .from(planProgress)
    .where(eq(planProgress.userId, opts.userId))
    .orderBy(asc(planProgress.planSlug), asc(planProgress.dayIndex));

  const result: Record<string, number[]> = {};
  for (const row of rows) {
    (result[row.planSlug] ??= []).push(row.dayIndex);
  }
  return result;
}

/**
 * Marca o desmarca un día de un plan. Idempotente (estado explícito, no
 * toggle): reenviar la misma petición no cambia nada — seguro ante dobles
 * clicks, reintentos y StrictMode.
 */
export async function setPlanDay(opts: {
  userId: string;
  planSlug: string;
  dayIndex: number;
  done: boolean;
}): Promise<void> {
  if (opts.done) {
    await db
      .insert(planProgress)
      .values({ userId: opts.userId, planSlug: opts.planSlug, dayIndex: opts.dayIndex })
      .onConflictDoNothing();
  } else {
    await db
      .delete(planProgress)
      .where(
        and(
          eq(planProgress.userId, opts.userId),
          eq(planProgress.planSlug, opts.planSlug),
          eq(planProgress.dayIndex, opts.dayIndex),
        ),
      );
  }
}

/**
 * Sube en bloque el progreso local del dispositivo (migración única al
 * iniciar sesión). Unión: nunca borra días ya marcados en la cuenta.
 * La entrada llega YA saneada por la API. No-op con progreso vacío.
 */
export async function mergePlanProgress(opts: {
  userId: string;
  progress: Record<string, number[]>;
}): Promise<void> {
  const rows = Object.entries(opts.progress).flatMap(([planSlug, days]) =>
    days.map((dayIndex) => ({ userId: opts.userId, planSlug, dayIndex })),
  );
  if (rows.length === 0) return;
  await db.insert(planProgress).values(rows).onConflictDoNothing();
}

// --- Resaltados y notas del usuario ------------------------------------------
// v1: un solo versículo (start_verse_id = end_verse_id) y una fila por
// (usuario, versículo) — los índices únicos sostienen los upserts.

export type DbChapterAnnotations = {
  highlights: Array<{ verseNumber: number; color: string }>;
  notes: Array<{ verseNumber: number; body: string }>;
};

/** Resaltados y notas del usuario en un capítulo (con cuerpos de nota:
 *  son pocos y pequeños, y así el lector no necesita un GET aparte). */
export async function getChapterAnnotations(opts: {
  userId: string;
  bookCanonicalId: string;
  chapterNumber: number;
}): Promise<DbChapterAnnotations> {
  const chapterVerses = db
    .select({ id: verse.id, number: verse.number })
    .from(verse)
    .innerJoin(chapter, eq(chapter.id, verse.chapterId))
    .innerJoin(book, eq(book.id, chapter.bookId))
    .where(
      and(eq(book.canonicalId, opts.bookCanonicalId), eq(chapter.number, opts.chapterNumber)),
    )
    .as('chapter_verses');

  const [highlights, notes] = await Promise.all([
    db
      .select({ verseNumber: chapterVerses.number, color: highlight.color })
      .from(highlight)
      .innerJoin(chapterVerses, eq(chapterVerses.id, highlight.startVerseId))
      .where(eq(highlight.userId, opts.userId))
      .orderBy(asc(chapterVerses.number)),
    db
      .select({ verseNumber: chapterVerses.number, body: note.bodyMd })
      .from(note)
      .innerJoin(chapterVerses, eq(chapterVerses.id, note.startVerseId))
      .where(eq(note.userId, opts.userId))
      .orderBy(asc(chapterVerses.number)),
  ]);

  return { highlights, notes };
}

/**
 * Resalta un versículo con un color (upsert: re-resaltar cambia el color) o
 * quita el resaltado (`color: null`). `null` si el versículo no existe.
 * El color llega YA validado contra la lista blanca por la API.
 */
export async function setHighlight(opts: {
  userId: string;
  bookCanonicalId: string;
  chapterNumber: number;
  verseNumber: number;
  color: string | null;
}): Promise<{ color: string | null } | null> {
  const verseId = await resolveVerseId(opts);
  if (verseId == null) return null;

  if (opts.color === null) {
    await db
      .delete(highlight)
      .where(and(eq(highlight.userId, opts.userId), eq(highlight.startVerseId, verseId)));
    return { color: null };
  }

  await db
    .insert(highlight)
    .values({
      userId: opts.userId,
      startVerseId: verseId,
      endVerseId: verseId,
      color: opts.color,
    })
    .onConflictDoUpdate({
      target: [highlight.userId, highlight.startVerseId],
      set: { color: opts.color },
    });
  return { color: opts.color };
}

/**
 * Guarda la nota de un versículo (upsert: editar reemplaza el cuerpo) o la
 * borra (`body: null`). `null` si el versículo no existe.
 */
export async function setNote(opts: {
  userId: string;
  bookCanonicalId: string;
  chapterNumber: number;
  verseNumber: number;
  body: string | null;
}): Promise<{ saved: boolean } | null> {
  const verseId = await resolveVerseId(opts);
  if (verseId == null) return null;

  if (opts.body === null) {
    await db
      .delete(note)
      .where(and(eq(note.userId, opts.userId), eq(note.startVerseId, verseId)));
    return { saved: false };
  }

  await db
    .insert(note)
    .values({
      userId: opts.userId,
      startVerseId: verseId,
      endVerseId: verseId,
      bodyMd: opts.body,
    })
    .onConflictDoUpdate({
      target: [note.userId, note.startVerseId],
      set: { bodyMd: opts.body, updatedAt: sql`now()` },
    });
  return { saved: true };
}

export type DbHighlightListItem = {
  bookCanonicalId: string;
  bookUrlSegment: string;
  bookName: string;
  chapterNumber: number;
  verseNumber: number;
  text: string;
  color: string;
  label: string | null;
};

/** Todos los resaltados del usuario, en orden canónico, con texto localizado. */
export async function listHighlights(opts: {
  userId: string;
  versionCode: string;
}): Promise<DbHighlightListItem[]> {
  const [ver] = await db.select().from(version).where(eq(version.code, opts.versionCode));
  if (!ver) return [];

  const rows = await db
    .select({
      canonicalId: book.canonicalId,
      bookName: bookTranslation.name,
      chapterNumber: chapter.number,
      verseNumber: verse.number,
      text: verseText.text,
      color: highlight.color,
      label: highlight.label,
    })
    .from(highlight)
    .innerJoin(verse, eq(verse.id, highlight.startVerseId))
    .innerJoin(chapter, eq(chapter.id, verse.chapterId))
    .innerJoin(book, eq(book.id, chapter.bookId))
    .innerJoin(
      verseText,
      and(eq(verseText.verseId, verse.id), eq(verseText.versionId, ver.id)),
    )
    .leftJoin(
      bookTranslation,
      and(eq(bookTranslation.bookId, book.id), eq(bookTranslation.versionId, ver.id)),
    )
    .where(eq(highlight.userId, opts.userId))
    .orderBy(asc(book.orderIndex), asc(chapter.number), asc(verse.number));

  return rows.map((r) => ({
    bookCanonicalId: r.canonicalId,
    bookUrlSegment: r.canonicalId.toLowerCase(),
    bookName: r.bookName ?? r.canonicalId,
    chapterNumber: r.chapterNumber,
    verseNumber: r.verseNumber,
    text: r.text,
    color: r.color,
    label: r.label,
  }));
}

export type DbNoteListItem = {
  bookCanonicalId: string;
  bookUrlSegment: string;
  bookName: string;
  chapterNumber: number;
  verseNumber: number;
  text: string;
  body: string;
  updatedAt: Date;
};

/** Todas las notas del usuario, en orden canónico, con texto localizado. */
export async function listNotes(opts: {
  userId: string;
  versionCode: string;
}): Promise<DbNoteListItem[]> {
  const [ver] = await db.select().from(version).where(eq(version.code, opts.versionCode));
  if (!ver) return [];

  const rows = await db
    .select({
      canonicalId: book.canonicalId,
      bookName: bookTranslation.name,
      chapterNumber: chapter.number,
      verseNumber: verse.number,
      text: verseText.text,
      body: note.bodyMd,
      updatedAt: note.updatedAt,
    })
    .from(note)
    .innerJoin(verse, eq(verse.id, note.startVerseId))
    .innerJoin(chapter, eq(chapter.id, verse.chapterId))
    .innerJoin(book, eq(book.id, chapter.bookId))
    .innerJoin(
      verseText,
      and(eq(verseText.verseId, verse.id), eq(verseText.versionId, ver.id)),
    )
    .leftJoin(
      bookTranslation,
      and(eq(bookTranslation.bookId, book.id), eq(bookTranslation.versionId, ver.id)),
    )
    .where(eq(note.userId, opts.userId))
    .orderBy(asc(book.orderIndex), asc(chapter.number), asc(verse.number));

  return rows.map((r) => ({
    bookCanonicalId: r.canonicalId,
    bookUrlSegment: r.canonicalId.toLowerCase(),
    bookName: r.bookName ?? r.canonicalId,
    chapterNumber: r.chapterNumber,
    verseNumber: r.verseNumber,
    text: r.text,
    body: r.body,
    updatedAt: r.updatedAt,
  }));
}
