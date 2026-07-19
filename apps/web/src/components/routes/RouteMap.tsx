'use client';

import { useEffect, useRef } from 'react';
import maplibregl, { Marker, type Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { SATELLITE_STYLE } from '../map/styles';

export type RouteMapStop = {
  slug: string;
  name: string;
  lng: number;
  lat: number;
};

type Props = {
  stops: RouteMapStop[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

const LINE_COLOR = '#c19f64';

/**
 * Mapa de una ruta: línea discontinua entre paradas, marcadores numerados
 * clicables (y operables por teclado) y vuelo suave a la parada activa.
 * Satélite fijo: el relieve es parte del relato en una ruta.
 */
export function RouteMap({ stops, activeIndex, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  // El callback vive en un ref para que los listeners de los marcadores
  // (creados una sola vez) siempre llamen a la versión vigente.
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Creación del mapa: una vez por ruta.
  useEffect(() => {
    if (!containerRef.current) return;

    const bounds = new maplibregl.LngLatBounds();
    for (const s of stops) bounds.extend([s.lng, s.lat]);

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: SATELLITE_STYLE,
      bounds,
      fitBoundsOptions: { padding: 70, maxZoom: 8 },
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;

    map.on('load', () => {
      try {
        map.addSource('tabor-route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: stops.map((s) => [s.lng, s.lat]) },
          },
        });
        map.addLayer({
          id: 'tabor-route-line',
          type: 'line',
          source: 'tabor-route',
          paint: {
            'line-color': LINE_COLOR,
            'line-width': 2.5,
            'line-opacity': 0.85,
            'line-dasharray': [1.5, 1.5],
          },
        });
      } catch {
        // Sin línea el mapa sigue siendo útil: no tumbar la página.
      }
    });

    stops.forEach((stop, index) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className =
        'tabor-route-stop flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-lapis-500 font-sans text-xs font-semibold text-white shadow-md transition-transform hover:scale-110';
      el.textContent = String(index + 1);
      el.setAttribute('aria-label', `${index + 1} — ${stop.name}`);
      el.addEventListener('click', () => onSelectRef.current(index));

      const marker = new Marker({ element: el }).setLngLat([stop.lng, stop.lat]).addTo(map);

      const label = document.createElement('div');
      label.className =
        'pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-semibold leading-tight text-stone-800 shadow-sm';
      label.textContent = stop.name;
      el.appendChild(label);

      markersRef.current.push(marker);
    });

    const markers = markersRef.current;
    return () => {
      markers.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // stops es estable por ruta (la página remonta con key por slug).
  }, [stops]);

  // Vuelo a la parada activa + realce del marcador.
  useEffect(() => {
    const map = mapRef.current;
    const stop = stops[activeIndex];
    if (!map || !stop) return;
    map.flyTo({ center: [stop.lng, stop.lat], zoom: 9, duration: 1400 });
    markersRef.current.forEach((marker, i) => {
      const el = marker.getElement();
      el.classList.toggle('bg-sand-500', i === activeIndex);
      el.classList.toggle('bg-lapis-500', i !== activeIndex);
      el.style.zIndex = i === activeIndex ? '10' : '1';
    });
  }, [activeIndex, stops]);

  return <div ref={containerRef} className="h-full w-full" />;
}
