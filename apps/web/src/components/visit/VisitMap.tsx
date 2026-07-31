'use client';

import { useEffect, useRef } from 'react';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { SATELLITE_STYLE } from '../map/styles';

export type VisitMapPoint = {
  slug: string;
  name: string;
  lng: number;
  lat: number;
  /** Color de la zona a la que pertenece (paleta en lib/visit.ts). */
  color: string;
};

type Props = {
  points: VisitMapPoint[];
  /** Etiqueta accesible del contenedor, ya traducida. */
  label: string;
};

/**
 * Mapa de orientación de la guía: dónde caen los cincuenta y pico sitios y
 * cómo se agrupan en zonas.
 *
 * Deliberadamente NO es un índice clicable. A la escala en que se ven Galilea
 * y el Négueb a la vez, doce puntos se solapan sólo alrededor de Jerusalén:
 * marcadores pulsables ahí serían un juego de puntería en el móvil, y cincuenta
 * marcadores enfocables meterían cincuenta paradas de tabulación antes del
 * contenido. El índice de verdad es la lista de debajo, donde cada sitio tiene
 * su enlace con su área táctil. El mapa dice lo que la lista no puede decir:
 * las distancias.
 *
 * Los nombres van en una capa `symbol`, que descarta las etiquetas que chocan:
 * al alejarse se ven las que caben y al acercarse aparecen las demás, sin
 * amontonarse nunca.
 */
export function VisitMap({ points, label }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    if (!containerRef.current || points.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();
    for (const p of points) bounds.extend([p.lng, p.lat]);

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: SATELLITE_STYLE,
      bounds,
      fitBoundsOptions: { padding: 48, maxZoom: 9 },
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;

    map.on('load', () => {
      try {
        map.addSource('tabor-visit', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: points.map((p) => ({
              type: 'Feature',
              properties: { name: p.name, color: p.color },
              geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
            })),
          },
        });
        map.addLayer({
          id: 'tabor-visit-point',
          type: 'circle',
          source: 'tabor-visit',
          paint: {
            'circle-color': ['get', 'color'],
            // Crece con el zoom: reconocible de lejos, preciso de cerca.
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 4.5, 10, 7],
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 1.6,
          },
        });
        map.addLayer({
          id: 'tabor-visit-label',
          type: 'symbol',
          source: 'tabor-visit',
          layout: {
            'text-field': ['get', 'name'],
            // Única fuente del servidor de glyphs de demotiles; sin fijarla
            // MapLibre pide su default y el texto sale corrupto.
            'text-font': ['Open Sans Semibold'],
            'text-size': 12,
            'text-offset': [0, 0.9],
            'text-anchor': 'top',
          },
          paint: {
            'text-color': '#2b2622',
            'text-halo-color': 'rgba(255,255,255,0.92)',
            'text-halo-width': 1.6,
          },
        });
      } catch {
        // Estilo sin glyphs u otra limitación: el mapa sigue sin la capa, y
        // la guía entera se lee igual sin él.
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [points]);

  return <div ref={containerRef} className="h-full w-full" role="application" aria-label={label} />;
}
