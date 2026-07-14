'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { NOTE_MAX_LENGTH } from '@/lib/annotations';

type Props = {
  /** "Génesis 3, 15" — la referencia visible del versículo anotado. */
  reference: string;
  verseText: string;
  /** '' si la nota es nueva. */
  initialBody: string;
  onSave: (body: string) => void;
  onDelete: () => void;
  onClose: () => void;
};

/**
 * Editor de la nota de un versículo. Diálogo modal con portal (patrón
 * BookSidebar): focus-trap, Escape y backdrop cierran. Texto plano v1 —
 * el campo se llama body_md en BD y el render usa whitespace-pre-wrap,
 * así que activar Markdown después no cambia el formato guardado.
 */
export function NoteEditor({ reference, verseText, initialBody, onSave, onDelete, onClose }: Props) {
  const t = useTranslations('reader');
  const [body, setBody] = useState(initialBody);
  const dialogRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmed = body.trim();
  const canSave = trimmed.length > 0 && trimmed !== initialBody;

  // Foco inicial al textarea; Tab queda dentro del diálogo (aria-modal).
  useEffect(() => {
    textareaRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), textarea',
      );
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      const active = document.activeElement;
      if (!dialog.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${t('noteDialog')} — ${reference}`}
        className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-lg rounded-lg border border-sand-200 bg-sand-50 p-5 shadow-2xl sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-full sm:-translate-x-1/2 sm:-translate-y-1/2 dark:border-stone-700 dark:bg-stone-900"
      >
        <p className="font-sans text-xs font-semibold uppercase tracking-wide text-lapis-600 dark:text-lapis-300">
          {reference}
        </p>
        <p className="mt-1.5 line-clamp-2 font-serif text-sm text-stone-600 dark:text-sand-200">
          {verseText}
        </p>

        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={NOTE_MAX_LENGTH}
          rows={6}
          placeholder={t('notePlaceholder')}
          className="mt-4 w-full resize-y rounded-md border border-sand-200 bg-white/70 p-3 font-sans text-sm text-stone-800 placeholder:text-stone-400 focus:border-lapis-500 focus:outline-none focus:ring-1 focus:ring-lapis-500 dark:border-stone-700 dark:bg-stone-800/70 dark:text-sand-100"
        />
        <p className="mt-1 text-right font-sans text-xs tabular-nums text-stone-400">
          {body.length} / {NOTE_MAX_LENGTH}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            disabled={!canSave}
            onClick={() => onSave(trimmed)}
            className="rounded-md bg-lapis-500 px-4 py-2 font-sans text-sm font-medium text-white transition-colors hover:bg-lapis-600 disabled:opacity-50"
          >
            {t('noteSave')}
          </button>
          {initialBody !== '' && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-md border border-red-300 px-3 py-2 font-sans text-sm text-red-700 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
            >
              {t('noteDelete')}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-md px-3 py-2 font-sans text-sm text-stone-600 transition-colors hover:bg-sand-100 dark:text-sand-200 dark:hover:bg-stone-800"
          >
            {t('noteCancel')}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
