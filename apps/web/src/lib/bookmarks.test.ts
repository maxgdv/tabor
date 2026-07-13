import { describe, expect, it } from 'vitest';
import type { DbBookmarkListItem } from '@tabor/db';
import { groupBookmarksByBook } from './bookmarks';

const item = (
  book: string,
  chapter: number,
  verse: number,
  bookName = book,
): DbBookmarkListItem => ({
  bookCanonicalId: book,
  bookUrlSegment: book.toLowerCase(),
  bookName,
  chapterNumber: chapter,
  verseNumber: verse,
  text: 'texto',
  createdAt: new Date('2026-07-13T00:00:00Z'),
});

describe('groupBookmarksByBook', () => {
  it('lista vacía → sin grupos', () => {
    expect(groupBookmarksByBook([])).toEqual([]);
  });

  it('agrupa consecutivos por libro conservando el orden de entrada', () => {
    const groups = groupBookmarksByBook([
      item('GEN', 3, 15, 'Génesis'),
      item('GEN', 12, 1, 'Génesis'),
      item('MAT', 5, 3, 'Mateo'),
    ]);
    expect(groups.map((g) => g.bookCanonicalId)).toEqual(['GEN', 'MAT']);
    expect(groups[0]?.items).toHaveLength(2);
    expect(groups[0]?.bookName).toBe('Génesis');
    expect(groups[1]?.items[0]?.verseNumber).toBe(3);
  });

  it('el segmento de URL viene en minúsculas para construir enlaces', () => {
    const groups = groupBookmarksByBook([item('1CO', 13, 4)]);
    expect(groups[0]?.bookUrlSegment).toBe('1co');
  });
});
