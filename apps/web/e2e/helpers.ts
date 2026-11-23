import { expect, type Page } from '@playwright/test';

/** Capítulo de referencia: corto, con lugares en muchos versículos. */
export const CHAPTER = '/es/leer/mat/4';

/**
 * Abre un capítulo y espera a que el lector esté operativo: texto pintado y
 * mapa con sus marcadores. Los marcadores los pone el JavaScript del mapa,
 * así que verlos garantiza que la página ya está hidratada; sin esta espera
 * las pruebas tocarían HTML estático que aún no responde.
 */
export async function openChapter(page: Page, path: string = CHAPTER): Promise<void> {
  await page.goto(path);
  await expect(page.locator('[data-verse="1"]')).toBeVisible();
  await expect(page.locator('.maplibregl-marker').first()).toBeVisible();
}

/**
 * Lleva un versículo a la «línea de lectura» desplazando solo el panel de
 * texto, como haría el usuario con la rueda o el dedo.
 *
 * El lector marca como activo el versículo más alto dentro de una franja
 * entre el 25 % y el 40 % del alto de la ventana. Para que ese sea justo el
 * pedido, se deja el final del versículo anterior unos píxeles por encima de
 * la franja: en texto corrido los dos comparten renglón, así que alinear el
 * principio del pedido no bastaría. Vale para versículos de más de un
 * renglón, que son los que usan las pruebas.
 *
 * Empieza con un toque de rueda de verdad sobre el texto: la app distingue
 * el movimiento del usuario del que hace ella sola (ver LastReadTracker), y
 * un `scrollBy` desde script no cuenta como gesto.
 *
 * La alineación se repite hasta que aguanta quieta. El navegador aplica la
 * rueda con retraso (y a veces animada), y una tipografía que termina de
 * cargar recoloca los renglones: medir una sola vez dejaba el texto unos
 * píxeles pasado cuando la máquina iba lenta, y el versículo activo era el
 * siguiente. Pasó en la primera ejecución contra producción desde GitHub.
 */
export async function scrollVerseToReadingLine(page: Page, verse: number): Promise<void> {
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.locator('[data-reader-scroll]').hover();
  const wheelSeen = page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        window.addEventListener('wheel', () => resolve(), { once: true, capture: true });
      }),
  );
  await page.mouse.wheel(0, 40);
  await wheelSeen;
  await page.evaluate(async (verse) => {
    const el = document.querySelector<HTMLElement>(`[data-verse="${verse}"]`);
    const scroller = el?.closest<HTMLElement>('[data-reader-scroll]');
    if (!el || !scroller) throw new Error(`No se encuentra el versículo ${verse}`);
    const previous = document.querySelector<HTMLElement>(`[data-verse="${verse - 1}"]`);
    const misalignment = () => {
      const bandTop = window.innerHeight * 0.25;
      return previous
        ? previous.getBoundingClientRect().bottom - (bandTop - 4)
        : el.getBoundingClientRect().top - (bandTop + 8);
    };
    const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const deadline = performance.now() + 5000;
    // Tres medidas seguidas en su sitio, a 100 ms: ya no se mueve nada.
    let calm = 0;
    while (calm < 3) {
      if (performance.now() > deadline) {
        throw new Error(`El versículo ${verse} no se queda quieto en la línea de lectura`);
      }
      const delta = misalignment();
      const before = scroller.scrollTop;
      if (Math.abs(delta) >= 1) scroller.scrollBy({ top: delta, behavior: 'instant' });
      // Sin recorrido (final del capítulo) el panel no se mueve: más cerca
      // no se puede dejar, así que también cuenta como quieto.
      calm = scroller.scrollTop === before ? calm + 1 : 0;
      await pause(100);
    }
  }, verse);
}

/** Número del versículo activo, o `null` si no hay ninguno marcado. */
export async function activeVerse(page: Page): Promise<number | null> {
  return page.evaluate(() => {
    const el = document.querySelector<HTMLElement>('[data-verse][data-active="true"]');
    return el ? Number(el.dataset.verse) : null;
  });
}

/** Nombres de los lugares que el mapa resalta para el versículo activo. */
export async function activePlaces(page: Page): Promise<string[]> {
  return page
    .locator('.maplibregl-marker[data-active="true"]')
    .evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.placeName ?? ''));
}

/**
 * Toca el texto de un versículo. Los versículos son spans en línea que
 * comparten renglón con sus vecinos: se apunta a su último renglón, que
 * es el único que con seguridad empieza por texto suyo.
 */
export async function tapVerse(page: Page, verse: number): Promise<void> {
  const point = await page.evaluate((verse) => {
    const el = document.querySelector<HTMLElement>(`[data-verse="${verse}"]`);
    if (!el) throw new Error(`No se encuentra el versículo ${verse}`);
    const rects = [...el.getClientRects()];
    const last = rects[rects.length - 1];
    if (!last) throw new Error(`El versículo ${verse} no está pintado`);
    return { x: last.left + Math.min(30, last.width / 2), y: last.top + last.height / 2 };
  }, verse);
  await page.mouse.click(point.x, point.y);
}
