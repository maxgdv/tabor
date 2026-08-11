import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getAdjacentChapter } from '@tabor/db';
import { Link } from '@/i18n/routing';
import { getChapter, getPlacesForChapter, versionForLocale } from '@/lib/bible';
import { SITE_URL, localeAlternates, openGraphFor, verseSnippet } from '@/lib/seo';
import { ReaderClient } from '@/components/reader/ReaderClient';
import { ReaderShell } from '@/components/reader/ReaderShell';
import { ChapterArt } from '@/components/reader/ChapterArt';
import { ChapterNav } from '@/components/reader/ChapterNav';
import { PeriodTimeline } from '@/components/reader/PeriodTimeline';
import { BibleMapClient } from '@/components/map/BibleMapClient';
import { getChapterArt } from '@/lib/chapter-art';
import { getPeriod } from '@/lib/periods';

const VERSION_BY_LOCALE: Record<string, string> = {
  es: 'STRA',
  en: 'CPDV',
};

// Página estática servida desde la CDN: el texto bíblico es el mismo para
// todos y no cambia. Nada de `headers()` ni `searchParams` aquí — la sesión
// (marcadores, notas) y el modo comparado (?vs=) se resuelven en el cliente
// dentro de ReaderClient. Cada visita —humana o de un bot rastreando las
// 1.334 × 2 páginas— deja de invocar una función en Vercel.
//
// Sin generateStaticParams: los capítulos se generan bajo demanda en la
// primera visita (ISR) y quedan cacheados; así el build no necesita BD.
// Un día de revalidación deja propagar correcciones del texto sin redesplegar.
export const revalidate = 86400;

// Vacío a propósito: sin él Next trataría la ruta como dinámica pura (una
// invocación por visita); con él, cada capítulo se genera en su primera
// visita y queda en la caché ISR. Prerenderizar los 1.334 × 2 en el build
// sería pagar ese coste en cada deploy.
export function generateStaticParams() {
  return [];
}

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
  const basePath = `/leer/${book.toLowerCase()}/${chapterNumber}`;

  // Capítulo, vecinos y traducciones — en paralelo.
  const [chapterData, prev, next, tBooks] = await Promise.all([
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
  ]);
  if (!chapterData) notFound();

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
  const tReader = await getTranslations('reader');

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
          viniendo renderizado desde el servidor. Prev/next se renderiza dos
          veces con distinta presentación —arriba en escritorio, en la barra
          del pulgar en móvil— pero cada copia vive tras un `display:none` del
          breakpoint contrario, así que en el árbol de accesibilidad solo
          existe una. */}
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

              <ChapterNav prev={prev} next={next} variant="top" />
            </div>
          </div>
        }
        textLabel={tReader('sectionText')}
        panelLabel={art ? tReader('sectionArt') : tReader('sectionMap')}
        toggleLabel={art ? tReader('panelArt') : tReader('panelMap')}
        versePlaces={versePlaces}
        chapterNav={<ChapterNav prev={prev} next={next} variant="thumb" />}
        text={
          // key: al navegar entre capítulos el cliente del lector se remonta
          // entero y el estado (personal, comparado) arranca limpio.
          <ReaderClient
            key={`${locale}-${chapterData.bookCanonicalId}-${chapterData.number}`}
            chapter={chapterData}
            basePath={basePath}
            primaryVersionCode={versionForLocale(locale)}
            locale={locale}
          />
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
