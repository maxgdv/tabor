import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { listBooks, type DbBookSummary } from '@tabor/db';

// Esta ruta consulta Postgres en cada render. El layout padre ya está marcado
// como dinámico (porque el SiteHeader también consulta libros) — esa
// declaración cascadea hasta aquí, así que no hace falta repetirla.

const VERSION_BY_LOCALE: Record<string, string> = {
  es: 'STRA',
  en: 'CPDV',
};

// Orden de categorías dentro de cada testamento. Coincide con el orderIndex
// canónico (todos los libros de una categoría son consecutivos por orderIndex).
const CATEGORY_ORDER: Record<string, string[]> = {
  OT: ['pentateuch', 'historical', 'wisdom', 'prophets'],
  NT: ['gospels', 'historical_nt', 'pauline', 'catholic_epistles', 'apocalyptic'],
};

export default async function BooksIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('books');
  const versionCode = VERSION_BY_LOCALE[locale] ?? 'STRA';
  const books = await listBooks({ versionCode });

  // Agrupa por testamento → categoría → libros, respetando orderIndex.
  const byTestamentCategory: Record<string, Record<string, DbBookSummary[]>> = {
    OT: {},
    NT: {},
  };
  for (const b of books) {
    const t = byTestamentCategory[b.testament] ?? (byTestamentCategory[b.testament] = {});
    (t[b.category] ??= []).push(b);
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:py-16">
      <header className="mb-12 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{t('breadcrumbBible')}</p>
        <h1 className="mt-2 font-serif text-3xl text-stone-800 sm:text-4xl dark:text-sand-100">
          {t('title')}
        </h1>
        <p className="mt-4 text-stone-600 dark:text-sand-200">{t('lede')}</p>
      </header>

      {(['OT', 'NT'] as const).map((testament) => (
        <section key={testament} className="mb-14">
          <h2 className="mb-6 font-serif text-2xl text-stone-800 dark:text-sand-100">
            {t(`testament.${testament}`)}
          </h2>

          {CATEGORY_ORDER[testament]?.map((category) => {
            const list = byTestamentCategory[testament]?.[category];
            if (!list || list.length === 0) return null;
            return (
              <div key={category} className="mb-8">
                <h3 className="mb-3 font-sans text-xs uppercase tracking-[0.18em] text-stone-500">
                  {t(`category.${category}`)}
                </h3>
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {list.map((book) => (
                    <li key={book.canonicalId}>
                      <Link
                        href={`/leer/${book.urlSegment}`}
                        className="group flex flex-col rounded-md border border-sand-200 bg-white/60 px-3 py-2.5 transition-colors hover:border-lapis-500 hover:bg-white dark:border-stone-700 dark:bg-stone-800/60 dark:hover:bg-stone-800"
                      >
                        <span className="font-serif text-base text-stone-800 group-hover:text-lapis-600 dark:text-sand-100">
                          {book.name}
                        </span>
                        <span className="font-sans text-xs text-stone-500">
                          {t('chaptersOther', { count: book.chapterCount })}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
