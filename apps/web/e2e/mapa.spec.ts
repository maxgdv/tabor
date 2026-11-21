import { expect, test } from '@playwright/test';
import { activePlaces, activeVerse, openChapter, scrollVerseToReadingLine } from './helpers';

// Lo que distingue a Tabor es que el mapa acompaña a la lectura. Estas
// pruebas vigilan esa sincronía y las dos formas en que ya se rompió.

test.describe('mapa del lector', () => {
  test('carga el worker de MapLibre, sin el que no se pinta nada vectorial', async ({
    page,
    request,
    baseURL,
  }) => {
    // Regresión de nov-2026: MapLibre 6 no incrusta su worker y, empaquetado,
    // lo pedía a una ruta que daba 404. El satélite se veía igual y no había
    // errores en consola, pero desaparecían regiones, rutas y rótulos.
    const sameOriginFailures: string[] = [];
    page.on('response', (response) => {
      const url = new URL(response.url());
      const ours = url.origin === new URL(baseURL!).origin;
      // /_vercel/ son las analíticas: fuera de Vercel no existen.
      if (ours && response.status() >= 400 && !url.pathname.startsWith('/_vercel/')) {
        sameOriginFailures.push(`${response.status()} ${url.pathname}`);
      }
    });

    await openChapter(page);

    await expect
      .poll(() => page.workers().filter((w) => w.url().includes('maplibre-gl-worker')).length)
      .toBeGreaterThan(0);
    const workerUrl = page
      .workers()
      .map((w) => w.url())
      .find((url) => url.includes('maplibre-gl-worker'));
    const worker = await request.get(workerUrl!);
    expect(worker.status()).toBe(200);
    expect(worker.headers()['content-type']).toContain('javascript');

    expect(sameOriginFailures).toEqual([]);
  });

  test('el mapa sigue al texto al desplazar la lectura', async ({ page }) => {
    await openChapter(page);

    // Mateo 4, 13: Jesús deja Nazaret y se establece en Cafarnaúm.
    await scrollVerseToReadingLine(page, 13);
    await expect.poll(() => activeVerse(page)).toBe(13);
    await expect.poll(() => activePlaces(page)).toContain('Cafarnaúm');
  });

  test('el mapa sigue al texto también en lectura comparada', async ({ page }) => {
    // Regresión de nov-2026: al activar «Comparar» los versículos se
    // remontaban y el lector se quedaba observando nodos que ya no estaban
    // en la página; el versículo activo dejaba de cambiar.
    await openChapter(page);
    await scrollVerseToReadingLine(page, 13);
    await expect.poll(() => activeVerse(page)).toBe(13);

    await page.getByRole('button', { name: 'English (CPDV)' }).click();
    await expect(page).toHaveURL(/\?vs=cpdv/);
    await expect(page.locator('[data-verse="1"] [lang="en"]')).toBeVisible();

    // Mateo 4, 25: lo siguen multitudes de Galilea, Decápolis, Jerusalén…
    await scrollVerseToReadingLine(page, 25);
    await expect.poll(() => activeVerse(page)).toBe(25);
    await expect.poll(() => activePlaces(page)).toContain('Jerusalén');
  });

  test('pulsar un lugar del mapa lleva el texto a su versículo', async ({ page }) => {
    await openChapter(page);
    const before = await page.locator('[data-reader-scroll]').evaluate((el) => el.scrollTop);

    await page.locator('.maplibregl-marker[data-place-name="Decápolis"]').click();

    await expect
      .poll(() => page.locator('[data-reader-scroll]').evaluate((el) => el.scrollTop))
      .toBeGreaterThan(before);
    await expect(page.locator('[data-verse="25"]')).toBeInViewport();
  });
});

test('la ficha de un lugar pinta su mapa', async ({ page }) => {
  await page.goto('/es/lugares/jerusalem');
  await expect(page.getByRole('heading', { level: 1, name: 'Jerusalén' })).toBeVisible();
  await expect(page.locator('.maplibregl-canvas')).toBeVisible();
  await expect(page.locator('.maplibregl-marker')).toHaveCount(1);
  // La ficha enlaza de vuelta a la lectura: es su razón de ser.
  await expect(page.locator('main a[href^="/es/leer/"]').first()).toBeVisible();
});
