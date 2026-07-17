'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';

type Props = {
  bookUrlSegment: string;
  chapterNumber: number;
  verseNumber: number;
};

/** Quita un marcador desde "Mis marcadores" (reusa el POST toggle). */
export function RemoveBookmarkButton({ bookUrlSegment, chapterNumber, verseNumber }: Props) {
  const t = useTranslations('auth');
  const tReader = useTranslations('reader');
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
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book: bookUrlSegment,
          chapter: chapterNumber,
          verse: verseNumber,
        }),
      });
      if (res.ok) {
        // La página es un server component: refresh re-lee la lista.
        router.refresh();
        return;
      }
    } catch {
      // El marcador sigue visible; se anuncia el fallo y se puede reintentar.
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
        aria-label={t('bookmarksRemove')}
        title={t('bookmarksRemove')}
        className="shrink-0 rounded p-1 text-stone-500 transition-colors hover:bg-sand-100 hover:text-red-600 disabled:opacity-50 dark:text-stone-400 dark:hover:bg-stone-800"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <span role="status" className="sr-only">
        {failed ? tReader('saveError') : ''}
      </span>
    </>
  );
}
