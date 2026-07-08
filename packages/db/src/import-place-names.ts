// Importador de nombres de lugares traducidos — pobla `place_alternate_name`
// desde el dataset curado en `data/place-names-es.ts`.
//
// Idempotente: borra las filas previas de la misma fuente ('tabor-curated')
// e inserta el dataset completo en una transacción. Corregir un nombre en el
// dataset y re-ejecutar deja la BD exactamente como dicta el fichero.
//
// Avisa (sin fallar) de los slugs del dataset que no existen en `place`,
// para detectar erratas.
//
// Uso:  npm run --workspace packages/db import:place-names
//       (DATABASE_URL apunta a la BD destino; sin ella usa la local de Docker)

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { and, eq, inArray } from 'drizzle-orm';
import { place, placeAlternateName } from './schema/index';
import { PLACE_NAMES_ES } from './data/place-names-es';

const SOURCE = 'tabor-curated';
const LANGUAGE = 'es';

const url =
  process.env.DATABASE_URL ?? 'postgres://tabor:tabor_dev_password@localhost:54320/tabor';

async function main() {
  const client = postgres(url, { max: 1, onnotice: () => {} });
  const db = drizzle(client);

  const slugs = Object.keys(PLACE_NAMES_ES);

  // Resuelve slug → id y detecta erratas del dataset.
  const rows = await db
    .select({ id: place.id, slug: place.slug })
    .from(place)
    .where(inArray(place.slug, slugs));
  const idBySlug = new Map(rows.map((r) => [r.slug, r.id]));

  const missing = slugs.filter((s) => !idBySlug.has(s));
  if (missing.length > 0) {
    console.warn(`⚠ ${missing.length} slugs del dataset no existen en place:`);
    for (const s of missing) console.warn(`   - ${s}`);
  }

  const inserts = Object.entries(PLACE_NAMES_ES)
    .filter(([slug]) => idBySlug.has(slug))
    .map(([slug, name]) => ({
      placeId: idBySlug.get(slug)!,
      language: LANGUAGE,
      name,
      source: SOURCE,
    }));

  await db.transaction(async (tx) => {
    await tx
      .delete(placeAlternateName)
      .where(
        and(eq(placeAlternateName.language, LANGUAGE), eq(placeAlternateName.source, SOURCE)),
      );
    if (inserts.length > 0) {
      await tx.insert(placeAlternateName).values(inserts);
    }
  });

  console.log(
    `✓ ${inserts.length} nombres en '${LANGUAGE}' importados (fuente '${SOURCE}').` +
      (missing.length > 0 ? ` ${missing.length} slugs desconocidos ignorados.` : ''),
  );

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
