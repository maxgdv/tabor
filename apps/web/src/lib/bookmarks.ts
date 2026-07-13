// Helpers puros de marcadores (sin BD): agrupación para "Mis marcadores".
// El import de tipo se borra al compilar — no arrastra la conexión.

import type { DbBookmarkListItem } from '@tabor/db';

export type BookmarkGroup = {
  bookCanonicalId: string;
  bookUrlSegment: string;
  bookName: string;
  items: DbBookmarkListItem[];
};

/**
 * Agrupa los marcadores por libro conservando el orden de entrada
 * (listBookmarks ya devuelve orden canónico libro → capítulo → versículo).
 */
export function groupBookmarksByBook(items: DbBookmarkListItem[]): BookmarkGroup[] {
  const groups: BookmarkGroup[] = [];
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
