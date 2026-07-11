import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Solo lógica pura por ahora: entorno node, sin jsdom ni testing-library.
export default defineConfig({
  resolve: {
    // Réplica del alias "@/*" de tsconfig.json (Vitest no lee paths de TS).
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
