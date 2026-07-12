'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { toggleDay, useCompletedDays } from '@/lib/plan-progress';

// El servidor precalcula etiquetas y hrefs (dependen del locale); este
// componente solo aporta el estado por-dispositivo de localStorage.
export type DayItem = {
  readings: Array<{ label: string; href: string }>;
};

type Props = {
  slug: string;
  days: DayItem[];
};

export function PlanDayList({ slug, days }: Props) {
  const t = useTranslations('plans');
  const completed = useCompletedDays(slug);
  // El primer día pendiente lleva un realce sutil: es "por dónde voy".
  const nextIndex = days.findIndex((_, i) => !completed.has(i));

  return (
    <ol className="space-y-1.5">
      {days.map((day, index) => {
        const isDone = completed.has(index);
        const isNext = index === nextIndex;
        return (
          <li
            key={index}
            className={`flex items-center gap-3 rounded-md border px-3 py-2 transition-colors ${
              isNext
                ? 'border-lapis-500/50 bg-lapis-500/5 dark:bg-stone-800'
                : 'border-sand-200 bg-white/60 dark:border-stone-700 dark:bg-stone-800/60'
            }`}
          >
            <button
              type="button"
              role="checkbox"
              aria-checked={isDone}
              aria-label={t(isDone ? 'unmarkDay' : 'markDay', { day: index + 1 })}
              onClick={() => toggleDay(slug, index)}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                isDone
                  ? 'border-olive-500 bg-olive-500 text-white'
                  : 'border-stone-300 bg-transparent hover:border-lapis-500 dark:border-stone-600'
              }`}
            >
              {isDone && (
                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M2.5 6.5l2.5 2.5 4.5-5"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            <span className="w-14 shrink-0 font-sans text-xs uppercase tracking-wide text-stone-400">
              {t('day', { day: index + 1 })}
            </span>

            <span className="flex flex-wrap gap-x-3 gap-y-0.5">
              {day.readings.map((reading) => (
                <Link
                  key={reading.href}
                  href={reading.href}
                  className={`font-serif text-sm underline-offset-2 hover:underline ${
                    isDone
                      ? 'text-stone-400 dark:text-stone-500'
                      : 'text-stone-800 hover:text-lapis-600 dark:text-sand-100'
                  }`}
                >
                  {reading.label}
                </Link>
              ))}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
