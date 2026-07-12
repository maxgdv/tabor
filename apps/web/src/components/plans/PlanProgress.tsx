'use client';

import { useTranslations } from 'next-intl';
import { useCompletedDays } from '@/lib/plan-progress';

type Props = {
  slug: string;
  totalDays: number;
};

/**
 * Barra de progreso de un plan (leída de localStorage). En SSR renderiza
 * 0/N y se actualiza al hidratar — sin mismatch gracias al server snapshot
 * de useCompletedDays.
 */
export function PlanProgress({ slug, totalDays }: Props) {
  const t = useTranslations('plans');
  const done = useCompletedDays(slug).size;
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
          {done === totalDays
            ? t('completed')
            : t('progress', { done, total: totalDays })}
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
