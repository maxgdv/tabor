import { describe, expect, it } from 'vitest';
import {
  HIGHLIGHT_CLASSES,
  HIGHLIGHT_COLORS,
  NOTE_MAX_LENGTH,
  SWATCH_CLASSES,
  isHighlightColor,
  parseHighlightBody,
  parseNoteBody,
} from './annotations';

describe('isHighlightColor', () => {
  it('acepta los cinco de la paleta', () => {
    for (const color of HIGHLIGHT_COLORS) expect(isHighlightColor(color)).toBe(true);
  });

  it('rechaza lo demás', () => {
    expect(isHighlightColor('red')).toBe(false);
    expect(isHighlightColor('')).toBe(false);
    expect(isHighlightColor(3)).toBe(false);
    expect(isHighlightColor(null)).toBe(false);
  });
});

describe('mapas de clases', () => {
  // Guardia anti-desincronización: cada color tiene sus clases (Tailwind
  // solo genera las que aparecen literales en el fuente).
  it('HIGHLIGHT_CLASSES y SWATCH_CLASSES cubren toda la paleta', () => {
    for (const color of HIGHLIGHT_COLORS) {
      expect(HIGHLIGHT_CLASSES[color]).toBeTruthy();
      expect(SWATCH_CLASSES[color]).toBeTruthy();
    }
  });
});

describe('parseHighlightBody', () => {
  it('acepta cada color y el null de quitar', () => {
    for (const color of HIGHLIGHT_COLORS) {
      expect(parseHighlightBody({ book: 'gen', chapter: 3, verse: 15, color })).toEqual({
        book: 'gen',
        chapter: 3,
        verse: 15,
        color,
      });
    }
    expect(parseHighlightBody({ book: 'gen', chapter: 3, verse: 15, color: null })).toEqual({
      book: 'gen',
      chapter: 3,
      verse: 15,
      color: null,
    });
  });

  it.each<[unknown, string]>([
    [{ book: 'gen', chapter: 3, verse: 15, color: 'red' }, 'color fuera de paleta'],
    [{ book: 'gen', chapter: 3, verse: 15 }, 'color ausente'],
    [{ book: 'gen', chapter: 0, verse: 15, color: 'sand' }, 'capítulo 0'],
    [{ book: 'gen', chapter: 3, verse: 1.5, color: 'sand' }, 'versículo no entero'],
    [{ book: 'génesis!', chapter: 3, verse: 15, color: 'sand' }, 'segmento de libro inválido'],
    [null, 'null'],
    ['x', 'string'],
  ])('rechaza %j (%s)', (body) => {
    expect(parseHighlightBody(body)).toBeNull();
  });
});

describe('parseNoteBody', () => {
  it('recorta el cuerpo y conserva saltos de línea internos', () => {
    expect(parseNoteBody({ book: 'mat', chapter: 5, verse: 3, body: '  hola\nmundo  ' })).toEqual(
      { book: 'mat', chapter: 5, verse: 3, body: 'hola\nmundo' },
    );
  });

  it('body: null es el borrado explícito', () => {
    expect(parseNoteBody({ book: 'mat', chapter: 5, verse: 3, body: null })).toEqual({
      book: 'mat',
      chapter: 5,
      verse: 3,
      body: null,
    });
  });

  it('el límite de longitud es exacto', () => {
    const max = 'a'.repeat(NOTE_MAX_LENGTH);
    expect(parseNoteBody({ book: 'mat', chapter: 5, verse: 3, body: max })?.body).toBe(max);
    expect(parseNoteBody({ book: 'mat', chapter: 5, verse: 3, body: max + 'a' })).toBeNull();
  });

  it.each<[unknown, string]>([
    [{ book: 'mat', chapter: 5, verse: 3, body: '   ' }, 'solo espacios (vaciar no borra)'],
    [{ book: 'mat', chapter: 5, verse: 3, body: 7 }, 'body numérico'],
    [{ book: 'mat', chapter: 5, verse: 3 }, 'body ausente'],
    [{ book: 'mat', chapter: -1, verse: 3, body: 'x' }, 'capítulo negativo'],
    [null, 'null'],
  ])('rechaza %j (%s)', (body) => {
    expect(parseNoteBody(body)).toBeNull();
  });
});
