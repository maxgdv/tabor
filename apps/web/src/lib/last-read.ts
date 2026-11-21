// «Seguir leyendo»: el último capítulo abierto, guardado en este dispositivo.
//
// Vive en localStorage y no en la cuenta a propósito: funciona igual para
// invitados, no añade ninguna petición al lector (que se sirve entero desde
// la CDN) y la portada lo lee ya en el navegador, así que sigue siendo la
// misma página estática para todos.
//
// Se guarda el identificador canónico del libro, no su nombre: el nombre se
// resuelve al pintar, en el idioma en que esté la interfaz en ese momento.

import { BOOK_META } from '@tabor/db/book-meta';

export type LastRead = {
  /** Identificador canónico en mayúsculas: 'GEN', '1SA'. */
  book: string;
  chapter: number;
  /** Versículo por el que iba la lectura; `null` si no pasó del principio. */
  verse: number | null;
};

const KEY = 'tabor.lastRead';
const EVENT = 'tabor-last-read-change';

const BOOK_NAMES = new Map(BOOK_META.map((m) => [m.canonicalId, { es: m.es.name, en: m.en.name }]));

function isPositiveInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1;
}

/**
 * Interpreta lo guardado. `null` ante cualquier cosa que no sea una posición
 * válida de un libro del canon: lo que hay en localStorage puede venir de una
 * versión anterior de la app o haber sido editado a mano.
 */
export function parseLastRead(raw: string | null): LastRead | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof data !== 'object' || data === null) return null;
  const { book, chapter, verse } = data as Record<string, unknown>;
  if (typeof book !== 'string' || !BOOK_NAMES.has(book)) return null;
  if (!isPositiveInt(chapter)) return null;
  return { book, chapter, verse: isPositiveInt(verse) ? verse : null };
}

/** «Mateo 4» en el idioma de la interfaz. */
export function lastReadLabel(last: LastRead, locale: string): string {
  const names = BOOK_NAMES.get(last.book);
  const name = (locale === 'en' ? names?.en : names?.es) ?? last.book;
  return `${name} ${last.chapter}`;
}

/**
 * Ruta del lector (sin prefijo de idioma) para retomar la lectura. Solo se
 * ancla al versículo si la lectura había avanzado: volver a `#v1` no aporta
 * nada y centraría el primer versículo dejando el título fuera de la vista.
 */
export function lastReadHref(last: LastRead): string {
  const base = `/leer/${last.book.toLowerCase()}/${last.chapter}`;
  return last.verse !== null && last.verse > 1 ? `${base}#v${last.verse}` : base;
}

// --- Almacenamiento ---------------------------------------------------------

/** JSON crudo: las cadenas se comparan por valor en useSyncExternalStore. */
export function getLastReadSnapshot(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function subscribeLastRead(onChange: () => void): () => void {
  window.addEventListener('storage', onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

export function saveLastRead(last: LastRead): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(last));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // Sin almacenamiento (modo privado estricto): no hay «seguir leyendo».
  }
}
