'use client';

import { useEffect } from 'react';
import { useReaderStore } from '@/lib/reader-store';

// Pinta el data-active="true" sobre el <span data-verse=N> activo.
// Lo hacemos imperativamente para no rerenderizar todo el texto en cada scroll.
export function ActiveVerseMarker() {
  const activeVerse = useReaderStore((s) => s.activeVerseNumber);

  useEffect(() => {
    const all = document.querySelectorAll<HTMLElement>('[data-verse]');
    all.forEach((el) => {
      const isActive = Number(el.dataset.verse) === activeVerse;
      if (isActive) el.dataset.active = 'true';
      else delete el.dataset.active;
    });
  }, [activeVerse]);

  return null;
}
