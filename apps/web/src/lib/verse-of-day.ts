// Versículo del día — selección determinista a partir de la fecha.
//
// Por qué determinista y no aleatorio: todo el mundo lee el mismo versículo
// el mismo día (se puede comentar, compartir y enlazar), la página es
// cacheable y el resultado es reproducible en un test. No hay estado en BD.
//
// Por qué un pool curado y no la Biblia entera: sacar un versículo al azar
// de los 71.603 devuelve genealogías y textos duros sin contexto, que es
// justo lo contrario de la serenidad que busca el proyecto.
//
// Qué NO es: el leccionario de la misa del día. Reproducirlo exigiría los
// ciclos dominicales A/B/C, el ferial I/II y el santoral, y no hay fuente
// de dominio público estructurada; anunciarlo como «la lectura de hoy»
// sería faltar a la verdad.

import { VERSE_POOL } from './data/verse-pool';
import { getLiturgicalSeason } from './liturgical';
import type { LiturgicalSeason } from './routes';

export type VerseOfDayEntry = {
  /** canonicalId del libro en MAYÚSCULAS ('JHN'). */
  book: string;
  chapter: number;
  /** Rango de versículos inclusivo; [16, 16] es un solo versículo. */
  verses: [number, number];
  /**
   * Si se indica, el versículo sólo entra en el sorteo durante ese tiempo
   * litúrgico. Sin `season` forma parte del fondo de armario que se usa el
   * resto del año.
   */
  season?: LiturgicalSeason;
};

/**
 * Día de referencia en la zona horaria de España.
 *
 * El servidor de Vercel corre en UTC: sin esto el versículo cambiaría a la
 * 01:00 o 02:00 de la madrugada peninsular en vez de a medianoche. La
 * audiencia principal del proyecto es hispanohablante europea; se asume esa
 * referencia única para todo el mundo, que además es lo que mantiene la
 * promesa de «el mismo versículo para todos».
 */
export function referenceDay(date: Date): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get('year'), month: get('month'), day: get('day') };
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Días transcurridos desde el epoch para el día de referencia. */
export function dayIndex(date: Date): number {
  const { year, month, day } = referenceDay(date);
  return Math.floor(Date.UTC(year, month - 1, day) / DAY_MS);
}

/**
 * El versículo que toca hoy.
 *
 * En tiempo fuerte (Adviento, Navidad, Cuaresma, Semana Santa, Pascua) el
 * sorteo se restringe a los versículos marcados con ese tiempo; en Tiempo
 * Ordinario se usa el fondo general. Si un tiempo no tuviera versículos
 * propios se cae al fondo general en lugar de fallar.
 */
export function verseOfDay(date: Date): VerseOfDayEntry {
  const season = getLiturgicalSeason(date);
  const general = VERSE_POOL.filter((entry) => !entry.season);
  const seasonal = season ? VERSE_POOL.filter((entry) => entry.season === season) : [];
  const pool = seasonal.length > 0 ? seasonal : general;
  // `pool` nunca está vacío: hay un test que lo garantiza sobre VERSE_POOL.
  const index = ((dayIndex(date) % pool.length) + pool.length) % pool.length;
  return pool[index]!;
}

/** Referencia legible «Juan 3, 16» / «Juan 3, 16-18». */
export function formatReference(entry: VerseOfDayEntry, bookName: string): string {
  const [from, to] = entry.verses;
  const verses = from === to ? `${from}` : `${from}-${to}`;
  return `${bookName} ${entry.chapter}, ${verses}`;
}
