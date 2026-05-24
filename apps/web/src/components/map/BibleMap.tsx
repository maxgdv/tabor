'use client';

import { useEffect, useRef } from 'react';
import maplibregl, { Marker, Popup, type Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useReaderStore } from '@/lib/reader-store';
import type { Chapter, Place } from '@/lib/bible';

type Props = {
  chapter: Chapter;
  places: Place[];
};

// Estilo vectorial gratuito y open-source. En producción usaremos nuestro propio
// tile server (OpenMapTiles + Tegola/Martin), pero para el vertical slice este
// estilo basta y no requiere API key.
const DEMO_STYLE = 'https://demotiles.maplibre.org/style.json';

export function BibleMap({ chapter, places }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());

  const activeVerse = useReaderStore((s) => s.activeVerseNumber);
  const requestScrollTo = useReaderStore((s) => s.requestScrollTo);

  // Inicialización del mapa: ocurre una sola vez.
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: DEMO_STYLE,
      // Centro inicial en el Levante mediterráneo, el escenario más frecuente.
      center: [35.5, 32.5],
      zoom: 4.5,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;

    // Cuando el estilo cargue, ajustamos la vista para abarcar todos los lugares.
    map.on('load', () => {
      const bounds = new maplibregl.LngLatBounds();
      for (const place of places) {
        bounds.extend([place.lng, place.lat]);
      }
      if (places.length > 0 && !bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 80, duration: 0, maxZoom: 6 });
      }

      // Marcadores.
      for (const place of places) {
        const popup = new Popup({ offset: 18, closeButton: false }).setHTML(
          `<div class="font-serif">
             <div class="text-sm font-semibold">${escapeHtml(place.canonicalName)}</div>
             ${place.modernName ? `<div class="text-xs text-stone-500">${escapeHtml(place.modernName)}</div>` : ''}
             ${place.description ? `<div class="mt-1 text-xs">${escapeHtml(place.description)}</div>` : ''}
           </div>`,
        );
        const marker = new Marker({ color: '#3a5a85' })
          .setLngLat([place.lng, place.lat])
          .setPopup(popup)
          .addTo(map);

        // Etiqueta persistente con el nombre bíblico bajo el marcador, para
        // que el usuario lea los lugares sin tener que clicar uno a uno.
        // Por ahora en inglés (los nombres vienen de OpenBible.info);
        // queda pendiente añadir traducción al español post-deploy.
        const label = document.createElement('div');
        label.className =
          'pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-semibold leading-tight text-stone-800 shadow-sm';
        label.textContent = place.canonicalName;
        marker.getElement().appendChild(label);

        // Click en marcador → scroll al primer versículo asociado.
        marker.getElement().addEventListener('click', () => {
          const firstVerse = chapter.verses.find((v) => v.placeSlugs.includes(place.slug));
          if (firstVerse) requestScrollTo(firstVerse.number);
        });
        markersRef.current.set(place.slug, marker);
      }
    });

    const markers = markersRef.current;
    return () => {
      markers.forEach((m) => m.remove());
      markers.clear();
      map.remove();
      mapRef.current = null;
    };
  }, [chapter, places, requestScrollTo]);

  // Cuando el versículo activo cambia, vuela a la(s) localización(es).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || activeVerse == null) return;

    const verse = chapter.verses.find((v) => v.number === activeVerse);
    if (!verse || verse.placeSlugs.length === 0) return;

    const targets = verse.placeSlugs
      .map((slug) => places.find((p) => p.slug === slug))
      .filter((p): p is Place => Boolean(p));
    if (targets.length === 0) return;

    if (targets.length === 1 && targets[0]) {
      map.flyTo({
        center: [targets[0].lng, targets[0].lat],
        zoom: 6,
        duration: 1200,
        essential: true,
      });
    } else {
      const bounds = new maplibregl.LngLatBounds();
      for (const t of targets) bounds.extend([t.lng, t.lat]);
      map.fitBounds(bounds, { padding: 80, duration: 1200, maxZoom: 6 });
    }

    // Resalta los marcadores asociados.
    markersRef.current.forEach((marker, slug) => {
      const el = marker.getElement();
      const isActive = verse.placeSlugs.includes(slug);
      el.style.filter = isActive ? 'drop-shadow(0 0 8px #c19f64)' : 'none';
      el.style.transform = isActive
        ? `${el.style.transform.replace(/scale\([^)]*\)/, '')} scale(1.25)`
        : el.style.transform.replace(/scale\([^)]*\)/, '');
    });
  }, [activeVerse, chapter, places]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      aria-label="Mapa interactivo del capítulo"
      role="application"
    />
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
