'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import type { VisitMapPoint } from './VisitMap';

export type { VisitMapPoint };

function MapLoading() {
  const t = useTranslations('places');
  return (
    <div className="flex h-full w-full items-center justify-center bg-sand-100 text-sm text-stone-600 dark:bg-stone-800 dark:text-stone-300">
      {t('mapLoading')}
    </div>
  );
}

// MapLibre pesa ~600 KB y solo funciona en el cliente: carga diferida para que
// la guía —que es texto y enlaces— llegue y se lea sin esperarlo. En la calle,
// con datos móviles, esto es la diferencia entre leer y no leer.
const VisitMap = dynamic(() => import('./VisitMap').then((m) => m.VisitMap), {
  ssr: false,
  loading: MapLoading,
});

type Props = {
  points: VisitMapPoint[];
  label: string;
};

/** Frontera cliente del mapa: el resto de la guía se renderiza en servidor. */
export function VisitMapClient(props: Props) {
  return <VisitMap {...props} />;
}
