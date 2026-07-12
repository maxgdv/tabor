// GET /api/search?q=<consulta>&locale=<es|en>
//
// Combina las tres formas de buscar del lector en una sola respuesta:
//   1. Referencia bíblica escrita a mano ("Mt 5", "gen 12:6") — parser local
//      + validación contra la BD (que el libro/capítulo existan de verdad).
//   2. Lugares por nombre (Postgres ILIKE sobre ~1.335 lugares).
//   3. Texto libre sobre los versículos: Meilisearch si está configurado
//      (mejor tolerancia a erratas); si no —el caso de producción hoy—,
//      FTS nativo de Postgres con stemming por idioma.
//
// Si ambos motores de texto libre fallan, la respuesta degrada a
// referencia + lugares en vez de fallar entera.

import { NextResponse, type NextRequest } from 'next/server';
import { getBookSummary, searchPlaces, searchVersesFts } from '@tabor/db';
import { parseReference } from '@/lib/reference';
import { versionForLocale } from '@/lib/bible';
import {
  HIGHLIGHT_POST,
  HIGHLIGHT_PRE,
  type SearchReference,
  type SearchResponse,
  type SearchVerse,
} from '@/lib/search';

// Mismos fallbacks de desarrollo que packages/db: sin .env la app apunta a
// los contenedores locales de docker-compose. En producción deben venir por
// entorno (y MEILI_SEARCH_KEY ser una search key de solo lectura).
const MEILI_HOST = process.env.MEILI_HOST ?? 'http://localhost:7700';
const MEILI_KEY =
  process.env.MEILI_SEARCH_KEY ??
  process.env.MEILI_MASTER_KEY ??
  'tabor_dev_meili_master_key_change_me';
// En producción sin MEILI_HOST no hay nada que intentar: directo al FTS de
// Postgres. En desarrollo probamos siempre el contenedor local.
const MEILI_ENABLED =
  Boolean(process.env.MEILI_HOST) || process.env.NODE_ENV !== 'production';

/** Valida la referencia parseada contra la BD y la localiza. */
async function resolveReference(
  query: string,
  versionCode: string,
): Promise<SearchReference | null> {
  const ref = parseReference(query);
  if (!ref) return null;

  const summary = await getBookSummary({
    bookCanonicalId: ref.canonicalId,
    versionCode,
  });
  if (!summary) return null;
  if (ref.chapter !== undefined && ref.chapter > summary.chapterCount) return null;

  return {
    urlSegment: summary.urlSegment,
    bookName: summary.name,
    ...(ref.chapter !== undefined ? { chapter: ref.chapter } : {}),
    ...(ref.verse !== undefined ? { verse: ref.verse } : {}),
  };
}

async function searchVersesMeili(query: string, language: string): Promise<SearchVerse[]> {
  const res = await fetch(`${MEILI_HOST}/indexes/verses/search`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${MEILI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: query,
      filter: `language = ${language}`,
      limit: 8,
      attributesToCrop: ['text'],
      cropLength: 24,
      attributesToHighlight: ['text'],
      highlightPreTag: HIGHLIGHT_PRE,
      highlightPostTag: HIGHLIGHT_POST,
    }),
    // La búsqueda es interactiva: mejor fallar rápido que colgar el dropdown.
    signal: AbortSignal.timeout(3000),
  });
  if (!res.ok) {
    throw new Error(`Meilisearch search → ${res.status}`);
  }
  const data = (await res.json()) as {
    hits: Array<{
      bookSegment: string;
      bookName: string;
      chapter: number;
      verse: number;
      text: string;
      _formatted?: { text?: string };
    }>;
  };
  return data.hits.map((h) => ({
    bookSegment: h.bookSegment,
    bookName: h.bookName,
    chapter: h.chapter,
    verse: h.verse,
    snippet: h._formatted?.text ?? h.text,
  }));
}

/** Texto libre: Meilisearch si se puede, FTS de Postgres si no. */
async function searchVerses(
  query: string,
  language: string,
  versionCode: string,
): Promise<SearchVerse[]> {
  if (MEILI_ENABLED) {
    try {
      return await searchVersesMeili(query, language);
    } catch {
      // Contenedor caído o instancia mal configurada: probamos Postgres.
    }
  }
  const rows = await searchVersesFts({
    query,
    language,
    versionCode,
    highlightPre: HIGHLIGHT_PRE,
    highlightPost: HIGHLIGHT_POST,
    limit: 8,
  });
  return rows.map((r) => ({
    bookSegment: r.bookUrlSegment,
    bookName: r.bookName,
    chapter: r.chapterNumber,
    verse: r.verseNumber,
    snippet: r.snippet,
  }));
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const q = (request.nextUrl.searchParams.get('q') ?? '').trim().slice(0, 200);
  const locale = request.nextUrl.searchParams.get('locale') === 'en' ? 'en' : 'es';
  const versionCode = versionForLocale(locale);

  if (q.length < 2) {
    return NextResponse.json<SearchResponse>({ reference: null, places: [], verses: [] });
  }

  const [reference, places, verses] = await Promise.all([
    resolveReference(q, versionCode).catch(() => null),
    searchPlaces({ query: q, language: locale, versionCode, limit: 4 }).catch(() => []),
    searchVerses(q, locale, versionCode).catch(() => []),
  ]);

  return NextResponse.json<SearchResponse>(
    {
      reference,
      places: places.map((p) => ({
        slug: p.slug,
        name: p.name,
        modernName: p.modernName,
        bookUrlSegment: p.bookUrlSegment,
        bookName: p.bookName,
        chapterNumber: p.chapterNumber,
        mentionCount: p.mentionCount,
      })),
      verses,
    },
    { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' } },
  );
}
