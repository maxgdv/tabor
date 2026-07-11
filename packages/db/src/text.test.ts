import { describe, expect, it } from 'vitest';
import { ACCENTED, PLAIN, escapeLike, foldJs } from './text';

describe('escapeLike', () => {
  it('escapa los metacaracteres de LIKE', () => {
    expect(escapeLike('100%_libre\\')).toBe('100\\%\\_libre\\\\');
  });

  it('deja intacto el texto normal', () => {
    expect(escapeLike('Jericó de Judá')).toBe('Jericó de Judá');
  });
});

describe('foldJs', () => {
  it('minúsculas y sin acentos', () => {
    expect(foldJs('Jericó')).toBe('jerico');
    expect(foldJs('GÉNESIS')).toBe('genesis');
    expect(foldJs('Efraín')).toBe('efrain');
  });

  it('ñ y ç también se pliegan', () => {
    expect(foldJs('señor')).toBe('senor');
    expect(foldJs('Françesca')).toBe('francesca');
  });

  it('texto sin diacríticos no cambia', () => {
    expect(foldJs('belen')).toBe('belen');
  });
});

describe('invariante JS ↔ SQL', () => {
  // foldSql usa translate(lower(col), ACCENTED, PLAIN) en Postgres; si esta
  // igualdad se rompe, la BD y el JS plegarían distinto y la búsqueda de
  // lugares dejaría de encontrar coincidencias con acentos.
  it('foldJs(ACCENTED) === PLAIN (mismo plegado en ambos lados)', () => {
    expect(ACCENTED.length).toBe(PLAIN.length);
    expect(foldJs(ACCENTED)).toBe(PLAIN);
  });
});
