import { describe, expect, it } from 'vitest';
import { HISTORICAL_OVERLAYS } from './historical-overlays';
import { PERIODS } from './periods';

describe('HISTORICAL_OVERLAYS', () => {
  const periodIds = new Set<string>(PERIODS.map((p) => p.id));

  it('cada overlay pertenece a una época existente', () => {
    for (const key of Object.keys(HISTORICAL_OVERLAYS)) {
      expect(periodIds.has(key)).toBe(true);
    }
  });

  it('los polígonos son anillos cerrados y las coordenadas son [lng, lat] plausibles', () => {
    for (const overlay of Object.values(HISTORICAL_OVERLAYS)) {
      for (const feature of overlay!.features) {
        const geom = feature.geometry;
        const coords =
          geom.type === 'Polygon'
            ? geom.coordinates.flat()
            : geom.type === 'LineString'
              ? geom.coordinates
              : [geom.coordinates];
        for (const [lng, lat] of coords as number[][]) {
          // Mundo bíblico: Egipto-Mesopotamia. Detecta lat/lng intercambiados.
          expect(lng).toBeGreaterThan(25);
          expect(lng).toBeLessThan(48);
          expect(lat).toBeGreaterThan(24);
          expect(lat).toBeLessThan(38);
        }
        if (geom.type === 'Polygon') {
          const ring = geom.coordinates[0]!;
          expect(ring[0]).toEqual(ring[ring.length - 1]);
          expect(feature.properties.nameEs).toBeTruthy();
          expect(feature.properties.nameEn).toBeTruthy();
        }
        expect(feature.properties.color).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });
});
