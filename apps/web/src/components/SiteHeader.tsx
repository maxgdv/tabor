import { headers } from 'next/headers';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link, routing } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import { getBooks, versionForLocale } from '@/lib/bible';
import { LocaleSwitcher } from './LocaleSwitcher';
import { BookSidebar } from './BookSidebar';
import { SearchBox } from './SearchBox';
import { UserMenu } from './UserMenu';

export async function SiteHeader() {
  const locale = await getLocale();
  const t = await getTranslations('header');
  const [books, session] = await Promise.all([
    getBooks(versionForLocale(locale)),
    auth.api.getSession({ headers: await headers() }),
  ]);

  return (
    <header className="border-b border-sand-200 bg-sand-50/80 backdrop-blur dark:border-stone-700 dark:bg-stone-900/80">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
        <div className="flex shrink-0 items-center gap-3">
          <BookSidebar books={books} />
          <Link
            href="/"
            className="font-serif text-lg font-semibold tracking-wide text-stone-800 dark:text-sand-100"
          >
            Tabor
          </Link>
        </div>
        <div className="flex min-w-0 flex-1 justify-center">
          <SearchBox />
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LocaleSwitcher locales={routing.locales} label={t('switchLanguage')} />
          {session ? (
            <UserMenu name={session.user.name ?? null} email={session.user.email} />
          ) : (
            <Link
              href="/entrar"
              className="rounded-md px-2 py-1.5 font-sans text-sm text-stone-700 transition-colors hover:bg-sand-200 dark:text-sand-100 dark:hover:bg-stone-700"
            >
              {t('signIn')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
