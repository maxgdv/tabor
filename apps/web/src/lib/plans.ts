// Planes de lectura — contenido curado, versionado en git.
//
// BORRADOR EDITORIAL: la selección de pasajes de cada plan la propone el
// asistente y está pendiente de revisión del maintainer (ver CONTRIBUTING:
// el contenido editorial requiere validación humana antes de considerarse
// definitivo). La estructura de días con rangos de capítulos es deliberada:
// sin niveles de versículo en el MVP.
//
// El progreso del usuario NO vive aquí: es por-dispositivo en localStorage
// (lib/plan-progress.ts) hasta que exista autenticación.

import { BOOK_META } from '@tabor/db/book-meta';
import type { LiturgicalSeason } from './routes';

export type PlanReading = {
  book: string; // canonicalId ('MAT')
  /** Rango de capítulos inclusivo; [5, 5] es un solo capítulo. */
  chapters: [number, number];
};

export type PlanDay = {
  readings: PlanReading[];
};

export type ReadingPlan = {
  slug: string;
  name: { es: string; en: string };
  description: { es: string; en: string };
  /** Tiempo litúrgico al que se asocia el plan (badge en las tarjetas). */
  season?: LiturgicalSeason;
  days: PlanDay[];
};

// --- Generadores para planes secuenciales -----------------------------

/**
 * Reparte los capítulos de una lista de libros en días consecutivos.
 * `perDay` puede ser un número fijo o un patrón cíclico ([3, 2] = un día
 * tres capítulos, el siguiente dos…). El último día absorbe el resto.
 */
function sequentialDays(
  books: Array<[canonicalId: string, chapterCount: number]>,
  perDay: number | number[],
): PlanDay[] {
  const all: Array<{ book: string; chapter: number }> = [];
  for (const [book, count] of books) {
    for (let c = 1; c <= count; c += 1) all.push({ book, chapter: c });
  }
  const pattern = Array.isArray(perDay) ? perDay : [perDay];
  const days: PlanDay[] = [];
  let i = 0;
  let dayIndex = 0;
  while (i < all.length) {
    const take = pattern[dayIndex % pattern.length] ?? 1;
    const chunk = all.slice(i, i + take);
    // Agrupa el trozo en rangos contiguos por libro.
    const readings: PlanReading[] = [];
    for (const { book, chapter } of chunk) {
      const last = readings[readings.length - 1];
      if (last && last.book === book && last.chapters[1] === chapter - 1) {
        last.chapters = [last.chapters[0], chapter];
      } else {
        readings.push({ book, chapters: [chapter, chapter] });
      }
    }
    days.push({ readings });
    i += take;
    dayIndex += 1;
  }
  return days;
}

/** Un capítulo por día, para planes curados a mano. */
function oneChapterDays(entries: Array<[canonicalId: string, chapter: number]>): PlanDay[] {
  return entries.map(([book, chapter]) => ({
    readings: [{ book, chapters: [chapter, chapter] }],
  }));
}

// --- Los planes ---------------------------------------------------------

export const PLANS: ReadingPlan[] = [
  {
    slug: 'evangelios-30',
    name: {
      es: 'Los Evangelios en 30 días',
      en: 'The Gospels in 30 Days',
    },
    description: {
      es: 'Los cuatro Evangelios de corrido, tres capítulos al día: un mes caminando con Jesús de Nazaret desde Mateo hasta Juan.',
      en: 'The four Gospels straight through, three chapters a day: a month walking with Jesus of Nazareth from Matthew to John.',
    },
    days: sequentialDays(
      [
        ['MAT', 28],
        ['MRK', 16],
        ['LUK', 24],
        ['JHN', 21],
      ],
      3,
    ),
  },
  {
    slug: 'hechos-14',
    name: {
      es: 'Hechos de los Apóstoles en 14 días',
      en: 'Acts of the Apostles in 14 Days',
    },
    description: {
      es: 'Dos semanas con la Iglesia naciente: de Pentecostés en Jerusalén al Evangelio llegando a Roma, dos capítulos al día.',
      en: 'Two weeks with the early Church: from Pentecost in Jerusalem to the Gospel reaching Rome, two chapters a day.',
    },
    days: sequentialDays([['ACT', 28]], 2),
  },
  {
    slug: 'salmos-60',
    name: {
      es: 'Los Salmos en 60 días',
      en: 'The Psalms in 60 Days',
    },
    description: {
      es: 'El libro de oración de Israel y de la Iglesia, entero en dos meses: dos o tres salmos al día para rezar, no solo leer.',
      en: 'The prayer book of Israel and the Church, whole in two months: two or three psalms a day, to pray and not just read.',
    },
    days: sequentialDays([['PSA', 150]], [3, 2]),
  },
  {
    slug: 'camino-belen-24',
    season: 'adviento',
    name: {
      es: 'Camino a Belén (24 días)',
      en: 'The Road to Bethlehem (24 Days)',
    },
    description: {
      es: 'Itinerario de Adviento: la promesa mesiánica desde el Génesis hasta el portal de Belén, un capítulo al día durante 24 días.',
      en: 'An Advent journey: the messianic promise from Genesis to the manger in Bethlehem, one chapter a day for 24 days.',
    },
    days: oneChapterDays([
      ['GEN', 3], // el protoevangelio: la primera promesa
      ['GEN', 12], // la llamada de Abrahán
      ['GEN', 49], // la bendición de Judá: el cetro
      ['NUM', 24], // la estrella de Jacob
      ['2SA', 7], // la promesa a David
      ['PSA', 2], // el Ungido del Señor
      ['PSA', 72], // el rey de paz
      ['PSA', 89], // la alianza con David
      ['ISA', 7], // la señal del Emmanuel
      ['ISA', 9], // un niño nos ha nacido
      ['ISA', 11], // el retoño de Jesé
      ['ISA', 35], // el desierto florecerá
      ['ISA', 40], // consolad a mi pueblo
      ['JER', 23], // el germen justo
      ['JER', 33], // la promesa restaurada
      ['EZK', 34], // el pastor verdadero
      ['MIC', 5], // y tú, Belén
      ['ZEP', 3], // el resto humilde se alegra
      ['HAG', 2], // la gloria de la casa nueva
      ['ZEC', 9], // tu rey viene, humilde
      ['MAL', 3], // el mensajero prepara el camino
      ['LUK', 1], // la anunciación y el Magníficat
      ['MAT', 1], // la genealogía y José
      ['LUK', 2], // el nacimiento en Belén
    ]),
  },
  {
    slug: 'navidad-12',
    season: 'navidad',
    name: {
      es: 'Los doce días de Navidad',
      en: 'The Twelve Days of Christmas',
    },
    description: {
      es: 'De Nochebuena a Epifanía: el Misterio del Nacimiento contemplado desde los Evangelios, los profetas y las cartas, un capítulo al día.',
      en: 'From Christmas Eve to Epiphany: the Mystery of the Nativity through the Gospels, the prophets and the letters, one chapter a day.',
    },
    days: oneChapterDays([
      ['LUK', 1], // anunciación y visitación
      ['LUK', 2], // el nacimiento
      ['MAT', 1], // la genealogía y José
      ['MAT', 2], // los magos y la huida
      ['JHN', 1], // el Verbo hecho carne
      ['ISA', 7], // el Emmanuel
      ['ISA', 9], // un niño nos ha nacido
      ['ISA', 11], // el retoño de Jesé
      ['MIC', 5], // y tú, Belén
      ['GAL', 4], // nacido de mujer, en la plenitud del tiempo
      ['TIT', 2], // ha aparecido la gracia de Dios
      ['PSA', 97], // «Cantad al Señor un cántico nuevo» (98 hebreo)
    ]),
  },
  {
    slug: 'cuaresma-40',
    season: 'cuaresma',
    name: {
      es: 'Cuaresma: 40 días hacia la Pascua',
      en: 'Lent: 40 Days towards Easter',
    },
    description: {
      es: 'Cuarenta días como los del desierto: la liberación del Éxodo, los salmos penitenciales, los profetas de la conversión y la subida a Jerusalén.',
      en: 'Forty days like those in the desert: the liberation of Exodus, the penitential psalms, the prophets of conversion, and the road up to Jerusalem.',
    },
    days: oneChapterDays([
      // La liberación: de la esclavitud a la Alianza (Ex 1-17).
      ['EXO', 1], ['EXO', 2], ['EXO', 3], ['EXO', 4], ['EXO', 5], ['EXO', 6],
      ['EXO', 7], ['EXO', 8], ['EXO', 9], ['EXO', 10], ['EXO', 11], ['EXO', 12],
      ['EXO', 13], ['EXO', 14], ['EXO', 15], ['EXO', 16], ['EXO', 17],
      ['DEU', 8], // la memoria del desierto
      // Los siete salmos penitenciales (numeración greco-latina).
      ['PSA', 6], ['PSA', 31], ['PSA', 37], ['PSA', 50], ['PSA', 101],
      ['PSA', 129], ['PSA', 142],
      // Los profetas de la conversión.
      ['ISA', 53], ['ISA', 55], ['ISA', 58], ['JOL', 2], ['JON', 3],
      // La subida a Jerusalén y la Pasión.
      ['MRK', 8], ['MRK', 9], ['MRK', 10], ['MRK', 14], ['MRK', 15],
      ['JHN', 18], ['JHN', 19],
      ['LAM', 3], // la esperanza en la aflicción
      ['HEB', 4], ['HEB', 5], // el sumo sacerdote que se compadece
    ]),
  },
  {
    slug: 'semana-santa-8',
    season: 'semana-santa',
    name: {
      es: 'Semana Santa, día a día',
      en: 'Holy Week, Day by Day',
    },
    description: {
      es: 'Del Domingo de Ramos al Domingo de Resurrección: cada día de la semana grande con su Evangelio.',
      en: 'From Palm Sunday to Easter Sunday: each day of the great week with its Gospel.',
    },
    days: [
      { readings: [{ book: 'LUK', chapters: [19, 19] }] }, // Domingo de Ramos
      { readings: [{ book: 'MRK', chapters: [11, 11] }] }, // Lunes Santo
      { readings: [{ book: 'MAT', chapters: [25, 25] }] }, // Martes Santo
      { readings: [{ book: 'LUK', chapters: [22, 22] }] }, // Miércoles Santo
      { readings: [{ book: 'JHN', chapters: [13, 13] }] }, // Jueves Santo
      { readings: [{ book: 'JHN', chapters: [18, 19] }] }, // Viernes Santo
      { readings: [{ book: 'LAM', chapters: [3, 3] }] }, // Sábado Santo
      { readings: [{ book: 'JHN', chapters: [20, 20] }] }, // Domingo de Resurrección
    ],
  },
  {
    slug: 'pascua-pentecostes-50',
    season: 'pascua',
    name: {
      es: 'De Pascua a Pentecostés (50 días)',
      en: 'From Easter to Pentecost (50 Days)',
    },
    description: {
      es: 'La cincuentena pascual: del sepulcro vacío al fuego del Espíritu — los relatos de la Resurrección, los Hechos enteros y las cartas de la vida nueva.',
      en: 'The fifty days of Easter: from the empty tomb to the fire of the Spirit — the Resurrection accounts, the whole of Acts, and the letters of new life.',
    },
    days: [
      { readings: [{ book: 'JHN', chapters: [20, 20] }] },
      { readings: [{ book: 'JHN', chapters: [21, 21] }] },
      { readings: [{ book: 'LUK', chapters: [24, 24] }] },
      ...sequentialDays([['ACT', 28]], 1),
      { readings: [{ book: '1CO', chapters: [15, 15] }] },
      ...sequentialDays([['ROM', 8]], 1).slice(4, 8), // Rom 5-8
      ...sequentialDays([['1PE', 5]], 1),
      ...sequentialDays([['EPH', 6]], 1),
      { readings: [{ book: 'PSA', chapters: [103, 103] }] }, // «envías tu Espíritu» (104 hebreo)
      { readings: [{ book: 'REV', chapters: [21, 21] }] },
      { readings: [{ book: 'REV', chapters: [22, 22] }] },
    ],
  },
];

export function getPlan(slug: string): ReadingPlan | null {
  return PLANS.find((p) => p.slug === slug) ?? null;
}

// --- Etiquetas ----------------------------------------------------------

const BOOK_NAME = new Map(
  BOOK_META.map((m) => [m.canonicalId, { es: m.es.name, en: m.en.name }]),
);

/** "Mateo 5–7" / "Salmos 23" — nombre localizado + rango de capítulos. */
export function readingLabel(reading: PlanReading, locale: string): string {
  const names = BOOK_NAME.get(reading.book);
  const name = (locale === 'en' ? names?.en : names?.es) ?? reading.book;
  const [from, to] = reading.chapters;
  return from === to ? `${name} ${from}` : `${name} ${from}–${to}`;
}

/** URL del lector para el primer capítulo de una lectura. */
export function readingHref(reading: PlanReading): string {
  return `/leer/${reading.book.toLowerCase()}/${reading.chapters[0]}`;
}
