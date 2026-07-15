import { describe, expect, it } from 'vitest';
import {
  HIGHLIGHT_CLASSES,
  HIGHLIGHT_COLORS,
  HIGHLIGHT_LABEL_MAX,
  NOTE_MAX_LENGTH,
  SWATCH_CLASSES,
  contiguousRanges,
  formatRanges,
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
  it('acepta cada color y el null de quitar (alias v1 { verse })', () => {
    for (const color of HIGHLIGHT_COLORS) {
      expect(parseHighlightBody({ book: 'gen', chapter: 3, verse: 15, color })).toEqual({
        book: 'gen',
        chapter: 3,
        start: 15,
        end: 15,
        color,
        label: null,
      });
    }
    expect(parseHighlightBody({ book: 'gen', chapter: 3, verse: 15, color: null })).toEqual({
      book: 'gen',
      chapter: 3,
      start: 15,
      end: 15,
      color: null,
      label: null,
    });
  });

  it('acepta rangos { start, end } y etiqueta recortada', () => {
    expect(
      parseHighlightBody({ book: 'mat', chapter: 5, start: 3, end: 10, color: 'lapis', label: '  fe  ' }),
    ).toEqual({ book: 'mat', chapter: 5, start: 3, end: 10, color: 'lapis', label: 'fe' });
  });

  it('etiqueta vacía o ausente normaliza a null', () => {
    expect(
      parseHighlightBody({ book: 'mat', chapter: 5, start: 3, end: 3, color: 'sand', label: '   ' })
        ?.label,
    ).toBeNull();
    expect(
      parseHighlightBody({ book: 'mat', chapter: 5, start: 3, end: 3, color: 'sand' })?.label,
    ).toBeNull();
  });

  it('el límite de la etiqueta es exacto', () => {
    const max = 'a'.repeat(HIGHLIGHT_LABEL_MAX);
    expect(
      parseHighlightBody({ book: 'mat', chapter: 5, start: 3, end: 3, color: 'sand', label: max })
        ?.label,
    ).toBe(max);
    expect(
      parseHighlightBody({
        book: 'mat',
        chapter: 5,
        start: 3,
        end: 3,
        color: 'sand',
        label: max + 'a',
      }),
    ).toBeNull();
  });

  it.each<[unknown, string]>([
    [{ book: 'gen', chapter: 3, verse: 15, color: 'red' }, 'color fuera de paleta'],
    [{ book: 'gen', chapter: 3, verse: 15 }, 'color ausente'],
    [{ book: 'gen', chapter: 0, verse: 15, color: 'sand' }, 'capítulo 0'],
    [{ book: 'gen', chapter: 3, verse: 1.5, color: 'sand' }, 'versículo no entero'],
    [{ book: 'génesis!', chapter: 3, verse: 15, color: 'sand' }, 'segmento de libro inválido'],
    [{ book: 'gen', chapter: 3, start: 10, end: 5, color: 'sand' }, 'rango invertido'],
    [{ book: 'gen', chapter: 3, start: 3, end: 4.5, color: 'sand' }, 'end no entero'],
    [{ book: 'gen', chapter: 3, start: 3, end: 5, color: 'sand', label: 7 }, 'label no string'],
    [null, 'null'],
    ['x', 'string'],
  ])('rechaza %j (%s)', (body) => {
    expect(parseHighlightBody(body)).toBeNull();
  });
});

describe('contiguousRanges', () => {
  it('agrupa contiguos, ordena y deduplica', () => {
    expect(contiguousRanges([5, 3, 4, 8, 3])).toEqual([
      { start: 3, end: 5 },
      { start: 8, end: 8 },
    ]);
  });

  it('vacío → sin rangos; un elemento → rango unitario', () => {
    expect(contiguousRanges([])).toEqual([]);
    expect(contiguousRanges([7])).toEqual([{ start: 7, end: 7 }]);
  });
});

describe('formatRanges', () => {
  it('formatea unitarios, rangos y mezclas', () => {
    expect(formatRanges([{ start: 3, end: 3 }])).toBe('3');
    expect(formatRanges([{ start: 3, end: 5 }])).toBe('3-5');
    expect(
      formatRanges([
        { start: 3, end: 5 },
        { start: 8, end: 8 },
      ]),
    ).toBe('3-5, 8');
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
