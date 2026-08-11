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
// ⚠️ INVARIANTE CRÍTICA (caída real del 2026-07-19): contra el pooler de
// Supabase (transaction mode), si una petición lanza MÁS queries en paralelo
// que `max`, postgres-js encola la sobrante y el pool queda envenenado: la
// primera ráfaga responde y TODA query posterior cuelga indefinidamente
// (reproducido A/B: max=5 con 6 paralelas → colgado; max=10 → perfecto).
// `max` debe superar siempre el máximo de queries simultáneas — y con las
// páginas estáticas (ISR bajo demanda) la unidad ya no es una petición sino
// los renders concurrentes del mismo proceso: cada generación de capítulo
// lanza ~5 queries (texto+geo + prev + next + listBooks del header), y justo
// tras un deploy pueden coincidir varias generaciones en la misma instancia
// (reproducido en local: 3 renders × 5 queries con max=12 → 2 colgados).
// max=24 tolera 4 generaciones simultáneas y sigue lejos del límite de 200
// conexiones del pooler en el plan Free de Supabase.
const client = postgres(connectionString, {
  max: 24,
  idle_timeout: 10,
  connect_timeout: 10,
  keep_alive: 20,
  max_lifetime: 60 * 5,
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
