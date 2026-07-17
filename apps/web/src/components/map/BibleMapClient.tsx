'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import type { Chapter, Place } from '@/lib/bible';

function MapLoading() {
  const t = useTranslations('reader');
  return (
    <div className="flex h-full w-full items-center justify-center bg-sand-100 text-sm text-stone-500 dark:bg-stone-800 dark:text-stone-400">
      {t('mapLoading')}
    </div>
  );
}

// MapLibre solo funciona en el cliente y pesa ~600KB.
// Lo cargamos diferido para no inflar el bundle inicial del lector.
const BibleMap = dynamic(() => import('./BibleMap').then((m) => m.BibleMap), {
  ssr: false,
  loading: MapLoading,
});

type Props = { chapter: Chapter; places: Place[] };

export function BibleMapClient(props: Props) {
  return <BibleMap {...props} />;
}
