'use client';

// Progreso de los planes de lectura del INVITADO, por dispositivo
// (localStorage). Con sesión iniciada el servidor es la verdad
// (plan_progress en BD): PlanProgressSync sube este contenido una única vez
// (unión) y lo limpia. Al cerrar sesión, el usuario vuelve a ser invitado
// con progreso local vacío — su progreso vive en la cuenta.

import { useMemo, useSyncExternalStore } from 'react';

const KEY = 'tabor-plan-progress';
const EVENT = 'tabor-plan-progress-change';

type ProgressMap = Record<string, number[]>;

function subscribe(cb: () => void): () => void {
  window.addEventListener('storage', cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener('storage', cb);
    window.removeEventListener(EVENT, cb);
  };
}

// El snapshot es el JSON crudo: las cadenas se comparan por valor, así que
// useSyncExternalStore solo re-renderiza cuando el contenido cambia.
function getSnapshot(): string {
  return localStorage.getItem(KEY) ?? '{}';
}

function parse(raw: string): ProgressMap {
  try {
    const data: unknown = JSON.parse(raw);
    return typeof data === 'object' && data !== null ? (data as ProgressMap) : {};
  } catch {
    return {};
  }
}

/** Días completados (índices 0-based) de un plan, reactivo entre pestañas. */
export function useCompletedDays(slug: string): Set<number> {
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => '{}');
  return useMemo(() => new Set(parse(raw)[slug] ?? []), [raw, slug]);
}

/** Todo el progreso local, para la migración única a la cuenta. */
export function readLocalProgress(): ProgressMap {
  return parse(getSnapshot());
}

/** Vacía el progreso local tras subirlo a la cuenta. */
export function clearLocalProgress(): void {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

/** Marca o desmarca un día (índice 0-based) como leído. */
export function toggleDay(slug: string, dayIndex: number): void {
  const map = parse(getSnapshot());
  const days = new Set(map[slug] ?? []);
  if (days.has(dayIndex)) {
    days.delete(dayIndex);
  } else {
    days.add(dayIndex);
  }
  map[slug] = Array.from(days).sort((a, b) => a - b);
  localStorage.setItem(KEY, JSON.stringify(map));
  window.dispatchEvent(new Event(EVENT));
}
