import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema/index';

const connectionString =
  process.env.DATABASE_URL ?? 'postgres://tabor:tabor_dev_password@localhost:54320/tabor';

// Cliente único reutilizable. En Next.js Route Handlers se importa este módulo
// y se reaprovecha la misma conexión entre invocaciones del mismo worker.
const client = postgres(connectionString, { max: 10 });

export const db = drizzle(client, { schema });
export { schema };
export type Database = typeof db;

// Consultas de dominio. Se exportan al final para que `db` ya esté inicializado
// cuando queries.ts (que lo importa) se evalúe — evita el TDZ del ciclo de imports.
export * from './queries';
