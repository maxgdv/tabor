import { describe, expect, it } from 'vitest';
import { BOOK_META } from '@tabor/db/book-meta';
import {
  ROUTES,
  getRoute,
  routeProgressSlug,
  routeReadingHref,
  routeReadingLabel,
} from './routes';
import { planDayCounts } from './plan-progress-sync';

const CANONICAL = new Set(BOOK_META.map((m) => m.canonicalId));

describe('ROUTES (integridad del dataset)', () => {
  it('slugs únicos y con paradas', () => {
    const slugs = ROUTES.map((r) => r.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const route of ROUTES) {
      expect(route.stops.length).toBeGreaterThanOrEqual(3);
      expect(route.name.es).toBeTruthy();
      expect(route.name.en).toBeTruthy();
      expect(route.description.es).toBeTruthy();
    }
  });

  it('cada lectura referencia un libro del canon y rangos coherentes', () => {
    for (const route of ROUTES) {
      for (const stop of route.stops) {
        expect(stop.placeSlug).toMatch(/^[a-z0-9-]+$/);
        expect(stop.title.es).toBeTruthy();
        expect(stop.note.es).toBeTruthy();
        expect(stop.readings.length).toBeGreaterThan(0);
        for (const reading of stop.readings) {
          expect(CANONICAL.has(reading.book)).toBe(true);
          expect(reading.chapter).toBeGreaterThanOrEqual(1);
          if (reading.verses) {
            expect(reading.verses[0]).toBeGreaterThanOrEqual(1);
            expect(reading.verses[1]).toBeGreaterThanOrEqual(reading.verses[0]);
          }
        }
      }
    }
  });
});

describe('helpers', () => {
  it('getRoute resuelve y rechaza', () => {
    expect(getRoute('el-exodo')?.stops.length).toBeGreaterThan(5);
    expect(getRoute('no-existe')).toBeNull();
  });

  it('etiquetas y hrefs con y sin versículos', () => {
    expect(routeReadingLabel({ book: 'JHN', chapter: 12, verses: [1, 11] }, 'es')).toBe(
      'Juan 12, 1-11',
    );
    expect(routeReadingLabel({ book: 'EXO', chapter: 14 }, 'es')).toBe('Éxodo 14');
    expect(routeReadingHref({ book: 'JHN', chapter: 12, verses: [1, 11] })).toBe(
      '/leer/jhn/12#v1',
    );
    expect(routeReadingHref({ book: 'EXO', chapter: 14 })).toBe('/leer/exo/14');
  });

  it('el progreso de rutas entra en el validador de la API', () => {
    const counts = planDayCounts();
    for (const route of ROUTES) {
      expect(counts.get(routeProgressSlug(route.slug))).toBe(route.stops.length);
    }
  });
});
