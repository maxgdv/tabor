// Helpers de texto para las consultas de búsqueda. Sin efectos secundarios:
// este módulo no toca la conexión, así que es testeable sin base de datos.

import { sql, type SQL } from 'drizzle-orm';

/** Escapa los metacaracteres de LIKE para usar entrada del usuario en ILIKE. */
export function escapeLike(input: string): string {
  return input.replace(/[\\%_]/g, (c) => `\\${c}`);
}

// Folding de acentos para que "jerico" encuentre "Jericó". Se hace igual en
// SQL (translate, sin depender de la extensión unaccent) y en JS (NFD).
// Invariante: foldJs(ACCENTED) === PLAIN — cubierto por test.
export const ACCENTED = 'áàâäãéèêëíìîïóòôöõúùûüñç';
export const PLAIN = 'aaaaaeeeeiiiiooooouuuunc';

export function foldSql(col: unknown): SQL {
  return sql`translate(lower(${col}), ${ACCENTED}, ${PLAIN})`;
}

export function foldJs(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}
