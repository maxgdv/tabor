// Acceso a la BD para la guía de lugares visitables.
//
// UNA sola consulta por página, y no una por sitio. La guía de Tierra Santa
// necesita nombre localizado y coordenadas de ~50 lugares: `listPlacesBySlugs`
// los trae todos en un `IN (...)`. Pedirlos en un bucle —o con un Promise.all
// de cincuenta— envenenaría el pool y colgaría la web (ver la invariante en
// packages/db/src/index.ts: nunca más queries simultáneas que `max`).
//
// Y no `listPlacesWithMentions`, que es la del índice de lugares, porque su
// JOIN con `verse_location` deja fuera precisamente lo que aquí no puede
// faltar: Magdala no tiene ni un versículo enlazado en el atlas y es parada
// obligada de cualquier peregrinación a Galilea.
//
// Envuelta en `cache()` de React: `generateMetadata` y el cuerpo de la página
// piden lo mismo en la misma petición HTTP.

import { cache } from 'react';
import { listPlacesBySlugs, type DbRoutePlace } from '@tabor/db';
import { sitesInRegion, type VisitableRegion } from '@/lib/visitable';

/**
 * Los lugares de una región visitable, indexados por slug. Un slug que el
 * atlas ya no tenga simplemente no vuelve; la guía lo omite en vez de romper.
 */
export const visitablePlaces = cache(
  async (region: VisitableRegion, locale: string): Promise<Map<string, DbRoutePlace>> => {
    const slugs = sitesInRegion(region).map((site) => site.slug);
    const places = await listPlacesBySlugs({ slugs, language: locale });
    return new Map(places.map((place) => [place.slug, place]));
  },
);
