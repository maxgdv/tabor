'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { authClient } from '@/lib/auth-client';

type Props = {
  name: string | null;
  email: string;
};

/**
 * Menú de cuenta del header. Dropdown accesible hecho a mano, en la línea
 * del resto de controles del proyecto: Escape y click-fuera cierran, el
 * botón anuncia estado con aria-expanded.
 */
export function UserMenu({ name, email }: Props) {
  const t = useTranslations('auth');
  const tHeader = useTranslations('header');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // La inicial del nombre (o del email) hace de avatar sobrio.
  const initial = (name?.trim() || email).charAt(0).toUpperCase();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  const signOut = async () => {
    setOpen(false);
    await authClient.signOut();
    // Los server components (header incluido) re-leen la sesión.
    router.refresh();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={tHeader('accountMenu')}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-lapis-500 font-sans text-sm font-semibold text-white transition-colors hover:bg-lapis-600"
      >
        {initial}
      </button>

      {open && (
        // Disclosure simple, sin role="menu": ese patrón exige gestión de
        // foco y flechas que unos enlaces normales no necesitan — con Tab
        // se recorren y con Escape se cierra.
        <div className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-lg border border-sand-200 bg-sand-50 py-1 shadow-xl dark:border-stone-700 dark:bg-stone-900">
          <p className="truncate border-b border-sand-200 px-3 py-2 font-sans text-xs text-stone-500 dark:border-stone-700 dark:text-stone-400">
            {email}
          </p>
          <Link
            href="/cuenta"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 font-sans text-sm text-stone-700 hover:bg-sand-100 dark:text-sand-100 dark:hover:bg-stone-800"
          >
            {t('accountTitle')}
          </Link>
          <Link
            href="/cuenta/marcadores"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 font-sans text-sm text-stone-700 hover:bg-sand-100 dark:text-sand-100 dark:hover:bg-stone-800"
          >
            {t('bookmarksTitle')}
          </Link>
          <Link
            href="/cuenta/notas"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 font-sans text-sm text-stone-700 hover:bg-sand-100 dark:text-sand-100 dark:hover:bg-stone-800"
          >
            {t('notesTitle')}
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="block w-full px-3 py-2 text-left font-sans text-sm text-stone-700 hover:bg-sand-100 dark:text-sand-100 dark:hover:bg-stone-800"
          >
            {t('signOut')}
          </button>
        </div>
      )}
    </div>
  );
}
