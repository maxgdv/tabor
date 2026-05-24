import { getLocale, getTranslations } from 'next-intl/server';
import { Link, routing } from '@/i18n/routing';
import { getBooks, versionForLocale } from '@/lib/bible';
import { LocaleSwitcher } from './LocaleSwitcher';
import { BookSidebar } from './BookSidebar';

export async function SiteHeader() {
  const locale = await getLocale();
  const t = await getTranslations('header');
  const books = await getBooks(versionForLocale(locale));

  return (
    <header className="border-b border-sand-200 bg-sand-50/80 backdrop-blur dark:border-stone-700 dark:bg-stone-900/80">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <BookSidebar books={books} />
          <Link
            href="/"
            className="font-serif text-lg font-semibold tracking-wide text-stone-800 dark:text-sand-100"
          >
            Tabor
          </Link>
        </div>
        <LocaleSwitcher locales={routing.locales} label={t('switchLanguage')} />
      </div>
    </header>
  );
}
