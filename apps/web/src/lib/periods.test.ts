import { describe, expect, it } from 'vitest';
import { PERIODS, getPeriod, periodIndex } from './periods';

describe('getPeriod', () => {
  it('Génesis se parte en Orígenes (1-11) y Patriarcas (12-50)', () => {
    expect(getPeriod('GEN', 1)).toBe('origins');
    expect(getPeriod('GEN', 11)).toBe('origins');
    expect(getPeriod('GEN', 12)).toBe('patriarchs');
    expect(getPeriod('GEN', 50)).toBe('patriarchs');
  });

  it.each<[string, number, string]>([
    ['EXO', 14, 'exodus'],
    ['RUT', 1, 'judges'],
    ['PSA', 23, 'kingdoms'],
    ['DAN', 3, 'exile'],
    ['EST', 4, 'persia'],
    ['1MA', 2, 'hellenism'],
    ['LUK', 15, 'jesus'],
    ['ACT', 2, 'church'],
    ['REV', 21, 'church'],
  ])('%s %i → %s', (book, chapter, period) => {
    expect(getPeriod(book, chapter)).toBe(period);
  });

  it('insensible a minúsculas y null para libros sin regla', () => {
    expect(getPeriod('luk', 1)).toBe('jesus');
    expect(getPeriod('XXX', 1)).toBeNull();
  });
});

describe('PERIODS', () => {
  it('están en orden cronológico y periodIndex los localiza', () => {
    for (let i = 1; i < PERIODS.length; i++) {
      const prev = PERIODS[i - 1]!;
      const curr = PERIODS[i]!;
      expect(curr.from === null ? -Infinity : curr.from).toBeGreaterThanOrEqual(
        prev.from === null ? -Infinity : prev.from,
      );
      expect(periodIndex(curr.id)).toBe(i);
    }
  });
});
