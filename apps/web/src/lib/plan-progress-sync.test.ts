import { describe, expect, it } from 'vitest';
import {
  countCompleted,
  parseSetDayBody,
  planDayCounts,
  sanitizeMergeProgress,
} from './plan-progress-sync';

// Contra los PLANS reales (datos puros): hechos-14 tiene 14 días.
const counts = planDayCounts();

describe('planDayCounts', () => {
  it('deriva los cuatro planes con sus días', () => {
    expect(counts.get('hechos-14')).toBe(14);
    expect(counts.get('evangelios-30')).toBe(30);
    expect(counts.get('salmos-60')).toBe(60);
    expect(counts.get('camino-belen-24')).toBe(24);
  });
});

describe('parseSetDayBody', () => {
  it('acepta marcar y desmarcar dentro de rango', () => {
    expect(parseSetDayBody({ plan: 'hechos-14', day: 0, done: true }, counts)).toEqual({
      plan: 'hechos-14',
      day: 0,
      done: true,
    });
    expect(parseSetDayBody({ plan: 'hechos-14', day: 13, done: false }, counts)).toEqual({
      plan: 'hechos-14',
      day: 13,
      done: false,
    });
  });

  it.each<[unknown, string]>([
    [{ plan: 'hechos-14', day: 14, done: true }, 'day == días del plan'],
    [{ plan: 'hechos-14', day: -1, done: true }, 'day negativo'],
    [{ plan: 'hechos-14', day: 1.5, done: true }, 'day no entero'],
    [{ plan: 'hechos-14', day: '3', done: true }, 'day string'],
    [{ plan: 'no-existe', day: 0, done: true }, 'slug desconocido'],
    [{ plan: 'hechos-14', day: 0 }, 'done ausente'],
    [{ plan: 'hechos-14', day: 0, done: 'yes' }, 'done no boolean'],
    [null, 'null'],
    ['texto', 'string'],
    [[1, 2], 'array'],
  ])('rechaza %j (%s)', (body) => {
    expect(parseSetDayBody(body, counts)).toBeNull();
  });
});

describe('sanitizeMergeProgress', () => {
  it('ordena y deduplica', () => {
    expect(sanitizeMergeProgress({ 'hechos-14': [3, 0, 3, 1] }, counts)).toEqual({
      'hechos-14': [0, 1, 3],
    });
  });

  it('filtra fuera de rango, no enteros y basura', () => {
    expect(sanitizeMergeProgress({ 'hechos-14': [0, 14, 99, -1, 0.5, '2', null, 2] }, counts)).toEqual({
      'hechos-14': [0, 2],
    });
  });

  it('elimina slugs desconocidos, valores no-array y claves vacías', () => {
    expect(
      sanitizeMergeProgress(
        { 'no-existe': [0], 'hechos-14': 'x', 'salmos-60': [999] },
        counts,
      ),
    ).toEqual({});
  });

  it('entrada no-objeto → vacío', () => {
    expect(sanitizeMergeProgress(null, counts)).toEqual({});
    expect(sanitizeMergeProgress('x', counts)).toEqual({});
    expect(sanitizeMergeProgress([1], counts)).toEqual({});
  });
});

describe('countCompleted', () => {
  it('cuenta solo días dentro de rango', () => {
    expect(countCompleted([0, 1, 2], 30)).toBe(3);
    expect(countCompleted([0, 99], 30)).toBe(1);
    expect(countCompleted([], 10)).toBe(0);
    expect(countCompleted([5], 0)).toBe(0);
  });
});
