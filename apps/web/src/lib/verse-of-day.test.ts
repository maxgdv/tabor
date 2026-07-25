import { describe, expect, it } from 'vitest';
import { CHAPTER_COUNTS } from '@tabor/db/chapter-counts';
import { VERSE_POOL } from './data/verse-pool';
import { dayIndex, formatReference, referenceDay, verseOfDay } from './verse-of-day';
import { getLiturgicalSeason } from './liturgical';
import type { LiturgicalSeason } from './routes';

// Dos familias de tests:
//  - integridad del pool curado (protege contra erratas al editarlo: libro
//    inexistente, "Salmos 151", rango invertido…);
//  - la promesa de la feature: mismo día, mismo versículo, para todos.

const SEASONS: readonly LiturgicalSeason[] = [
  'adviento',
  'navidad',
  'cuaresma',
  'semana-santa',
  'pascua',
];

describe('VERSE_POOL — integridad', () => {
  it('tiene versículos de sobra para no repetirse en un año', () => {
    expect(VERSE_POOL.length).toBeGreaterThanOrEqual(300);
  });

  it('cada referencia apunta a un libro y capítulo que existen', () => {
    for (const entry of VERSE_POOL) {
      const max = CHAPTER_COUNTS[entry.book];
      expect(max, `libro desconocido: ${entry.book}`).toBeDefined();
      expect(entry.book, `los canonicalId van en mayúsculas: ${entry.book}`).toBe(
        entry.book.toUpperCase(),
      );
      expect(entry.chapter).toBeGreaterThanOrEqual(1);
      expect(
        entry.chapter,
        `${entry.book} ${entry.chapter} no existe (máx ${max})`,
      ).toBeLessThanOrEqual(max ?? 0);
    }
  });

  it('los rangos de versículos están bien formados', () => {
    for (const entry of VERSE_POOL) {
      const [from, to] = entry.verses;
      expect(from, `${entry.book} ${entry.chapter}`).toBeGreaterThanOrEqual(1);
      expect(to, `rango invertido en ${entry.book} ${entry.chapter}`).toBeGreaterThanOrEqual(from);
      // Rangos cortos a propósito: un versículo del día no es una perícopa.
      expect(to - from, `rango demasiado largo en ${entry.book} ${entry.chapter}`).toBeLessThan(6);
    }
  });

  it('no repite pasajes', () => {
    const keys = VERSE_POOL.map((e) => `${e.book} ${e.chapter},${e.verses[0]}-${e.verses[1]}`);
    const duplicates = keys.filter((k, i) => keys.indexOf(k) !== i);
    expect(duplicates, `pasajes duplicados: ${duplicates.join(' · ')}`).toEqual([]);
  });

  it('la temporada declarada es una de las conocidas', () => {
    for (const entry of VERSE_POOL) {
      if (entry.season) expect(SEASONS).toContain(entry.season);
    }
  });

  it('hay fondo general y cada tiempo fuerte tiene versículos propios', () => {
    expect(VERSE_POOL.filter((e) => !e.season).length).toBeGreaterThanOrEqual(150);
    for (const season of SEASONS) {
      expect(
        VERSE_POOL.filter((e) => e.season === season).length,
        `sin versículos para ${season}`,
      ).toBeGreaterThanOrEqual(8);
    }
  });
});

describe('referenceDay', () => {
  it('usa la hora peninsular, no UTC', () => {
    // 23:30 UTC del 1 de julio ya es día 2 en Madrid (verano, UTC+2).
    expect(referenceDay(new Date('2026-07-01T23:30:00Z'))).toEqual({
      year: 2026,
      month: 7,
      day: 2,
    });
    // En invierno (UTC+1) el corte es a las 23:00 UTC.
    expect(referenceDay(new Date('2026-01-15T23:30:00Z'))).toEqual({
      year: 2026,
      month: 1,
      day: 16,
    });
    expect(referenceDay(new Date('2026-01-15T10:00:00Z'))).toEqual({
      year: 2026,
      month: 1,
      day: 15,
    });
  });

  it('dayIndex avanza de uno en uno y sólo cambia al pasar de día', () => {
    const manana = dayIndex(new Date('2026-03-10T08:00:00Z'));
    const noche = dayIndex(new Date('2026-03-10T21:00:00Z'));
    const siguiente = dayIndex(new Date('2026-03-11T08:00:00Z'));
    expect(noche).toBe(manana);
    expect(siguiente).toBe(manana + 1);
  });
});

describe('verseOfDay', () => {
  it('es determinista: el mismo día devuelve siempre el mismo versículo', () => {
    const a = verseOfDay(new Date('2026-09-14T06:00:00Z'));
    const b = verseOfDay(new Date('2026-09-14T19:45:00Z'));
    expect(b).toEqual(a);
  });

  it('cambia de un día para otro', () => {
    const hoy = verseOfDay(new Date('2026-09-14T10:00:00Z'));
    const manana = verseOfDay(new Date('2026-09-15T10:00:00Z'));
    expect(manana).not.toEqual(hoy);
  });

  it('en tiempo fuerte sirve un versículo de ese tiempo', () => {
    // Fechas conocidas: Pascua de 2026 es el 5 de abril.
    const casos: Array<[string, LiturgicalSeason]> = [
      ['2026-12-08T10:00:00Z', 'adviento'],
      ['2026-12-26T10:00:00Z', 'navidad'],
      ['2026-03-01T10:00:00Z', 'cuaresma'],
      ['2026-04-03T10:00:00Z', 'semana-santa'],
      ['2026-04-12T10:00:00Z', 'pascua'],
    ];
    for (const [iso, esperada] of casos) {
      const fecha = new Date(iso);
      expect(getLiturgicalSeason(fecha), `la fecha ${iso} no cae en ${esperada}`).toBe(esperada);
      expect(verseOfDay(fecha).season, `versículo fuera de tiempo el ${iso}`).toBe(esperada);
    }
  });

  it('en Tiempo Ordinario sirve del fondo general', () => {
    const fecha = new Date('2026-07-15T10:00:00Z');
    expect(getLiturgicalSeason(fecha)).toBeNull();
    expect(verseOfDay(fecha).season).toBeUndefined();
  });

  it('recorre el fondo general sin dejar versículos muertos', () => {
    // Un año entero de Tiempo Ordinario no existe, pero sí basta para
    // comprobar que la rotación no se queda pegada en unos pocos.
    const vistos = new Set<string>();
    for (let i = 0; i < 365; i += 1) {
      const fecha = new Date(Date.UTC(2026, 0, 1 + i, 10));
      const e = verseOfDay(fecha);
      vistos.add(`${e.book} ${e.chapter},${e.verses[0]}`);
    }
    expect(vistos.size).toBeGreaterThan(200);
  });
});

describe('formatReference', () => {
  it('un solo versículo', () => {
    expect(formatReference({ book: 'JHN', chapter: 3, verses: [16, 16] }, 'Juan')).toBe('Juan 3, 16');
  });

  it('un rango', () => {
    expect(formatReference({ book: 'MAT', chapter: 5, verses: [3, 10] }, 'Mateo')).toBe(
      'Mateo 5, 3-10',
    );
  });
});
