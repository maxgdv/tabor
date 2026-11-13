'use client';

// Preferencia «Mapa actual / Satélite», compartida por todos los mapas del
// sitio: el lector, la ficha de un lugar y la guía de visita.
//
// Dos públicos, dos mapas. Quien lee quiere el relieve —por qué ahí y no dos
// valles más allá—, y por eso el satélite es el valor por defecto. Quien
// piensa en ir quiere carreteras y pueblos de hoy para orientarse. La
// elección se guarda en localStorage y vale para todos los mapas: quien pide
// el mapa actual en una ficha lo quiere también en la siguiente.

import { useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import type { StyleSpecification } from 'maplibre-gl';
import { SATELLITE_STYLE, VECTOR_STYLE } from './styles';

export type MapStyleId = 'vector' | 'satellite';

const STYLE_KEY = 'tabor-map-style';
const STYLE_CHANGE_EVENT = 'tabor-map-style-change';

function subscribeStyle(cb: () => void): () => void {
  window.addEventListener('storage', cb);
  window.addEventListener(STYLE_CHANGE_EVENT, cb);
  return () => {
    window.removeEventListener('storage', cb);
    window.removeEventListener(STYLE_CHANGE_EVENT, cb);
  };
}

function getStoredStyle(): MapStyleId {
  if (typeof localStorage === 'undefined') return 'satellite';
  // Por defecto satélite; solo se usa vector si el usuario lo eligió explícitamente.
  return localStorage.getItem(STYLE_KEY) === 'vector' ? 'vector' : 'satellite';
}

function setStoredStyle(style: MapStyleId): void {
  localStorage.setItem(STYLE_KEY, style);
  // El evento 'storage' no se dispara en la misma pestaña: con uno propio se
  // enteran también los demás mapas de la página.
  window.dispatchEvent(new Event(STYLE_CHANGE_EVENT));
}

/**
 * Estilo elegido, leído con useSyncExternalStore para evitar el desajuste de
 * hidratación (en servidor siempre es 'satellite').
 */
export function useMapStyle(): MapStyleId {
  return useSyncExternalStore(subscribeStyle, getStoredStyle, () => 'satellite' as MapStyleId);
}

/** El estilo de MapLibre que corresponde a cada opción. */
export function mapStyleFor(style: MapStyleId): StyleSpecification | string {
  return style === 'satellite' ? SATELLITE_STYLE : VECTOR_STYLE;
}

/**
 * Selector de dos botones. Va arriba a la izquierda del mapa (arriba a la
 * derecha está el control de zoom de MapLibre); el contenedor que lo aloja
 * debe ser `relative`.
 */
export function MapStyleToggle({ current }: { current: MapStyleId }) {
  const t = useTranslations('reader');
  const button = (active: boolean) =>
    `inline-flex min-h-11 items-center px-3 font-sans text-xs font-medium transition-colors ${
      active
        ? 'bg-lapis-500 text-white'
        : 'text-stone-700 hover:bg-sand-100 dark:text-sand-100 dark:hover:bg-stone-700'
    }`;

  return (
    <div
      role="group"
      aria-label={t('mapStyleAria')}
      className="absolute left-2 top-2 z-10 flex overflow-hidden rounded-md bg-white shadow-md ring-1 ring-stone-200 dark:bg-stone-800 dark:ring-stone-700"
    >
      <button
        type="button"
        onClick={() => setStoredStyle('vector')}
        aria-pressed={current === 'vector'}
        className={button(current === 'vector')}
      >
        {t('mapStyleVector')}
      </button>
      <button
        type="button"
        onClick={() => setStoredStyle('satellite')}
        aria-pressed={current === 'satellite'}
        className={button(current === 'satellite')}
      >
        {t('mapStyleSatellite')}
      </button>
    </div>
  );
}
