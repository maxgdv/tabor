'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useReaderStore } from '@/lib/reader-store';
import type { Chapter } from '@/lib/bible';

type Props = {
  chapter: Chapter;
};

export function ChapterReader({ chapter }: Props) {
  const t = useTranslations('reader');
  const setActiveVerse = useReaderStore((s) => s.setActiveVerse);
  const scrollTarget = useReaderStore((s) => s.scrollTarget);
  const clearScrollTarget = useReaderStore((s) => s.clearScrollTarget);

  const containerRef = useRef<HTMLDivElement>(null);
  const verseRefs = useRef<Map<number, HTMLElement>>(new Map());

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
              data-verse={verse.number}
              className="group inline transition-colors"
            >
              <sup className="mr-1 select-none font-sans text-xs text-stone-400 group-data-[active=true]:text-lapis-500">
                {verse.number}
              </sup>
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
