import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getAdjacentChapter } from '@tabor/db';
import { Link } from '@/i18n/routing';
import { getChapter, getPlacesForChapter } from '@/lib/bible';
import { ChapterReader } from '@/components/reader/ChapterReader';
import { ActiveVerseMarker } from '@/components/reader/ActiveVerseMarker';
import { EmptyChapterIllumination } from '@/components/reader/EmptyChapterIllumination';
import { BibleMapClient } from '@/components/map/BibleMapClient';

const VERSION_BY_LOCALE: Record<string, string> = {
  es: 'STRA',
  en: 'CPDV',
};

type Params = Promise<{ locale: string; book: string; chapter: string }>;

export default async function ReaderPage({ params }: { params: Params }) {
  const { locale, book, chapter } = await params;
  setRequestLocale(locale);

  const chapterNumber = Number.parseInt(chapter, 10);
  if (!Number.isFinite(chapterNumber)) notFound();

  const versionCode = VERSION_BY_LOCALE[locale] ?? 'STRA';
  const upperBook = book.toUpperCase();

  // Capítulo, vecinos y traducciones — todo en paralelo.
  const [chapterData, prev, next, tBooks, tReader] = await Promise.all([
    getChapter(book, chapterNumber, locale),
    getAdjacentChapter({
      bookCanonicalId: upperBook,
      chapterNumber,
      direction: 'prev',
      versionCode,
    }),
    getAdjacentChapter({
      bookCanonicalId: upperBook,
      chapterNumber,
      direction: 'next',
      versionCode,
    }),
    getTranslations('books'),
    getTranslations('reader'),
  ]);
  if (!chapterData) notFound();

  const places = getPlacesForChapter(chapterData);

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col">
      <div className="border-b border-sand-200 bg-sand-50/60 px-4 py-2.5 backdrop-blur sm:px-6 dark:border-stone-700 dark:bg-stone-900/60">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <nav aria-label="Breadcrumb" className="font-sans text-xs uppercase tracking-[0.18em] text-stone-500">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/leer" className="hover:text-stone-800 dark:hover:text-sand-200">
                  {tBooks('breadcrumbBible')}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href={`/leer/${book.toLowerCase()}`}
                  className="hover:text-stone-800 dark:hover:text-sand-200"
                >
                  {chapterData.bookName}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-stone-700 dark:text-sand-100">{chapterData.number}</li>
            </ol>
          </nav>

          <nav aria-label="Navegación entre capítulos" className="flex items-center gap-1.5 font-sans text-sm">
            {prev ? (
              <Link
                href={`/leer/${prev.bookUrlSegment}/${prev.chapterNumber}`}
                aria-label={tReader('ariaPrev')}
                className="inline-flex items-center gap-1.5 rounded-md border border-sand-200 bg-white/60 px-3 py-1.5 text-stone-700 transition-colors hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-700 dark:bg-stone-800/60 dark:text-sand-100"
              >
                <span aria-hidden="true">←</span>
                <span>
                  {prev.bookName} {prev.chapterNumber}
                </span>
              </Link>
            ) : (
              <span
                aria-hidden="true"
                className="inline-flex items-center gap-1.5 rounded-md border border-transparent px-3 py-1.5 text-stone-300 dark:text-stone-600"
              >
                ←
              </span>
            )}
            {next ? (
              <Link
                href={`/leer/${next.bookUrlSegment}/${next.chapterNumber}`}
                aria-label={tReader('ariaNext')}
                className="inline-flex items-center gap-1.5 rounded-md border border-sand-200 bg-white/60 px-3 py-1.5 text-stone-700 transition-colors hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-700 dark:bg-stone-800/60 dark:text-sand-100"
              >
                <span>
                  {next.bookName} {next.chapterNumber}
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <span
                aria-hidden="true"
                className="inline-flex items-center gap-1.5 rounded-md border border-transparent px-3 py-1.5 text-stone-300 dark:text-stone-600"
              >
                →
              </span>
            )}
          </nav>
        </div>
      </div>

      {/* min-h-0 + grid-rows explícitas: necesario para que el ChapterReader
          (con h-full overflow-y-auto) pueda hacer scroll vertical en vez de
          empujar el mapa fuera del viewport en móvil o ignorar overflow en
          desktop. */}
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[1fr_50vh] lg:grid-cols-2 lg:grid-rows-1">
        <section
          aria-label="Texto del capítulo"
          className="min-h-0 overflow-hidden border-b border-sand-200 lg:border-b-0 lg:border-r dark:border-stone-700"
        >
          <ChapterReader chapter={chapterData} />
          <ActiveVerseMarker />
        </section>
        <section aria-label="Mapa del capítulo" className="relative min-h-0">
          {places.length > 0 ? (
            <BibleMapClient chapter={chapterData} places={places} />
          ) : (
            <EmptyChapterIllumination
              bookName={chapterData.bookName}
              chapterNumber={chapterData.number}
              message={tReader('noPlacesBody')}
            />
          )}
        </section>
      </div>
    </div>
  );
}
