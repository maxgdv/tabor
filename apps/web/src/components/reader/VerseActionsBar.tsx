'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  HIGHLIGHT_COLORS,
  HIGHLIGHT_LABEL_MAX,
  SWATCH_CLASSES,
  type HighlightColor,
} from '@/lib/annotations';

type Props = {
  /** «Versículo 3» o «Versículos 3-5, 8» — ya formateado por el lector. */
  refLabel: string;
  /** Color común de toda la selección, o `null` si difieren o no hay. */
  currentColor: HighlightColor | null;
  /** Etiqueta común de la selección (solo significativa con currentColor). */
  currentLabel: string | null;
  /** La nota es de un solo versículo: solo con selección unitaria. */
  canNote: boolean;
  hasNote: boolean;
  onSelectColor: (color: HighlightColor | null) => void;
  onSaveLabel: (label: string | null) => void;
  onOpenNote: () => void;
  onClose: () => void;
};

/**
 * Barra de acciones de la selección de versículos, fija al borde inferior del
 * panel del lector (sin anclaje al texto: robusta en móvil y con el scroll
 * interno). Tocar el color activo lo quita. El botón de etiqueta cambia la
 * barra a un input en línea (una sola fila también en móvil). Escape cierra.
 */
export function VerseActionsBar({
  refLabel,
  currentColor,
  currentLabel,
  canNote,
  hasNote,
  onSelectColor,
  onSaveLabel,
  onOpenNote,
  onClose,
}: Props) {
  const t = useTranslations('reader');
  const [labelMode, setLabelMode] = useState(false);
  const [labelDraft, setLabelDraft] = useState('');
  const labelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (labelMode) labelInputRef.current?.focus();
  }, [labelMode]);

  const openLabelMode = () => {
    setLabelDraft(currentLabel ?? '');
    setLabelMode(true);
  };

  const saveLabel = () => {
    const trimmed = labelDraft.trim();
    onSaveLabel(trimmed.length > 0 ? trimmed : null);
    setLabelMode(false);
  };

  return (
    <div
      role="toolbar"
      aria-label={refLabel}
      className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-3 border-t border-sand-200 bg-sand-50/95 px-4 py-2.5 backdrop-blur dark:border-stone-700 dark:bg-stone-900/95"
    >
      {labelMode ? (
        <>
          <label
            htmlFor="highlight-label-input"
            className="shrink-0 font-sans text-xs uppercase tracking-wide text-stone-500"
          >
            {t('labelName')}
          </label>
          <input
            ref={labelInputRef}
            id="highlight-label-input"
            type="text"
            value={labelDraft}
            onChange={(e) => setLabelDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveLabel();
            }}
            maxLength={HIGHLIGHT_LABEL_MAX}
            placeholder={t('labelPlaceholder')}
            className="min-w-0 flex-1 rounded-md border border-sand-200 bg-white/70 px-2.5 py-1 font-sans text-sm text-stone-800 placeholder:text-stone-400 focus:border-lapis-500 focus:outline-none focus:ring-1 focus:ring-lapis-500 dark:border-stone-600 dark:bg-stone-800/70 dark:text-sand-100"
          />
          <button
            type="button"
            onClick={saveLabel}
            className="shrink-0 rounded-md bg-lapis-500 px-2.5 py-1 font-sans text-xs font-medium text-white transition-colors hover:bg-lapis-600"
          >
            {t('labelSave')}
          </button>
          <button
            type="button"
            onClick={() => setLabelMode(false)}
            className="shrink-0 rounded-md px-2 py-1 font-sans text-xs text-stone-600 transition-colors hover:bg-sand-200 dark:text-sand-200 dark:hover:bg-stone-700"
          >
            {t('labelCancel')}
          </button>
        </>
      ) : (
        <>
          <span className="shrink-0 font-sans text-xs uppercase tracking-wide text-stone-500">
            {refLabel}
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

          {currentColor !== null && (
            <button
              type="button"
              onClick={openLabelMode}
              title={t(currentLabel ? 'labelEdit' : 'labelAdd')}
              className="max-w-32 truncate rounded-md border border-sand-200 px-2.5 py-1 font-sans text-xs text-stone-700 transition-colors hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-600 dark:text-sand-100"
            >
              {currentLabel ?? t('labelAdd')}
            </button>
          )}

          {canNote && (
            <button
              type="button"
              onClick={onOpenNote}
              className="rounded-md border border-sand-200 px-2.5 py-1 font-sans text-xs text-stone-700 transition-colors hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-600 dark:text-sand-100"
            >
              {t(hasNote ? 'noteEdit' : 'noteAdd')}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-md text-lg leading-none text-stone-500 transition-colors hover:bg-sand-200 dark:hover:bg-stone-700"
          >
            ×
          </button>
        </>
      )}
    </div>
  );
}
