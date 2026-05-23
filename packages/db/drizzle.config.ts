import { defineConfig } from 'drizzle-kit';

const url = process.env.DATABASE_URL ?? 'postgres://tabor:tabor_dev_password@localhost:54320/tabor';

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
