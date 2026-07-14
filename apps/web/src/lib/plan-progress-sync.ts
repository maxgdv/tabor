// Validación y saneado del progreso de planes que viaja cliente↔servidor.
// Funciones puras (sin React ni BD): las comparten la API route y los tests.

import { PLANS, type ReadingPlan } from '@/lib/plans';

/** slug → nº de días, derivado de los planes en código. */
export function planDayCounts(
  plans: Array<Pick<ReadingPlan, 'slug' | 'days'>> = PLANS,
): Map<string, number> {
  return new Map(plans.map((p) => [p.slug, p.days.length]));
}

export type SetDayBody = {
  plan: string;
  day: number;
  done: boolean;
};

/**
 * Valida el cuerpo de marcar/desmarcar un día. `null` si es inválido (→ 400):
 * el slug debe existir y el día ser un entero dentro del plan.
 */
export function parseSetDayBody(
  data: unknown,
  dayCounts: Map<string, number>,
): SetDayBody | null {
  if (typeof data !== 'object' || data === null) return null;
  const { plan, day, done } = data as Record<string, unknown>;
  if (typeof plan !== 'string') return null;
  const total = dayCounts.get(plan);
  if (total === undefined) return null;
  if (typeof day !== 'number' || !Number.isInteger(day) || day < 0 || day >= total) return null;
  if (typeof done !== 'boolean') return null;
  return { plan, day, done };
}

/**
 * Sanea el cuerpo del merge local→cuenta. Filtra en vez de rechazar (el
 * localStorage puede traer restos antiguos): slugs desconocidos, días fuera
 * de rango o no enteros desaparecen; deduplica y ordena. `{}` si no queda
 * nada válido.
 */
export function sanitizeMergeProgress(
  data: unknown,
  dayCounts: Map<string, number>,
): Record<string, number[]> {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return {};
  const result: Record<string, number[]> = {};
  for (const [slug, value] of Object.entries(data)) {
    const total = dayCounts.get(slug);
    if (total === undefined || !Array.isArray(value)) continue;
    const days = Array.from(
      new Set(
        value.filter(
          (d): d is number => typeof d === 'number' && Number.isInteger(d) && d >= 0 && d < total,
        ),
      ),
    ).sort((a, b) => a - b);
    if (days.length > 0) result[slug] = days;
  }
  return result;
}

/** Días completados válidos para la barra: descarta índices fuera de rango. */
export function countCompleted(days: number[], totalDays: number): number {
  return days.filter((d) => Number.isInteger(d) && d >= 0 && d < totalDays).length;
}
