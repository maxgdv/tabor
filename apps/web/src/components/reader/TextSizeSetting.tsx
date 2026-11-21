'use client';

import { useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { useReaderStore } from '@/lib/reader-store';
import {
  DEFAULT_TEXT_SCALE,
  TEXT_SCALES,
  getTextScale,
  setTextScale,
  stepTextScale,
  subscribeTextScale,
  textScalePercent,
} from '@/lib/text-size';

/**
 * Cambia el tamaño de letra sin perder el sitio: al agrandar o reducir, el
 * texto se recoloca y el versículo que se estaba leyendo saltaría varias
 * líneas. Se mide dónde estaba antes del cambio y se compensa el scroll del
 * panel para dejarlo exactamente a la misma altura.
 */
function changeTextScale(direction: 1 | -1): void {
  const current = getTextScale();
  const next = stepTextScale(current, direction);
  if (next === current) return;

  const active = useReaderStore.getState().activeVerseNumber;
  const anchor =
    active != null ? document.querySelector<HTMLElement>(`[data-verse="${active}"]`) : null;
  const scroller = anchor?.closest<HTMLElement>('[data-reader-scroll]') ?? null;
  const before = anchor?.getBoundingClientRect().top;

  setTextScale(next);

  if (anchor && scroller && before !== undefined) {
    scroller.scrollTop += anchor.getBoundingClientRect().top - before;
  }
}

/** Control «A− 115 % A+» de los ajustes de lectura. */
export function TextSizeSetting() {
  const t = useTranslations('reader');
  // En servidor siempre es el tamaño por defecto; la preferencia real llega
  // tras hidratar (el texto ya la lleva aplicada desde el script de arranque).
  const scale = useSyncExternalStore(subscribeTextScale, getTextScale, () => DEFAULT_TEXT_SCALE);
  const atMin = scale === TEXT_SCALES[0];
  const atMax = scale === TEXT_SCALES[TEXT_SCALES.length - 1];

  const stepClass =
    'inline-flex h-11 w-11 items-center justify-center rounded-md border border-sand-200 bg-white/70 font-serif text-stone-800 transition-colors hover:border-lapis-500 hover:text-lapis-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-sand-200 disabled:hover:text-stone-800 dark:border-stone-600 dark:bg-stone-800/70 dark:text-sand-100 dark:disabled:hover:border-stone-600 dark:disabled:hover:text-sand-100';

  return (
    <div role="group" aria-labelledby="text-size-label">
      <span
        id="text-size-label"
        className="mb-1 block font-sans text-xs font-medium text-stone-600 dark:text-sand-200"
      >
        {t('textSize')}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => changeTextScale(-1)}
          disabled={atMin}
          aria-label={t('textSizeSmaller')}
          title={t('textSizeSmaller')}
          className={`${stepClass} text-sm`}
        >
          A
        </button>
        {/* aria-live: el cambio de tamaño se ve, pero no se oye. */}
        <span
          aria-live="polite"
          className="min-w-0 flex-1 text-center font-sans text-sm tabular-nums text-stone-700 dark:text-sand-100"
        >
          {t('textSizeValue', { percent: textScalePercent(scale) })}
        </span>
        <button
          type="button"
          onClick={() => changeTextScale(1)}
          disabled={atMax}
          aria-label={t('textSizeLarger')}
          title={t('textSizeLarger')}
          className={`${stepClass} text-xl`}
        >
          A
        </button>
      </div>
    </div>
  );
}
