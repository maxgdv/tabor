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

  const remove = async () => {
    if (busy) return;
    setBusy(true);
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
      // Silencioso: la nota sigue visible, el usuario puede reintentar.
    }
    setBusy(false);
  };

  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      aria-label={t('noteDelete')}
      title={t('noteDelete')}
      className="shrink-0 rounded p-1 text-stone-400 transition-colors hover:bg-sand-100 hover:text-red-600 disabled:opacity-50 dark:hover:bg-stone-800"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  );
}
