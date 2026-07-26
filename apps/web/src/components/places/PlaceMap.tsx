'use client';

import { useEffect, useRef } from 'react';
import maplibregl, { Marker, type Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { SATELLITE_STYLE } from '../map/styles';

type Props = {
  /** Nombre localizado; se pinta como etiqueta bajo el marcador. */
  name: string;
  lng: number;
  lat: number;
  /** Etiqueta accesible del contenedor, ya traducida. */
  label: string;
};

// Suficiente para reconocer el entorno (costa, valle, lago) sin perder de
// vista dónde cae el lugar dentro de la región. Las regiones extensas
// —Egipto, Canaán— se ven mal a cualquier zoom fijo: el punto del dataset es
// representativo, y así se dice en el texto que acompaña al mapa.
const ZOOM = 8;

/**
 * Mapa de la ficha de un lugar: un único marcador, satélite fijo (el relieve
 * es la mitad del interés: por qué ahí y no dos valles más allá).
 *
 * El marcador no es interactivo —no hay a dónde ir desde él— así que se
 * queda fuera del árbol de accesibilidad: su nombre ya está en el h1, en la
 * etiqueta del contenedor y en la ficha de datos que va debajo. El mapa en sí
 * se maneja con teclado como en el lector: el canvas de MapLibre se enfoca
 * con tabulación y responde a flechas y +/−, y los botones de zoom del
 * NavigationControl son controles reales.
 */
export function PlaceMap({ name, lng, lat, label }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: SATELLITE_STYLE,
      center: [lng, lat],
      zoom: ZOOM,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;

    const marker = new Marker({ color: '#3a5a85' }).setLngLat([lng, lat]).addTo(map);
    const element = marker.getElement();

    const caption = document.createElement('div');
    caption.className =
      'pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-semibold leading-tight text-stone-800 shadow-sm';
    caption.textContent = name;
    element.appendChild(caption);

    // Nada que activar: se retira del recorrido de tabulación *antes* de
    // ocultarlo, porque un elemento enfocable con aria-hidden es justo lo que
    // rompe la navegación por teclado.
    element.removeAttribute('tabindex');
    element.setAttribute('aria-hidden', 'true');

    return () => {
      marker.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [lng, lat, name]);

  return <div ref={containerRef} className="h-full w-full" role="application" aria-label={label} />;
}
