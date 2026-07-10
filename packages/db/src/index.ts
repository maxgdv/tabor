import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema/index';

const connectionString =
  process.env.DATABASE_URL ?? 'postgres://tabor:tabor_dev_password@localhost:54320/tabor';

// Detecta si vamos contra un pooler tipo pgbouncer (Supabase usa puerto 6543
// en modo transaction). En ese modo: max=1 por Lambda para no agotar el
// connection limit, y prepare=false porque pgbouncer transaction no soporta
// prepared statements.
const isPooled = connectionString.includes(':6543');

// Con max=5 contra el pooler de Supabase, una sola lambda puede ejecutar
// varias queries en paralelo (p.ej. getChapterText + getChapterGeo con
// Promise.all) sin serializarlas. Sigue muy por debajo del límite de
// conexiones de Supabase (200 en plan Free).
const client = postgres(connectionString, {
  max: isPooled ? 5 : 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: !isPooled,
});

export const db = drizzle(client, { schema });
export { schema };
export type Database = typeof db;

// Consultas de dominio. Se exportan al final para que `db` ya esté inicializado
// cuando queries.ts (que lo importa) se evalúe — evita el TDZ del ciclo de imports.
export * from './queries';

// Metadatos estáticos del canon (nombres y abreviaturas es/en por libro).
// Los usa el parser de referencias de la búsqueda ("Mt 5" → MAT 5).
export { BOOK_META, type BookMeta } from './book-meta';
