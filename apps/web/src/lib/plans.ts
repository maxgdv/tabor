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
import { SITUATION_PLANS } from './data/situation-plans';
import type { LiturgicalSeason } from './routes';

export type PlanReading = {
  book: string; // canonicalId ('MAT')
  /** Rango de capítulos inclusivo; [5, 5] es un solo capítulo. */
  chapters: [number, number];
  /**
   * Rango de versículos inclusivo dentro de un capítulo único. Opcional: los
   * itinerarios largos se leen por capítulos enteros, pero un plan para una
   * situación concreta necesita señalar el pasaje exacto — a quien está
   * angustiado se le ofrecen diez versículos, no un capítulo entero.
   * Solo tiene sentido cuando `chapters` es un único capítulo.
   */
  verses?: [number, number];
};

export type PlanDay = {
  readings: PlanReading[];
};

/**
 * Un plan es un *itinerario* (recorrido largo por un libro o un tiempo
 * litúrgico) o una *situación* (unos pocos días para lo que alguien está
 * viviendo: un duelo, una decisión, una enfermedad). La distinción sólo
 * afecta a cómo se agrupan y se presentan: el progreso se guarda igual, con
 * el slug como clave, así que `plan_progress` no se entera.
 */
export type PlanKind = 'itinerario' | 'situacion';

export type ReadingPlan = {
  slug: string;
  name: { es: string; en: string };
  description: { es: string; en: string };
  /** Por defecto 'itinerario'. */
  kind?: PlanKind;
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

/** Recorridos largos: un libro, un tiempo litúrgico, un bloque del canon. */
export const ITINERARY_PLANS: ReadingPlan[] = [
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
      ['EXO', 1],
      ['EXO', 2],
      ['EXO', 3],
      ['EXO', 4],
      ['EXO', 5],
      ['EXO', 6],
      ['EXO', 7],
      ['EXO', 8],
      ['EXO', 9],
      ['EXO', 10],
      ['EXO', 11],
      ['EXO', 12],
      ['EXO', 13],
      ['EXO', 14],
      ['EXO', 15],
      ['EXO', 16],
      ['EXO', 17],
      ['DEU', 8], // la memoria del desierto
      // Los siete salmos penitenciales (numeración greco-latina).
      ['PSA', 6],
      ['PSA', 31],
      ['PSA', 37],
      ['PSA', 50],
      ['PSA', 101],
      ['PSA', 129],
      ['PSA', 142],
      // Los profetas de la conversión.
      ['ISA', 53],
      ['ISA', 55],
      ['ISA', 58],
      ['JOL', 2],
      ['JON', 3],
      // La subida a Jerusalén y la Pasión.
      ['MRK', 8],
      ['MRK', 9],
      ['MRK', 10],
      ['MRK', 14],
      ['MRK', 15],
      ['JHN', 18],
      ['JHN', 19],
      ['LAM', 3], // la esperanza en la aflicción
      ['HEB', 4],
      ['HEB', 5], // el sumo sacerdote que se compadece
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
  {
    slug: 'exodo-40',
    name: {
      es: 'El Éxodo en 40 días',
      en: 'Exodus in 40 Days',
    },
    description: {
      es: 'El libro de la liberación entero, un capítulo al día: de la esclavitud a la nube que llena el santuario. Cuarenta capítulos, cuarenta días — como los del desierto.',
      en: 'The whole book of liberation, one chapter a day: from slavery to the cloud filling the sanctuary. Forty chapters, forty days — like those in the desert.',
    },
    days: sequentialDays([['EXO', 40]], 1),
  },
  {
    slug: 'josue-24',
    name: {
      es: 'Josué en 24 días',
      en: 'Joshua in 24 Days',
    },
    description: {
      es: 'La entrada en la Tierra Prometida capítulo a capítulo: el Jordán, Jericó, el reparto de la herencia y la gran elección de Siquem.',
      en: 'The entry into the Promised Land chapter by chapter: the Jordan, Jericho, the allotment of the inheritance, and the great choice at Shechem.',
    },
    days: sequentialDays([['JOS', 24]], 1),
  },
  {
    slug: 'juan-21',
    name: {
      es: 'El Evangelio de Juan en 21 días',
      en: 'The Gospel of John in 21 Days',
    },
    description: {
      es: 'Tres semanas con el Evangelio del discípulo amado, un capítulo al día: los signos, los grandes discursos y la hora de la gloria.',
      en: 'Three weeks with the Gospel of the beloved disciple, one chapter a day: the signs, the great discourses, and the hour of glory.',
    },
    days: sequentialDays([['JHN', 21]], 1),
  },
  {
    slug: 'proverbios-31',
    name: {
      es: 'Proverbios, uno al día (31 días)',
      en: 'Proverbs, One a Day (31 Days)',
    },
    description: {
      es: 'La sabiduría práctica de Israel en un mes: un capítulo por cada día, al ritmo clásico de leer el capítulo que marca el calendario.',
      en: 'Israel’s practical wisdom in a month: one chapter for each day, in the classic rhythm of reading the day’s chapter.',
    },
    days: sequentialDays([['PRO', 31]], 1),
  },

  // --- BORRADOR EDITORIAL: pendiente de revisión del maintainer -----------
  // Ampliación del catálogo de itinerarios (bloques del canon todavía sin
  // recorrido propio: Génesis, históricos, sapienciales, profetas mayores,
  // corpus paulino, cartas católicas y Apocalipsis) más una puerta de entrada
  // para quien nunca ha leído la Biblia. Selección y textos propuestos por el
  // asistente: revisar antes de darlos por definitivos.
  {
    slug: 'primeros-pasos-21',
    name: {
      es: 'Si nunca has leído la Biblia (21 días)',
      en: 'If You Have Never Read the Bible (21 Days)',
    },
    description: {
      es: 'Para quien empieza de cero y no sabe por dónde entrar: veintiún capítulos clave que cuentan de un extremo a otro la historia de la salvación. Un capítulo al día, sin prisa, en tres semanas.',
      en: 'For anyone starting from scratch and unsure where to begin: twenty-one key chapters telling the story of salvation from end to end. One chapter a day, unhurried, over three weeks.',
    },
    days: oneChapterDays([
      ['GEN', 1], // la creación
      ['GEN', 3], // la caída y la primera promesa
      ['GEN', 12], // la llamada de Abrahán
      ['EXO', 3], // la zarza: el Nombre de Dios
      ['EXO', 20], // los diez mandamientos
      ['DEU', 6], // escucha, Israel
      ['PSA', 22], // «El Señor es mi pastor» (23 hebreo)
      ['PSA', 50], // el Miserere (51 hebreo)
      ['ISA', 53], // el siervo que carga con el dolor
      ['LUK', 2], // el nacimiento en Belén
      ['MAT', 5], // las bienaventuranzas
      ['MAT', 6], // el Padrenuestro
      ['LUK', 10], // el buen samaritano
      ['LUK', 15], // el hijo pródigo
      ['JHN', 1], // el Verbo hecho carne
      ['JHN', 3], // nacer de nuevo
      ['JHN', 19], // la cruz
      ['LUK', 24], // Emaús y la Resurrección
      ['ACT', 2], // Pentecostés
      ['ROM', 8], // nada podrá separarnos
      ['REV', 21], // un cielo nuevo y una tierra nueva
    ]),
  },
  {
    slug: 'genesis-25',
    name: {
      es: 'El Génesis en 25 días',
      en: 'Genesis in 25 Days',
    },
    description: {
      es: 'El libro de los orígenes entero, para quien quiera saber de dónde arranca todo: la creación, el diluvio, los patriarcas y la historia de José. Dos capítulos al día durante veinticinco días.',
      en: 'The whole book of origins, for anyone wanting to see where it all begins: creation, the flood, the patriarchs and the story of Joseph. Two chapters a day for twenty-five days.',
    },
    days: sequentialDays([['GEN', 50]], 2),
  },
  {
    slug: 'samuel-reyes-34',
    name: {
      es: 'Samuel y Reyes en 34 días',
      en: 'Samuel and Kings in 34 Days',
    },
    description: {
      es: 'La gran historia de la monarquía para lectores de relato largo: Samuel, Saúl, David y Salomón, el reino dividido, Elías y Eliseo, hasta el destierro de Babilonia. Tres capítulos al día durante algo más de un mes.',
      en: 'The great history of the monarchy for readers of long narrative: Samuel, Saul, David and Solomon, the divided kingdom, Elijah and Elisha, down to the exile in Babylon. Three chapters a day for a little over a month.',
    },
    days: sequentialDays(
      [
        ['1SA', 31],
        ['2SA', 24],
        ['1KI', 22],
        ['2KI', 25],
      ],
      3,
    ),
  },
  {
    slug: 'salmos-30',
    name: {
      es: 'Los Salmos en 30 días',
      en: 'The Psalms in 30 Days',
    },
    description: {
      es: 'El salterio completo en un mes, a la manera de la vieja costumbre monástica: para quien ya reza los salmos y quiere recorrerlos de un tirón. Cinco salmos al día durante treinta días.',
      en: 'The whole psalter in a month, after the old monastic custom: for those who already pray the psalms and want to cover them in one sweep. Five psalms a day for thirty days.',
    },
    days: sequentialDays([['PSA', 150]], 5),
  },
  {
    slug: 'sapienciales-44',
    name: {
      es: 'Los libros sapienciales en 44 días',
      en: 'The Wisdom Books in 44 Days',
    },
    description: {
      es: 'Job, Eclesiastés, el Cantar, Sabiduría y Eclesiástico, para quien busca hondura más que relato: el sufrimiento del justo, el arte de vivir y el amor. Tres capítulos al día durante seis semanas y media.',
      en: 'Job, Ecclesiastes, the Song of Songs, Wisdom and Sirach, for readers after depth rather than narrative: the suffering of the just, the art of living, and love. Three chapters a day over six and a half weeks.',
    },
    days: sequentialDays(
      [
        ['JOB', 42],
        ['ECC', 12],
        ['SNG', 8],
        ['WIS', 19],
        ['SIR', 51],
      ],
      3,
    ),
  },
  {
    slug: 'isaias-33',
    name: {
      es: 'Isaías en 33 días',
      en: 'Isaiah in 33 Days',
    },
    description: {
      es: 'El profeta que más lee la Iglesia, entero y en orden: el juicio sobre Jerusalén, el libro de la consolación y los cantos del Siervo. Dos capítulos al día durante poco más de un mes.',
      en: 'The prophet the Church reads most, complete and in order: the judgement on Jerusalem, the book of consolation, and the Servant songs. Two chapters a day for just over a month.',
    },
    days: sequentialDays([['ISA', 66]], 2),
  },
  {
    slug: 'jeremias-lamentaciones-29',
    name: {
      es: 'Jeremías y Lamentaciones en 29 días',
      en: 'Jeremiah and Lamentations in 29 Days',
    },
    description: {
      es: 'El profeta de la ruina y de la alianza nueva, seguido del llanto por la ciudad destruida: para quien atraviesa un tiempo duro y quiere palabras a su altura. Dos capítulos al día durante cuatro semanas.',
      en: 'The prophet of ruin and of the new covenant, followed by the lament over the ruined city: for anyone in a hard season who wants words equal to it. Two chapters a day for four weeks.',
    },
    days: sequentialDays(
      [
        ['JER', 52],
        ['LAM', 5],
      ],
      2,
    ),
  },
  {
    slug: 'cartas-pablo-50',
    name: {
      es: 'Las cartas de san Pablo en 50 días',
      en: 'The Letters of Saint Paul in 50 Days',
    },
    description: {
      es: 'El corpus paulino completo, de Romanos a Hebreos, para quien ya conoce los Evangelios y quiere la doctrina cristiana en estado naciente. Dos capítulos al día durante cincuenta días.',
      en: 'The complete Pauline corpus, from Romans to Hebrews, for those who know the Gospels and want Christian doctrine in its nascent state. Two chapters a day for fifty days.',
    },
    days: sequentialDays(
      [
        ['ROM', 16],
        ['1CO', 16],
        ['2CO', 13],
        ['GAL', 6],
        ['EPH', 6],
        ['PHP', 4],
        ['COL', 4],
        ['1TH', 5],
        ['2TH', 3],
        ['1TI', 6],
        ['2TI', 4],
        ['TIT', 3],
        ['PHM', 1],
        ['HEB', 13],
      ],
      2,
    ),
  },
  {
    slug: 'cartas-catolicas-apocalipsis-43',
    name: {
      es: 'Cartas católicas y Apocalipsis en 43 días',
      en: 'The Catholic Letters and Revelation in 43 Days',
    },
    description: {
      es: 'El final del Nuevo Testamento, para quien quiera cerrar el círculo: Santiago, Pedro, Juan y Judas escribiendo a toda la Iglesia, y la visión que cierra la Biblia. Un capítulo al día durante seis semanas.',
      en: 'The close of the New Testament, for those who want to complete the circle: James, Peter, John and Jude writing to the whole Church, and the vision that ends the Bible. One chapter a day for six weeks.',
    },
    days: sequentialDays(
      [
        ['JAS', 5],
        ['1PE', 5],
        ['2PE', 3],
        ['1JN', 5],
        ['2JN', 1],
        ['3JN', 1],
        ['JUD', 1],
        ['REV', 22],
      ],
      1,
    ),
  },
  // --- fin del borrador editorial ----------------------------------------
];

/**
 * Todos los planes: primero los itinerarios, después los de situación.
 * El orden de este array manda en el sitemap; el índice los agrupa aparte.
 */
export const PLANS: ReadingPlan[] = [...ITINERARY_PLANS, ...SITUATION_PLANS];

export function getPlan(slug: string): ReadingPlan | null {
  return PLANS.find((p) => p.slug === slug) ?? null;
}

/** Los planes de un tipo, en el orden en que se declararon. */
export function plansOfKind(kind: PlanKind): ReadingPlan[] {
  return PLANS.filter((p) => (p.kind ?? 'itinerario') === kind);
}

// --- Etiquetas ----------------------------------------------------------

const BOOK_NAME = new Map(BOOK_META.map((m) => [m.canonicalId, { es: m.es.name, en: m.en.name }]));

/** "Mateo 5–7" / "Salmos 23" / "Mateo 6, 25-34" — nombre localizado. */
export function readingLabel(reading: PlanReading, locale: string): string {
  const names = BOOK_NAME.get(reading.book);
  const name = (locale === 'en' ? names?.en : names?.es) ?? reading.book;
  const [from, to] = reading.chapters;
  const chapters = from === to ? `${from}` : `${from}–${to}`;
  if (!reading.verses) return `${name} ${chapters}`;
  const [vFrom, vTo] = reading.verses;
  return `${name} ${chapters}, ${vFrom === vTo ? vFrom : `${vFrom}-${vTo}`}`;
}

/**
 * URL del lector para una lectura. Con rango de versículos se ancla al
 * primero (`#v25`), igual que hacen la búsqueda y el versículo del día.
 */
export function readingHref(reading: PlanReading): string {
  const base = `/leer/${reading.book.toLowerCase()}/${reading.chapters[0]}`;
  return reading.verses ? `${base}#v${reading.verses[0]}` : base;
}
