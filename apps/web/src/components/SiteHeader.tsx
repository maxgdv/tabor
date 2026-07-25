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
      {/* Por debajo de `sm` el buscador baja a su propia línea. Los tres grupos
          no caben en una fila en móviles de 320-375 px: el contenedor central
          se quedaba en 0 px de ancho y el input se salía por encima del
          selector de idioma, tapándolo. El header no es sticky, así que la
          segunda línea desaparece en cuanto se empieza a leer. */}
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 sm:flex-nowrap sm:gap-4 sm:px-6 sm:py-3">
        <div className="flex shrink-0 items-center gap-3">
          <BookSidebar books={books} />
          <Link
            href="/"
            // -mx-2 + px-2/py-2: el área táctil llega a 44 px de alto sin que el
            // relleno ensanche la fila ni desplace ópticamente el rótulo.
            className="-mx-2 flex items-center px-2 py-2 font-serif text-lg font-semibold tracking-wide text-stone-800 dark:text-sand-100"
          >
            Tabor
          </Link>
        </div>
        <div className="order-last flex w-full min-w-0 justify-center sm:order-none sm:w-auto sm:flex-1">
          <SearchBox />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:ml-0 sm:gap-3">
          <LocaleSwitcher locales={routing.locales} label={t('switchLanguage')} />
          {session ? (
            <UserMenu name={session.user.name ?? null} email={session.user.email} />
          ) : (
            <Link
              href="/entrar"
              className="inline-flex min-h-11 items-center rounded-md px-2 font-sans text-sm text-stone-700 transition-colors hover:bg-sand-200 dark:text-sand-100 dark:hover:bg-stone-700"
            >
              {t('signIn')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
