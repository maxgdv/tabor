'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useReaderStore } from '@/lib/reader-store';
import type { Chapter } from '@/lib/bible';
import {
  HIGHLIGHT_CLASSES,
  contiguousRanges,
  formatRanges,
  isHighlightColor,
  type HighlightColor,
} from '@/lib/annotations';
import { VerseActionsBar } from './VerseActionsBar';
import { NoteEditor } from './NoteEditor';

export type ChapterAnnotations = {
  highlights: Array<{ verseNumber: number; color: string; label: string | null }>;
  notes: Array<{ verseNumber: number; body: string }>;
};

type VerseHighlight = { color: HighlightColor; label: string | null };

/** Valor común de todos los elementos, o `null` si difieren o no hay ninguno. */
function uniformValue<T>(values: Array<T | null>): T | null {
  if (values.length === 0) return null;
  const [first] = values;
  return values.every((v) => v === first) ? (first ?? null) : null;
}

type Props = {
  chapter: Chapter;
  /** Versículos marcados por el usuario; `null` = invitado (sin UI de marcadores). */
  initialBookmarks: number[] | null;
  /** Resaltados y notas del capítulo; `null` = invitado. */
  initialAnnotations: ChapterAnnotations | null;
};

export function ChapterReader({ chapter, initialBookmarks, initialAnnotations }: Props) {
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

  // Resaltados y notas (solo con sesión). Nacen del server y el remontaje
  // por key al cambiar de capítulo los refresca — sin setState en effects.
  // La selección es un conjunto: cada tap añade/quita un versículo, y el
  // color se aplica por rangos contiguos (un tap solo = comportamiento v1).
  const [selected, setSelected] = useState<ReadonlySet<number>>(() => new Set());
  const [noteEditorVerse, setNoteEditorVerse] = useState<number | null>(null);
  const [highlights, setHighlights] = useState<ReadonlyMap<number, VerseHighlight>>(
    () =>
      new Map(
        (initialAnnotations?.highlights ?? [])
          .filter((h) => isHighlightColor(h.color))
          .map((h) => [h.verseNumber, { color: h.color as HighlightColor, label: h.label }]),
      ),
  );
  const [notes, setNotes] = useState<ReadonlyMap<number, string>>(
    () => new Map((initialAnnotations?.notes ?? []).map((n) => [n.verseNumber, n.body])),
  );

  const selectedNumbers = [...selected].sort((a, b) => a - b);
  const selectedHighlights = selectedNumbers.map((n) => highlights.get(n) ?? null);
  // Swatch activo solo si TODA la selección comparte color; ídem etiqueta.
  const selectionColor = uniformValue(selectedHighlights.map((h) => h?.color ?? null));
  const selectionLabel =
    selectionColor !== null
      ? uniformValue(selectedHighlights.map((h) => h?.label ?? null))
      : null;

  /** Aplica color (o null = quitar) y etiqueta a toda la selección, un POST
   *  por rango contiguo, con actualización optimista y revert conjunto. */
  const applyHighlight = (color: HighlightColor | null, label: string | null) => {
    if (selectedNumbers.length === 0) return;
    const previous = highlights;
    setHighlights((prev) => {
      const next = new Map(prev);
      for (const n of selectedNumbers) {
        if (color === null) next.delete(n);
        else next.set(n, { color, label });
      }
      return next;
    });
    const ranges = contiguousRanges(selectedNumbers);
    void Promise.all(
      ranges.map((range) =>
        fetch('/api/highlights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            book: chapter.bookCanonicalId.toLowerCase(),
            chapter: chapter.number,
            start: range.start,
            end: range.end,
            color,
            label,
          }),
        }).then((res) => {
          if (!res.ok) throw new Error(`highlights → ${res.status}`);
        }),
      ),
    ).catch(() => setHighlights(previous));
  };

  const saveNote = (verseNumber: number, body: string | null) => {
    const previous = notes.get(verseNumber) ?? null;
    const set = (value: string | null) =>
      setNotes((prev) => {
        const next = new Map(prev);
        if (value === null) next.delete(verseNumber);
        else next.set(verseNumber, value);
        return next;
      });
    set(body);
    setNoteEditorVerse(null);
    void fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        book: chapter.bookCanonicalId.toLowerCase(),
        chapter: chapter.number,
        verse: verseNumber,
        body,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`notes → ${res.status}`);
      })
      .catch(() => set(previous));
  };

  // Tap en el texto del versículo = añadirlo/quitarlo de la selección. Los
  // clicks nacidos en botones interiores (marcador, icono de nota) no cuentan.
  const onVerseClick = (verseNumber: number) => (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(verseNumber)) next.delete(verseNumber);
      else next.add(verseNumber);
      return next;
    });
  };

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

  // La nota sigue siendo de un solo versículo: el botón solo aparece con
  // exactamente un versículo seleccionado.
  const singleSelected = selectedNumbers.length === 1 ? selectedNumbers[0]! : null;
  const selectionRef =
    selectedNumbers.length === 1
      ? t('verseActions', { n: selectedNumbers[0]! })
      : t('verseActionsRange', { refs: formatRanges(contiguousRanges(selectedNumbers)) });

  return (
    <div className="relative h-full">
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
              data-selected={selected.has(verse.number) ? 'true' : undefined}
              // A11y v1 documentada: seleccionar para anotar es por puntero
              // (hacer focusables ~170 spans degradaría el teclado del
              // lector); barra y editor sí son 100 % accesibles por teclado.
              onClick={isAuthed ? onVerseClick(verse.number) : undefined}
              className={`group inline transition-colors ${
                isAuthed && highlights.has(verse.number)
                  ? `${HIGHLIGHT_CLASSES[highlights.get(verse.number)!.color]} box-decoration-clone rounded-sm`
                  : ''
              } data-[selected=true]:underline data-[selected=true]:decoration-stone-400 data-[selected=true]:decoration-dotted data-[selected=true]:underline-offset-4`}
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
              {isAuthed && notes.has(verse.number) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelected(new Set([verse.number]));
                    setNoteEditorVerse(verse.number);
                  }}
                  aria-label={t('noteOpen', { n: verse.number })}
                  title={t('noteOpen', { n: verse.number })}
                  className="mr-1 inline-block align-super text-lapis-500 transition-colors hover:text-lapis-600 dark:text-lapis-300"
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.4-9.4a2 2 0 112.8 2.8L11 15l-4 1 1-4 8.6-8.4z"
                    />
                  </svg>
                </button>
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

    {isAuthed && selected.size > 0 && noteEditorVerse == null && (
      <VerseActionsBar
        refLabel={selectionRef}
        currentColor={selectionColor}
        currentLabel={selectionLabel}
        canNote={singleSelected != null}
        hasNote={singleSelected != null && notes.has(singleSelected)}
        onSelectColor={(color) =>
          // Cambiar de color conserva la etiqueta común de la selección.
          applyHighlight(color, color === null ? null : selectionLabel)
        }
        onSaveLabel={(label) => applyHighlight(selectionColor, label)}
        onOpenNote={() => singleSelected != null && setNoteEditorVerse(singleSelected)}
        onClose={() => setSelected(new Set())}
      />
    )}

    {isAuthed && noteEditorVerse != null && (
      <NoteEditor
        reference={`${chapter.bookName} ${chapter.number}, ${noteEditorVerse}`}
        verseText={chapter.verses.find((v) => v.number === noteEditorVerse)?.text ?? ''}
        initialBody={notes.get(noteEditorVerse) ?? ''}
        onSave={(body) => saveNote(noteEditorVerse, body)}
        onDelete={() => saveNote(noteEditorVerse, null)}
        onClose={() => setNoteEditorVerse(null)}
      />
    )}
    </div>
  );
}
