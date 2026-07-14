// Resaltados y notas: paleta, validación y parsers de los cuerpos de las
// APIs. Funciones puras (sin React ni BD) — las comparten routes y tests.

export const HIGHLIGHT_COLORS = ['sand', 'olive', 'lapis', 'rose', 'sky'] as const;
export type HighlightColor = (typeof HIGHLIGHT_COLORS)[number];

// Mapa ESTÁTICO color→clases: Tailwind solo genera clases que aparecen
// literales en el fuente. Fondo suave en claro, tono-500 con alpha en dark
// (el texto sigue siendo stone-800 / sand-100, legible en ambos).
export const HIGHLIGHT_CLASSES: Record<HighlightColor, string> = {
  sand: 'bg-sand-200/80 dark:bg-sand-500/25',
  olive: 'bg-olive-200/80 dark:bg-olive-500/25',
  lapis: 'bg-lapis-200/70 dark:bg-lapis-500/30',
  rose: 'bg-rose-200/80 dark:bg-rose-500/25',
  sky: 'bg-sky-200/80 dark:bg-sky-500/25',
};

// Swatches de la barra de acciones (tono 500, distinguibles como control).
export const SWATCH_CLASSES: Record<HighlightColor, string> = {
  sand: 'bg-sand-500',
  olive: 'bg-olive-500',
  lapis: 'bg-lapis-500',
  rose: 'bg-rose-500',
  sky: 'bg-sky-500',
};

export function isHighlightColor(value: unknown): value is HighlightColor {
  return typeof value === 'string' && (HIGHLIGHT_COLORS as readonly string[]).includes(value);
}

export const NOTE_MAX_LENGTH = 5000;

const BOOK_SEGMENT = /^[a-z0-9]{2,4}$/i;

function isValidReference(book: unknown, chapter: unknown, verse: unknown): boolean {
  return (
    typeof book === 'string' &&
    BOOK_SEGMENT.test(book) &&
    typeof chapter === 'number' &&
    Number.isInteger(chapter) &&
    chapter >= 1 &&
    typeof verse === 'number' &&
    Number.isInteger(verse) &&
    verse >= 1
  );
}

export type HighlightBody = {
  book: string;
  chapter: number;
  verse: number;
  /** `null` = quitar el resaltado. */
  color: HighlightColor | null;
};

export function parseHighlightBody(data: unknown): HighlightBody | null {
  if (typeof data !== 'object' || data === null) return null;
  const { book, chapter, verse, color } = data as Record<string, unknown>;
  if (!isValidReference(book, chapter, verse)) return null;
  if (color !== null && !isHighlightColor(color)) return null;
  return {
    book: book as string,
    chapter: chapter as number,
    verse: verse as number,
    color: color as HighlightColor | null,
  };
}

export type NoteBody = {
  book: string;
  chapter: number;
  verse: number;
  /** `null` = borrar la nota. Nunca cadena vacía: borrar es explícito. */
  body: string | null;
};

export function parseNoteBody(data: unknown): NoteBody | null {
  if (typeof data !== 'object' || data === null) return null;
  const { book, chapter, verse, body } = data as Record<string, unknown>;
  if (!isValidReference(book, chapter, verse)) return null;
  if (body === null) {
    return { book: book as string, chapter: chapter as number, verse: verse as number, body: null };
  }
  if (typeof body !== 'string') return null;
  const trimmed = body.trim();
  // Vacío NO significa borrar: un textarea vaciado por accidente no debe
  // destruir la nota. Borrar viaja como body: null desde un botón explícito.
  if (trimmed.length === 0 || trimmed.length > NOTE_MAX_LENGTH) return null;
  return {
    book: book as string,
    chapter: chapter as number,
    verse: verse as number,
    body: trimmed,
  };
}
