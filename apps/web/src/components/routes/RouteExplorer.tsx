'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { toggleDay, useCompletedDays } from '@/lib/plan-progress';
import { RouteMap, type RouteMapStop } from './RouteMap';

export type ExplorerStop = RouteMapStop & {
  title: string;
  note: string;
  readings: Array<{ label: string; href: string }>;
};

type Props = {
  /** Slug bajo el que viaja el progreso (`ruta-<slug>`). */
  progressSlug: string;
  stops: ExplorerStop[];
  /** Paradas completadas según la cuenta; `null` = invitado (localStorage). */
  serverProgress: number[] | null;
};

/**
 * Experiencia de una ruta: mapa con la parada activa + panel con su título,
 * nota y lecturas. El progreso reutiliza la maquinaria de los planes
 * (invitado: localStorage reactivo; con cuenta: optimista + POST idempotente
 * a /api/plan-progress con revert — patrón PlanDetail).
 */
export function RouteExplorer({ progressSlug, stops, serverProgress }: Props) {
  const t = useTranslations('routes');
  const tReader = useTranslations('reader');
  const [active, setActive] = useState(0);
  const [saveFailed, setSaveFailed] = useState(false);

  const isAuthed = serverProgress !== null;
  const local = useCompletedDays(progressSlug);
  const [remote, setRemote] = useState<ReadonlySet<number>>(() => new Set(serverProgress ?? []));
  const completed = isAuthed ? remote : local;

  const onToggle = (index: number) => {
    if (!isAuthed) {
      toggleDay(progressSlug, index);
      return;
    }
    setSaveFailed(false);
    const wasDone = remote.has(index);
    const apply = (done: boolean) =>
      setRemote((prev) => {
        const next = new Set(prev);
        if (done) next.add(index);
        else next.delete(index);
        return next;
      });
    apply(!wasDone);
    void fetch('/api/plan-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: progressSlug, day: index, done: !wasDone }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`plan-progress → ${res.status}`);
      })
      .catch(() => {
        apply(wasDone);
        setSaveFailed(true);
      });
  };

  const stop = stops[active];
  if (!stop) return null;
  const isDone = completed.has(active);

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[1fr_1.4fr] lg:grid-cols-2 lg:grid-rows-1">
      <section aria-label={t('mapLabel')} className="relative min-h-0 lg:order-2">
        <RouteMap stops={stops} activeIndex={active} onSelect={setActive} />
      </section>

      <section
        aria-label={t('stopPanel')}
        className="min-h-0 overflow-y-auto border-t border-sand-200 px-6 py-8 sm:px-10 lg:order-1 lg:border-r lg:border-t-0 dark:border-stone-700"
      >
        <p className="font-sans text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
          {t('stopCount', { n: active + 1, total: stops.length })}
        </p>
        <h2 className="mt-2 font-serif text-2xl text-stone-800 dark:text-sand-100">{stop.title}</h2>
        <p className="mt-3 max-w-prose leading-relaxed text-stone-600 dark:text-sand-200">
          {stop.note}
        </p>

        <h3 className="mt-6 font-sans text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          {t('readings')}
        </h3>
        <ul className="mt-2 space-y-1.5">
          {stop.readings.map((reading) => (
            <li key={reading.href}>
              <Link
                href={reading.href}
                className="font-serif text-lg text-lapis-600 underline-offset-2 hover:underline dark:text-lapis-300"
              >
                {reading.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onToggle(active)}
            aria-pressed={isDone}
            className={`rounded-md border px-3 py-1.5 font-sans text-sm transition-colors ${
              isDone
                ? 'border-olive-500 bg-olive-500/10 text-olive-700 dark:text-olive-300'
                : 'border-sand-200 text-stone-700 hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-600 dark:text-sand-100'
            }`}
          >
            {t(isDone ? 'stopDone' : 'stopMark')}
          </button>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActive((i) => Math.max(0, i - 1))}
              disabled={active === 0}
              className="rounded-md border border-sand-200 px-3 py-1.5 font-sans text-sm text-stone-700 transition-colors hover:border-lapis-500 hover:text-lapis-600 disabled:opacity-40 dark:border-stone-600 dark:text-sand-100"
            >
              ← {t('prevStop')}
            </button>
            <button
              type="button"
              onClick={() => setActive((i) => Math.min(stops.length - 1, i + 1))}
              disabled={active === stops.length - 1}
              className="rounded-md border border-sand-200 px-3 py-1.5 font-sans text-sm text-stone-700 transition-colors hover:border-lapis-500 hover:text-lapis-600 disabled:opacity-40 dark:border-stone-600 dark:text-sand-100"
            >
              {t('nextStop')} →
            </button>
          </div>
        </div>

        {/* Lista de paradas para saltar directamente (y ver el progreso). */}
        <ol className="mt-8 space-y-1 border-t border-sand-200 pt-5 dark:border-stone-700">
          {stops.map((s, i) => (
            <li key={s.slug + i}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-current={i === active ? 'step' : undefined}
                className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left font-sans text-sm transition-colors ${
                  i === active
                    ? 'bg-lapis-500/10 text-lapis-700 dark:bg-stone-800 dark:text-lapis-300'
                    : 'text-stone-600 hover:bg-sand-100 dark:text-sand-200 dark:hover:bg-stone-800'
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                    completed.has(i)
                      ? 'bg-olive-500 text-white'
                      : 'bg-sand-200 text-stone-600 dark:bg-stone-700 dark:text-sand-200'
                  }`}
                >
                  {completed.has(i) ? '✓' : i + 1}
                </span>
                {s.title}
              </button>
            </li>
          ))}
        </ol>

        <p role="status" className="sr-only">
          {saveFailed ? tReader('saveError') : ''}
        </p>
      </section>
    </div>
  );
}
