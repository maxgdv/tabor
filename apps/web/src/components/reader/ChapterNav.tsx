'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export type AdjacentChapter = {
  bookUrlSegment: string;
  chapterNumber: number;
  bookName: string;
};

type Props = {
  prev: AdjacentChapter | null;
  next: AdjacentChapter | null;
  /** 'top' = barra superior de escritorio; 'thumb' = barra del pulgar en móvil. */
  variant: 'top' | 'thumb';
};

const navLinkClass =
  'inline-flex min-h-11 items-center gap-1.5 rounded-md border border-sand-200 bg-white/60 px-3 font-sans text-sm text-stone-700 transition-colors hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-700 dark:bg-stone-800/60 dark:text-sand-100';
const navDisabledClass =
  'inline-flex min-h-11 items-center gap-1.5 rounded-md border border-transparent px-3 font-sans text-sm text-stone-300 dark:text-stone-600';

/**
 * Prev/next de capítulo. Es un componente de cliente porque conserva el modo
 * comparado (?vs=) en los enlaces, y la página —estática, servida desde la
 * CDN— ya no puede leer la query en el servidor. `useSearchParams` obliga al
 * Suspense de abajo: el HTML estático lleva los enlaces sin sufijo y el vs se
 * añade al hidratar (idéntico a la vista salvo por la query del href).
 */
function ChapterNavLinks({ prev, next, variant, vsSuffix }: Props & { vsSuffix: string }) {
  const t = useTranslations('reader');
  const compact = variant === 'thumb';

  return (
    <nav
      aria-label={t('sectionNav')}
      className={
        compact ? 'flex shrink-0 items-center gap-1.5 lg:hidden' : 'hidden items-center gap-1.5 lg:flex'
      }
    >
      {prev ? (
        <Link
          href={`/leer/${prev.bookUrlSegment}/${prev.chapterNumber}${vsSuffix}`}
          aria-label={`${t('ariaPrev')}: ${prev.bookName} ${prev.chapterNumber}`}
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
          aria-label={`${t('ariaNext')}: ${next.bookName} ${next.chapterNumber}`}
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
}

function ChapterNavWithQuery(props: Props) {
  const vs = useSearchParams().get('vs');
  return <ChapterNavLinks {...props} vsSuffix={vs ? `?vs=${vs}` : ''} />;
}

export function ChapterNav(props: Props) {
  return (
    <Suspense fallback={<ChapterNavLinks {...props} vsSuffix="" />}>
      <ChapterNavWithQuery {...props} />
    </Suspense>
  );
}
