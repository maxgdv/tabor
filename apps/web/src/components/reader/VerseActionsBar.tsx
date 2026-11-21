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
  /** Con sesión: colores, etiqueta y nota. Sin ella, solo compartir y copiar. */
  canAnnotate: boolean;
  /** Cita, referencia y enlace de la selección, listos para enviar. */
  shareText: string | null;
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

type CopyStatus = 'idle' | 'copied' | 'failed';

/**
 * Barra de acciones de la selección de versículos, fija al borde inferior del
 * panel del lector (sin anclaje al texto: robusta en móvil y con el scroll
 * interno). Compartir y copiar están para todos; resaltar, etiquetar y anotar
 * piden sesión. Tocar el color activo lo quita. El botón de etiqueta cambia
 * la barra a un input en línea (una sola fila también en móvil). Escape
 * cierra.
 */
export function VerseActionsBar({
  refLabel,
  canAnnotate,
  shareText,
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
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    },
    [],
  );

  // La hoja de compartir del sistema existe sobre todo en móvil; donde no la
  // hay, «Copiar» cubre el caso. La barra solo se monta tras una interacción,
  // ya en el navegador, así que consultar `navigator` aquí no desajusta la
  // hidratación.
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const share = () => {
    if (!shareText) return;
    // Rechaza con AbortError cuando el usuario cierra la hoja sin elegir
    // destino: no es un fallo y no hay nada que avisar.
    navigator.share({ text: shareText }).catch(() => {});
  };

  const copy = async () => {
    if (!shareText) return;
    let status: CopyStatus = 'copied';
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      status = 'failed';
    }
    setCopyStatus(status);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopyStatus('idle'), 2500);
  };

  const actionButtonClass =
    'inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-md border border-sand-200 px-3 font-sans text-xs text-stone-700 transition-colors hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-600 dark:text-sand-100';
  const copyLabel = t(
    copyStatus === 'copied' ? 'copied' : copyStatus === 'failed' ? 'copyFailed' : 'copy',
  );
  // Con sesión la barra ya lleva colores, etiqueta y nota: compartir y copiar
  // se quedan en icono para no añadir otra fila (el panel de texto es media
  // pantalla también en escritorio; el rótulo vuelve en pantallas muy
  // anchas). Sin sesión son lo único que hay y caben con su texto.
  const actionTextClass = canAnnotate ? 'hidden 2xl:inline' : '';

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
      // flex-wrap: con objetivos táctiles de 44 px los cinco colores más los
      // botones no caben en una fila de teléfono; en pantalla ancha sigue
      // siendo una sola línea.
      className="absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-sand-200 bg-sand-50/95 px-3 py-1.5 backdrop-blur sm:gap-x-3 sm:px-4 dark:border-stone-700 dark:bg-stone-900/95"
    >
      {labelMode ? (
        <>
          <label
            htmlFor="highlight-label-input"
            className="shrink-0 font-sans text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400"
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
            className="min-h-11 min-w-0 flex-1 rounded-md border border-sand-200 bg-white/70 px-2.5 font-sans text-sm text-stone-800 placeholder:text-stone-500 focus:border-lapis-500 focus:outline-none focus:ring-1 focus:ring-lapis-500 dark:border-stone-600 dark:bg-stone-800/70 dark:text-sand-100 dark:placeholder:text-stone-400"
          />
          <button
            type="button"
            onClick={saveLabel}
            className="inline-flex min-h-11 shrink-0 items-center rounded-md bg-lapis-500 px-3 font-sans text-xs font-medium text-white transition-colors hover:bg-lapis-600"
          >
            {t('labelSave')}
          </button>
          <button
            type="button"
            onClick={() => setLabelMode(false)}
            className="inline-flex min-h-11 shrink-0 items-center rounded-md px-3 font-sans text-xs text-stone-600 transition-colors hover:bg-sand-200 dark:text-sand-200 dark:hover:bg-stone-700"
          >
            {t('labelCancel')}
          </button>
        </>
      ) : (
        <>
          <span className="shrink-0 font-sans text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
            {refLabel}
          </span>

          {canAnnotate && (
            <div className="flex items-center" role="group" aria-label={t('highlightGroup')}>
              {HIGHLIGHT_COLORS.map((color) => {
                const isActive = currentColor === color;
                return (
                  // El botón mide 44×44 (área táctil); la muestra de color
                  // sigue siendo el círculo de 24 px de dentro.
                  <button
                    key={color}
                    type="button"
                    onClick={() => onSelectColor(isActive ? null : color)}
                    aria-pressed={isActive}
                    aria-label={t(isActive ? 'highlightRemove' : `color.${color}`)}
                    title={t(isActive ? 'highlightRemove' : `color.${color}`)}
                    className="group inline-flex h-11 w-11 items-center justify-center rounded-md"
                  >
                    <span
                      aria-hidden="true"
                      className={`reader-motion h-6 w-6 rounded-full ${SWATCH_CLASSES[color]} transition-transform group-hover:scale-110 ${
                        isActive
                          ? 'ring-2 ring-stone-700 ring-offset-1 ring-offset-sand-50 dark:ring-sand-100 dark:ring-offset-stone-900'
                          : 'opacity-80 group-hover:opacity-100'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}

          {canAnnotate && currentColor !== null && (
            <button
              type="button"
              onClick={openLabelMode}
              title={t(currentLabel ? 'labelEdit' : 'labelAdd')}
              className="inline-flex min-h-11 max-w-32 items-center truncate rounded-md border border-sand-200 px-3 font-sans text-xs text-stone-700 transition-colors hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-600 dark:text-sand-100"
            >
              {currentLabel ?? t('labelAdd')}
            </button>
          )}

          {canAnnotate && canNote && (
            <button
              type="button"
              onClick={onOpenNote}
              className="inline-flex min-h-11 items-center rounded-md border border-sand-200 px-3 font-sans text-xs text-stone-700 transition-colors hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-600 dark:text-sand-100"
            >
              {t(hasNote ? 'noteEdit' : 'noteAdd')}
            </button>
          )}

          {shareText && canShare && (
            <button
              type="button"
              onClick={share}
              aria-label={t('share')}
              title={t('share')}
              className={actionButtonClass}
            >
              <svg
                className="h-4 w-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15V3m0 0L8 7m4-4l4 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
              <span className={actionTextClass}>{t('share')}</span>
            </button>
          )}
          {shareText && (
            <button
              type="button"
              onClick={copy}
              aria-label={t('copy')}
              title={t('copy')}
              className={actionButtonClass}
            >
              {copyStatus === 'copied' ? (
                <svg
                  className="h-4 w-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <rect x="9" y="9" width="11" height="11" rx="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15V6a2 2 0 012-2h9" />
                </svg>
              )}
              <span className={actionTextClass}>{copyLabel}</span>
            </button>
          )}
          {/* El cambio de icono y de texto no lo anuncia un lector de
              pantalla por sí solo (WCAG 4.1.3). */}
          <span role="status" className="sr-only">
            {copyStatus === 'idle' ? '' : copyLabel}
          </span>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-md text-lg leading-none text-stone-500 transition-colors hover:bg-sand-200 dark:hover:bg-stone-700"
          >
            ×
          </button>
        </>
      )}
    </div>
  );
}
