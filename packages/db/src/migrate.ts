import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const url =
  process.env.DATABASE_URL ?? 'postgres://tabor:tabor_dev_password@localhost:54320/tabor';

async function main() {
  // prepare:false necesario contra pgbouncer transaction-mode (Supabase pooler).
  const isPooled = url.includes(':6543');
  const client = postgres(url, { max: 1, prepare: !isPooled });
  const db = drizzle(client);

  console.log('[db] applying migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('[db] migrations done.');

  await client.end();
}

main().catch((err) => {
  console.error('[db] migration failed:', err);
  process.exit(1);
});
