// Parser de referencias bíblicas escritas a mano: "Mt 5", "Gen 12:6",
// "1 Co 13", "salmo 23", "cantar 2, 4"…
//
// Acepta nombres y abreviaturas en español e inglés indistintamente (quien
// usa la UI en español escribe "Gen" con naturalidad), sin acentos y sin
// puntos de abreviatura. Devuelve la referencia estructurada; validar que el
// capítulo exista es responsabilidad del llamador (requiere BD).

import { BOOK_META } from '@tabor/db';

export type ParsedReference = {
  canonicalId: string; // 'MAT'
  urlSegment: string; // 'mat'
  chapter?: number;
  verse?: number;
};

/** minúsculas, sin diacríticos, sin puntos de abreviatura, espacios colapsados. */
function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/(?<=[a-z])\./g, '') // "mt." → "mt" (el punto tras dígito es separador)
    .replace(/\s+/g, ' ')
    .trim();
}

// Alias normalizado → libro. Se generan de BOOK_META (nombre y abreviatura
// es/en + canonicalId). En colisiones gana el libro anterior en orden
// canónico, coherente con cómo desambigua el índice impreso de una Biblia.
type AliasEntry = { alias: string; canonicalId: string; order: number };

const ALIASES: AliasEntry[] = (() => {
  const seen = new Map<string, AliasEntry>();
  BOOK_META.forEach((meta, order) => {
    for (const raw of [
      meta.es.name,
      meta.en.name,
      meta.es.short,
      meta.en.short,
      meta.canonicalId,
    ]) {
      const alias = normalize(raw);
      if (!seen.has(alias)) {
        seen.set(alias, { alias, canonicalId: meta.canonicalId, order });
      }
    }
  });
  return Array.from(seen.values());
})();

/** "ii cor" → "2 cor", "1cor" → "1 cor": normaliza el ordinal del libro. */
function normalizeOrdinal(bookPart: string): string {
  return bookPart
    .replace(/^(i{1,3})\s+/, (_, r: string) => `${r.length} `)
    .replace(/^([123])(?=[a-z])/, '$1 ');
}

function matchBook(bookPart: string): AliasEntry | null {
  const needle = normalizeOrdinal(bookPart);
  const exact = ALIASES.find((a) => a.alias === needle);
  if (exact) return exact;
  if (needle.length < 2) return null;
  // Prefijo: "mate" → "mateo", "salmo" → "salmos". Gana el primero del canon.
  const candidates = ALIASES.filter((a) => a.alias.startsWith(needle));
  if (candidates.length === 0) return null;
  return candidates.reduce((best, c) => (c.order < best.order ? c : best));
}

/**
 * Interpreta la consulta como referencia bíblica.
 * `null` si no se reconoce ningún libro (la consulta será texto libre).
 */
export function parseReference(query: string): ParsedReference | null {
  const norm = normalize(query);
  // libro [capítulo [separador versículo]] — el libro puede llevar ordinal.
  const m = norm.match(/^([123]?\s?[a-z][a-z ]*?)(?:\s+(\d{1,3})(?:\s*[:,.]\s*(\d{1,3}))?)?$/);
  if (!m || !m[1]) return null;

  const book = matchBook(m[1]);
  if (!book) return null;

  const chapter = m[2] ? Number(m[2]) : undefined;
  const verse = m[3] ? Number(m[3]) : undefined;
  if (chapter !== undefined && chapter < 1) return null;

  return {
    canonicalId: book.canonicalId,
    urlSegment: book.canonicalId.toLowerCase(),
    ...(chapter !== undefined ? { chapter } : {}),
    ...(verse !== undefined ? { verse } : {}),
  };
}
