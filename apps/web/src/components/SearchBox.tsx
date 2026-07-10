'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import {
  HIGHLIGHT_POST,
  HIGHLIGHT_PRE,
  type SearchResponse,
} from '@/lib/search';

// Un resultado plano del dropdown, sea cual sea su origen.
type Item = {
  key: string;
  href: string;
  group: 'reference' | 'places' | 'verses';
  title: string;
  subtitle?: string;
  /** Solo los versículos llevan snippet con marcadores de resaltado. */
  snippet?: string;
};

/** Convierte la respuesta de /api/search en la lista plana del dropdown. */
function toItems(data: SearchResponse): Item[] {
  const items: Item[] = [];

  if (data.reference) {
    const r = data.reference;
    const label =
      r.chapter === undefined
        ? r.bookName
        : `${r.bookName} ${r.chapter}${r.verse !== undefined ? `, ${r.verse}` : ''}`;
    const href =
      r.chapter === undefined
        ? `/leer/${r.urlSegment}`
        : `/leer/${r.urlSegment}/${r.chapter}${r.verse !== undefined ? `#v${r.verse}` : ''}`;
    items.push({ key: 'ref', href, group: 'reference', title: label });
  }

  for (const p of data.places) {
    items.push({
      key: `place:${p.slug}`,
      href: `/leer/${p.bookUrlSegment}/${p.chapterNumber}`,
      group: 'places',
      title: p.name,
      subtitle: `${p.bookName} ${p.chapterNumber}`,
    });
  }

  for (const v of data.verses) {
    items.push({
      key: `verse:${v.bookSegment}-${v.chapter}-${v.verse}`,
      href: `/leer/${v.bookSegment}/${v.chapter}#v${v.verse}`,
      group: 'verses',
      title: `${v.bookName} ${v.chapter}, ${v.verse}`,
      snippet: v.snippet,
    });
  }

  return items;
}

/** Renderiza un snippet marcando los términos encontrados, sin HTML crudo. */
function Snippet({ text }: { text: string }) {
  const nodes: React.ReactNode[] = [];
  text.split(HIGHLIGHT_PRE).forEach((chunk, i) => {
    if (i === 0) {
      if (chunk) nodes.push(chunk);
      return;
    }
    const [hit, rest] = chunk.split(HIGHLIGHT_POST, 2);
    nodes.push(
      <mark key={i} className="bg-transparent font-semibold text-lapis-600 dark:text-lapis-300">
        {hit}
      </mark>,
    );
    if (rest) nodes.push(rest);
  });
  return <>{nodes}</>;
}

/**
 * Buscador global del header: referencias ("Mt 5"), lugares y texto libre.
 * Combobox accesible: input + listbox, flechas para moverse, Enter navega,
 * Escape cierra.
 */
export function SearchBox() {
  const t = useTranslations('search');
  const locale = useLocale();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [data, setData] = useState<SearchResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo(() => (data ? toItems(data) : []), [data]);

  // Pide resultados con debounce, cancelando la petición anterior.
  // (Con menos de 2 caracteres no hay nada que pedir; el onChange ya
  // limpió los resultados.)
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q)}&locale=${locale}`,
          { signal: controller.signal },
        );
        if (!res.ok) return;
        const body = (await res.json()) as SearchResponse;
        setData(body);
        setActiveIndex(0);
      } catch {
        // Petición cancelada o red caída: el dropdown se queda como estaba.
      }
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, locale]);

  // Cierra al hacer click fuera del componente.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const navigateTo = (item: Item) => {
    setOpen(false);
    inputRef.current?.blur();
    // typedRoutes valida rutas estáticas; estas se construyen en runtime.
    router.push(item.href as Parameters<typeof router.push>[0]);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!open || items.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + items.length) % items.length);
    } else if (e.key === 'Enter') {
      const item = items[activeIndex] ?? items[0];
      if (item) {
        e.preventDefault();
        navigateTo(item);
      }
    }
  };

  const showNoResults = open && query.trim().length >= 2 && data !== null && items.length === 0;
  const groupLabel: Record<Item['group'], string> = {
    reference: t('groupReference'),
    places: t('groupPlaces'),
    verses: t('groupVerses'),
  };

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1 max-w-xs sm:max-w-sm">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (e.target.value.trim().length < 2) setData(null);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={t('placeholder')}
          aria-label={t('label')}
          aria-expanded={open && items.length > 0}
          aria-controls="search-results"
          aria-autocomplete="list"
          aria-activedescendant={
            open && items[activeIndex] ? `search-item-${activeIndex}` : undefined
          }
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-lg border border-sand-200 bg-white/70 py-1.5 pl-8 pr-3 font-sans text-sm text-stone-800 placeholder:text-stone-400 focus:border-lapis-500 focus:outline-none focus:ring-1 focus:ring-lapis-500 dark:border-stone-700 dark:bg-stone-800/70 dark:text-sand-100"
        />
      </div>

      {open && (items.length > 0 || showNoResults) && (
        <ul
          id="search-results"
          role="listbox"
          aria-label={t('label')}
          className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-[70vh] overflow-y-auto rounded-lg border border-sand-200 bg-sand-50 py-1 shadow-xl dark:border-stone-700 dark:bg-stone-900 sm:min-w-96"
        >
          {showNoResults && (
            <li className="px-3 py-2 font-sans text-sm text-stone-500" role="presentation">
              {t('noResults', { query: query.trim() })}
            </li>
          )}
          {items.map((item, index) => {
            const isFirstOfGroup = index === 0 || items[index - 1]?.group !== item.group;
            const isActive = index === activeIndex;
            return (
              <li key={item.key} role="presentation">
                {isFirstOfGroup && (
                  <p className="px-3 pb-1 pt-2 font-sans text-[10px] uppercase tracking-wider text-stone-400">
                    {groupLabel[item.group]}
                  </p>
                )}
                <button
                  type="button"
                  id={`search-item-${index}`}
                  role="option"
                  aria-selected={isActive}
                  // pointerdown navega antes de que el input pierda el foco.
                  onPointerDown={(e) => {
                    e.preventDefault();
                    navigateTo(item);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`block w-full px-3 py-1.5 text-left transition-colors ${
                    isActive ? 'bg-lapis-500/10 dark:bg-stone-700' : ''
                  }`}
                >
                  <span className="block font-serif text-sm text-stone-800 dark:text-sand-100">
                    {item.title}
                    {item.subtitle && (
                      <span className="ml-2 font-sans text-xs text-stone-500">
                        {item.subtitle}
                      </span>
                    )}
                  </span>
                  {item.snippet && (
                    <span className="mt-0.5 block truncate font-sans text-xs leading-snug text-stone-500 dark:text-stone-400">
                      <Snippet text={item.snippet} />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
