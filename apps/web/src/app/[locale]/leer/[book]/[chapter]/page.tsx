import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getAdjacentChapter, getBookmarkedVerseNumbers, getChapterAnnotations } from '@tabor/db';
import { auth } from '@/lib/auth';
import { Link } from '@/i18n/routing';
import {
  getChapter,
  getPlacesForChapter,
  getSecondaryChapter,
  resolveCompare,
  versionForLocale,
} from '@/lib/bible';
import { SITE_URL, localeAlternates, openGraphFor, verseSnippet } from '@/lib/seo';
import { ChapterReader } from '@/components/reader/ChapterReader';
import { ReaderShell } from '@/components/reader/ReaderShell';
import { ActiveVerseMarker } from '@/components/reader/ActiveVerseMarker';
import { ChapterArt } from '@/components/reader/ChapterArt';
import { CompareSelector } from '@/components/reader/CompareSelector';
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

export default async function ReaderPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale, book, chapter }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const chapterNumber = Number.parseInt(chapter, 10);
  if (!Number.isFinite(chapterNumber)) notFound();

  const versionCode = VERSION_BY_LOCALE[locale] ?? 'STRA';
  const upperBook = book.toUpperCase();

  // Lectura comparada: ?vs=vul|stra|cpdv (saneado; nunca contra sí misma).
  const vsParam = typeof query.vs === 'string' ? query.vs : undefined;
  const compareOption = resolveCompare(vsParam, versionForLocale(locale));
  // prev/next conservan el modo comparado.
  const vsSuffix = compareOption ? `?vs=${compareOption.param}` : '';

  // Capítulo, vecinos, texto comparado, sesión y traducciones — en paralelo.
  const [chapterData, secondary, prev, next, session, tBooks, tReader] = await Promise.all([
    getChapter(book, chapterNumber, locale),
    compareOption ? getSecondaryChapter(upperBook, chapterNumber, compareOption) : null,
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
  // Nombre del primer lugar de cada versículo: la barra inferior del móvil lo
  // muestra junto al disparador del mapa, para que la sincronización
  // pasaje↔mapa se note también con la hoja recogida.
  const versePlaces: Record<number, string> = {};
  for (const verse of chapterData.verses) {
    const first = verse.placeSlugs
      .map((slug) => places.find((p) => p.slug === slug))
      .find((p) => p !== undefined);
    if (first) versePlaces[verse.number] = first.name;
  }
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

  // Prev/next de capítulo. Se renderiza dos veces con distinta presentación
  // —arriba en escritorio, en la barra del pulgar en móvil— pero cada copia
  // vive tras un `display:none` del breakpoint contrario, así que en el árbol
  // de accesibilidad solo existe una: ni landmarks duplicados ni paradas de
  // tabulación de más. El aria-label repite el texto visible (WCAG 2.5.3).
  const navLinkClass =
    'inline-flex min-h-11 items-center gap-1.5 rounded-md border border-sand-200 bg-white/60 px-3 font-sans text-sm text-stone-700 transition-colors hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-700 dark:bg-stone-800/60 dark:text-sand-100';
  const navDisabledClass =
    'inline-flex min-h-11 items-center gap-1.5 rounded-md border border-transparent px-3 font-sans text-sm text-stone-300 dark:text-stone-600';

  const chapterNav = (variant: 'top' | 'thumb') => {
    const compact = variant === 'thumb';
    return (
      <nav
        aria-label={tReader('sectionNav')}
        className={
          compact
            ? 'flex shrink-0 items-center gap-1.5 lg:hidden'
            : 'hidden items-center gap-1.5 lg:flex'
        }
      >
        {prev ? (
          <Link
            href={`/leer/${prev.bookUrlSegment}/${prev.chapterNumber}${vsSuffix}`}
            aria-label={`${tReader('ariaPrev')}: ${prev.bookName} ${prev.chapterNumber}`}
            className={navLinkClass}
          >
            <span aria-hidden="true">←</span>
            <span>{compact ? prev.chapterNumber : `${prev.bookName} ${prev.chapterNumber}`}</span>
          </Link>
        ) : (
          <span aria-hidden="true" className={navDisabledClass}>
            ←
          </span>
        )}
        {next ? (
          <Link
            href={`/leer/${next.bookUrlSegment}/${next.chapterNumber}${vsSuffix}`}
            aria-label={`${tReader('ariaNext')}: ${next.bookName} ${next.chapterNumber}`}
            className={navLinkClass}
          >
            <span>{compact ? next.chapterNumber : `${next.bookName} ${next.chapterNumber}`}</span>
            <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <span aria-hidden="true" className={navDisabledClass}>
            →
          </span>
        )}
      </nav>
    );
  };

  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify + escape de '<' evita inyección si algún nombre
        // de libro contuviera markup.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c'),
        }}
      />

      {/* Escritorio: 50/50 lado a lado, como siempre. Móvil: el texto ocupa
          toda la pantalla y el panel del mapa se convoca desde la barra
          inferior (hoja deslizante). Lo gestiona ReaderShell, que necesita
          estado de cliente; el contenido de los paneles y de las barras sigue
          viniendo renderizado desde el servidor. */}
      <ReaderShell
        topBar={
          <div className="border-b border-sand-200 bg-sand-50/60 px-4 py-2.5 backdrop-blur sm:px-6 dark:border-stone-700 dark:bg-stone-900/60">
            <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2">
              <nav
                aria-label="Breadcrumb"
                className="font-sans text-xs uppercase tracking-[0.18em] text-stone-500"
              >
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

              {chapterNav('top')}
            </div>
          </div>
        }
        textLabel={tReader('sectionText')}
        panelLabel={art ? tReader('sectionArt') : tReader('sectionMap')}
        toggleLabel={art ? tReader('panelArt') : tReader('panelMap')}
        versePlaces={versePlaces}
        chapterNav={chapterNav('thumb')}
        text={
          <>
            {/* key: al navegar entre capítulos el componente se remonta y el
                estado local de marcadores arranca limpio desde el server. */}
            <ChapterReader
              key={`${chapterData.bookCanonicalId}-${chapterData.number}-${secondary?.versionCode ?? ''}`}
              chapter={chapterData}
              initialBookmarks={initialBookmarks}
              initialAnnotations={initialAnnotations}
              secondary={
                secondary
                  ? {
                      versionFullName: secondary.versionFullName,
                      copyright: secondary.copyright,
                      lang: secondary.lang,
                      byVerse: secondary.byVerse,
                    }
                  : null
              }
              headerExtra={
                <CompareSelector
                  basePath={`/leer/${book.toLowerCase()}/${chapterNumber}`}
                  primaryVersionCode={versionForLocale(locale)}
                  activeCode={secondary?.versionCode ?? null}
                />
              }
            />
            <ActiveVerseMarker />
          </>
        }
        panel={
          // Con lugares: mapa sincronizado. Sin lugares: arte sacro del
          // pasaje si está curado; si no, la vista panorámica con badge
          // explicativo (gestionado en BibleMap).
          art ? (
            <ChapterArt art={art} />
          ) : (
            <>
              <BibleMapClient chapter={chapterData} places={places} period={period} />
              {period && <PeriodTimeline period={period} />}
            </>
          )
        }
      />
    </>
  );
}
