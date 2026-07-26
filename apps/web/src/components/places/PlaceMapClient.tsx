'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

function MapLoading() {
  const t = useTranslations('places');
  return (
    <div className="flex h-full w-full items-center justify-center bg-sand-100 text-sm text-stone-600 dark:bg-stone-800 dark:text-stone-300">
      {t('mapLoading')}
    </div>
  );
}

// MapLibre pesa ~600 KB y solo funciona en el cliente: carga diferida para
// que la ficha (que es texto y enlaces) llegue y se lea sin esperarlo.
const PlaceMap = dynamic(() => import('./PlaceMap').then((m) => m.PlaceMap), {
  ssr: false,
  loading: MapLoading,
});

type Props = {
  name: string;
  lng: number;
  lat: number;
  label: string;
};

/** Frontera cliente del mapa: el resto de la ficha se renderiza en servidor. */
export function PlaceMapClient(props: Props) {
  return <PlaceMap {...props} />;
}
