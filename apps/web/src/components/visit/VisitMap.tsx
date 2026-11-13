'use client';

import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { type Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../map/worker';
import { MAP_LABEL_FONT } from '../map/styles';
import {
  MapStyleToggle,
  mapStyleFor,
  useMapStyle,
  type MapStyleId,
} from '../map/style-preference';

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
  const mapStyle = useMapStyle();
  // Último estilo aplicado: evita el setStyle redundante del montaje.
  const appliedStyleRef = useRef<MapStyleId | null>(null);
  // Vuelve a pintar los sitios: un cambio de estilo borra las capas propias.
  const addLayersRef = useRef<(map: MapLibreMap) => void>(() => {});

  useEffect(() => {
    if (!containerRef.current || points.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();
    for (const p of points) bounds.extend([p.lng, p.lat]);

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyleFor(mapStyle),
      bounds,
      fitBoundsOptions: { padding: 48, maxZoom: 9 },
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;
    appliedStyleRef.current = mapStyle;

    const addLayers = (target: MapLibreMap) => {
      if (target.getSource('tabor-visit')) return;
      try {
        target.addSource('tabor-visit', {
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
        target.addLayer({
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
        target.addLayer({
          id: 'tabor-visit-label',
          type: 'symbol',
          source: 'tabor-visit',
          layout: {
            'text-field': ['get', 'name'],
            // Una fuente que el servidor de glyphs sí sirve (ver styles.ts);
            // sin fijarla MapLibre pide su default y el texto no se pinta.
            'text-font': MAP_LABEL_FONT,
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
    };
    addLayersRef.current = addLayers;
    map.on('load', () => addLayers(map));

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // El cambio de estilo lo gestiona el efecto de abajo sin recrear el mapa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  // Cambio de estilo en caliente: las capas propias se pierden y se re-añaden.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || appliedStyleRef.current === mapStyle) return;
    appliedStyleRef.current = mapStyle;
    // diff: false → recarga completa. Con el diff por defecto, al pasar del
    // estilo remoto al satélite MapLibre parchea el estilo en sitio, borra las
    // capas propias y no emite 'style.load': nadie volvía a pintarlas.
    map.setStyle(mapStyleFor(mapStyle), { diff: false });
    map.once('style.load', () => addLayersRef.current(map));
  }, [mapStyle]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" role="application" aria-label={label} />
      <MapStyleToggle current={mapStyle} />
    </div>
  );
}
