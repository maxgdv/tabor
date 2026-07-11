import { describe, expect, it } from 'vitest';
import {
  HIGHLIGHT_POST,
  HIGHLIGHT_PRE,
  toItems,
  type SearchPlace,
  type SearchResponse,
  type SearchVerse,
} from './search';

// toItems aplana la respuesta de /api/search en los items del dropdown.
// Estos tests fijan los hrefs (rutas del lector + ancla #v) y el orden de
// grupos, que es lo que el usuario acaba viendo y clicando.

const PLACE: SearchPlace = {
  slug: 'jericho-1',
  name: 'Jericó',
  modernName: 'Tell es Sultan',
  bookUrlSegment: 'jos',
  bookName: 'Josué',
  chapterNumber: 6,
  mentionCount: 6,
};

const VERSE: SearchVerse = {
  bookSegment: 'mat',
  bookName: 'Mateo',
  chapter: 5,
  verse: 14,
  snippet: `Vosotros sois la ${HIGHLIGHT_PRE}luz${HIGHLIGHT_POST} del mundo.`,
};

const empty: SearchResponse = { reference: null, places: [], verses: [] };

describe('toItems', () => {
  it('respuesta vacía → sin items', () => {
    expect(toItems(empty)).toEqual([]);
  });

  it('referencia solo-libro → enlace al índice del libro', () => {
    const items = toItems({
      ...empty,
      reference: { urlSegment: 'gen', bookName: 'Génesis' },
    });
    expect(items).toEqual([
      { key: 'ref', href: '/leer/gen', group: 'reference', title: 'Génesis' },
    ]);
  });

  it('referencia con capítulo y versículo → ancla #v en el href', () => {
    const items = toItems({
      ...empty,
      reference: { urlSegment: 'mat', bookName: 'Mateo', chapter: 5, verse: 3 },
    });
    expect(items[0]).toMatchObject({
      href: '/leer/mat/5#v3',
      title: 'Mateo 5, 3',
    });
  });

  it('lugar → enlaza al capítulo con más menciones', () => {
    const items = toItems({ ...empty, places: [PLACE] });
    expect(items[0]).toMatchObject({
      key: 'place:jericho-1',
      href: '/leer/jos/6',
      group: 'places',
      title: 'Jericó',
      subtitle: 'Josué 6',
    });
  });

  it('versículo → snippet con marcadores de resaltado intactos', () => {
    const items = toItems({ ...empty, verses: [VERSE] });
    expect(items[0]).toMatchObject({
      key: 'verse:mat-5-14',
      href: '/leer/mat/5#v14',
      title: 'Mateo 5, 14',
    });
    expect(items[0]?.snippet).toContain(`${HIGHLIGHT_PRE}luz${HIGHLIGHT_POST}`);
  });

  it('respuesta mixta → orden de grupos: referencia, lugares, versículos', () => {
    const items = toItems({
      reference: { urlSegment: 'mat', bookName: 'Mateo', chapter: 5 },
      places: [PLACE],
      verses: [VERSE],
    });
    expect(items.map((i) => i.group)).toEqual(['reference', 'places', 'verses']);
  });
});
