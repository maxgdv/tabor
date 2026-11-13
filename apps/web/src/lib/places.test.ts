import { describe, expect, it } from 'vitest';
import type { DbPlaceMention } from '@tabor/db';
import { BOOK_META } from '@tabor/db/book-meta';
import { PLACE_NAMES_ES } from '@tabor/db/place-names-es';
import { REGION_PLACE_SLUGS } from '@/lib/data/place-regions';
import { PLACE_SUMMARIES } from '@/lib/data/place-summaries';
import { ROUTES } from '@/lib/routes';
import {
  IN_JERUSALEM_KM,
  JERUSALEM,
  PLACE_MIN_MENTIONS,
  chapterPlaceEntries,
  compassDirection,
  distanceKm,
  fromJerusalem,
  nearbyPlaces,
  placeSummary,
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

describe('chapterPlaceEntries', () => {
  const chapter = {
    verses: [
      { number: 3, placeSlugs: ['judea', 'galilee'] },
      { number: 4, placeSlugs: ['samaria-1'] },
      { number: 5, placeSlugs: ['samaria-1', 'aldea-sin-ficha'] },
      { number: 6, placeSlugs: [] },
      { number: 9, placeSlugs: ['samaria-1'] },
    ],
    places: [
      { slug: 'judea', name: 'Judea', mentionCount: 40 },
      { slug: 'galilee', name: 'Galilea', mentionCount: 60 },
      { slug: 'samaria-1', name: 'Samaria', mentionCount: 100 },
      { slug: 'aldea-sin-ficha', name: 'Aldea', mentionCount: PLACE_MIN_MENTIONS - 1 },
    ],
  };

  it('conserva el orden de aparición y agrupa los versículos en rangos', () => {
    const entries = chapterPlaceEntries(chapter);
    expect(entries.map((e) => e.slug)).toEqual([
      'judea',
      'galilee',
      'samaria-1',
      'aldea-sin-ficha',
    ]);
    const samaria = entries[2]!;
    expect(samaria.verseRefs).toBe('4-5, 9');
    expect(samaria.verseCount).toBe(3);
    expect(entries[0]!.verseRefs).toBe('3');
    expect(entries[0]!.verseCount).toBe(1);
  });

  it('solo marca con ficha los lugares que se indexan', () => {
    const entries = chapterPlaceEntries(chapter);
    expect(entries.filter((e) => e.hasPage).map((e) => e.slug)).toEqual([
      'judea',
      'galilee',
      'samaria-1',
    ]);
  });

  it('enlaza un lugar poco nombrado si es parada de una ruta', () => {
    const stop = ROUTES[0]!.stops[0]!.placeSlug;
    const [entry] = chapterPlaceEntries({
      verses: [{ number: 1, placeSlugs: [stop] }],
      places: [{ slug: stop, name: 'Parada', mentionCount: 1 }],
    });
    expect(entry!.hasPage).toBe(true);
  });

  it('devuelve lista vacía en un capítulo sin geografía', () => {
    expect(chapterPlaceEntries({ verses: [{ number: 1, placeSlugs: [] }], places: [] })).toEqual(
      [],
    );
  });
});

describe('distanceKm y compassDirection', () => {
  const capernaum = { lat: 32.881, lng: 35.575 };
  const bethlehem = { lat: 31.704, lng: 35.208 };
  const jericho = { lat: 31.872, lng: 35.445 };
  const rome = { lat: 41.892, lng: 12.485 };

  it('mide distancias reales con error de pocos kilómetros', () => {
    expect(distanceKm(JERUSALEM, capernaum)).toBeGreaterThan(120);
    expect(distanceKm(JERUSALEM, capernaum)).toBeLessThan(130);
    expect(Math.round(distanceKm(JERUSALEM, rome) / 100)).toBe(23);
    expect(distanceKm(JERUSALEM, JERUSALEM)).toBe(0);
  });

  it('reduce el rumbo a ocho direcciones', () => {
    expect(compassDirection(JERUSALEM, capernaum)).toBe('n');
    expect(compassDirection(JERUSALEM, bethlehem)).toBe('s');
    expect(compassDirection(JERUSALEM, jericho)).toBe('ne');
    expect(compassDirection(JERUSALEM, rome)).toBe('nw');
    expect(compassDirection(JERUSALEM, { lat: 32.543, lng: 44.422 })).toBe('e');
  });
});

describe('fromJerusalem', () => {
  it('da kilómetros y rumbo a un asentamiento', () => {
    const result = fromJerusalem({ slug: 'capernaum', lat: 32.881, lng: 35.575 });
    expect(result).toMatchObject({ kind: 'away', direction: 'n' });
    expect(result && result.kind === 'away' ? result.km : 0).toBeGreaterThan(120);
  });

  it('no mide dentro de Jerusalén', () => {
    expect(fromJerusalem({ slug: 'golgotha', lat: 31.778, lng: 35.23 })).toEqual({
      kind: 'within',
    });
    expect(distanceKm(JERUSALEM, { lat: 31.772, lng: 35.256 })).toBeLessThan(IN_JERUSALEM_KM);
  });

  it('calla en la propia Jerusalén y en las regiones', () => {
    expect(fromJerusalem({ slug: 'jerusalem', ...JERUSALEM })).toBeNull();
    const region = [...REGION_PLACE_SLUGS][0]!;
    expect(fromJerusalem({ slug: region, lat: 30, lng: 31 })).toBeNull();
  });
});

describe('nearbyPlaces', () => {
  const origin = { slug: 'capernaum', name: 'Cafarnaúm', lat: 32.881, lng: 35.575 };
  const candidates = [
    origin,
    { slug: 'bethsaida-1', name: 'Betsaida', lat: 32.91, lng: 35.631 },
    { slug: 'gennesaret', name: 'Genesaret', lat: 32.861, lng: 35.507 },
    { slug: 'nazareth', name: 'Nazaret', lat: 32.702, lng: 35.298 },
    { slug: 'hebron', name: 'Hebrón', lat: 31.525, lng: 35.102 },
    { slug: [...REGION_PLACE_SLUGS][0]!, name: 'Región', lat: 32.88, lng: 35.57 },
  ];

  it('ordena por cercanía y descarta el propio lugar, las regiones y lo lejano', () => {
    const near = nearbyPlaces(origin, candidates);
    expect(near.map((n) => n.place.slug)).toEqual(['bethsaida-1', 'gennesaret', 'nazareth']);
    expect(near[0]!.km).toBeLessThan(near[1]!.km);
  });

  it('respeta el límite', () => {
    expect(nearbyPlaces(origin, candidates, { limit: 1 })).toHaveLength(1);
  });

  it('descarta lo que el atlas pone en el mismo punto, se llame igual o no', () => {
    const samaria = { slug: 'samaria-1', name: 'Samaria', lat: 32.276, lng: 35.195 };
    const near = nearbyPlaces(samaria, [
      { slug: 'samaria-2', name: 'Samaria', lat: 32.276, lng: 35.195 },
      { slug: 'shechem', name: 'Siquem', lat: 32.214, lng: 35.282 },
    ]);
    expect(near.map((n) => n.place.slug)).toEqual(['shechem']);

    // La «Babilonia» del Apocalipsis está en las coordenadas de Roma.
    const rome = { slug: 'rome', name: 'Roma', lat: 41.892, lng: 12.485 };
    expect(
      nearbyPlaces(rome, [{ slug: 'babylon-3', name: 'Babilonia', lat: 41.892, lng: 12.485 }]),
    ).toEqual([]);
  });

  it('no repite dos homónimos desdoblados en un mismo punto', () => {
    const near = nearbyPlaces({ slug: 'gibeon', name: 'Gabaón', lat: 31.847, lng: 35.183 }, [
      { slug: 'ramah-1', name: 'Ramá', lat: 31.854, lng: 35.232 },
      { slug: 'ramah-4', name: 'Ramá', lat: 31.854, lng: 35.232 },
    ]);
    expect(near.map((n) => n.place.slug)).toEqual(['ramah-1']);
  });

  it('una región no tiene vecinos: su punto es solo representativo', () => {
    const region = { slug: [...REGION_PLACE_SLUGS][0]!, name: 'Región', lat: 32.88, lng: 35.57 };
    expect(nearbyPlaces(region, candidates)).toEqual([]);
  });
});

describe('PLACE_SUMMARIES', () => {
  const bookIds = new Set(BOOK_META.map((b) => b.canonicalId));

  it('cada resumen tiene texto en los dos idiomas y lecturas válidas', () => {
    const entries = Object.entries(PLACE_SUMMARIES);
    expect(entries.length).toBeGreaterThan(30);
    for (const [slug, summary] of entries) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
      expect(summary.es.length, slug).toBeGreaterThan(60);
      expect(summary.en.length, slug).toBeGreaterThan(60);
      expect(summary.readings.length, slug).toBeGreaterThan(0);
      for (const reading of summary.readings) {
        expect(bookIds.has(reading.book), slug + ' → ' + reading.book).toBe(true);
        expect(reading.chapter, slug).toBeGreaterThan(0);
        // Los Salmos van en numeración greco-latina: se evitan a propósito.
        expect(reading.book, slug).not.toBe('PSA');
      }
    }
  });

  it('placeSummary devuelve null para un lugar sin resumen', () => {
    expect(placeSummary('jerusalem')).not.toBeNull();
    expect(placeSummary('lugar-que-no-existe')).toBeNull();
  });
});
