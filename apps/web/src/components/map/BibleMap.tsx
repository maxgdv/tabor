'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import maplibregl, {
  Marker,
  Popup,
  type Map as MapLibreMap,
  type StyleSpecification,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTranslations } from 'next-intl';
import { useReaderStore } from '@/lib/reader-store';
import type { Chapter, Place } from '@/lib/bible';

type Props = {
  chapter: Chapter;
  places: Place[];
};

// Estilo vectorial gratuito y open-source. Para el MVP basta y no requiere
// API key. En el futuro podemos servir nuestro propio tile server.
const VECTOR_STYLE = 'https://demotiles.maplibre.org/style.json';

// Estilo satélite con teselas raster de Esri World Imagery — gratis para
// uso no comercial, atribución obligatoria visible.
const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    esri: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: 'Imagery © Esri, Maxar, Earthstar Geographics',
    },
  },
  layers: [{ id: 'esri-imagery', type: 'raster', source: 'esri' }],
};

// Vista panorámica del "mundo bíblico": Egipto + Levante + Mesopotamia.
// Usada cuando el capítulo no tiene lugares específicos.
const OVERVIEW_CENTER: [number, number] = [35.5, 32];
const OVERVIEW_ZOOM = 5;

// --- Persistencia de la preferencia de estilo en localStorage ----------
type MapStyleId = 'vector' | 'satellite';
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
function setStoredStyle(s: MapStyleId): void {
  localStorage.setItem(STYLE_KEY, s);
  // 'storage' event no se dispara en la misma pestaña — usamos custom event
  // para que el resto de componentes (si los hubiera) también reaccionen.
  window.dispatchEvent(new Event(STYLE_CHANGE_EVENT));
}

// --- Componente --------------------------------------------------------
export function BibleMap({ chapter, places }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());

  const activeVerse = useReaderStore((s) => s.activeVerseNumber);
  const requestScrollTo = useReaderStore((s) => s.requestScrollTo);
  const t = useTranslations('reader');

  // Estilo persistente vía localStorage, leído con useSyncExternalStore
  // para evitar mismatch de hidratación (SSR siempre devuelve 'satellite').
  const mapStyle = useSyncExternalStore(
    subscribeStyle,
    getStoredStyle,
    () => 'satellite' as MapStyleId,
  );

  const isOverview = places.length === 0;

  // Inicialización del mapa: una sola vez. Re-ejecuta si cambia el conjunto
  // de lugares (cambio de capítulo) o el modo overview.
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle === 'satellite' ? SATELLITE_STYLE : VECTOR_STYLE,
      center: isOverview ? OVERVIEW_CENTER : [35.5, 32.5],
      zoom: isOverview ? OVERVIEW_ZOOM : 4.5,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;

    map.on('load', () => {
      // En modo overview no añadimos marcadores ni hacemos fitBounds:
      // queremos una vista panorámica fija del mundo bíblico.
      if (isOverview) return;

      const bounds = new maplibregl.LngLatBounds();
      for (const place of places) {
        bounds.extend([place.lng, place.lat]);
      }
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 80, duration: 0, maxZoom: 6 });
      }

      for (const place of places) {
        const popup = new Popup({ offset: 18, closeButton: false }).setHTML(
          `<div class="font-serif">
             <div class="text-sm font-semibold">${escapeHtml(place.name)}</div>
             ${place.modernName ? `<div class="text-xs text-stone-500">${escapeHtml(place.modernName)}</div>` : ''}
             ${place.description ? `<div class="mt-1 text-xs">${escapeHtml(place.description)}</div>` : ''}
           </div>`,
        );
        const marker = new Marker({ color: '#3a5a85' })
          .setLngLat([place.lng, place.lat])
          .setPopup(popup)
          .addTo(map);

        // Etiqueta persistente con el nombre bíblico bajo el marcador.
        const label = document.createElement('div');
        label.className =
          'pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-semibold leading-tight text-stone-800 shadow-sm';
        label.textContent = place.name;
        marker.getElement().appendChild(label);

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
    // No incluimos mapStyle aquí — el cambio de estilo lo gestiona otro efecto
    // sin destruir el mapa entero. Sí incluimos isOverview porque cambia
    // center/zoom iniciales.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter, places, requestScrollTo, isOverview]);

  // Cambio de estilo en caliente (no recrea el mapa, conserva marcadores).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(mapStyle === 'satellite' ? SATELLITE_STYLE : VECTOR_STYLE);
  }, [mapStyle]);

  // Vuela al versículo activo (solo en modo específico).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || activeVerse == null || isOverview) return;

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
      for (const tgt of targets) bounds.extend([tgt.lng, tgt.lat]);
      map.fitBounds(bounds, { padding: 80, duration: 1200, maxZoom: 6 });
    }

    markersRef.current.forEach((marker, slug) => {
      const el = marker.getElement();
      const active = verse.placeSlugs.includes(slug);
      el.style.filter = active ? 'drop-shadow(0 0 8px #c19f64)' : 'none';
      el.style.transform = active
        ? `${el.style.transform.replace(/scale\([^)]*\)/, '')} scale(1.25)`
        : el.style.transform.replace(/scale\([^)]*\)/, '');
    });
  }, [activeVerse, chapter, places, isOverview]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="h-full w-full"
        aria-label="Mapa interactivo del capítulo"
        role="application"
      />

      {/* Selector Vector / Satélite — arriba-izquierda (top-right ya tiene
          NavigationControl de MapLibre). */}
      <div
        role="group"
        aria-label={t('mapStyleAria')}
        className="absolute left-2 top-2 z-10 flex overflow-hidden rounded-md bg-white shadow-md ring-1 ring-stone-200 dark:bg-stone-800 dark:ring-stone-700"
      >
        <button
          type="button"
          onClick={() => setStoredStyle('vector')}
          aria-pressed={mapStyle === 'vector'}
          className={`px-2.5 py-1.5 font-sans text-xs font-medium transition-colors ${
            mapStyle === 'vector'
              ? 'bg-lapis-500 text-white'
              : 'text-stone-700 hover:bg-sand-100 dark:text-sand-100 dark:hover:bg-stone-700'
          }`}
        >
          {t('mapStyleVector')}
        </button>
        <button
          type="button"
          onClick={() => setStoredStyle('satellite')}
          aria-pressed={mapStyle === 'satellite'}
          className={`px-2.5 py-1.5 font-sans text-xs font-medium transition-colors ${
            mapStyle === 'satellite'
              ? 'bg-lapis-500 text-white'
              : 'text-stone-700 hover:bg-sand-100 dark:text-sand-100 dark:hover:bg-stone-700'
          }`}
        >
          {t('mapStyleSatellite')}
        </button>
      </div>

      {/* Badge informativo cuando el capítulo no tiene lugares específicos. */}
      {isOverview && (
        <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 max-w-[90%] -translate-x-1/2 rounded-md bg-stone-900/75 px-3 py-1.5 text-center font-sans text-xs text-white shadow-md backdrop-blur-sm">
          {t('overviewBadge')}
        </div>
      )}
    </div>
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
