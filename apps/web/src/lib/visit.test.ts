import { describe, expect, it } from 'vitest';
import { VISIT_AREAS, areaForSite, groupSitesByArea } from '@/lib/visit';

// Coordenadas reales del atlas, para no comprobar la regla contra sí misma.
const COORDS: Record<string, { lat: number; lng: number }> = {
  capernaum: { lat: 32.8811, lng: 35.575 },
  'bethlehem-1': { lat: 31.7043, lng: 35.2076 },
  gethsemane: { lat: 31.7794, lng: 35.2394 },
  caesarea: { lat: 32.5, lng: 34.8917 },
  shechem: { lat: 32.2136, lng: 35.2819 },
  'jericho-1': { lat: 31.8717, lng: 35.4446 },
};

describe('areaForSite', () => {
  it('usa la zona curada aunque las coordenadas dirían otra cosa', () => {
    // Belén está a 8 km de Jerusalén: sin la lista curada caería con ella.
    expect(areaForSite('bethlehem-1', COORDS['bethlehem-1'])).toBe('judea');
    expect(areaForSite('gethsemane', COORDS['gethsemane'])).toBe('jerusalen');
    expect(areaForSite('capernaum', COORDS['capernaum'])).toBe('galilea');
    expect(areaForSite('caesarea', COORDS['caesarea'])).toBe('costa');
  });

  it('reparte por el punto de referencia más cercano lo que no está curado', () => {
    expect(areaForSite('sin-curar-junto-al-lago', { lat: 32.9, lng: 35.6 })).toBe('galilea');
    expect(areaForSite('sin-curar-en-la-costa', { lat: 31.9, lng: 34.7 })).toBe('costa');
    expect(areaForSite('sin-curar-en-el-jordan', { lat: 31.6, lng: 35.45 })).toBe('jordan');
    expect(areaForSite('sin-curar-en-la-montana', { lat: 32.2, lng: 35.25 })).toBe('samaria');
  });

  it('no deja sin zona un sitio sin coordenadas', () => {
    expect(VISIT_AREAS).toContain(areaForSite('sin-coordenadas', null));
  });
});

describe('groupSitesByArea', () => {
  const sites = [
    { slug: 'caesarea' },
    { slug: 'capernaum' },
    { slug: 'gethsemane' },
    { slug: 'shechem' },
    { slug: 'jericho-1' },
  ];
  const groups = groupSitesByArea(sites, (slug) => COORDS[slug] ?? null);

  it('devuelve las zonas en el orden de la guía y sólo las que tienen sitios', () => {
    expect(groups.map((g) => g.area)).toEqual([
      'jerusalen',
      'jordan',
      'galilea',
      'samaria',
      'costa',
    ]);
  });

  it('no pierde ni duplica sitios', () => {
    expect(groups.flatMap((g) => g.sites.map((s) => s.slug)).sort()).toEqual(
      sites.map((s) => s.slug).sort(),
    );
  });

  it('conserva dentro de la zona el orden en que se declararon', () => {
    const galilee = groupSitesByArea(
      [{ slug: 'capernaum' }, { slug: 'nazareth' }],
      (slug) => COORDS[slug] ?? { lat: 32.7021, lng: 35.2977 },
    );
    expect(galilee[0]?.sites.map((s) => s.slug)).toEqual(['capernaum', 'nazareth']);
  });
});
