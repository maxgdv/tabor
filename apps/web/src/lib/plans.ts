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
