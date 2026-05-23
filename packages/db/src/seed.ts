import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import * as schema from './schema/index';

const url =
  process.env.DATABASE_URL ?? 'postgres://tabor:tabor_dev_password@localhost:54320/tabor';

// Seed mínimo de Fase 0: catálogo de libros canónicos y una versión de prueba.
// En Fase 1 se importan los versículos completos desde una versión licenciada.
async function main() {
  const client = postgres(url, { max: 1 });
  const db = drizzle(client, { schema });

  console.log('[seed] inserting canonical book catalog...');
  await db
    .insert(schema.book)
    .values(CANONICAL_BOOKS)
    .onConflictDoNothing({ target: schema.book.canonicalId });

  console.log('[seed] inserting placeholder version (public-domain stub)...');
  await db
    .insert(schema.version)
    .values({
      code: 'STUB-ES',
      language: 'es',
      fullName: 'Versión de desarrollo (placeholder)',
      copyright: 'Dominio público',
      licenseType: 'public_domain',
      metadata: sql`'{"note": "placeholder for development only"}'::jsonb`,
    })
    .onConflictDoNothing({ target: schema.version.code });

  console.log('[seed] done.');
  await client.end();
}

// Catálogo canónico (Biblia católica, 73 libros). orderIndex respeta el orden litúrgico.
const CANONICAL_BOOKS: Array<typeof schema.book.$inferInsert> = [
  // Pentateuco
  { canonicalId: 'GEN', testament: 'OT', category: 'pentateuch', orderIndex: 1 },
  { canonicalId: 'EXO', testament: 'OT', category: 'pentateuch', orderIndex: 2 },
  { canonicalId: 'LEV', testament: 'OT', category: 'pentateuch', orderIndex: 3 },
  { canonicalId: 'NUM', testament: 'OT', category: 'pentateuch', orderIndex: 4 },
  { canonicalId: 'DEU', testament: 'OT', category: 'pentateuch', orderIndex: 5 },
  // Históricos
  { canonicalId: 'JOS', testament: 'OT', category: 'historical', orderIndex: 6 },
  { canonicalId: 'JDG', testament: 'OT', category: 'historical', orderIndex: 7 },
  { canonicalId: 'RUT', testament: 'OT', category: 'historical', orderIndex: 8 },
  { canonicalId: '1SA', testament: 'OT', category: 'historical', orderIndex: 9 },
  { canonicalId: '2SA', testament: 'OT', category: 'historical', orderIndex: 10 },
  { canonicalId: '1KI', testament: 'OT', category: 'historical', orderIndex: 11 },
  { canonicalId: '2KI', testament: 'OT', category: 'historical', orderIndex: 12 },
  { canonicalId: '1CH', testament: 'OT', category: 'historical', orderIndex: 13 },
  { canonicalId: '2CH', testament: 'OT', category: 'historical', orderIndex: 14 },
  { canonicalId: 'EZR', testament: 'OT', category: 'historical', orderIndex: 15 },
  { canonicalId: 'NEH', testament: 'OT', category: 'historical', orderIndex: 16 },
  { canonicalId: 'TOB', testament: 'OT', category: 'historical', orderIndex: 17 }, // deuterocanónico
  { canonicalId: 'JDT', testament: 'OT', category: 'historical', orderIndex: 18 }, // deuterocanónico
  { canonicalId: 'EST', testament: 'OT', category: 'historical', orderIndex: 19 },
  { canonicalId: '1MA', testament: 'OT', category: 'historical', orderIndex: 20 }, // deuterocanónico
  { canonicalId: '2MA', testament: 'OT', category: 'historical', orderIndex: 21 }, // deuterocanónico
  // Sapienciales
  { canonicalId: 'JOB', testament: 'OT', category: 'wisdom', orderIndex: 22 },
  { canonicalId: 'PSA', testament: 'OT', category: 'wisdom', orderIndex: 23 },
  { canonicalId: 'PRO', testament: 'OT', category: 'wisdom', orderIndex: 24 },
  { canonicalId: 'ECC', testament: 'OT', category: 'wisdom', orderIndex: 25 },
  { canonicalId: 'SNG', testament: 'OT', category: 'wisdom', orderIndex: 26 },
  { canonicalId: 'WIS', testament: 'OT', category: 'wisdom', orderIndex: 27 }, // deuterocanónico
  { canonicalId: 'SIR', testament: 'OT', category: 'wisdom', orderIndex: 28 }, // deuterocanónico
  // Proféticos
  { canonicalId: 'ISA', testament: 'OT', category: 'prophets', orderIndex: 29 },
  { canonicalId: 'JER', testament: 'OT', category: 'prophets', orderIndex: 30 },
  { canonicalId: 'LAM', testament: 'OT', category: 'prophets', orderIndex: 31 },
  { canonicalId: 'BAR', testament: 'OT', category: 'prophets', orderIndex: 32 }, // deuterocanónico
  { canonicalId: 'EZK', testament: 'OT', category: 'prophets', orderIndex: 33 },
  { canonicalId: 'DAN', testament: 'OT', category: 'prophets', orderIndex: 34 },
  { canonicalId: 'HOS', testament: 'OT', category: 'prophets', orderIndex: 35 },
  { canonicalId: 'JOL', testament: 'OT', category: 'prophets', orderIndex: 36 },
  { canonicalId: 'AMO', testament: 'OT', category: 'prophets', orderIndex: 37 },
  { canonicalId: 'OBA', testament: 'OT', category: 'prophets', orderIndex: 38 },
  { canonicalId: 'JON', testament: 'OT', category: 'prophets', orderIndex: 39 },
  { canonicalId: 'MIC', testament: 'OT', category: 'prophets', orderIndex: 40 },
  { canonicalId: 'NAM', testament: 'OT', category: 'prophets', orderIndex: 41 },
  { canonicalId: 'HAB', testament: 'OT', category: 'prophets', orderIndex: 42 },
  { canonicalId: 'ZEP', testament: 'OT', category: 'prophets', orderIndex: 43 },
  { canonicalId: 'HAG', testament: 'OT', category: 'prophets', orderIndex: 44 },
  { canonicalId: 'ZEC', testament: 'OT', category: 'prophets', orderIndex: 45 },
  { canonicalId: 'MAL', testament: 'OT', category: 'prophets', orderIndex: 46 },
  // Evangelios y Hechos
  { canonicalId: 'MAT', testament: 'NT', category: 'gospels', orderIndex: 47 },
  { canonicalId: 'MRK', testament: 'NT', category: 'gospels', orderIndex: 48 },
  { canonicalId: 'LUK', testament: 'NT', category: 'gospels', orderIndex: 49 },
  { canonicalId: 'JHN', testament: 'NT', category: 'gospels', orderIndex: 50 },
  { canonicalId: 'ACT', testament: 'NT', category: 'historical_nt', orderIndex: 51 },
  // Cartas paulinas
  { canonicalId: 'ROM', testament: 'NT', category: 'pauline', orderIndex: 52 },
  { canonicalId: '1CO', testament: 'NT', category: 'pauline', orderIndex: 53 },
  { canonicalId: '2CO', testament: 'NT', category: 'pauline', orderIndex: 54 },
  { canonicalId: 'GAL', testament: 'NT', category: 'pauline', orderIndex: 55 },
  { canonicalId: 'EPH', testament: 'NT', category: 'pauline', orderIndex: 56 },
  { canonicalId: 'PHP', testament: 'NT', category: 'pauline', orderIndex: 57 },
  { canonicalId: 'COL', testament: 'NT', category: 'pauline', orderIndex: 58 },
  { canonicalId: '1TH', testament: 'NT', category: 'pauline', orderIndex: 59 },
  { canonicalId: '2TH', testament: 'NT', category: 'pauline', orderIndex: 60 },
  { canonicalId: '1TI', testament: 'NT', category: 'pauline', orderIndex: 61 },
  { canonicalId: '2TI', testament: 'NT', category: 'pauline', orderIndex: 62 },
  { canonicalId: 'TIT', testament: 'NT', category: 'pauline', orderIndex: 63 },
  { canonicalId: 'PHM', testament: 'NT', category: 'pauline', orderIndex: 64 },
  { canonicalId: 'HEB', testament: 'NT', category: 'pauline', orderIndex: 65 },
  // Católicas y Apocalipsis
  { canonicalId: 'JAS', testament: 'NT', category: 'catholic_epistles', orderIndex: 66 },
  { canonicalId: '1PE', testament: 'NT', category: 'catholic_epistles', orderIndex: 67 },
  { canonicalId: '2PE', testament: 'NT', category: 'catholic_epistles', orderIndex: 68 },
  { canonicalId: '1JN', testament: 'NT', category: 'catholic_epistles', orderIndex: 69 },
  { canonicalId: '2JN', testament: 'NT', category: 'catholic_epistles', orderIndex: 70 },
  { canonicalId: '3JN', testament: 'NT', category: 'catholic_epistles', orderIndex: 71 },
  { canonicalId: 'JUD', testament: 'NT', category: 'catholic_epistles', orderIndex: 72 },
  { canonicalId: 'REV', testament: 'NT', category: 'apocalyptic', orderIndex: 73 },
];

main().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
