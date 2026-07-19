import { describe, expect, it } from 'vitest';
import { adventStart, easterDate, getLiturgicalSeason } from './liturgical';

const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));

describe('easterDate (cómputo gregoriano)', () => {
  it.each<[number, number, number]>([
    [2024, 3, 31],
    [2025, 4, 20],
    [2026, 4, 5],
    [2027, 3, 28],
    [2030, 4, 21],
  ])('Pascua %i → %i/%i', (year, month, day) => {
    const easter = easterDate(year);
    expect([easter.getUTCMonth() + 1, easter.getUTCDate()]).toEqual([month, day]);
  });
});

describe('adventStart', () => {
  it('cuarto domingo antes de Navidad', () => {
    expect(adventStart(2026).toISOString().slice(0, 10)).toBe('2026-11-29');
    expect(adventStart(2025).toISOString().slice(0, 10)).toBe('2025-11-30');
    // Navidad 2022 cayó en domingo → Adviento empezó el 27-nov.
    expect(adventStart(2022).toISOString().slice(0, 10)).toBe('2022-11-27');
  });
});

describe('getLiturgicalSeason', () => {
  it.each<[string, string | null]>([
    ['2026-02-17', null], // martes de carnaval
    ['2026-02-18', 'cuaresma'], // miércoles de ceniza 2026
    ['2026-03-28', 'cuaresma'],
    ['2026-03-29', 'semana-santa'], // Domingo de Ramos 2026
    ['2026-04-04', 'semana-santa'], // Sábado Santo
    ['2026-04-05', 'pascua'], // Domingo de Resurrección
    ['2026-05-24', 'pascua'], // Pentecostés 2026
    ['2026-05-25', null], // vuelta al Ordinario
    ['2026-07-19', null], // pleno verano
    ['2026-11-28', null], // víspera de Adviento
    ['2026-11-29', 'adviento'], // primer domingo de Adviento 2026
    ['2026-12-24', 'adviento'],
    ['2026-12-25', 'navidad'],
    ['2027-01-06', 'navidad'], // Epifanía
    ['2027-01-10', 'navidad'], // Bautismo del Señor 2027 (domingo)
    ['2027-01-11', null],
  ])('%s → %s', (iso, expected) => {
    expect(getLiturgicalSeason(new Date(iso + 'T12:00:00Z'))).toBe(expected);
  });

  it('cubre el cambio de año dentro de Navidad', () => {
    expect(getLiturgicalSeason(utc(2027, 1, 2))).toBe('navidad');
  });
});
