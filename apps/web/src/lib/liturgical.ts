// Calendario litúrgico (rito romano, cómputo occidental): en qué tiempo
// estamos hoy. Suficiente para destacar contenido de temporada; no pretende
// ser un calendario litúrgico completo (ferias, solemnidades, ciclos).
//
// Simplificaciones asumidas (documentadas para el revisor):
// - Navidad termina en el domingo siguiente al 6 de enero (Bautismo del
//   Señor); cuando Epifanía cae en domingo, algunas conferencias trasladan
//   el Bautismo al lunes — aquí se ignora ese matiz.
// - La Semana Santa se trata como tiempo propio (Ramos → Sábado Santo)
//   aunque litúrgicamente sus primeros días pertenecen a la Cuaresma.

import type { LiturgicalSeason } from './routes';

/** Domingo de Pascua (gregoriano) — algoritmo anónimo de Meeus/Butcher. */
export function easterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = marzo, 4 = abril
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

const DAY_MS = 24 * 60 * 60 * 1000;

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function utcMidnight(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** Primer domingo de Adviento: el cuarto domingo antes de Navidad. */
export function adventStart(year: number): Date {
  const christmas = new Date(Date.UTC(year, 11, 25));
  const weekday = christmas.getUTCDay(); // 0 = domingo
  // Si Navidad cae en domingo, Adviento empieza cuatro domingos antes (día 27-nov).
  return addDays(christmas, -(weekday === 0 ? 28 : weekday + 21));
}

/** Tiempo litúrgico de una fecha, o `null` en Tiempo Ordinario. */
export function getLiturgicalSeason(date: Date): LiturgicalSeason | null {
  const day = utcMidnight(date);
  const year = day.getUTCFullYear();

  // Navidad puede venir del año anterior (25-dic → Bautismo en enero).
  const epiphany = new Date(Date.UTC(year, 0, 6));
  const baptism = addDays(epiphany, 7 - (epiphany.getUTCDay() === 0 ? 7 : epiphany.getUTCDay()));
  if (day <= baptism && day >= new Date(Date.UTC(year - 1, 11, 25))) return 'navidad';

  const easter = easterDate(year);
  const ashWednesday = addDays(easter, -46);
  const palmSunday = addDays(easter, -7);
  const pentecost = addDays(easter, 49);

  if (day >= ashWednesday && day < palmSunday) return 'cuaresma';
  if (day >= palmSunday && day < easter) return 'semana-santa';
  if (day >= easter && day <= pentecost) return 'pascua';

  const advent1 = adventStart(year);
  const christmas = new Date(Date.UTC(year, 11, 25));
  if (day >= advent1 && day < christmas) return 'adviento';
  if (day >= christmas) return 'navidad';

  return null;
}
