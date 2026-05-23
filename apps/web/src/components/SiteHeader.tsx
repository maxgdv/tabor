import { getTranslations } from 'next-intl/server';
import { Link, routing } from '@/i18n/routing';
import { LocaleSwitcher } from './LocaleSwitcher';

export async function SiteHeader() {
  const t = await getTranslations('header');

  return (
    <header className="border-b border-sand-200 bg-sand-50/80 backdrop-blur dark:border-stone-700 dark:bg-stone-900/80">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-serif text-lg font-semibold tracking-wide text-stone-800 dark:text-sand-100"
        >
          Tabor
        </Link>
        <LocaleSwitcher locales={routing.locales} label={t('switchLanguage')} />
      </div>
    </header>
  );
}
