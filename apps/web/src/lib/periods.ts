// Épocas históricas de la Biblia y asignación editorial por libro/capítulo.
// Primer paso del diferenciador "capa histórica viva" (spec §5): situar cada
// pasaje en su época y dejar que el mapa reaccione (v1: regiones del s. I
// en los Evangelios).
//
// Criterio editorial: se asigna la época de la AMBIENTACIÓN del texto (dónde
// se sitúa lo narrado), no la de su composición — con dos excepciones
// asumidas: Sabiduría y Eclesiástico se sitúan en el Helenismo (composición)
// porque carecen de marco narrativo propio. Los sapienciales con marco
// salomónico (Proverbios, Eclesiastés, Cantar) y los Salmos van a Reinos.
// Job se sitúa tradicionalmente en época patriarcal. Fechas aproximadas y
// discutidas en los extremos: son orientación de lectura, no cronología
// académica. Correcciones bienvenidas (fichero editable, como los planes).

export const PERIODS = [
  { id: 'origins', from: null, to: -2000 },
  { id: 'patriarchs', from: -2000, to: -1700 },
  { id: 'exodus', from: -1300, to: -1200 },
  { id: 'judges', from: -1200, to: -1050 },
  { id: 'kingdoms', from: -1050, to: -587 },
  { id: 'exile', from: -587, to: -538 },
  { id: 'persia', from: -538, to: -332 },
  { id: 'hellenism', from: -332, to: -63 },
  { id: 'jesus', from: -6, to: 30 },
  { id: 'church', from: 30, to: 100 },
] as const;

export type PeriodId = (typeof PERIODS)[number]['id'];

type Rule = { book: string; fromChapter?: number; period: PeriodId };

// Orden importa dentro de un libro: gana la última regla cuyo fromChapter
// no supere el capítulo pedido.
const RULES: Rule[] = [
  { book: 'GEN', period: 'origins' },
  { book: 'GEN', fromChapter: 12, period: 'patriarchs' },
  { book: 'EXO', period: 'exodus' },
  { book: 'LEV', period: 'exodus' },
  { book: 'NUM', period: 'exodus' },
  { book: 'DEU', period: 'exodus' },
  { book: 'JOS', period: 'exodus' },
  { book: 'JDG', period: 'judges' },
  { book: 'RUT', period: 'judges' },
  { book: '1SA', period: 'kingdoms' },
  { book: '2SA', period: 'kingdoms' },
  { book: '1KI', period: 'kingdoms' },
  { book: '2KI', period: 'kingdoms' },
  { book: '1CH', period: 'kingdoms' },
  { book: '2CH', period: 'kingdoms' },
  { book: 'EZR', period: 'persia' },
  { book: 'NEH', period: 'persia' },
  { book: 'TOB', period: 'exile' },
  { book: 'JDT', period: 'exile' },
  { book: 'EST', period: 'persia' },
  { book: '1MA', period: 'hellenism' },
  { book: '2MA', period: 'hellenism' },
  { book: 'JOB', period: 'patriarchs' },
  { book: 'PSA', period: 'kingdoms' },
  { book: 'PRO', period: 'kingdoms' },
  { book: 'ECC', period: 'kingdoms' },
  { book: 'SNG', period: 'kingdoms' },
  { book: 'WIS', period: 'hellenism' },
  { book: 'SIR', period: 'hellenism' },
  { book: 'ISA', period: 'kingdoms' },
  { book: 'JER', period: 'kingdoms' },
  { book: 'LAM', period: 'exile' },
  { book: 'BAR', period: 'exile' },
  { book: 'EZK', period: 'exile' },
  { book: 'DAN', period: 'exile' },
  { book: 'HOS', period: 'kingdoms' },
  { book: 'JOL', period: 'persia' },
  { book: 'AMO', period: 'kingdoms' },
  { book: 'OBA', period: 'exile' },
  { book: 'JON', period: 'kingdoms' },
  { book: 'MIC', period: 'kingdoms' },
  { book: 'NAM', period: 'kingdoms' },
  { book: 'HAB', period: 'kingdoms' },
  { book: 'ZEP', period: 'kingdoms' },
  { book: 'HAG', period: 'persia' },
  { book: 'ZEC', period: 'persia' },
  { book: 'MAL', period: 'persia' },
  { book: 'MAT', period: 'jesus' },
  { book: 'MRK', period: 'jesus' },
  { book: 'LUK', period: 'jesus' },
  { book: 'JHN', period: 'jesus' },
  { book: 'ACT', period: 'church' },
  { book: 'ROM', period: 'church' },
  { book: '1CO', period: 'church' },
  { book: '2CO', period: 'church' },
  { book: 'GAL', period: 'church' },
  { book: 'EPH', period: 'church' },
  { book: 'PHP', period: 'church' },
  { book: 'COL', period: 'church' },
  { book: '1TH', period: 'church' },
  { book: '2TH', period: 'church' },
  { book: '1TI', period: 'church' },
  { book: '2TI', period: 'church' },
  { book: 'TIT', period: 'church' },
  { book: 'PHM', period: 'church' },
  { book: 'HEB', period: 'church' },
  { book: 'JAS', period: 'church' },
  { book: '1PE', period: 'church' },
  { book: '2PE', period: 'church' },
  { book: '1JN', period: 'church' },
  { book: '2JN', period: 'church' },
  { book: '3JN', period: 'church' },
  { book: 'JUD', period: 'church' },
  { book: 'REV', period: 'church' },
];

/** Época de un capítulo, o `null` si el libro no tiene asignación. */
export function getPeriod(bookCanonicalId: string, chapterNumber: number): PeriodId | null {
  const book = bookCanonicalId.toUpperCase();
  let match: PeriodId | null = null;
  for (const rule of RULES) {
    if (rule.book !== book) continue;
    if (rule.fromChapter !== undefined && chapterNumber < rule.fromChapter) continue;
    match = rule.period;
  }
  return match;
}

/** Índice de la época en la secuencia cronológica (para la línea de tiempo). */
export function periodIndex(id: PeriodId): number {
  return PERIODS.findIndex((p) => p.id === id);
}
