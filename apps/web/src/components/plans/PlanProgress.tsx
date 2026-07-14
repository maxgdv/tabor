'use client';

import { useTranslations } from 'next-intl';
import { useCompletedDays } from '@/lib/plan-progress';
import { countCompleted } from '@/lib/plan-progress-sync';

/** Barra de progreso presentacional: quien la monta decide de dónde sale `done`. */
export function PlanProgressBar({ done, totalDays }: { done: number; totalDays: number }) {
  const t = useTranslations('plans');
  const pct = totalDays > 0 ? Math.round((done / totalDays) * 100) : 0;

  if (done === 0) {
    return (
      <span className="font-sans text-xs text-stone-500">
        {t('duration', { count: totalDays })}
      </span>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-sans text-xs text-stone-500">
          {done === totalDays ? t('completed') : t('progress', { done, total: totalDays })}
        </span>
        <span className="font-sans text-xs tabular-nums text-stone-400">{pct}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={totalDays}
        aria-label={t('progress', { done, total: totalDays })}
        className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-sand-200 dark:bg-stone-700"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${
            done === totalDays ? 'bg-olive-500' : 'bg-lapis-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

type Props = {
  slug: string;
  totalDays: number;
  /** Progreso de la cuenta; `null` = invitado (localStorage reactivo). */
  serverDays: number[] | null;
};

/**
 * Progreso de un plan en el índice /planes (sin toggles): con sesión muestra
 * los datos del servidor; como invitado, el localStorage del dispositivo.
 * El hook se llama siempre (rules of hooks) aunque en modo cuenta se ignore.
 */
export function PlanProgress({ slug, totalDays, serverDays }: Props) {
  const local = useCompletedDays(slug);
  const done = serverDays !== null ? countCompleted(serverDays, totalDays) : local.size;
  return <PlanProgressBar done={done} totalDays={totalDays} />;
}
