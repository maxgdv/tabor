import { expect, test, type Page } from '@playwright/test';
import { CHAPTER, activeVerse, openChapter, scrollVerseToReadingLine, tapVerse } from './helpers';

// Comodidades de lectura que viven en el dispositivo del lector (sin cuenta):
// tamaño de letra, compartir un versículo y retomar la lectura.

const verseFontSize = (page: Page) =>
  page.locator('[data-verse="1"]').evaluate((el) => getComputedStyle(el).fontSize);

test.describe('tamaño de letra', () => {
  test('se cambia desde los ajustes y se conserva al recargar', async ({ page }) => {
    await openChapter(page);
    expect(await verseFontSize(page)).toBe('18px');

    await page.getByRole('button', { name: 'Ajustes de lectura' }).click();
    const larger = page.getByRole('button', { name: 'Aumentar el tamaño de letra' });
    await larger.click();
    await larger.click();
    await expect(page.getByText('130 %')).toBeVisible();
    expect(await verseFontSize(page)).toBe('23.4px');

    // Al recargar, el tamaño ya está aplicado cuando llega el HTML: sin
    // esperar a que React hidrate (ese es el trabajo del script de arranque).
    await page.reload({ waitUntil: 'commit' });
    await expect(page.locator('[data-verse="1"]')).toBeVisible();
    expect(await verseFontSize(page)).toBe('23.4px');
  });

  test('no pierde el versículo que se estaba leyendo', async ({ page }) => {
    await openChapter(page);
    await scrollVerseToReadingLine(page, 13);
    await expect.poll(() => activeVerse(page)).toBe(13);
    const top = () =>
      page.locator('[data-verse="13"]').evaluate((el) => el.getBoundingClientRect().top);
    const before = await top();

    await page.getByRole('button', { name: 'Ajustes de lectura' }).click();
    await page.getByRole('button', { name: 'Aumentar el tamaño de letra' }).click();

    expect(Math.abs((await top()) - before)).toBeLessThan(2);
  });

  test('tiene tope por arriba y por abajo', async ({ page }) => {
    await openChapter(page);
    await page.getByRole('button', { name: 'Ajustes de lectura' }).click();
    const smaller = page.getByRole('button', { name: 'Reducir el tamaño de letra' });
    await smaller.click();
    await expect(page.getByText('90 %')).toBeVisible();
    await expect(smaller).toBeDisabled();
  });
});

test.describe('compartir un versículo', () => {
  test('sin sesión se puede seleccionar un versículo y copiarlo con su enlace', async ({
    page,
  }) => {
    await openChapter(page);
    await tapVerse(page, 4);

    const toolbar = page.getByRole('toolbar', { name: 'Versículo 4' });
    await expect(toolbar).toBeVisible();
    // Resaltar y anotar piden cuenta: sin ella no se ofrecen.
    await expect(toolbar.getByRole('group', { name: 'Resaltar con color' })).toHaveCount(0);

    await toolbar.getByRole('button', { name: 'Copiar', exact: true }).click();
    await expect(toolbar.getByRole('status')).toHaveText('Copiado');

    const copied = (await page.evaluate(() => navigator.clipboard.readText())).replace(
      /\r\n/g,
      '\n',
    );
    const [quote, reference, link] = copied.split('\n');
    expect(quote).toMatch(/^«.*No de pan solo vivirá el hombre.*»$/);
    expect(reference).toBe('— Mateo 4, 4 · Biblia Platense (Straubinger)');
    expect(link).toMatch(/\/es\/leer\/mat\/4#v4$/);
  });

  test('varios versículos seguidos salen como un rango', async ({ page }) => {
    await openChapter(page);
    await tapVerse(page, 4);
    await tapVerse(page, 5);

    const toolbar = page.getByRole('toolbar', { name: 'Versículos 4-5' });
    await toolbar.getByRole('button', { name: 'Copiar', exact: true }).click();
    await expect(toolbar.getByRole('status')).toHaveText('Copiado');

    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain('— Mateo 4, 4-5 · ');
    expect(copied).toMatch(/#v4$/);
  });

  test('el número del versículo lo selecciona con el teclado', async ({ page }) => {
    await openChapter(page);
    const number = page.getByRole('button', { name: 'Seleccionar el versículo 7', exact: true });
    await number.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('toolbar', { name: 'Versículo 7' })).toBeVisible();
    await expect(number).toHaveAttribute('aria-pressed', 'true');

    await page.keyboard.press('Escape');
    await expect(page.getByRole('toolbar')).toHaveCount(0);
  });

  test('el enlace compartido abre el capítulo en ese versículo', async ({ page }) => {
    await page.goto(`${CHAPTER}#v20`);
    await expect(page.locator('[data-verse="20"]')).toBeInViewport();
    await expect.poll(() => activeVerse(page)).not.toBeNull();
    // El salto es dentro del panel de texto: la página no se desplaza, y la
    // cabecera del sitio sigue entera.
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(page.getByRole('banner')).toBeInViewport({ ratio: 1 });
  });
});

test.describe('seguir leyendo', () => {
  test('la portada ofrece retomar el último capítulo, en el versículo', async ({ page }) => {
    await page.goto('/es');
    const cta = page.locator('main a').first();
    await expect(cta).toHaveText('Comenzar a leer');
    await expect(cta).toHaveAttribute('href', '/es/leer');

    await openChapter(page);
    await scrollVerseToReadingLine(page, 18);
    await expect.poll(() => activeVerse(page)).toBe(18);

    await page.goto('/es');
    await expect(cta).toContainText('Seguir leyendo');
    await expect(cta).toContainText('Mateo 4');
    await expect(cta).toHaveAttribute('href', '/es/leer/mat/4#v18');

    await cta.click();
    await expect(page).toHaveURL(/\/es\/leer\/mat\/4#v18$/);
    await expect(page.locator('[data-verse="18"]')).toBeInViewport();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  });

  test('el nombre del libro sale en el idioma de la interfaz', async ({ page }) => {
    await openChapter(page);
    await page.goto('/en');
    await expect(page.locator('main a').first()).toContainText('Continue reading');
    await expect(page.locator('main a').first()).toContainText('Matthew 4');
  });

  test('recargar el capítulo devuelve la lectura a donde estaba', async ({ page }) => {
    await openChapter(page);
    await scrollVerseToReadingLine(page, 18);
    await expect.poll(() => activeVerse(page)).toBe(18);

    const stored = () => page.evaluate(() => localStorage.getItem('tabor.lastRead'));
    const expected = '{"book":"MAT","chapter":4,"verse":18}';
    expect(await stored()).toBe(expected);

    // Dos recargas seguidas: el texto vuelve a su sitio y la posición
    // apuntada no retrocede sola por el camino.
    for (let i = 0; i < 2; i += 1) {
      await page.reload();
      await expect(page.locator('[data-verse="18"]')).toBeInViewport();
      await expect(page.locator('.maplibregl-marker').first()).toBeVisible();
      expect(await stored()).toBe(expected);
    }
  });

  test('abrir un capítulo sin moverse no inventa una posición', async ({ page }) => {
    await openChapter(page);
    const stored = () => page.evaluate(() => localStorage.getItem('tabor.lastRead'));
    expect(await stored()).toBe('{"book":"MAT","chapter":4,"verse":null}');

    // Siguiente capítulo desde la barra: se apunta el capítulo nuevo, sin
    // heredar el versículo del anterior.
    await page
      .getByRole('link', { name: /Mateo 5/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/es\/leer\/mat\/5$/);
    await expect.poll(stored).toBe('{"book":"MAT","chapter":5,"verse":null}');
  });
});
