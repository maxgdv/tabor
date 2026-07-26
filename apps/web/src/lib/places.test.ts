import { describe, expect, it } from 'vitest';
import type { DbPlaceMention } from '@tabor/db';
import { PLACE_NAMES_ES } from '@tabor/db/place-names-es';
import { REGION_PLACE_SLUGS } from '@/lib/data/place-regions';
import { ROUTES } from '@/lib/routes';
import {
  PLACE_MIN_MENTIONS,
  distinctModernName,
  groupMentionsByBook,
  groupPlacesByLetter,
  indexLetter,
  isListedPlace,
  isRegionPlace,
  modernNameDisplay,
  mostMentioned,
  routesForPlace,
} from '@/lib/places';

const place = (name: string, extra: Partial<Record<string, unknown>> = {}) => ({
  name,
  canonicalName: name,
  modernName: null,
  slug: name.toLowerCase(),
  mentionCount: 10,
  ...extra,
});

describe('indexLetter', () => {
  it('agrupa por inicial sin diacríticos', () => {
    expect(indexLetter('Éfeso')).toBe('E');
    expect(indexLetter('Cafarnaúm')).toBe('C');
    expect(indexLetter('ñu')).toBe('N');
  });

  it('manda a "#" lo que no empieza por letra latina', () => {
    expect(indexLetter('1 Nefi')).toBe('#');
    expect(indexLetter('  ')).toBe('#');
  });
});

describe('groupPlacesByLetter', () => {
  it('ordena alfabéticamente ignorando acentos y parte por inicial', () => {
    const groups = groupPlacesByLetter(
      [place('Éfeso'), place('Belén'), place('Egipto'), place('Betania')],
      'es',
    );
    expect(groups.map((g) => g.letter)).toEqual(['B', 'E']);
    expect(groups[0]?.places.map((p) => p.name)).toEqual(['Belén', 'Betania']);
    expect(groups[1]?.places.map((p) => p.name)).toEqual(['Éfeso', 'Egipto']);
  });

  it('deja el grupo "#" al final', () => {
    const groups = groupPlacesByLetter([place('1 Lugar'), place('Zabulón')], 'es');
    expect(groups.map((g) => g.letter)).toEqual(['Z', '#']);
  });

  it('no muta la lista recibida', () => {
    const input = [place('Zabulón'), place('Acaya')];
    groupPlacesByLetter(input, 'es');
    expect(input.map((p) => p.name)).toEqual(['Zabulón', 'Acaya']);
  });
});

describe('distinctModernName', () => {
  it('descarta el nombre moderno que repite el bíblico', () => {
    expect(
      distinctModernName({ name: 'Patmos', canonicalName: 'Patmos', modernName: 'Patmos' }),
    ).toBeNull();
    // El dataset repite la forma inglesa aunque el nombre visible sea el español.
    expect(
      distinctModernName({
        name: 'Jerusalén',
        canonicalName: 'Jerusalem',
        modernName: 'Jerusalem',
      }),
    ).toBeNull();
    // El sufijo de desambiguación no debe hacer que parezcan distintos.
    expect(
      distinctModernName({
        name: 'Belén',
        canonicalName: 'Bethlehem 1',
        modernName: 'Bethlehem',
      }),
    ).toBeNull();
  });

  it('conserva el nombre moderno cuando aporta información', () => {
    expect(
      distinctModernName({
        name: 'Cafarnaúm',
        canonicalName: 'Capernaum',
        modernName: 'Tell Hum',
      }),
    ).toBe('Tell Hum');
  });

  it('tolera la ausencia de nombre moderno', () => {
    expect(distinctModernName({ name: 'X', canonicalName: 'X', modernName: null })).toBeNull();
  });

  it('descarta la repetición con descriptor genérico', () => {
    // «Jordán → Jordan River» no es falso, solo repite el nombre bíblico con
    // el sustantivo delante; igual con el orden invertido y con «of».
    expect(
      distinctModernName({ name: 'Jordán', canonicalName: 'Jordan', modernName: 'Jordan River' }),
    ).toBeNull();
    expect(
      distinctModernName({
        name: 'Valle de Yizreel',
        canonicalName: 'Valley of Jezreel',
        modernName: 'Jezreel Valley',
      }),
    ).toBeNull();
    expect(
      distinctModernName({ name: 'Siloé', canonicalName: 'Siloam', modernName: 'Pool of Siloam' }),
    ).toBeNull();
    expect(
      distinctModernName({ name: 'Sarón', canonicalName: 'Sharon 1', modernName: 'Sharon Plain' }),
    ).toBeNull();
  });

  it('conserva el nombre moderno de ríos y montes cuando de verdad nombra otra cosa', () => {
    // El Arnón es el Wadi Mujib: mismo accidente, nombre moderno distinto.
    expect(
      distinctModernName({ name: 'Arnón', canonicalName: 'Arnon', modernName: 'Wadi Mujib' }),
    ).toBe('Wadi Mujib');
    expect(
      distinctModernName({
        name: 'Monte Nebo',
        canonicalName: 'Mount Nebo',
        modernName: 'Jabal al Naba',
      }),
    ).toBe('Jabal al Naba');
    // Y el descriptor no debe hacer coincidir dos nombres distintos.
    expect(
      distinctModernName({
        name: 'Mar de la Sal',
        canonicalName: 'Salt Sea',
        modernName: 'Dead Sea',
      }),
    ).toBe('Dead Sea');
  });
});

describe('modernNameDisplay', () => {
  it('un asentamiento conserva su identificación arqueológica', () => {
    expect(
      modernNameDisplay({
        slug: 'capernaum',
        name: 'Cafarnaúm',
        canonicalName: 'Capernaum',
        modernName: 'Tell Hum',
      }),
    ).toEqual({ name: 'Tell Hum', identifies: true });
    expect(
      modernNameDisplay({
        slug: 'jericho-1',
        name: 'Jericó',
        canonicalName: 'Jericho 1',
        modernName: 'Tell es Sultan',
      }),
    ).toEqual({ name: 'Tell es Sultan', identifies: true });
  });

  it('una región no afirma identificación', () => {
    // Ain Shams es un barrio de El Cairo: decir que Egipto «es» Ain Shams
    // sería falso. El dato se conserva, pero marcado como punto del mapa.
    expect(
      modernNameDisplay({
        slug: 'egypt',
        name: 'Egipto',
        canonicalName: 'Egypt',
        modernName: 'Ain Shams',
      }),
    ).toEqual({ name: 'Ain Shams', identifies: false });
    expect(
      modernNameDisplay({
        slug: 'judea-1',
        name: 'Judea',
        canonicalName: 'Judea 1',
        modernName: 'Jerusalem',
      }),
    ).toEqual({ name: 'Jerusalem', identifies: false });
    expect(isRegionPlace('moab-1')).toBe(true);
    expect(isRegionPlace('shechem')).toBe(false);
  });

  it('sigue sin mostrar nada cuando el nombre moderno no aporta', () => {
    expect(
      modernNameDisplay({
        slug: 'canaan',
        name: 'Canaán',
        canonicalName: 'Canaan',
        modernName: 'Canaan',
      }),
    ).toBeNull();
  });
});

describe('REGION_PLACE_SLUGS (integridad de la lista curada)', () => {
  // Un slug mal escrito aquí no rompe nada: simplemente no se aplicaría, y la
  // ficha seguiría afirmando una identificación falsa sin que se note.
  // PLACE_NAMES_ES cubre los 1.335 lugares del atlas con su slug real, así
  // que sirve de padrón para detectar la errata sin levantar la BD.
  it('todos los slugs existen en el atlas', () => {
    const unknown = [...REGION_PLACE_SLUGS].filter((slug) => !(slug in PLACE_NAMES_ES));
    expect(unknown).toEqual([]);
  });

  it('no marca como región a los asentamientos con identificación buena', () => {
    for (const slug of ['jericho-1', 'shechem', 'capernaum', 'bethel-1', 'hebron', 'gibeah-1']) {
      expect(isRegionPlace(slug)).toBe(false);
    }
  });

  it('marca las regiones, países y pueblos del dataset', () => {
    for (const slug of ['egypt', 'assyria', 'moab-1', 'edom', 'ammon', 'syria-1', 'judea-1']) {
      expect(isRegionPlace(slug)).toBe(true);
    }
    expect(REGION_PLACE_SLUGS.size).toBeGreaterThan(50);
  });
});

describe('isListedPlace', () => {
  it('acepta los que superan el umbral de menciones', () => {
    expect(isListedPlace({ slug: 'jerusalem', mentionCount: PLACE_MIN_MENTIONS })).toBe(true);
    expect(isListedPlace({ slug: 'sin-rutas-ni-menciones', mentionCount: 1 })).toBe(false);
  });

  it('acepta los lugares curados como parada de una ruta aunque casi no se nombren', () => {
    // Getsemaní tiene 2 menciones en el atlas y es de los lugares más
    // buscados del Nuevo Testamento: el corte por menciones no debe tirarlo.
    expect(isListedPlace({ slug: 'gethsemane', mentionCount: 2 })).toBe(true);
  });
});

describe('routesForPlace', () => {
  it('encuentra las rutas que tienen una parada en el lugar', () => {
    const slug = ROUTES[0]?.stops[0]?.placeSlug ?? '';
    expect(routesForPlace(slug).map((r) => r.slug)).toContain(ROUTES[0]?.slug);
  });

  it('devuelve vacío para un lugar sin rutas', () => {
    expect(routesForPlace('lugar-que-no-existe')).toEqual([]);
  });
});

describe('mostMentioned', () => {
  it('devuelve los n más mencionados de más a menos', () => {
    const list = [
      place('A', { mentionCount: 3 }),
      place('B', { mentionCount: 40 }),
      place('C', { mentionCount: 12 }),
    ];
    expect(mostMentioned(list, 2).map((p) => p.name)).toEqual(['B', 'C']);
    expect(list.map((p) => p.name)).toEqual(['A', 'B', 'C']);
  });
});

describe('groupMentionsByBook', () => {
  const mention = (book: string, chapter: number, verse: number): DbPlaceMention => ({
    bookCanonicalId: book,
    bookUrlSegment: book.toLowerCase(),
    bookName: book,
    chapterNumber: chapter,
    verseNumber: verse,
    text: `${book} ${chapter},${verse}`,
  });

  it('parte por libro conservando el orden bíblico de entrada', () => {
    const groups = groupMentionsByBook([
      mention('MAT', 4, 13),
      mention('MAT', 8, 5),
      mention('MRK', 1, 21),
    ]);
    expect(groups.map((g) => g.bookCanonicalId)).toEqual(['MAT', 'MRK']);
    expect(groups[0]?.mentions).toHaveLength(2);
    expect(groups[1]?.mentions).toHaveLength(1);
  });

  it('devuelve vacío sin menciones', () => {
    expect(groupMentionsByBook([])).toEqual([]);
  });
});
