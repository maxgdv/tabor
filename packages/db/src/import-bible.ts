// Importador de versiones bíblicas completas.
//
// Lee un JSON de scrollmapper (formato { translation, books:[{ name, chapters:
// [{ chapter, verses:[{ verse, text }] }] }] }) y lo vuelca a las tablas
// version / book_translation / chapter / verse / verse_text.
//
// Es idempotente: chapter y verse se insertan con ON CONFLICT DO NOTHING
// (el slot canónico es compartido por todas las versiones); version,
// book_translation y verse_text se actualizan en cada pasada.
//
// Uso:
//   npm run --workspace packages/db import:bible            -> importa todas
//   npm run --workspace packages/db import:bible -- STRA    -> solo esa(s)
//
// El catálogo de libros (tabla `book`) debe estar sembrado antes — ver seed.ts.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import * as schema from './schema/index';
import { BOOK_META, BOOK_META_BY_SOURCE } from './book-meta';

const url =
  process.env.DATABASE_URL ?? 'postgres://tabor:tabor_dev_password@localhost:54320/tabor';

// --- Catálogo de versiones que sabemos importar ---------------------------
type VersionSpec = {
  code: string;
  language: 'es' | 'en' | 'la';
  fullName: string;
  copyright: string;
  file: string; // nombre del archivo dentro de data/bible-sources/
};

const VERSIONS: Record<string, VersionSpec> = {
  STRA: {
    code: 'STRA',
    language: 'es',
    fullName: 'Biblia Platense (Straubinger)',
    copyright: 'Dominio público — traducción de Mons. Juan Straubinger',
    file: 'SpaPlatense.json',
  },
  CPDV: {
    code: 'CPDV',
    language: 'en',
    fullName: 'Catholic Public Domain Version',
    copyright: 'Public domain — Catholic Public Domain Version (Ronald L. Conte Jr.)',
    file: 'CPDV.json',
  },
  // La versificación clementina de los Salmos coincide con la de STRA/CPDV
  // (numeración greco-latina: el «Dominus regit me» es el 22), así que los
  // huecos canónicos alinean sin renumerar. El apéndice clementino (Oratio
  // Manassae, III-IV Esdrae, Ps 151, Laodicenses) cae solo: no está en
  // BOOK_META y el importador lo descarta con aviso.
  VUL: {
    code: 'VUL',
    language: 'la',
    fullName: 'Biblia Sacra Vulgata (Clementina)',
    copyright: 'Dominio público — Vulgata Clementina (Clementine Text Project)',
    file: 'VulgClementine.json',
  },
};

// Títulos latinos de los libros (la Vulgata no es un locale de la interfaz;
// book_translation los quiere para cabeceras y referencias).
const LATIN_NAMES: Record<string, { name: string; short: string }> = {
  GEN: { name: 'Genesis', short: 'Gn' },
  EXO: { name: 'Exodus', short: 'Ex' },
  LEV: { name: 'Leviticus', short: 'Lv' },
  NUM: { name: 'Numeri', short: 'Nm' },
  DEU: { name: 'Deuteronomium', short: 'Dt' },
  JOS: { name: 'Josue', short: 'Jos' },
  JDG: { name: 'Judices', short: 'Jdc' },
  RUT: { name: 'Ruth', short: 'Rt' },
  '1SA': { name: '1 Samuelis', short: '1 Sm' },
  '2SA': { name: '2 Samuelis', short: '2 Sm' },
  '1KI': { name: '1 Regum', short: '1 Rg' },
  '2KI': { name: '2 Regum', short: '2 Rg' },
  '1CH': { name: '1 Paralipomenon', short: '1 Par' },
  '2CH': { name: '2 Paralipomenon', short: '2 Par' },
  EZR: { name: 'Esdrae', short: 'Esd' },
  NEH: { name: 'Nehemiae', short: 'Neh' },
  TOB: { name: 'Tobiae', short: 'Tb' },
  JDT: { name: 'Judith', short: 'Jdt' },
  EST: { name: 'Esther', short: 'Est' },
  '1MA': { name: '1 Machabaeorum', short: '1 Mcc' },
  '2MA': { name: '2 Machabaeorum', short: '2 Mcc' },
  JOB: { name: 'Job', short: 'Job' },
  PSA: { name: 'Psalmi', short: 'Ps' },
  PRO: { name: 'Proverbia', short: 'Prv' },
  ECC: { name: 'Ecclesiastes', short: 'Eccl' },
  SNG: { name: 'Canticum Canticorum', short: 'Ct' },
  WIS: { name: 'Sapientia', short: 'Sap' },
  SIR: { name: 'Ecclesiasticus', short: 'Eccli' },
  ISA: { name: 'Isaias', short: 'Is' },
  JER: { name: 'Jeremias', short: 'Jer' },
  LAM: { name: 'Lamentationes', short: 'Lam' },
  BAR: { name: 'Baruch', short: 'Bar' },
  EZK: { name: 'Ezechiel', short: 'Ez' },
  DAN: { name: 'Daniel', short: 'Dn' },
  HOS: { name: 'Osee', short: 'Os' },
  JOL: { name: 'Joel', short: 'Joel' },
  AMO: { name: 'Amos', short: 'Am' },
  OBA: { name: 'Abdias', short: 'Abd' },
  JON: { name: 'Jonas', short: 'Jon' },
  MIC: { name: 'Michaeas', short: 'Mch' },
  NAM: { name: 'Nahum', short: 'Nah' },
  HAB: { name: 'Habacuc', short: 'Hab' },
  ZEP: { name: 'Sophonias', short: 'Soph' },
  HAG: { name: 'Aggaeus', short: 'Agg' },
  ZEC: { name: 'Zacharias', short: 'Zach' },
  MAL: { name: 'Malachias', short: 'Mal' },
  MAT: { name: 'Matthaeus', short: 'Mt' },
  MRK: { name: 'Marcus', short: 'Mc' },
  LUK: { name: 'Lucas', short: 'Lc' },
  JHN: { name: 'Joannes', short: 'Jo' },
  ACT: { name: 'Actus Apostolorum', short: 'Act' },
  ROM: { name: 'Ad Romanos', short: 'Rom' },
  '1CO': { name: '1 Ad Corinthios', short: '1 Cor' },
  '2CO': { name: '2 Ad Corinthios', short: '2 Cor' },
  GAL: { name: 'Ad Galatas', short: 'Gal' },
  EPH: { name: 'Ad Ephesios', short: 'Eph' },
  PHP: { name: 'Ad Philippenses', short: 'Phil' },
  COL: { name: 'Ad Colossenses', short: 'Col' },
  '1TH': { name: '1 Ad Thessalonicenses', short: '1 Thess' },
  '2TH': { name: '2 Ad Thessalonicenses', short: '2 Thess' },
  '1TI': { name: '1 Ad Timotheum', short: '1 Tim' },
  '2TI': { name: '2 Ad Timotheum', short: '2 Tim' },
  TIT: { name: 'Ad Titum', short: 'Tit' },
  PHM: { name: 'Ad Philemonem', short: 'Phlm' },
  HEB: { name: 'Ad Hebraeos', short: 'Hebr' },
  JAS: { name: 'Jacobi', short: 'Jac' },
  '1PE': { name: '1 Petri', short: '1 Pt' },
  '2PE': { name: '2 Petri', short: '2 Pt' },
  '1JN': { name: '1 Joannis', short: '1 Jo' },
  '2JN': { name: '2 Joannis', short: '2 Jo' },
  '3JN': { name: '3 Joannis', short: '3 Jo' },
  JUD: { name: 'Judae', short: 'Jud' },
  REV: { name: 'Apocalypsis', short: 'Apoc' },
};

// --- Forma del JSON de origen ---------------------------------------------
type SourceBible = {
  translation: string;
  books: Array<{
    name: string;
    chapters: Array<{
      chapter: number;
      verses: Array<{ verse: number; text: string }>;
    }>;
  }>;
};

function sourcePath(file: string): string {
  // import-bible.ts vive en packages/db/src/ -> tres niveles hasta la raíz.
  return fileURLToPath(new URL(`../../../data/bible-sources/${file}`, import.meta.url));
}

// Inserta `rows` en lotes para no rebasar el límite de parámetros de Postgres.
async function inChunks<T>(rows: T[], size: number, fn: (chunk: T[]) => Promise<unknown>) {
  for (let i = 0; i < rows.length; i += size) {
    await fn(rows.slice(i, i + size));
  }
}

async function importVersion(
  db: ReturnType<typeof drizzle<typeof schema>>,
  spec: VersionSpec,
) {
  console.log(`\n[import:${spec.code}] leyendo ${spec.file}...`);
  const src: SourceBible = JSON.parse(readFileSync(sourcePath(spec.file), 'utf8'));

  // 1. Versión (upsert).
  const [ver] = await db
    .insert(schema.version)
    .values({
      code: spec.code,
      language: spec.language,
      fullName: spec.fullName,
      copyright: spec.copyright,
      licenseType: 'public_domain',
      metadata: sql`${JSON.stringify({ source: src.translation, importedAt: new Date().toISOString() })}::jsonb`,
    })
    .onConflictDoUpdate({
      target: schema.version.code,
      set: { fullName: spec.fullName, copyright: spec.copyright },
    })
    .returning();
  if (!ver) throw new Error(`No se pudo crear/recuperar la versión ${spec.code}`);

  // 2. Catálogo de libros ya sembrado: canonicalId -> book.id.
  const books = await db.select().from(schema.book);
  const bookIdByCanonical = new Map(books.map((b) => [b.canonicalId, b.id]));

  // 3. Recorrer la fuente y acumular filas. Los libros fuera del canon
  //    católico (no presentes en BOOK_META) se descartan con aviso.
  const bookTranslations: Array<typeof schema.bookTranslation.$inferInsert> = [];
  const chapterKeys: Array<{ bookId: number; number: number }> = [];
  const skipped: string[] = [];

  for (const sb of src.books) {
    const meta = BOOK_META_BY_SOURCE.get(sb.name);
    if (!meta) {
      skipped.push(sb.name);
      continue;
    }
    const bookId = bookIdByCanonical.get(meta.canonicalId);
    if (bookId === undefined) {
      console.warn(`  ! libro ${meta.canonicalId} ausente de la tabla book — ¿falta el seed?`);
      continue;
    }
    const loc =
      spec.language === 'la'
        ? (LATIN_NAMES[meta.canonicalId] ?? meta.en)
        : spec.language === 'es'
          ? meta.es
          : meta.en;
    bookTranslations.push({ bookId, versionId: ver.id, name: loc.name, shortName: loc.short });
    for (const ch of sb.chapters) {
      chapterKeys.push({ bookId, number: ch.chapter });
    }
  }
  if (skipped.length > 0) {
    console.log(`  · libros descartados (fuera del canon): ${skipped.join(', ')}`);
  }

  // 4. book_translation (upsert).
  await db
    .insert(schema.bookTranslation)
    .values(bookTranslations)
    .onConflictDoUpdate({
      target: [schema.bookTranslation.bookId, schema.bookTranslation.versionId],
      set: {
        name: sql`excluded.name`,
        shortName: sql`excluded.short_name`,
      },
    });

  // 5. chapter (slot canónico compartido — DO NOTHING).
  await inChunks(chapterKeys, 5000, (chunk) =>
    db.insert(schema.chapter).values(chunk).onConflictDoNothing(),
  );

  // 6. Releer chapters para mapear (bookId, number) -> chapter.id.
  const allChapters = await db.select().from(schema.chapter);
  const chapterId = new Map<string, number>();
  for (const c of allChapters) chapterId.set(`${c.bookId}:${c.number}`, c.id);

  // 7. verse (slot canónico compartido — DO NOTHING).
  const verseKeys: Array<{ chapterId: number; number: number }> = [];
  for (const sb of src.books) {
    const meta = BOOK_META_BY_SOURCE.get(sb.name);
    if (!meta) continue;
    const bookId = bookIdByCanonical.get(meta.canonicalId);
    if (bookId === undefined) continue;
    for (const ch of sb.chapters) {
      const chId = chapterId.get(`${bookId}:${ch.chapter}`);
      if (chId === undefined) continue;
      for (const v of ch.verses) {
        verseKeys.push({ chapterId: chId, number: v.verse });
      }
    }
  }
  await inChunks(verseKeys, 5000, (chunk) =>
    db.insert(schema.verse).values(chunk).onConflictDoNothing(),
  );

  // 8. Releer verses para mapear (chapterId, number) -> verse.id.
  const allVerses = await db.select().from(schema.verse);
  const verseId = new Map<string, number>();
  for (const v of allVerses) verseId.set(`${v.chapterId}:${v.number}`, v.id);

  // 9. verse_text para esta versión (upsert — re-importar refresca el texto).
  const texts: Array<typeof schema.verseText.$inferInsert> = [];
  for (const sb of src.books) {
    const meta = BOOK_META_BY_SOURCE.get(sb.name);
    if (!meta) continue;
    const bookId = bookIdByCanonical.get(meta.canonicalId);
    if (bookId === undefined) continue;
    for (const ch of sb.chapters) {
      const chId = chapterId.get(`${bookId}:${ch.chapter}`);
      if (chId === undefined) continue;
      for (const v of ch.verses) {
        const vId = verseId.get(`${chId}:${v.verse}`);
        if (vId === undefined) continue;
        const text = v.text.trim();
        if (text.length === 0) continue;
        texts.push({ verseId: vId, versionId: ver.id, text });
      }
    }
  }
  await inChunks(texts, 4000, (chunk) =>
    db
      .insert(schema.verseText)
      .values(chunk)
      .onConflictDoUpdate({
        target: [schema.verseText.verseId, schema.verseText.versionId],
        set: { text: sql`excluded.text` },
      }),
  );

  console.log(
    `[import:${spec.code}] OK — ${bookTranslations.length} libros, ` +
      `${chapterKeys.length} capítulos, ${texts.length} versículos.`,
  );
  return { books: bookTranslations.length, chapters: chapterKeys.length, verses: texts.length };
}

async function main() {
  const requested = process.argv.slice(2).map((s) => s.toUpperCase());
  const codes = requested.length > 0 ? requested : Object.keys(VERSIONS);

  for (const code of codes) {
    if (!VERSIONS[code]) {
      console.error(`Versión desconocida: ${code}. Disponibles: ${Object.keys(VERSIONS).join(', ')}`);
      process.exit(1);
    }
  }

  // Aviso temprano si el canon de BOOK_META no cuadra con los 73 esperados.
  if (BOOK_META.length !== 73) {
    console.warn(`Aviso: BOOK_META tiene ${BOOK_META.length} libros (se esperaban 73).`);
  }

  const isPooled = url.includes(':6543');
  const client = postgres(url, { max: 1, prepare: !isPooled });
  const db = drizzle(client, { schema });

  try {
    for (const code of codes) {
      await importVersion(db, VERSIONS[code]!);
    }

    // Resumen final.
    const summary = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.verseText);
    console.log(`\n[import] completado. Total filas en verse_text: ${summary[0]?.count ?? 0}.`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('[import] falló:', err);
  process.exit(1);
});
