import { describe, expect, it } from 'vitest';
import { buildShareText, shareReference, shareUrl } from './share';

const base = {
  bookName: 'Mateo',
  chapter: 4,
  versionName: 'Biblia Platense (Straubinger)',
  locale: 'es',
  bookSegment: 'mat',
  siteUrl: 'https://proyectotabor.org',
};

describe('shareReference', () => {
  it('usa la coma en español y los dos puntos en inglés', () => {
    expect(shareReference('Mateo', 4, [4], 'es')).toBe('Mateo 4, 4');
    expect(shareReference('Matthew', 4, [4], 'en')).toBe('Matthew 4:4');
  });

  it('agrupa los versículos contiguos y ordena los salteados', () => {
    expect(shareReference('Mateo', 4, [5, 3, 4], 'es')).toBe('Mateo 4, 3-5');
    expect(shareReference('Mateo', 4, [8, 3, 4], 'es')).toBe('Mateo 4, 3-4, 8');
  });
});

describe('shareUrl', () => {
  it('ancla al versículo dentro del idioma', () => {
    expect(shareUrl(base, 4)).toBe('https://proyectotabor.org/es/leer/mat/4#v4');
    expect(shareUrl({ ...base, locale: 'en' }, 12)).toBe(
      'https://proyectotabor.org/en/leer/mat/4#v12',
    );
  });
});

describe('buildShareText', () => {
  it('compone cita, referencia con versión y enlace', () => {
    const text = buildShareText({
      ...base,
      verses: [{ number: 4, text: 'No de pan solo vivirá el hombre.' }],
    });
    expect(text).toBe(
      '«No de pan solo vivirá el hombre.»\n' +
        '— Mateo 4, 4 · Biblia Platense (Straubinger)\n' +
        'https://proyectotabor.org/es/leer/mat/4#v4',
    );
  });

  it('une los versículos contiguos en orden aunque lleguen desordenados', () => {
    const text = buildShareText({
      ...base,
      verses: [
        { number: 2, text: 'Segundo.' },
        { number: 1, text: 'Primero.' },
      ],
    });
    expect(text).toContain('«Primero. Segundo.»');
    expect(text).toContain('— Mateo 4, 1-2 ·');
    expect(text).toContain('#v1');
  });

  it('marca con […] el hueco entre versículos salteados', () => {
    const text = buildShareText({
      ...base,
      verses: [
        { number: 1, text: 'Uno.' },
        { number: 2, text: 'Dos.' },
        { number: 5, text: 'Cinco.' },
      ],
    });
    expect(text).toContain('«Uno. Dos. […] Cinco.»');
    expect(text).toContain('— Mateo 4, 1-2, 5 ·');
  });

  it('usa comillas y referencia inglesas en inglés', () => {
    const text = buildShareText({
      ...base,
      bookName: 'Matthew',
      versionName: 'Catholic Public Domain Version',
      locale: 'en',
      verses: [{ number: 4, text: 'Not by bread alone.' }],
    });
    expect(text).toBe(
      '“Not by bread alone.”\n' +
        '— Matthew 4:4 · Catholic Public Domain Version\n' +
        'https://proyectotabor.org/en/leer/mat/4#v4',
    );
  });

  it('colapsa saltos de línea y espacios del texto', () => {
    const text = buildShareText({
      ...base,
      verses: [{ number: 1, text: '  Con   saltos\nde línea.  ' }],
    });
    expect(text).toContain('«Con saltos de línea.»');
  });

  it('no devuelve nada sin selección', () => {
    expect(buildShareText({ ...base, verses: [] })).toBeNull();
  });
});
