import { getLocale, getTranslations } from 'next-intl/server';
import { Link, routing } from '@/i18n/routing';
import { getBooks, versionForLocale } from '@/lib/bible';
import { LocaleSwitcher } from './LocaleSwitcher';
import { BookSidebar } from './BookSidebar';
import { SearchBox } from './SearchBox';
import { HeaderAuth } from './HeaderAuth';

// Ojo: nada de `headers()`/sesión aquí. El header lo renderizan páginas
// estáticas servidas desde la CDN; la sesión se resuelve en el cliente
// (HeaderAuth) para no arrastrar toda la app a renderizado por petición.
export async function SiteHeader() {
  const locale = await getLocale();
  const t = await getTranslations('header');
  const tFeedback = await getTranslations('feedback');
  const books = await getBooks(versionForLocale(locale));

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
          {/* Entrada visible del buzón: el enlace del pie no se descubre (queda
              al final de cada capítulo). Icono solo en móvil, texto en ≥md. */}
          <Link
            href="/comentarios"
            aria-label={tFeedback('title')}
            title={tFeedback('title')}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-md border border-stone-300 px-2.5 font-sans text-sm text-stone-600 hover:text-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lapis-500 dark:border-stone-600 dark:text-sand-200 dark:hover:text-sand-100"
          >
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            <span className="hidden md:inline">{tFeedback('headerLabel')}</span>
          </Link>
          <LocaleSwitcher locales={routing.locales} label={t('switchLanguage')} />
          <HeaderAuth />
        </div>
      </div>
    </header>
  );
}
