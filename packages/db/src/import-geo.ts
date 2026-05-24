// Importador geográfico — pobla `place` y `verse_location` desde el dataset
// público de OpenBible.info (Bible Geocoding Data, CC-BY 4.0).
//
// Fuente: data/bible-sources/ancient.jsonl  (descargar de
//   https://github.com/openbibleinfo/Bible-Geocoding-Data )
//
// Para cada lugar antiguo se toma la `modern_association` con mayor `score`
// y se resuelve a una coordenada (lon,lat) vía
// `identifications[i].resolutions[j].lonlat`. Lugares sin localización
// resoluble (Edén, nombres simbólicos, “unknown_place”) se descartan.
//
// El `score` (~0–1000) se mapea al `confidence` (1..5) de `verse_location`.
// La fuente queda anotada como 'openbible.info' por fila para auditoría.
//
// Idempotente: re-ejecutar refresca coordenadas / descripciones y vuelve a
// puntuar las asociaciones — útil cuando el dataset se actualiza.
//
// Uso:  npm run --workspace packages/db import:geo

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, sql } from 'drizzle-orm';
import * as schema from './schema/index';

const url =
  process.env.DATABASE_URL ?? 'postgres://tabor:tabor_dev_password@localhost:54320/tabor';

// --- helpers ---------------------------------------------------------------
function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Limpia un `comment` de OpenBible: quita tags XML (<ancient/>, <modern/>),
// normaliza espacios, devuelve `null` si queda vacío.
function stripXmlTags(s: string | undefined | null): string | null {
  if (!s) return null;
  const cleaned = s
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.length > 0 ? cleaned : null;
}

// Mapea el `score` adjustado de OpenBible a la escala 1..5 de `verse_location.confidence`.
// El score >= 500 ya es alta confianza según la documentación del dataset.
function scoreToConfidence(score: number): number {
  if (score >= 500) return 5;
  if (score >= 200) return 4;
  if (score >= 75) return 3;
  if (score >= 25) return 2;
  return 1;
}

// "GEN 12:6" -> { book:'GEN', chapter:12, verse:6 }.
const USX_RE = /^([A-Z0-9]+)\s+(\d+):(\d+)$/;
function parseUsx(usx: string): { book: string; chapter: number; verse: number } | null {
  const m = USX_RE.exec(usx);
  if (!m) return null;
  return { book: m[1]!, chapter: Number(m[2]), verse: Number(m[3]) };
}

// --- estructura mínima del JSONL relevante para nosotros -------------------
type Verse = { usx: string };
type Resolution = { lonlat?: string };
type Identification = { resolutions: Resolution[] };
type ModernAssoc = { name: string; score: number; identification_ids: number[][] };
type AncientRecord = {
  id: string;
  friendly_id: string;
  comment?: string;
  identifications?: Identification[];
  modern_associations?: Record<string, ModernAssoc>;
  verses?: Verse[];
};

// --- importador ------------------------------------------------------------
async function main() {
  const isPooled = url.includes(':6543');
  const client = postgres(url, { max: 1, prepare: !isPooled });
  const db = drizzle(client, { schema });

  const path = fileURLToPath(
    new URL('../../../data/bible-sources/ancient.jsonl', import.meta.url),
  );
  const lines = readFileSync(path, 'utf8').split('\n').filter(Boolean);

  // 1. Cargar libros y construir mapa (canonicalId, chapter, verse) -> verse.id
  const books = await db.select().from(schema.book);
  const bookIdByCanonical = new Map(books.map((b) => [b.canonicalId, b.id]));

  const verseRows = await db
    .select({
      id: schema.verse.id,
      bookId: schema.chapter.bookId,
      chapterNumber: schema.chapter.number,
      verseNumber: schema.verse.number,
    })
    .from(schema.verse)
    .innerJoin(schema.chapter, eq(schema.chapter.id, schema.verse.chapterId));
  const verseIdByKey = new Map<string, number>();
  for (const v of verseRows) {
    verseIdByKey.set(`${v.bookId}|${v.chapterNumber}|${v.verseNumber}`, v.id);
  }
  console.log(`[import-geo] indexados ${verseRows.length} versículos canónicos.`);

  // 2. Recorrer registros y construir placeholders en memoria.
  type PlaceRow = {
    slug: string;
    canonicalName: string;
    description: string | null;
    modernName: string | null;
    modernCountry: string | null;
    lon: number;
    lat: number;
    confidence: number; // 1..5 aplicado a todos sus verse_location
  };
  const places: PlaceRow[] = [];
  const versesByAncientId = new Map<string, Array<{ book: string; chapter: number; verse: number }>>();
  const slugByAncientId = new Map<string, string>();
  let skipped = 0;

  for (const line of lines) {
    const o = JSON.parse(line) as AncientRecord;
    if (!o.modern_associations || Object.keys(o.modern_associations).length === 0) {
      skipped++;
      continue;
    }
    // Mejor modern_association por score.
    let best: { score: number; name: string; identification_ids: number[][] } | null = null;
    for (const a of Object.values(o.modern_associations)) {
      if (!best || a.score > best.score) best = a;
    }
    if (!best || !best.identification_ids[0]) {
      skipped++;
      continue;
    }
    const [i, j] = best.identification_ids[0];
    const lonlat = o.identifications?.[i!]?.resolutions?.[j!]?.lonlat;
    if (!lonlat) {
      skipped++;
      continue;
    }
    const [lonStr, latStr] = lonlat.split(',');
    const lon = Number(lonStr);
    const lat = Number(latStr);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
      skipped++;
      continue;
    }

    const slug = slugify(o.friendly_id);
    places.push({
      slug,
      canonicalName: o.friendly_id,
      description: stripXmlTags(o.comment),
      modernName: best.name,
      modernCountry: null, // requeriría modern.jsonl; no es crítico para el MVP
      lon,
      lat,
      confidence: scoreToConfidence(best.score),
    });
    slugByAncientId.set(o.id, slug);

    const refs: Array<{ book: string; chapter: number; verse: number }> = [];
    for (const v of o.verses ?? []) {
      const parsed = parseUsx(v.usx);
      if (parsed) refs.push(parsed);
    }
    if (refs.length > 0) versesByAncientId.set(o.id, refs);
  }
  console.log(`[import-geo] lugares con localización: ${places.length} (descartados: ${skipped}).`);

  // 3. Upsert de places por slug (geom calculado con ST_MakePoint).
  const placeChunk = 200;
  for (let k = 0; k < places.length; k += placeChunk) {
    const chunk = places.slice(k, k + placeChunk);
    await db
      .insert(schema.place)
      .values(
        chunk.map((p) => ({
          slug: p.slug,
          canonicalName: p.canonicalName,
          description: p.description,
          modernName: p.modernName,
          modernCountry: p.modernCountry,
          geom: sql`ST_SetSRID(ST_MakePoint(${p.lon}, ${p.lat}), 4326)::geography`,
        })),
      )
      .onConflictDoUpdate({
        target: schema.place.slug,
        set: {
          canonicalName: sql`excluded.canonical_name`,
          description: sql`excluded.description`,
          modernName: sql`excluded.modern_name`,
          modernCountry: sql`excluded.modern_country`,
          geom: sql`excluded.geom`,
        },
      });
  }

  // 4. Releer places para mapear slug -> place.id.
  const allPlaces = await db
    .select({ id: schema.place.id, slug: schema.place.slug })
    .from(schema.place);
  const placeIdBySlug = new Map(allPlaces.map((p) => [p.slug, p.id]));
  const confidenceBySlug = new Map(places.map((p) => [p.slug, p.confidence]));

  // 5. Construir filas verse_location.
  type VlRow = { verseId: number; placeId: number; confidence: number; source: string };
  const vlRows: VlRow[] = [];
  const seen = new Set<string>();
  let missingVerses = 0;
  let missingBooks = 0;

  for (const [ancientId, refs] of versesByAncientId) {
    const slug = slugByAncientId.get(ancientId)!;
    const placeId = placeIdBySlug.get(slug);
    if (placeId === undefined) continue;
    const confidence = confidenceBySlug.get(slug) ?? 3;
    for (const ref of refs) {
      const bookId = bookIdByCanonical.get(ref.book);
      if (bookId === undefined) {
        missingBooks++;
        continue;
      }
      const vId = verseIdByKey.get(`${bookId}|${ref.chapter}|${ref.verse}`);
      if (vId === undefined) {
        missingVerses++;
        continue;
      }
      const k = `${vId}|${placeId}`;
      if (seen.has(k)) continue;
      seen.add(k);
      vlRows.push({ verseId: vId, placeId, confidence, source: 'openbible.info' });
    }
  }
  console.log(
    `[import-geo] verse_location filas: ${vlRows.length}` +
      ` (libros sin mapear: ${missingBooks}, versículos sin slot: ${missingVerses}).`,
  );

  // 6. Upsert de verse_location en lotes.
  const vlChunk = 3000;
  for (let k = 0; k < vlRows.length; k += vlChunk) {
    const chunk = vlRows.slice(k, k + vlChunk);
    await db
      .insert(schema.verseLocation)
      .values(chunk)
      .onConflictDoUpdate({
        target: [schema.verseLocation.verseId, schema.verseLocation.placeId],
        set: {
          confidence: sql`excluded.confidence`,
          source: sql`excluded.source`,
        },
      });
  }

  // 7. Resumen final.
  const placeCount = await db.select({ c: sql<number>`count(*)::int` }).from(schema.place);
  const vlCount = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(schema.verseLocation);
  console.log(
    `[import-geo] OK — place: ${placeCount[0]?.c ?? 0}, verse_location: ${vlCount[0]?.c ?? 0}.`,
  );

  await client.end();
}

main().catch((err) => {
  console.error('[import-geo] falló:', err);
  process.exit(1);
});
