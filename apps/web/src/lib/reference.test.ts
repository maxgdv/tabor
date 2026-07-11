import { describe, expect, it } from 'vitest';
import { parseReference } from './reference';

// El parser es el punto de entrada de la búsqueda por referencia: cada caso
// fija el comportamiento observable (qué libro resuelve y cómo interpreta
// capítulo/versículo), no los detalles internos de normalización.

describe('parseReference — referencias válidas', () => {
  it('abreviatura con capítulo: "Mt 5"', () => {
    expect(parseReference('Mt 5')).toEqual({
      canonicalId: 'MAT',
      urlSegment: 'mat',
      chapter: 5,
    });
  });

  it('libro solo, sin capítulo: "mt"', () => {
    expect(parseReference('mt')).toEqual({ canonicalId: 'MAT', urlSegment: 'mat' });
  });

  it('punto de abreviatura: "mt. 5"', () => {
    expect(parseReference('mt. 5')).toMatchObject({ canonicalId: 'MAT', chapter: 5 });
  });

  it.each([
    ['gen 12:6', 'dos puntos'],
    ['gen 12, 6', 'coma'],
    ['gen 12.6', 'punto tras dígito (separador, no abreviatura)'],
  ])('capítulo y versículo con separador %s', (input) => {
    expect(parseReference(input)).toEqual({
      canonicalId: 'GEN',
      urlSegment: 'gen',
      chapter: 12,
      verse: 6,
    });
  });

  it('ordinal arábigo con espacio: "1 co 13, 4"', () => {
    expect(parseReference('1 co 13, 4')).toEqual({
      canonicalId: '1CO',
      urlSegment: '1co',
      chapter: 13,
      verse: 4,
    });
  });

  it('ordinal pegado al nombre: "1cor 13"', () => {
    expect(parseReference('1cor 13')).toMatchObject({ canonicalId: '1CO', chapter: 13 });
  });

  it('ordinal romano: "ii cor 3"', () => {
    expect(parseReference('ii cor 3')).toMatchObject({ canonicalId: '2CO', chapter: 3 });
  });

  it('ordinal romano de tres, en mayúsculas: "III Juan 1"', () => {
    expect(parseReference('III Juan 1')).toMatchObject({ canonicalId: '3JN', chapter: 1 });
  });

  it('prefijo en singular: "salmo 23" → Salmos', () => {
    expect(parseReference('salmo 23')).toMatchObject({ canonicalId: 'PSA', chapter: 23 });
  });

  it('prefijo de nombre largo: "cantar 2, 4" → Cantar de los Cantares', () => {
    expect(parseReference('cantar 2, 4')).toMatchObject({
      canonicalId: 'SNG',
      chapter: 2,
      verse: 4,
    });
  });

  it('folding de acentos: "génesis" y "genesis" resuelven igual', () => {
    expect(parseReference('génesis')).toEqual(parseReference('genesis'));
    expect(parseReference('genesis')).toMatchObject({ canonicalId: 'GEN' });
  });

  it('colisión de prefijos: "ju 3" gana Jueces por orden canónico', () => {
    // "ju" es prefijo de Jueces, Judit, Juan y Judas; desambigua como el
    // índice impreso de una Biblia: el primero del canon.
    expect(parseReference('ju 3')).toMatchObject({ canonicalId: 'JDG', chapter: 3 });
  });

  it('un carácter más desambigua: "jua 1" → Juan', () => {
    expect(parseReference('jua 1')).toMatchObject({ canonicalId: 'JHN', chapter: 1 });
  });

  it('capítulo de tres dígitos: "sal 119"', () => {
    expect(parseReference('sal 119')).toMatchObject({ canonicalId: 'PSA', chapter: 119 });
  });
});

describe('parseReference — entradas rechazadas', () => {
  it('ordinal y capítulo todo pegado: "1co13"', () => {
    // Comportamiento actual: la regex exige espacio antes del capítulo.
    // Candidato a mejora futura; si se soporta, actualizar este test.
    expect(parseReference('1co13')).toBeNull();
  });

  it('capítulo cero: "mt 0"', () => {
    expect(parseReference('mt 0')).toBeNull();
  });

  it('texto libre sin libro: "amor eterno"', () => {
    expect(parseReference('amor eterno')).toBeNull();
  });

  it('prefijo de una sola letra: "j"', () => {
    expect(parseReference('j')).toBeNull();
  });

  it('cadena vacía o solo espacios', () => {
    expect(parseReference('')).toBeNull();
    expect(parseReference('   ')).toBeNull();
  });

  it('capítulo de cuatro dígitos: "mt 1000"', () => {
    // \d{1,3} en la regex: fija el límite actual de tres dígitos.
    expect(parseReference('mt 1000')).toBeNull();
  });
});
