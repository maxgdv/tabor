import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getAdjacentChapter, getBookmarkedVerseNumbers, getChapterAnnotations } from '@tabor/db';
import { auth } from '@/lib/auth';
import { Link } from '@/i18n/routing';
import { getChapter, getPlacesForChapter } from '@/lib/bible';
import { SITE_URL, localeAlternates, openGraphFor, verseSnippet } from '@/lib/seo';
import { ChapterReader } from '@/components/reader/ChapterReader';
import { ActiveVerseMarker } from '@/components/reader/ActiveVerseMarker';
import { ChapterArt } from '@/components/reader/ChapterArt';
import { PeriodTimeline } from '@/components/reader/PeriodTimeline';
import { BibleMapClient } from '@/components/map/BibleMapClient';
import { getChapterArt } from '@/lib/chapter-art';
import { getPeriod } from '@/lib/periods';

const VERSION_BY_LOCALE: Record<string, string> = {
  es: 'STRA',
  en: 'CPDV',
};

type Params = Promise<{ locale: string; book: string; chapter: string }>;

// Título y descripción únicos por capítulo: el título lleva libro y número
// ("Génesis 12 · Tabor" vía plantilla del layout) y la descripción arranca
// con las primeras palabras del propio texto — el contenido más singular de
// cada una de las 1.334 páginas. `getChapter` está memoizada con React.cache,
// así que el cuerpo de la página reutiliza esta misma query.
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, book, chapter } = await params;
  const chapterNumber = Number.parseInt(chapter, 10);
  if (!Number.isFinite(chapterNumber)) return {};

  const chapterData = await getChapter(book, chapterNumber, locale);
  if (!chapterData) return {};

  const t = await getTranslations({ locale, namespace: 'metadata' });
  const title = `${chapterData.bookName} ${chapterData.number}`;
  const description = t('chapterDescription', {
    snippet: verseSnippet(chapterData.verses),
    book: chapterData.bookName,
    chapter: chapterData.number,
  });
  const path = `leer/${book.toLowerCase()}/${chapterNumber}`;

  return {
    title,
    description,
    alternates: localeAlternates(locale, path),
    openGraph: openGraphFor(locale, `${title} · Tabor`, description, path),
  };
}

export default async function ReaderPage({ params }: { params: Params }) {
  const { locale, book, chapter } = await params;
  setRequestLocale(locale);

  const chapterNumber = Number.parseInt(chapter, 10);
  if (!Number.isFinite(chapterNumber)) notFound();

  const versionCode = VERSION_BY_LOCALE[locale] ?? 'STRA';
  const upperBook = book.toUpperCase();

  // Capítulo, vecinos, sesión y traducciones — todo en paralelo.
  const [chapterData, prev, next, session, tBooks, tReader] = await Promise.all([
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
    auth.api.getSession({ headers: await headers() }),
    getTranslations('books'),
    getTranslations('reader'),
  ]);
  if (!chapterData) notFound();

  // `null` = invitado (el lector no muestra ninguna UI personal).
  const [initialBookmarks, initialAnnotations] = session
    ? await Promise.all([
        getBookmarkedVerseNumbers({
          userId: session.user.id,
          bookCanonicalId: upperBook,
          chapterNumber,
        }),
        getChapterAnnotations({
          userId: session.user.id,
          bookCanonicalId: upperBook,
          chapterNumber,
        }),
      ])
    : [null, null];

  const places = getPlacesForChapter(chapterData);
  // Sin geografía, el panel muestra arte sacro del pasaje si lo hay curado;
  // si no, cae al mapa panorámico con badge (comportamiento de siempre).
  const art =
    places.length === 0 ? getChapterArt(chapterData.bookCanonicalId, chapterData.number) : null;
  const period = getPeriod(chapterData.bookCanonicalId, chapterData.number);

  // Datos estructurados schema.org: Google los usa para mostrar la ruta
  // "Biblia › Génesis › 12" en los resultados en vez de la URL cruda.
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: tBooks('breadcrumbBible'),
        item: `${SITE_URL}/${locale}/leer`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: chapterData.bookName,
        item: `${SITE_URL}/${locale}/leer/${book.toLowerCase()}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${chapterData.bookName} ${chapterData.number}`,
      },
    ],
  };

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col">
      <script
        type="application/ld+json"
        // JSON.stringify + escape de '<' evita inyección si algún nombre
        // de libro contuviera markup.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c'),
        }}
      />
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

          <nav aria-label={tReader('sectionNav')} className="flex items-center gap-1.5 font-sans text-sm">
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
          desktop. En móvil: texto 2fr y mapa 1fr (texto 2× el alto del
          mapa), adapta mejor a pantallas pequeñas que un mapa con altura
          fija en vh. En desktop: una sola fila a 50/50 lado a lado. */}
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[2fr_1fr] lg:grid-cols-2 lg:grid-rows-1">
        <section
          aria-label={tReader('sectionText')}
          className="min-h-0 overflow-hidden border-b border-sand-200 lg:border-b-0 lg:border-r dark:border-stone-700"
        >
          {/* key: al navegar entre capítulos el componente se remonta y el
              estado local de marcadores arranca limpio desde el server. */}
          <ChapterReader
            key={`${chapterData.bookCanonicalId}-${chapterData.number}`}
            chapter={chapterData}
            initialBookmarks={initialBookmarks}
            initialAnnotations={initialAnnotations}
          />
          <ActiveVerseMarker />
        </section>
        <section aria-label={tReader('sectionMap')} className="relative min-h-0">
          {/* Con lugares: mapa sincronizado. Sin lugares: arte sacro del
              pasaje si está curado; si no, la vista panorámica con badge
              explicativo (gestionado en BibleMap). */}
          {art ? (
            <ChapterArt art={art} />
          ) : (
            <>
              <BibleMapClient chapter={chapterData} places={places} period={period} />
              {period && <PeriodTimeline period={period} />}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
