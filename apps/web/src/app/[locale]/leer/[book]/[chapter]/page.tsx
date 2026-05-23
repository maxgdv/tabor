import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getChapter, getPlacesForChapter } from '@/lib/bible';
import { ChapterReader } from '@/components/reader/ChapterReader';
import { ActiveVerseMarker } from '@/components/reader/ActiveVerseMarker';
import { BibleMapClient } from '@/components/map/BibleMapClient';

type Params = Promise<{ locale: string; book: string; chapter: string }>;

export default async function ReaderPage({ params }: { params: Params }) {
  const { locale, book, chapter } = await params;
  setRequestLocale(locale);

  const chapterNumber = Number.parseInt(chapter, 10);
  if (!Number.isFinite(chapterNumber)) notFound();

  const chapterData = await getChapter(book, chapterNumber, locale);
  if (!chapterData) notFound();

  const places = getPlacesForChapter(chapterData);

  return (
    <div className="grid h-[calc(100dvh-8rem)] grid-cols-1 lg:grid-cols-2">
      <section
        aria-label="Texto del capítulo"
        className="border-b border-sand-200 lg:border-b-0 lg:border-r dark:border-stone-700"
      >
        <ChapterReader chapter={chapterData} />
        <ActiveVerseMarker />
      </section>
      <section
        aria-label="Mapa del capítulo"
        className="relative min-h-[50vh] lg:min-h-0"
      >
        <BibleMapClient chapter={chapterData} places={places} />
      </section>
    </div>
  );
}
