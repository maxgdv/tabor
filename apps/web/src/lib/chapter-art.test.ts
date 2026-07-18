import { describe, expect, it } from 'vitest';
import { CHAPTER_ART, artThumbUrl, getChapterArt } from './chapter-art';

describe('CHAPTER_ART', () => {
  it('claves con formato BOOK/chapter y campos completos', () => {
    for (const [key, art] of Object.entries(CHAPTER_ART)) {
      expect(key).toMatch(/^[A-Z0-9]{3}\/\d+$/);
      expect(art.title.length).toBeGreaterThan(0);
      expect(art.artist.length).toBeGreaterThan(0);
      // Solo imágenes directas de Commons (host permitido en next.config).
      expect(art.imageUrl).toMatch(/^https:\/\/upload\.wikimedia\.org\//);
      expect(art.sourceUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    }
  });
});

describe('getChapterArt', () => {
  it('resuelve por libro+capítulo, insensible a mayúsculas del libro', () => {
    expect(getChapterArt('LUK', 15)?.artist).toBe('Rembrandt');
    expect(getChapterArt('luk', 15)?.artist).toBe('Rembrandt');
  });

  it('null cuando no hay obra curada', () => {
    expect(getChapterArt('LUK', 24)).toBeNull();
    expect(getChapterArt('ZZZ', 1)).toBeNull();
  });
});

describe('artThumbUrl', () => {
  it('construye el patrón /thumb/<hash>/<file>/<w>px-<file>', () => {
    expect(
      artThumbUrl('https://upload.wikimedia.org/wikipedia/commons/9/96/Bloch-SermonOnTheMount.jpg', 1280),
    ).toBe(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Bloch-SermonOnTheMount.jpg/1280px-Bloch-SermonOnTheMount.jpg',
    );
  });

  it('devuelve la URL intacta si no es de Commons', () => {
    expect(artThumbUrl('https://example.com/x.jpg', 800)).toBe('https://example.com/x.jpg');
  });
});
