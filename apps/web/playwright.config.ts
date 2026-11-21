import { defineConfig, devices } from '@playwright/test';

// Pruebas de navegador: lo que los tests unitarios no pueden ver.
//
// Los dos fallos que llegaron a producción en noviembre de 2026 —el mapa que
// dejaba de seguir al texto en lectura comparada y las capas del mapa que
// desaparecían al subir MapLibre— pasaban typecheck, lint y todos los tests
// de Vitest: solo se veían con la página abierta. Esto la abre.
//
// Contra qué se ejecutan:
//   · En local:  `npm run build && npm run e2e` (con la BD de Docker en
//     marcha y DATABASE_URL exportada antes del build; ver CONTRIBUTING).
//     Playwright arranca `next start` por su cuenta.
//   · Contra un sitio ya desplegado: `E2E_BASE_URL=https://… npm run e2e`.
//     Es lo que hace el workflow diario contra producción (.github/workflows/
//     e2e.yml): la CI no tiene base de datos, así que no puede levantar la
//     app para probarla.
//
// Las pruebas son de solo lectura y sin sesión: no crean cuentas ni escriben
// en el buzón, así que pueden correr contra producción sin dejar rastro.

const PORT = 3210;
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  // Pocas pruebas y un mapa WebGL en cada una: en serie son más estables y
  // no parecen una ráfaga de bots cuando el destino es producción.
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL,
    locale: 'es-ES',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'escritorio',
      use: {
        ...devices['Desktop Chrome'],
        // El Chromium completo en su modo sin ventana, no el «headless
        // shell» recortado: el mapa es WebGL y conviene probarlo con el
        // mismo motor de pintado que tiene el lector.
        channel: 'chromium',
        viewport: { width: 1366, height: 800 },
        permissions: ['clipboard-read', 'clipboard-write'],
      },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npx next start -p ${PORT}`,
        url: `${baseURL}/robots.txt`,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});
