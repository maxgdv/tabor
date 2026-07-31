// La guía de lugares visitables: regiones, zonas y agrupación.
//
// `visitable.ts` contiene el dato de cada sitio (qué se conserva, dónde está,
// qué leer allí) y no sabe nada de cómo se presenta. Este módulo es lo otro:
// en qué orden se recorren las regiones, en qué zonas se parte una de ellas y
// a cuál va cada sitio. Lógica pura y comprobable, sin BD y sin JSX; las
// coordenadas se las pasa quien llama, que ya las ha pedido de una sola vez.

import type { VisitableRegion } from '@/lib/visitable';
import { AREA_BY_SLUG } from '@/lib/data/visit-areas';

/** Regiones publicadas, en orden de aparición en el hub. */
export const VISIT_REGIONS: readonly VisitableRegion[] = ['tierra-santa', 'viajes-de-pablo'];

/** Path (sin locale ni barra inicial) de la guía de cada región. */
export const REGION_PATH: Record<VisitableRegion, string> = {
  'tierra-santa': 'visitar/tierra-santa',
  'viajes-de-pablo': 'visitar/viajes-de-pablo',
};

// --- Zonas de Tierra Santa --------------------------------------------------

/**
 * Cómo se parte Tierra Santa en la guía.
 *
 * Ni por orden bíblico ni alfabético: por dónde se duerme. Una peregrinación
 * real se organiza en dos o tres bases —Jerusalén, Galilea, a veces Belén— y
 * desde cada una se sale a lo que está a mano. Quien busca «qué ver en Tierra
 * Santa» está armando ese calendario, no repasando el canon; y quien ya está
 * allí necesita saber qué le queda cerca hoy.
 *
 * El orden de las zonas baja de Jerusalén a Judá, cruza al Jordán y sube por
 * el centro hasta Galilea antes de volver por la costa.
 */
export type VisitAreaId = 'jerusalen' | 'judea' | 'jordan' | 'galilea' | 'samaria' | 'costa';

export const VISIT_AREAS: readonly VisitAreaId[] = [
  'jerusalen',
  'judea',
  'jordan',
  'galilea',
  'samaria',
  'costa',
];

/**
 * Color de cada zona en el mapa de la guía, de la paleta del proyecto
 * (globals.css). El color no es la información: las zonas son encabezados de
 * verdad y la leyenda dice el nombre junto a la muestra, así que nadie
 * depende de distinguirlos (WCAG 1.4.1).
 */
export const AREA_COLORS: Record<VisitAreaId, string> = {
  jerusalen: '#a05a52', // rose-500
  judea: '#a98249', // sand-500
  jordan: '#3a5a85', // lapis-500
  galilea: '#7a8c4b', // olive-500
  samaria: '#6e6253', // stone-500
  costa: '#5b8a9c', // sky-500
};

/** Coordenadas de un lugar, tal como vienen del atlas. */
export type LatLng = { lat: number; lng: number };

/**
 * Puntos de referencia de cada zona, para los sitios que no estén en la lista
 * curada: gana el más cercano. No son centroides sino lugares reconocibles,
 * que es lo que hace predecible el reparto —lo que cae cerca de Cesarea es
 * costa aunque esté a la latitud de Nazaret.
 */
const AREA_ANCHORS: readonly (LatLng & { area: VisitAreaId })[] = [
  { area: 'jerusalen', lat: 31.7767, lng: 35.2342 },
  { area: 'judea', lat: 31.7043, lng: 35.2076 }, // Belén
  { area: 'judea', lat: 31.5251, lng: 35.1022 }, // Hebrón
  { area: 'judea', lat: 31.2447, lng: 34.8408 }, // Berseba
  { area: 'jordan', lat: 31.8717, lng: 35.4446 }, // Jericó
  { area: 'jordan', lat: 31.5, lng: 35.5 }, // mar Muerto
  { area: 'jordan', lat: 31.7491, lng: 35.7439 }, // Nebo
  { area: 'galilea', lat: 32.8811, lng: 35.575 }, // Cafarnaúm
  { area: 'galilea', lat: 32.7021, lng: 35.2977 }, // Nazaret
  { area: 'galilea', lat: 33.2461, lng: 35.6933 }, // Cesarea de Filipo
  { area: 'samaria', lat: 32.2136, lng: 35.2819 }, // Siquem
  { area: 'samaria', lat: 31.9228, lng: 35.2414 }, // Betel
  { area: 'costa', lat: 32.5, lng: 34.8917 }, // Cesarea marítima
  { area: 'costa', lat: 32.0545, lng: 34.753 }, // Jope
  { area: 'costa', lat: 31.504, lng: 34.4644 }, // Gaza
  { area: 'costa', lat: 33.2708, lng: 35.1961 }, // Tiro
];

/**
 * Distancia al cuadrado en grados, corrigiendo la longitud por la latitud
 * (a 32°N un grado de longitud mide un 85 % de uno de latitud). No hace falta
 * haversine para decidir cuál de dieciséis puntos cae más cerca.
 */
function roughDistance(a: LatLng, b: LatLng): number {
  const dLat = a.lat - b.lat;
  const dLng = (a.lng - b.lng) * Math.cos((a.lat * Math.PI) / 180);
  return dLat * dLat + dLng * dLng;
}

/**
 * Zona de un sitio: la curada si está, y si no la del punto de referencia más
 * cercano. Sin coordenadas —un slug que el atlas ya no tenga— cae en la zona
 * de Jerusalén, que es donde menos desentona y donde antes se detecta.
 */
export function areaForSite(slug: string, coords: LatLng | null | undefined): VisitAreaId {
  const curated = AREA_BY_SLUG.get(slug);
  if (curated) return curated;
  if (!coords) return 'jerusalen';
  let best: VisitAreaId = 'jerusalen';
  let bestDistance = Infinity;
  for (const anchor of AREA_ANCHORS) {
    const distance = roughDistance(coords, anchor);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = anchor.area;
    }
  }
  return best;
}

export type VisitAreaGroup<T> = { area: VisitAreaId; sites: T[] };

/**
 * Sitios repartidos por zona, en el orden de `VISIT_AREAS` y conservando
 * dentro de cada una el orden en que se declararon (que es editorial: primero
 * lo que nadie se salta). Las zonas sin sitios no salen.
 */
export function groupSitesByArea<T extends { slug: string }>(
  sites: readonly T[],
  coordsOf: (slug: string) => LatLng | null | undefined,
): VisitAreaGroup<T>[] {
  const byArea = new Map<VisitAreaId, T[]>();
  for (const site of sites) {
    const area = areaForSite(site.slug, coordsOf(site.slug));
    const bucket = byArea.get(area);
    if (bucket) bucket.push(site);
    else byArea.set(area, [site]);
  }
  return VISIT_AREAS.filter((area) => byArea.has(area)).map((area) => ({
    area,
    sites: byArea.get(area) ?? [],
  }));
}
