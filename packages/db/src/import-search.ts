// Indexador de búsqueda — vuelca todos los versículos (todas las versiones)
// al índice `verses` de Meilisearch para la búsqueda full-text del lector.
//
// Idempotente: los documentos usan id estable `<versionCode>_<verseId>`, así
// que re-ejecutar sobrescribe en vez de duplicar. Configura también los
// settings del índice (atributos buscables/filtrables), que Meilisearch
// aplica de forma incremental.
//
// Sin dependencias nuevas: habla con la API REST de Meilisearch vía fetch.
//
// Uso:  npm run --workspace packages/db import:search
//       MEILI_HOST (def. http://localhost:7700) y MEILI_MASTER_KEY apuntan
//       a la instancia destino; DATABASE_URL a la BD origen.

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { and, asc, eq } from 'drizzle-orm';
import { book, bookTranslation, chapter, verse, verseText, version } from './schema/bible';

const MEILI_HOST = process.env.MEILI_HOST ?? 'http://localhost:7700';
const MEILI_KEY = process.env.MEILI_MASTER_KEY ?? 'tabor_dev_meili_master_key_change_me';
const INDEX = 'verses';
const BATCH_SIZE = 10_000;

const dbUrl =
  process.env.DATABASE_URL ?? 'postgres://tabor:tabor_dev_password@localhost:54320/tabor';

type VerseDoc = {
  id: string; // '<versionCode>_<verseId>' — estable entre ejecuciones
  language: string; // 'es' | 'en' — filtro principal de la búsqueda
  versionCode: string;
  book: string; // canonical_id ('GEN', 'MAT', ...)
  bookSegment: string; // segmento de URL ('gen', 'mat', ...)
  bookName: string; // nombre localizado en esa versión
  chapter: number;
  verse: number;
  text: string;
};

async function meili(path: string, init: RequestInit): Promise<unknown> {
  const res = await fetch(`${MEILI_HOST}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${MEILI_KEY}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`Meilisearch ${init.method ?? 'GET'} ${path} → ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

/** Espera a que una tarea asíncrona de Meilisearch termine (o falle). */
async function waitForTask(taskUid: number): Promise<void> {
  for (;;) {
    const task = (await meili(`/tasks/${taskUid}`, { method: 'GET' })) as {
      status: string;
      error?: { message: string };
    };
    if (task.status === 'succeeded') return;
    if (task.status === 'failed' || task.status === 'canceled') {
      throw new Error(`Tarea ${taskUid} ${task.status}: ${task.error?.message ?? 'sin detalle'}`);
    }
    await new Promise((r) => setTimeout(r, 500));
  }
}

async function main() {
  const client = postgres(dbUrl, { max: 1, onnotice: () => {} });
  const db = drizzle(client);

  // Crear índice solo si no existe (la creación es asíncrona y fallaría
  // dentro de la tarea, no como error HTTP, si ya está creado).
  const exists = await meili(`/indexes/${INDEX}`, { method: 'GET' }).then(
    () => true,
    (e) => {
      if (String(e).includes('index_not_found')) return false;
      throw e;
    },
  );
  if (!exists) {
    const created = (await meili('/indexes', {
      method: 'POST',
      body: JSON.stringify({ uid: INDEX, primaryKey: 'id' }),
    })) as { taskUid: number };
    await waitForTask(created.taskUid);
  }

  // Settings: el texto manda; bookName permite "getsemaní" como texto libre.
  // Filtramos siempre por idioma para no mezclar versiones.
  const settings = (await meili(`/indexes/${INDEX}/settings`, {
    method: 'PATCH',
    body: JSON.stringify({
      searchableAttributes: ['text', 'bookName'],
      filterableAttributes: ['language', 'book'],
      sortableAttributes: [],
    }),
  })) as { taskUid: number };
  await waitForTask(settings.taskUid);

  // Todos los versículos de todas las versiones, con nombre de libro localizado.
  const rows = await db
    .select({
      verseId: verse.id,
      verseNumber: verse.number,
      chapterNumber: chapter.number,
      bookCanonicalId: book.canonicalId,
      bookName: bookTranslation.name,
      versionCode: version.code,
      language: version.language,
      text: verseText.text,
    })
    .from(verseText)
    .innerJoin(verse, eq(verse.id, verseText.verseId))
    .innerJoin(chapter, eq(chapter.id, verse.chapterId))
    .innerJoin(book, eq(book.id, chapter.bookId))
    .innerJoin(version, eq(version.id, verseText.versionId))
    .innerJoin(
      bookTranslation,
      and(
        eq(bookTranslation.bookId, book.id),
        eq(bookTranslation.versionId, verseText.versionId),
      ),
    )
    .orderBy(asc(verseText.versionId), asc(verse.id));

  const docs: VerseDoc[] = rows.map((r) => ({
    id: `${r.versionCode}_${r.verseId}`,
    language: r.language,
    versionCode: r.versionCode,
    book: r.bookCanonicalId,
    bookSegment: r.bookCanonicalId.toLowerCase(),
    bookName: r.bookName,
    chapter: r.chapterNumber,
    verse: r.verseNumber,
    text: r.text,
  }));

  console.log(`Indexando ${docs.length} versículos en '${INDEX}' (${MEILI_HOST})…`);
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    const task = (await meili(`/indexes/${INDEX}/documents`, {
      method: 'PUT',
      body: JSON.stringify(batch),
    })) as { taskUid: number };
    await waitForTask(task.taskUid);
    console.log(`  ${Math.min(i + BATCH_SIZE, docs.length)}/${docs.length}`);
  }

  console.log(`✓ Índice '${INDEX}' actualizado: ${docs.length} documentos.`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
