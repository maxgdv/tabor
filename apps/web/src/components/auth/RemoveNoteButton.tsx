'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';

type Props = {
  bookUrlSegment: string;
  chapterNumber: number;
  verseNumber: number;
};

/** Borra una nota desde "Mis notas" (POST body: null, borrado explícito). */
export function RemoveNoteButton({ bookUrlSegment, chapterNumber, verseNumber }: Props) {
  const t = useTranslations('reader');
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  // El fallo se anuncia (sr-only): sin esto el botón "no hace nada" para
  // un lector de pantalla (WCAG 4.1.3).
  const [failed, setFailed] = useState(false);

  const remove = async () => {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book: bookUrlSegment,
          chapter: chapterNumber,
          verse: verseNumber,
          body: null,
        }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
    } catch {
      // La nota sigue visible; se anuncia el fallo y se puede reintentar.
    }
    setFailed(true);
    setBusy(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        aria-label={t('noteDelete')}
        title={t('noteDelete')}
        className="shrink-0 rounded p-1 text-stone-500 transition-colors hover:bg-sand-100 hover:text-red-600 disabled:opacity-50 dark:text-stone-400 dark:hover:bg-stone-800"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <span role="status" className="sr-only">
        {failed ? t('saveError') : ''}
      </span>
    </>
  );
}
