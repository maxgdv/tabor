// Acceso a la BD para las páginas de lugares.
//
// Separado de `places.ts` (lógica pura) por dos razones: los tests no tienen
// que levantar Postgres, y las consultas quedan en un solo sitio donde se ve
// de un vistazo cuántas lanza cada página.
//
// Todas van envueltas en `cache()` de React: `generateMetadata` y el cuerpo de
// la página necesitan los mismos datos, y así los piden una sola vez. La ficha
// de un lugar hace por tanto 2 consultas —lugar y versículos— y el índice, 1;
// con el `max` del pool en 12 y el header gastando 2, hay margen de sobra.
// (Ver la invariante en packages/db/src/index.ts: nunca más queries en
// paralelo que `max`, y nunca consultas dentro de un bucle.)

import { cache } from 'react';
import { getPlace, listPlaceMentions, listPlacesWithMentions } from '@tabor/db';
import type { DbPlaceMention, DbPlaceSummary } from '@tabor/db';
import { PLACE_MENTION_LIMIT, isListedPlace } from '@/lib/places';

/** Lugares con página propia, con el nombre en el idioma pedido. */
export const listedPlaces = cache(async (locale: string): Promise<DbPlaceSummary[]> => {
  const all = await listPlacesWithMentions({ language: locale, minMentions: 0 });
  return all.filter(isListedPlace);
});

/** Ficha de un lugar, o `null` si no existe o no tiene coordenadas. */
export const placeBySlug = cache(
  (slug: string, locale: string): Promise<DbPlaceSummary | null> =>
    getPlace({ slug, language: locale }),
);

/** Versículos que mencionan un lugar, en orden bíblico y hasta el límite. */
export const placeMentions = cache(
  (slug: string, versionCode: string): Promise<DbPlaceMention[]> =>
    listPlaceMentions({ slug, versionCode, limit: PLACE_MENTION_LIMIT }),
);
