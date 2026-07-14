// Helpers puros de contenido personal (sin BD): agrupación por libro para
// "Mis marcadores", "Mis notas" y el export. El import de tipo se borra al
// compilar — no arrastra la conexión.

import type { DbBookmarkListItem } from '@tabor/db';

type BookRef = {
  bookCanonicalId: string;
  bookUrlSegment: string;
  bookName: string;
};

export type BookGroup<T extends BookRef> = BookRef & {
  items: T[];
};

/**
 * Agrupa items por libro conservando el orden de entrada (las queries list*
 * ya devuelven orden canónico libro → capítulo → versículo).
 */
export function groupByBook<T extends BookRef>(items: T[]): Array<BookGroup<T>> {
  const groups: Array<BookGroup<T>> = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.bookCanonicalId === item.bookCanonicalId) {
      last.items.push(item);
    } else {
      groups.push({
        bookCanonicalId: item.bookCanonicalId,
        bookUrlSegment: item.bookUrlSegment,
        bookName: item.bookName,
        items: [item],
      });
    }
  }
  return groups;
}

export type BookmarkGroup = BookGroup<DbBookmarkListItem>;

/** Alias retro-compatible para los marcadores. */
export const groupBookmarksByBook = groupByBook<DbBookmarkListItem>;
