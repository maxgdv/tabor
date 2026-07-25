import { describe, expect, it } from 'vitest';
import { CHAPTER_COUNTS } from '@tabor/db/chapter-counts';
import { PLANS, getPlan, plansOfKind, readingHref, readingLabel } from './plans';

// Integridad del contenido curado: estos tests protegen contra erratas al
// editar los planes (libro inexistente, "Salmos 151", rangos invertidos…).

describe('PLANS — integridad', () => {
  it('slugs únicos y aptos para URL', () => {
    const slugs = PLANS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it('todos los planes tienen nombre y descripción en es y en', () => {
    for (const plan of PLANS) {
      expect(plan.name.es.length).toBeGreaterThan(0);
      expect(plan.name.en.length).toBeGreaterThan(0);
      expect(plan.description.es.length).toBeGreaterThan(0);
      expect(plan.description.en.length).toBeGreaterThan(0);
    }
  });

  it('cada día tiene al menos una lectura y cada lectura es válida', () => {
    for (const plan of PLANS) {
      expect(plan.days.length).toBeGreaterThan(0);
      for (const day of plan.days) {
        expect(day.readings.length).toBeGreaterThan(0);
        for (const reading of day.readings) {
          const max = CHAPTER_COUNTS[reading.book];
          expect(max, `libro desconocido: ${reading.book} (${plan.slug})`).toBeDefined();
          const [from, to] = reading.chapters;
          expect(from).toBeGreaterThanOrEqual(1);
          expect(to).toBeGreaterThanOrEqual(from);
          expect(
            to,
            `${reading.book} ${to} no existe (${plan.slug}: máx ${max})`,
          ).toBeLessThanOrEqual(max ?? 0);
        }
      }
    }
  });

  it('la duración anunciada en el slug coincide con los días reales', () => {
    // Convención: los slugs terminan en el nº de días ('evangelios-30').
    for (const plan of PLANS) {
      const suffix = Number(plan.slug.split('-').at(-1));
      expect(plan.days.length, plan.slug).toBe(suffix);
    }
  });

  it('los planes secuenciales cubren los libros completos sin huecos', () => {
    // Evangelios: 28+16+24+21 = 89 capítulos exactos.
    const gospels = getPlan('evangelios-30');
    const total = gospels?.days
      .flatMap((d) => d.readings)
      .reduce((sum, r) => sum + (r.chapters[1] - r.chapters[0] + 1), 0);
    expect(total).toBe(89);

    // Salmos: los 150, empezando en 1 y acabando en 150.
    const psalms = getPlan('salmos-60');
    const readings = psalms?.days.flatMap((d) => d.readings) ?? [];
    expect(readings[0]?.chapters[0]).toBe(1);
    expect(readings.at(-1)?.chapters[1]).toBe(150);
    const psalmTotal = readings.reduce((s, r) => s + (r.chapters[1] - r.chapters[0] + 1), 0);
    expect(psalmTotal).toBe(150);
  });
});

describe('planes de situación', () => {
  const situacion = plansOfKind('situacion');

  it('están declarados y no se mezclan con los itinerarios', () => {
    expect(situacion.length).toBeGreaterThanOrEqual(12);
    // `kind` por defecto es 'itinerario': los planes antiguos no se movieron.
    expect(plansOfKind('itinerario').length).toBe(PLANS.length - situacion.length);
    for (const plan of situacion) expect(plan.kind).toBe('situacion');
  });

  it('son cortos: nadie en apuros empieza un plan de 40 días', () => {
    for (const plan of situacion) {
      expect(plan.days.length, plan.slug).toBeGreaterThanOrEqual(3);
      expect(plan.days.length, plan.slug).toBeLessThanOrEqual(7);
    }
  });

  it('señalan el pasaje exacto, no el capítulo entero', () => {
    for (const plan of situacion) {
      for (const day of plan.days) {
        for (const reading of day.readings) {
          expect(reading.verses, `${plan.slug}: lectura sin versículos`).toBeDefined();
          const [from, to] = reading.verses!;
          expect(from, plan.slug).toBeGreaterThanOrEqual(1);
          expect(to, `rango invertido en ${plan.slug}`).toBeGreaterThanOrEqual(from);
          // Un rango de versículos vive dentro de un solo capítulo.
          expect(reading.chapters[0], plan.slug).toBe(reading.chapters[1]);
        }
      }
    }
  });

  it('no llevan tiempo litúrgico: no son de temporada', () => {
    for (const plan of situacion) expect(plan.season, plan.slug).toBeUndefined();
  });

  it('tienen nombre corto para el acceso directo de la portada', () => {
    for (const plan of situacion) {
      expect(plan.shortName, `${plan.slug} sin shortName`).toBeDefined();
      for (const lang of ['es', 'en'] as const) {
        const label = plan.shortName![lang];
        expect(label.length, `${plan.slug}.${lang} vacío`).toBeGreaterThan(0);
        // Son pastillas en una fila: un nombre largo rompe la retícula y
        // deja de leerse de un vistazo, que es para lo que existen.
        expect(label.length, `${plan.slug}.${lang} demasiado largo`).toBeLessThanOrEqual(16);
        expect(label, `${plan.slug}.${lang} no debe repetir la duración`).not.toMatch(/\d/);
      }
    }
  });
});

describe('helpers', () => {
  it('readingLabel localiza el nombre y compacta rangos', () => {
    expect(readingLabel({ book: 'MAT', chapters: [5, 7] }, 'es')).toBe('Mateo 5–7');
    expect(readingLabel({ book: 'MAT', chapters: [5, 7] }, 'en')).toBe('Matthew 5–7');
    expect(readingLabel({ book: 'PSA', chapters: [23, 23] }, 'es')).toBe('Salmos 23');
  });

  it('readingLabel añade el rango de versículos cuando lo hay', () => {
    expect(readingLabel({ book: 'MAT', chapters: [6, 6], verses: [25, 34] }, 'es')).toBe(
      'Mateo 6, 25-34',
    );
    expect(readingLabel({ book: 'PSA', chapters: [22, 22], verses: [4, 4] }, 'es')).toBe(
      'Salmos 22, 4',
    );
  });

  it('readingHref enlaza al primer capítulo del rango', () => {
    expect(readingHref({ book: 'MRK', chapters: [2, 4] })).toBe('/leer/mrk/2');
  });

  it('readingHref ancla al primer versículo cuando la lectura lo precisa', () => {
    expect(readingHref({ book: 'MAT', chapters: [6, 6], verses: [25, 34] })).toBe(
      '/leer/mat/6#v25',
    );
  });

  it('getPlan devuelve null para slugs desconocidos', () => {
    expect(getPlan('no-existe')).toBeNull();
  });
});
