import { describe, expect, it } from 'vitest';
import { lastReadHref, lastReadLabel, parseLastRead } from './last-read';

describe('parseLastRead', () => {
  it('lee una posición válida', () => {
    expect(parseLastRead('{"book":"MAT","chapter":4,"verse":12}')).toEqual({
      book: 'MAT',
      chapter: 4,
      verse: 12,
    });
  });

  it('acepta una posición sin versículo', () => {
    expect(parseLastRead('{"book":"GEN","chapter":1,"verse":null}')).toEqual({
      book: 'GEN',
      chapter: 1,
      verse: null,
    });
    expect(parseLastRead('{"book":"GEN","chapter":1}')?.verse).toBeNull();
  });

  it('descarta lo vacío y lo que no es JSON', () => {
    expect(parseLastRead(null)).toBeNull();
    expect(parseLastRead('')).toBeNull();
    expect(parseLastRead('{book:')).toBeNull();
    expect(parseLastRead('"MAT 4"')).toBeNull();
    expect(parseLastRead('null')).toBeNull();
  });

  it('descarta libros que no están en el canon', () => {
    expect(parseLastRead('{"book":"XYZ","chapter":1}')).toBeNull();
    // El identificador es canónico, en mayúsculas: una ruta no vale.
    expect(parseLastRead('{"book":"mat","chapter":1}')).toBeNull();
    expect(parseLastRead('{"book":"../../cuenta","chapter":1}')).toBeNull();
  });

  it('descarta capítulos que no son enteros positivos', () => {
    expect(parseLastRead('{"book":"MAT","chapter":0}')).toBeNull();
    expect(parseLastRead('{"book":"MAT","chapter":-2}')).toBeNull();
    expect(parseLastRead('{"book":"MAT","chapter":1.5}')).toBeNull();
    expect(parseLastRead('{"book":"MAT","chapter":"4"}')).toBeNull();
  });

  it('ignora un versículo inválido sin perder el capítulo', () => {
    expect(parseLastRead('{"book":"MAT","chapter":4,"verse":"x"}')).toEqual({
      book: 'MAT',
      chapter: 4,
      verse: null,
    });
    expect(parseLastRead('{"book":"MAT","chapter":4,"verse":0}')?.verse).toBeNull();
  });
});

describe('lastReadLabel', () => {
  it('nombra el libro en el idioma de la interfaz', () => {
    const last = { book: 'MAT', chapter: 4, verse: null };
    expect(lastReadLabel(last, 'es')).toBe('Mateo 4');
    expect(lastReadLabel(last, 'en')).toBe('Matthew 4');
  });

  it('conserva el ordinal de los libros numerados', () => {
    expect(lastReadLabel({ book: '1SA', chapter: 17, verse: 4 }, 'es')).toBe('1 Samuel 17');
  });
});

describe('lastReadHref', () => {
  it('enlaza al capítulo con el segmento en minúsculas', () => {
    expect(lastReadHref({ book: '1SA', chapter: 17, verse: null })).toBe('/leer/1sa/17');
  });

  it('ancla al versículo cuando la lectura había avanzado', () => {
    expect(lastReadHref({ book: 'MAT', chapter: 4, verse: 12 })).toBe('/leer/mat/4#v12');
  });

  it('no ancla al primer versículo', () => {
    expect(lastReadHref({ book: 'MAT', chapter: 4, verse: 1 })).toBe('/leer/mat/4');
  });
});
