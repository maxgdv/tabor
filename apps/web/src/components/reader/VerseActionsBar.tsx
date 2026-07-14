'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  HIGHLIGHT_COLORS,
  SWATCH_CLASSES,
  type HighlightColor,
} from '@/lib/annotations';

type Props = {
  verseNumber: number;
  currentColor: HighlightColor | null;
  hasNote: boolean;
  onSelectColor: (color: HighlightColor | null) => void;
  onOpenNote: () => void;
  onClose: () => void;
};

/**
 * Barra de acciones del versículo seleccionado, fija al borde inferior del
 * panel del lector (sin anclaje al texto: robusta en móvil y con el scroll
 * interno). Tocar el color activo lo quita. Escape cierra.
 */
export function VerseActionsBar({
  verseNumber,
  currentColor,
  hasNote,
  onSelectColor,
  onOpenNote,
  onClose,
}: Props) {
  const t = useTranslations('reader');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="toolbar"
      aria-label={t('verseActions', { n: verseNumber })}
      className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-3 border-t border-sand-200 bg-sand-50/95 px-4 py-2.5 backdrop-blur dark:border-stone-700 dark:bg-stone-900/95"
    >
      <span className="shrink-0 font-sans text-xs uppercase tracking-wide text-stone-500">
        {t('verseActions', { n: verseNumber })}
      </span>

      <div className="flex items-center gap-1.5" role="group" aria-label={t('highlightGroup')}>
        {HIGHLIGHT_COLORS.map((color) => {
          const isActive = currentColor === color;
          return (
            <button
              key={color}
              type="button"
              onClick={() => onSelectColor(isActive ? null : color)}
              aria-pressed={isActive}
              aria-label={t(isActive ? 'highlightRemove' : `color.${color}`)}
              title={t(isActive ? 'highlightRemove' : `color.${color}`)}
              className={`h-6 w-6 rounded-full ${SWATCH_CLASSES[color]} transition-transform hover:scale-110 ${
                isActive
                  ? 'ring-2 ring-stone-700 ring-offset-1 ring-offset-sand-50 dark:ring-sand-100 dark:ring-offset-stone-900'
                  : 'opacity-80 hover:opacity-100'
              }`}
            />
          );
        })}
      </div>

      <button
        type="button"
        onClick={onOpenNote}
        className="rounded-md border border-sand-200 px-2.5 py-1 font-sans text-xs text-stone-700 transition-colors hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-600 dark:text-sand-100"
      >
        {t(hasNote ? 'noteEdit' : 'noteAdd')}
      </button>

      <button
        type="button"
        onClick={onClose}
        aria-label={t('close')}
        className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-md text-lg leading-none text-stone-500 transition-colors hover:bg-sand-200 dark:hover:bg-stone-700"
      >
        ×
      </button>
    </div>
  );
}
