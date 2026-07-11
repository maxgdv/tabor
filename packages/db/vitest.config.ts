import { defineConfig } from 'vitest/config';

// Solo módulos puros (text.ts): entorno node, sin base de datos.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
