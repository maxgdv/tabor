'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  required?: boolean;
  minLength?: number;
};

// La contraseña vuelve a ocultarse sola: el ojito sirve para un vistazo
// contra typos, no para dejarla expuesta en pantalla.
const REVEAL_MS = 5000;

/** Campo de contraseña con botón de mostrar/ocultar (se re-oculta a los 5 s). */
export function PasswordInput({ value, onChange, autoComplete, required, minLength }: Props) {
  const t = useTranslations('auth');
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const toggle = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setVisible((v) => {
      if (!v) hideTimer.current = setTimeout(() => setVisible(false), REVEAL_MS);
      return !v;
    });
  };

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        required={required}
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="w-full rounded-md border border-sand-200 bg-white/70 py-2 pl-3 pr-11 font-sans text-sm text-stone-800 placeholder:text-stone-500 focus:border-lapis-500 focus:outline-none focus:ring-1 focus:ring-lapis-500 dark:border-stone-700 dark:bg-stone-800/70 dark:text-sand-100 dark:placeholder:text-stone-400"
      />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={visible}
        aria-label={t(visible ? 'hidePassword' : 'showPassword')}
        title={t(visible ? 'hidePassword' : 'showPassword')}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-stone-500 hover:text-stone-700 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-lapis-500 dark:text-stone-400 dark:hover:text-sand-200"
      >
        {visible ? (
          // Ojo tachado: la contraseña está visible; el click la oculta.
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a13.16 13.16 0 0 1-1.67 2.68" />
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 8 10 8a9.74 9.74 0 0 0 5.39-1.61" />
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
            <line x1="2" x2="22" y1="2" y2="22" />
          </svg>
        ) : (
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
