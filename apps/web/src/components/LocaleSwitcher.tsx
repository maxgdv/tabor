'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useTransition } from 'react';

type Props = {
  locales: readonly string[];
  label: string;
};

const localeLabels: Record<string, string> = {
  es: 'Español',
  en: 'English',
};

export function LocaleSwitcher({ locales, label }: Props) {
  const current = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-sm text-stone-600 dark:text-sand-200">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={current}
        disabled={isPending}
        onChange={(event) => {
          const nextLocale = event.target.value;
          startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
          });
        }}
        className="rounded-md border border-stone-300 bg-transparent px-2 py-1 font-sans text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lapis-500 dark:border-stone-600"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {localeLabels[loc] ?? loc}
          </option>
        ))}
      </select>
    </label>
  );
}
