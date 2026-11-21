import { expect, test } from '@playwright/test';

// Prueba de humo: cada tipo de página responde y pinta su título, sin
// errores de JavaScript. No comprueba contenido; comprueba que nada esté
// caído (una consulta que falla, un despliegue a medias, una ruta rota).

const PAGES: Array<{ path: string; heading: string | RegExp }> = [
  { path: '/es', heading: 'La Biblia, lugar a lugar' },
  { path: '/en', heading: /.+/ },
  { path: '/es/leer', heading: /.+/ },
  { path: '/es/leer/gen', heading: /Génesis/ },
  { path: '/es/leer/psa/22', heading: 'Salmos 22' },
  { path: '/en/leer/gen/12', heading: 'Genesis 12' },
  { path: '/es/lugares', heading: /.+/ },
  { path: '/es/planes', heading: 'Planes de lectura' },
  { path: '/es/rutas', heading: /.+/ },
  { path: '/es/visitar/tierra-santa', heading: /.+/ },
  { path: '/es/versiculo-del-dia', heading: /.+/ },
  { path: '/es/comentarios', heading: /.+/ },
];

for (const { path, heading } of PAGES) {
  test(`responde y pinta su título: ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
    // Margen para que la hidratación termine y afloren sus errores.
    await page.waitForLoadState('load');
    expect(errors).toEqual([]);
  });
}

test('una ruta que no existe devuelve 404', async ({ page }) => {
  const response = await page.goto('/es/leer/mat/999');
  expect(response?.status()).toBe(404);
});

test('sitemap y robots están servidos', async ({ request }) => {
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain('/es/lugares/');

  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain('Sitemap:');
});
