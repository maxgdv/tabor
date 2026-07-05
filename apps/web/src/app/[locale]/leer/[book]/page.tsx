import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getBookSummaryCached } from '@/lib/bible';
import { localeAlternates, openGraphFor } from '@/lib/seo';

const VERSION_BY_LOCALE: Record<string, string> = {
  es: 'STRA',
  en: 'CPDV',
};

type Params = Promise<{ locale: string; book: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, book } = await params;
  const versionCode = VERSION_BY_LOCALE[locale] ?? 'STRA';
  const summary = await getBookSummaryCached(book.toUpperCase(), versionCode);
  if (!summary || summary.chapterCount === 0) return {};

  const t = await getTranslations({ locale, namespace: 'metadata' });
  const description = t('bookDescription', {
    book: summary.name,
    count: summary.chapterCount,
  });
  const path = `leer/${summary.urlSegment}`;

  return {
    title: summary.name,
    description,
    alternates: localeAlternates(locale, path),
    openGraph: openGraphFor(locale, `${summary.name} · Tabor`, description, path),
  };
}

export default async function BookChapterIndexPage({ params }: { params: Params }) {
  const { locale, book } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('books');
  const versionCode = VERSION_BY_LOCALE[locale] ?? 'STRA';

  const summary = await getBookSummaryCached(book.toUpperCase(), versionCode);
  if (!summary || summary.chapterCount === 0) notFound();

  const chapters = Array.from({ length: summary.chapterCount }, (_, i) => i + 1);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:py-16">
      <nav aria-label="Breadcrumb" className="mb-6 font-sans text-xs uppercase tracking-[0.18em] text-stone-500">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/leer" className="hover:text-stone-800 dark:hover:text-sand-200">
              {t('breadcrumbBible')}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-stone-700 dark:text-sand-100">{summary.name}</li>
        </ol>
      </nav>

      <header className="mb-10">
        <h1 className="font-serif text-3xl text-stone-800 sm:text-4xl dark:text-sand-100">
          {summary.name}
        </h1>
        <p className="mt-2 font-sans text-sm text-stone-500">
          {t(summary.chapterCount === 1 ? 'chaptersOne' : 'chaptersOther', {
            count: summary.chapterCount,
          })}
        </p>
        <p className="mt-6 text-stone-600 dark:text-sand-200">{t('chooseChapter')}</p>
      </header>

      <ul className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
        {chapters.map((n) => (
          <li key={n}>
            <Link
              href={`/leer/${summary.urlSegment}/${n}`}
              aria-label={t('chapter', { n })}
              className="flex aspect-square items-center justify-center rounded-md border border-sand-200 bg-white/60 font-serif text-lg text-stone-700 transition-colors hover:border-lapis-500 hover:bg-white hover:text-lapis-600 dark:border-stone-700 dark:bg-stone-800/60 dark:text-sand-100 dark:hover:bg-stone-800"
            >
              {n}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
