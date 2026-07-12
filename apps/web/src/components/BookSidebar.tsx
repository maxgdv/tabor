'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';
import type { DbBookSummary } from '@tabor/db';

// Detección de hidratación sin setState-in-effect: en server snapshot devuelve
// `false`, en cliente `true`. Patrón recomendado por React 18+ para evitar
// mismatches de hidratación al usar APIs solo-browser como `document.body`
// para portales.
const subscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

// Orden de categorías dentro de cada testamento — debe coincidir con /leer.
const CATEGORY_ORDER: Record<'OT' | 'NT', string[]> = {
  OT: ['pentateuch', 'historical', 'wisdom', 'prophets'],
  NT: ['gospels', 'historical_nt', 'pauline', 'catholic_epistles', 'apocalyptic'],
};

type Props = {
  books: DbBookSummary[];
};

/**
 * Drawer lateral persistente que da acceso rápido a los 73 libros desde
 * cualquier página. Vive en el SiteHeader (layout), así que su estado
 * sobrevive a las navegaciones del App Router.
 */
export function BookSidebar({ books }: Props) {
  const [open, setOpen] = useState(false);
  // El botón hamburguesa se renderiza en SSR; el drawer se inserta vía
  // portal solo tras hidratación, así garantizamos acceso a document.body.
  const mounted = useMounted();
  const t = useTranslations('books');
  const tHeader = useTranslations('header');
  const tPlans = useTranslations('plans');
  const pathname = usePathname();

  const asideRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  // Distingue "cerrado tras estar abierto" del primer render, para no robar
  // el foco al montar la página.
  const wasOpenRef = useRef(false);

  // ESC cierra; Tab queda atrapado dentro del diálogo (aria-modal exige que
  // el foco no escape a la página de fondo — WCAG 2.4.3).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const aside = asideRef.current;
      if (!aside) return;
      const focusables = aside.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      const active = document.activeElement;
      if (!aside.contains(active)) {
        // El foco se quedó fuera (p. ej. el usuario clicó el backdrop):
        // el siguiente Tab lo trae dentro en vez de recorrer la página.
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
  }, [open]);

  // Al abrir, foco al primer control del drawer (el botón de cerrar);
  // al cerrar, de vuelta al botón hamburguesa que lo abrió.
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      asideRef.current?.querySelector<HTMLElement>('button, a[href]')?.focus();
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      triggerRef.current?.focus();
    }
  }, [open]);

  // Mientras el drawer está abierto, bloquea el scroll del body para
  // que el usuario no scrolee la página de fondo accidentalmente.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Detecta el libro actual mirando /[locale]/leer/[book]/...
  const currentBookSegment = pathname.match(/\/leer\/([^/]+)/)?.[1];

  // Agrupar libros por testamento → categoría → libros.
  const grouped: Record<string, Record<string, DbBookSummary[]>> = { OT: {}, NT: {} };
  for (const b of books) {
    const tg = grouped[b.testament] ?? (grouped[b.testament] = {});
    (tg[b.category] ??= []).push(b);
  }

  // El drawer + backdrop se portan a document.body para escapar de cualquier
  // stacking context creado por ancestros del header (ej. backdrop-blur).
  // Sin esto, el `fixed` del drawer queda contenido en el rectángulo del
  // header y se ve "clippeado".
  const drawer = (
    <>
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        ref={asideRef}
        id="book-sidebar"
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-sidebar-title"
        className={`fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] flex-col bg-sand-50 shadow-2xl transition-transform duration-300 dark:bg-stone-900 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-sand-200 px-5 py-4 dark:border-stone-700">
          <h2
            id="book-sidebar-title"
            className="font-serif text-lg text-stone-800 dark:text-sand-100"
          >
            {tHeader('sidebarTitle')}
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={tHeader('closeSidebar')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-2xl leading-none text-stone-500 transition-colors hover:bg-sand-200 hover:text-stone-700 dark:hover:bg-stone-700 dark:hover:text-sand-100"
          >
            ×
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <Link
            href="/planes"
            onClick={() => setOpen(false)}
            className="mb-5 flex items-center gap-2 rounded-md border border-sand-200 px-3 py-2 font-serif text-sm text-stone-700 transition-colors hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-700 dark:text-sand-200 dark:hover:border-lapis-500"
          >
            {tPlans('title')}
          </Link>
          {(['OT', 'NT'] as const).map((testament) => (
            <section key={testament} className="mb-6">
              <h3 className="mb-3 font-sans text-xs uppercase tracking-[0.18em] text-stone-500">
                {t(`testament.${testament}`)}
              </h3>
              {CATEGORY_ORDER[testament].map((category) => {
                const list = grouped[testament]?.[category];
                if (!list?.length) return null;
                return (
                  <div key={category} className="mb-4">
                    <p className="mb-2 font-sans text-[10px] uppercase tracking-wider text-stone-400">
                      {t(`category.${category}`)}
                    </p>
                    <ul className="space-y-0.5">
                      {list.map((book) => {
                        const isActive = book.urlSegment === currentBookSegment;
                        return (
                          <li key={book.canonicalId}>
                            <Link
                              href={`/leer/${book.urlSegment}`}
                              onClick={() => setOpen(false)}
                              aria-current={isActive ? 'page' : undefined}
                              className={`block rounded px-2 py-1.5 font-serif text-sm transition-colors ${
                                isActive
                                  ? 'bg-lapis-500/10 text-lapis-600 dark:bg-stone-700 dark:text-sand-100'
                                  : 'text-stone-700 hover:bg-sand-100 dark:text-sand-200 dark:hover:bg-stone-800'
                              }`}
                            >
                              {book.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </section>
          ))}
        </nav>
      </aside>
    </>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={tHeader('openSidebar')}
        aria-expanded={open}
        aria-controls="book-sidebar"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-stone-700 transition-colors hover:bg-sand-200 dark:text-sand-100 dark:hover:bg-stone-700"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {mounted && createPortal(drawer, document.body)}
    </>
  );
}
