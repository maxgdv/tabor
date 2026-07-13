'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useReaderStore } from '@/lib/reader-store';
import type { Chapter } from '@/lib/bible';

type Props = {
  chapter: Chapter;
  /** Versículos marcados por el usuario; `null` = invitado (sin UI de marcadores). */
  initialBookmarks: number[] | null;
};

export function ChapterReader({ chapter, initialBookmarks }: Props) {
  const t = useTranslations('reader');
  const setActiveVerse = useReaderStore((s) => s.setActiveVerse);
  const scrollTarget = useReaderStore((s) => s.scrollTarget);
  const clearScrollTarget = useReaderStore((s) => s.clearScrollTarget);

  const containerRef = useRef<HTMLDivElement>(null);
  const verseRefs = useRef<Map<number, HTMLElement>>(new Map());

  // Marcadores con actualización optimista. El componente se remonta al
  // cambiar de capítulo (key en la página), así que el estado nace del server.
  const isAuthed = initialBookmarks !== null;
  const [bookmarks, setBookmarks] = useState<ReadonlySet<number>>(
    () => new Set(initialBookmarks ?? []),
  );

  const toggleBookmark = async (verseNumber: number) => {
    const wasBookmarked = bookmarks.has(verseNumber);
    const apply = (add: boolean) =>
      setBookmarks((prev) => {
        const next = new Set(prev);
        if (add) next.add(verseNumber);
        else next.delete(verseNumber);
        return next;
      });
    apply(!wasBookmarked);
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book: chapter.bookCanonicalId.toLowerCase(),
          chapter: chapter.number,
          verse: verseNumber,
        }),
      });
      if (!res.ok) throw new Error(`bookmarks → ${res.status}`);
    } catch {
      // Revertir: la red o la sesión fallaron y el estado visual mentiría.
      apply(wasBookmarked);
    }
  };

  // Observa qué versículo está más cerca de la línea de lectura y lo marca activo.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        // De los versículos visibles, escoge el que esté más alto en la viewport.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => ({
            number: Number((e.target as HTMLElement).dataset.verse),
            top: e.boundingClientRect.top,
          }))
          .filter((v) => Number.isFinite(v.number))
          .sort((a, b) => a.top - b.top);

        if (visible.length > 0 && visible[0]) {
          setActiveVerse(visible[0].number);
        }
      },
      {
        // La "línea de lectura" está en el tercio superior del viewport del lector.
        rootMargin: '-25% 0px -60% 0px',
        threshold: 0,
      },
    );

    verseRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [setActiveVerse]);

  // Deep-link a un versículo: /leer/mat/5#v3 (desde la búsqueda o un enlace
  // compartido). El contenedor de scroll es interno, así que hacemos el
  // scroll nosotros en vez de confiar en el anchor nativo del navegador.
  useEffect(() => {
    const match = window.location.hash.match(/^#v(\d+)$/);
    if (!match) return;
    const number = Number(match[1]);
    const el = verseRefs.current.get(number);
    if (el) {
      el.scrollIntoView({ block: 'center' });
      setActiveVerse(number);
    }
  }, [chapter, setActiveVerse]);

  // Cuando el mapa pide scroll a un versículo concreto, lo llevamos suavemente.
  useEffect(() => {
    if (scrollTarget == null) return;
    const el = verseRefs.current.get(scrollTarget);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    clearScrollTarget();
  }, [scrollTarget, clearScrollTarget]);

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto px-6 py-10 sm:px-10 sm:py-14"
    >
      <article className="mx-auto max-w-reader">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
            {chapter.versionFullName}
          </p>
          <h1 className="mt-2 font-serif text-3xl text-stone-800 dark:text-sand-100">
            {chapter.bookName} {chapter.number}
          </h1>
        </header>
        <p className="font-serif text-lg leading-loose text-stone-800 dark:text-sand-100">
          {chapter.verses.map((verse) => (
            <span
              key={verse.number}
              ref={(el) => {
                if (el) verseRefs.current.set(verse.number, el);
                else verseRefs.current.delete(verse.number);
              }}
              id={`v${verse.number}`}
              data-verse={verse.number}
              data-bookmarked={isAuthed && bookmarks.has(verse.number) ? 'true' : undefined}
              className="group inline transition-colors"
            >
              {isAuthed ? (
                // Con sesión, el número del versículo es el botón de marcador:
                // misma tipografía que el <sup> de invitado, alineado arriba.
                <button
                  type="button"
                  onClick={() => toggleBookmark(verse.number)}
                  aria-pressed={bookmarks.has(verse.number)}
                  aria-label={t(bookmarks.has(verse.number) ? 'bookmarkRemove' : 'bookmarkAdd', {
                    n: verse.number,
                  })}
                  className="mr-1 inline-block select-none align-super font-sans text-xs leading-none text-stone-400 transition-colors hover:text-lapis-500 group-data-[active=true]:text-lapis-500 group-data-[bookmarked=true]:font-semibold group-data-[bookmarked=true]:text-sand-500"
                >
                  {verse.number}
                </button>
              ) : (
                <sup className="mr-1 select-none font-sans text-xs text-stone-400 group-data-[active=true]:text-lapis-500">
                  {verse.number}
                </sup>
              )}
              {verse.text}{' '}
            </span>
          ))}
        </p>
        <footer className="mt-16 border-t border-sand-200 pt-6 text-xs text-stone-500 dark:border-stone-700">
          <p>{chapter.copyright}</p>
          <p className="mt-1">
            {t.rich('geoCredits', {
              link: (chunks) => (
                <a
                  href="https://www.openbible.info/geo/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline hover:text-stone-700 dark:hover:text-sand-200"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
        </footer>
      </article>
    </div>
  );
}
