import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { artThumbUrl, type ChapterArtwork } from '@/lib/chapter-art';

type Props = { art: ChapterArtwork };

/**
 * Panel de arte sacro para capítulos sin geografía: en lugar del mapa
 * panorámico genérico, una obra clásica de dominio público que representa
 * el contenido del capítulo, con su atribución visible. Server component.
 */
export function ChapterArt({ art }: Props) {
  const t = useTranslations('reader');

  return (
    <figure className="flex h-full w-full flex-col bg-stone-900">
      <div className="relative min-h-0 flex-1">
        <Image
          src={artThumbUrl(art.imageUrl, 1280)}
          alt={`${art.title} — ${art.artist}`}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain"
          priority={false}
        />
      </div>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-stone-700 bg-stone-900 px-4 py-2.5 font-sans text-xs text-sand-100">
        <span>
          <span className="font-serif italic">{art.title}</span>
          {' — '}
          {art.artist}
          {art.year ? ` (${art.year})` : ''}
        </span>
        <a
          href={art.sourceUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="text-stone-400 underline underline-offset-2 transition-colors hover:text-sand-200"
        >
          {t('artCredit')}
        </a>
      </figcaption>
    </figure>
  );
}
