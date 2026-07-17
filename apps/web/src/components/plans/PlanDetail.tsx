'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toggleDay, useCompletedDays } from '@/lib/plan-progress';
import { PlanProgressBar } from './PlanProgress';
import { PlanDayList, type DayItem } from './PlanDayList';

type Props = {
  slug: string;
  totalDays: number;
  days: DayItem[];
  /** Días completados según la cuenta; `null` = invitado (localStorage). */
  serverProgress: number[] | null;
};

/**
 * Detalle de un plan: un único Set alimenta la barra y la lista de días,
 * así se mueven juntas al marcar. Dos fuentes según sesión:
 * - Invitado: localStorage reactivo (useCompletedDays + toggleDay), como
 *   siempre. El hook se llama incondicionalmente (rules of hooks).
 * - Con cuenta: estado optimista inicializado desde el servidor + POST
 *   idempotente con revert si falla (patrón ChapterReader.toggleBookmark).
 *   La página remonta este componente vía `key` cuando el servidor trae
 *   progreso nuevo (p. ej. tras el merge inicial).
 */
export function PlanDetail({ slug, totalDays, days, serverProgress }: Props) {
  const tReader = useTranslations('reader');
  const isAuthed = serverProgress !== null;
  // Anuncio sr-only cuando el toggle optimista revierte (WCAG 4.1.3).
  const [saveFailed, setSaveFailed] = useState(false);
  const local = useCompletedDays(slug);
  const [remote, setRemote] = useState<ReadonlySet<number>>(
    () => new Set(serverProgress ?? []),
  );

  const completed = isAuthed ? remote : local;

  const onToggle = (dayIndex: number) => {
    if (!isAuthed) {
      toggleDay(slug, dayIndex);
      return;
    }
    setSaveFailed(false);
    const wasDone = remote.has(dayIndex);
    const apply = (done: boolean) =>
      setRemote((prev) => {
        const next = new Set(prev);
        if (done) next.add(dayIndex);
        else next.delete(dayIndex);
        return next;
      });
    apply(!wasDone);
    void fetch('/api/plan-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: slug, day: dayIndex, done: !wasDone }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`plan-progress → ${res.status}`);
      })
      .catch(() => {
        // Revertir: la red o la sesión fallaron y el estado visual mentiría.
        apply(wasDone);
        setSaveFailed(true);
      });
  };

  return (
    <>
      <div className="mb-10 mt-5 max-w-sm">
        <PlanProgressBar done={completed.size} totalDays={totalDays} />
      </div>
      <PlanDayList days={days} completed={completed} onToggle={onToggle} />
      <p role="status" className="sr-only">
        {saveFailed ? tReader('saveError') : ''}
      </p>
    </>
  );
}
