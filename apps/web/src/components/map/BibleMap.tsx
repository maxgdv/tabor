'use client';

import { useEffect, useRef } from 'react';
// Se importa el dato en crudo, no los helpers de `lib/places`: aquéllos
// arrastran el catálogo de rutas y esto es un componente de cliente.
import { REGION_PLACE_SLUGS } from '@/lib/data/place-regions';
import * as maplibregl from 'maplibre-gl';
import { Marker, Popup, type Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './worker';
import { useLocale, useTranslations } from 'next-intl';
import { useReaderStore } from '@/lib/reader-store';
import type { Chapter, Place } from '@/lib/bible';
import { HISTORICAL_OVERLAYS } from '@/lib/historical-overlays';
import type { PeriodId } from '@/lib/periods';
import { MAP_LABEL_FONT } from './styles';
import { MapStyleToggle, mapStyleFor, useMapStyle, type MapStyleId } from './style-preference';
import { MAP_PANEL_EVENT } from './panel-events';

type Props = {
  chapter: Chapter;
  places: Place[];
  /** Época del capítulo; con 'jesus' el mapa pinta las regiones del s. I. */
  period: PeriodId | null;
};

// Vista panorámica del "mundo bíblico": Egipto + Levante + Mesopotamia.
// Usada cuando el capítulo no tiene lugares específicos.
const OVERVIEW_CENTER: [number, number] = [35.5, 32];
const OVERVIEW_ZOOM = 5;

// A partir de cuántos lugares las etiquetas persistentes se solapan en una
// sopa ilegible (Josué 15 tiene 163). En capítulos densos solo se muestran
// desde este zoom; el hover y el versículo activo las fuerzan una a una.
// (9.5 y no 7.5: el encuadre inicial llega ahora hasta INITIAL_MAX_ZOOM, y
// con el umbral antiguo un capítulo denso abría ya con todas las etiquetas.)
const DENSE_PLACE_THRESHOLD = 40;
const LABEL_MIN_ZOOM = 9.5;

// Hasta dónde se acerca el mapa. Antes todo se quedaba en zoom 6 (unos
// 1.400 km de lado a lado): en un capítulo como Juan 4, cuyos lugares caben
// en 130 km, el mapa «volaba» al versículo activo sin moverse apenas, y la
// sincronía pasaje↔mapa —lo que distingue a Tabor— no se percibía.
//   · PLACE_ZOOM: un asentamiento o un accidente concreto (≈90 km de ancho:
//     Cafarnaúm con el lago entero alrededor).
//   · REGION_ZOOM: regiones y países, cuyo punto en el atlas es solo
//     representativo (Egipto → un barrio de El Cairo); acercarse más ahí
//     sería afirmar una precisión que el dato no tiene.
//   · INITIAL_MAX_ZOOM: tope del encuadre inicial con todos los lugares del
//     capítulo.
const PLACE_ZOOM = 10;
const REGION_ZOOM = 7.5;
const INITIAL_MAX_ZOOM = 9;
const zoomForPlace = (slug: string) => (REGION_PLACE_SLUGS.has(slug) ? REGION_ZOOM : PLACE_ZOOM);

// Separación mínima, en píxeles de pantalla, entre dos marcadores visibles.
// Por debajo, el segundo se recoge en el primero, que muestra «+n». Un pin
// mide unos 27 px de ancho: con 30 dejan de pisarse.
const MARKER_MIN_GAP_PX = 30;

// --- Componente --------------------------------------------------------
export function BibleMap({ chapter, places, period }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  // Recalcula qué etiquetas se ven; lo comparten el listener de zoom del
  // mapa y el efecto de versículo activo (que marca data-active).
  const labelVisibilityRef = useRef<() => void>(() => {});
  // Reagrupa los marcadores que se pisan; lo llaman el mapa al terminar cada
  // movimiento y el efecto de versículo activo (que decide cuáles no se ocultan).
  const declutterRef = useRef<() => void>(() => {});

  const activeVerse = useReaderStore((s) => s.activeVerseNumber);
  const requestScrollTo = useReaderStore((s) => s.requestScrollTo);
  const t = useTranslations('reader');
  const locale = useLocale();

  // Capa histórica de la época del capítulo (regiones, rutas, hitos).
  // Los cambios de estilo borran las capas propias, así que se re-añade
  // tras cada 'style.load'. try/catch: un fallo aquí no debe tumbar el mapa.
  const addRegionLayers = (map: MapLibreMap) => {
    const overlay = period ? HISTORICAL_OVERLAYS[period] : undefined;
    if (!overlay || map.getSource('tabor-regions')) return;
    try {
      map.addSource('tabor-regions', {
        type: 'geojson',
        data: overlay,
        attribution: t('regionsAttribution'),
      });
      map.addLayer({
        id: 'tabor-regions-fill',
        type: 'fill',
        source: 'tabor-regions',
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.14 },
      });
      // Contornos de regiones y rutas comparten capa (discontinua).
      map.addLayer({
        id: 'tabor-regions-line',
        type: 'line',
        source: 'tabor-regions',
        filter: ['!=', ['geometry-type'], 'Point'],
        paint: {
          'line-color': ['get', 'color'],
          'line-opacity': 0.6,
          'line-width': 1.4,
          'line-dasharray': [2, 2],
        },
      });
      map.addLayer({
        id: 'tabor-regions-point',
        type: 'circle',
        source: 'tabor-regions',
        filter: ['==', ['geometry-type'], 'Point'],
        paint: {
          'circle-radius': 3.5,
          'circle-color': ['get', 'color'],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 1.2,
        },
      });
      map.addLayer({
        id: 'tabor-regions-label',
        type: 'symbol',
        source: 'tabor-regions',
        layout: {
          'text-field': ['get', locale === 'en' ? 'nameEn' : 'nameEs'],
          // Una fuente que el servidor de glyphs sí sirve (ver styles.ts);
          // sin fijarla, MapLibre pide su default y el texto no se pinta.
          'text-font': MAP_LABEL_FONT,
          'text-size': 12,
          'text-letter-spacing': 0.08,
          'text-transform': 'uppercase',
          'text-offset': [0, 0.8],
        },
        paint: {
          // Texto oscuro con halo claro: legible sobre vector y satélite.
          'text-color': '#2b2622',
          'text-halo-color': 'rgba(255,255,255,0.9)',
          'text-halo-width': 1.6,
        },
      });
    } catch {
      // Estilo sin glyphs u otra limitación: el mapa sigue sin la capa.
    }
  };
  // Último estilo aplicado al mapa vivo. Evita el setStyle redundante del
  // montaje: setStyle antes de que el estilo inicial termine de cargar
  // fuerza un "rebuild from scratch" y puede perder el evento 'load' (y con
  // él los marcadores) — carrera real observada con red lenta.
  const appliedStyleRef = useRef<MapStyleId | null>(null);

  // Estilo elegido por el usuario, compartido con los demás mapas del sitio.
  const mapStyle = useMapStyle();

  const isOverview = places.length === 0;

  // Inicialización del mapa: una sola vez. Re-ejecuta si cambia el conjunto
  // de lugares (cambio de capítulo) o el modo overview.
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyleFor(mapStyle),
      center: isOverview ? OVERVIEW_CENTER : [35.5, 32.5],
      zoom: isOverview ? OVERVIEW_ZOOM : 4.5,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;
    appliedStyleRef.current = mapStyle;

    map.on('load', () => {
      addRegionLayers(map);
      // En modo overview no añadimos marcadores ni hacemos fitBounds:
      // queremos una vista panorámica fija del mundo bíblico.
      if (isOverview) return;

      const bounds = new maplibregl.LngLatBounds();
      for (const place of places) {
        bounds.extend([place.lng, place.lat]);
      }
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 80, duration: 0, maxZoom: INITIAL_MAX_ZOOM });
      }

      for (const place of places) {
        const popup = new Popup({ offset: 18, closeButton: false }).setHTML(
          `<div class="font-serif">
             <div class="text-sm font-semibold">${escapeHtml(place.name)}</div>
             ${place.modernName && !REGION_PLACE_SLUGS.has(place.slug) ? `<div class="text-xs text-stone-500">${escapeHtml(place.modernName)}</div>` : ''}
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
          'tabor-marker-label pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-semibold leading-tight text-stone-800 shadow-sm';
        label.textContent = place.name;
        marker.getElement().appendChild(label);

        // El marcador es operable por teclado (WCAG 2.1.1): focusable, con
        // nombre accesible, y Enter/Espacio equivalen al click (ir al
        // versículo). El popup lo alterna MapLibre en el mismo gesto.
        const markerEl = marker.getElement();
        markerEl.setAttribute('tabindex', '0');
        markerEl.setAttribute('role', 'button');
        markerEl.setAttribute('aria-label', place.name);
        // El nombre a secas, para recomponer el aria-label cuando el marcador
        // agrupa a otros («Hebrón (+4)») o deja de hacerlo.
        markerEl.dataset.placeName = place.name;
        const goToVerse = () => {
          const firstVerse = chapter.verses.find((v) => v.placeSlugs.includes(place.slug));
          if (firstVerse) requestScrollTo(firstVerse.number);
        };
        markerEl.addEventListener('click', goToVerse);
        markerEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            marker.togglePopup();
            goToVerse();
          }
        });
        markersRef.current.set(place.slug, marker);
      }

      // Visibilidad de etiquetas según densidad y zoom (ver constantes).
      const updateLabelVisibility = () => {
        const showAll = places.length <= DENSE_PLACE_THRESHOLD || map.getZoom() >= LABEL_MIN_ZOOM;
        markersRef.current.forEach((marker) => {
          const el = marker.getElement();
          const label = el.querySelector<HTMLElement>('.tabor-marker-label');
          if (!label) return;
          label.style.display = showAll || el.dataset.active === 'true' ? '' : 'none';
        });
      };
      // Marcadores amontonados: en Josué 15 hay 163 pines y a zoom lejano
      // forman una mancha en la que no se distingue ni se puede pulsar
      // ninguno. Tras cada movimiento se recorre la lista —los del versículo
      // activo primero, luego en orden de aparición— y el que cae a menos de
      // MARKER_MIN_GAP_PX de uno ya visible se recoge en él, que enseña
      // cuántos agrupa. Al acercarse se separan solos. No se pierde acceso a
      // ningún lugar: todos siguen en la lista «Lugares de este capítulo»
      // bajo el texto, y el del versículo activo nunca se oculta.
      const declutterMarkers = () => {
        const entries = Array.from(markersRef.current.values()).map((marker, order) => {
          const el = marker.getElement();
          return {
            el,
            order,
            active: el.dataset.active === 'true',
            point: map.project(marker.getLngLat()),
          };
        });
        entries.sort((a, b) => Number(b.active) - Number(a.active) || a.order - b.order);

        const kept: { x: number; y: number; el: HTMLElement; hidden: number }[] = [];
        for (const entry of entries) {
          const host = entry.active
            ? undefined
            : kept.find(
                (k) =>
                  Math.hypot(k.x - entry.point.x, k.y - entry.point.y) < MARKER_MIN_GAP_PX,
              );
          if (host) {
            entry.el.style.display = 'none';
            host.hidden += 1;
          } else {
            entry.el.style.display = '';
            kept.push({ x: entry.point.x, y: entry.point.y, el: entry.el, hidden: 0 });
          }
        }

        for (const { el, hidden } of kept) {
          let badge = el.querySelector<HTMLElement>('.tabor-marker-count');
          if (hidden === 0) {
            badge?.remove();
            el.setAttribute('aria-label', el.dataset.placeName ?? '');
            continue;
          }
          if (!badge) {
            badge = document.createElement('span');
            badge.className =
              'tabor-marker-count pointer-events-none absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 font-sans text-[10px] font-bold leading-none text-lapis-600 shadow ring-1 ring-lapis-500/40';
            badge.setAttribute('aria-hidden', 'true');
            el.appendChild(badge);
          }
          badge.textContent = `+${hidden}`;
          el.setAttribute('aria-label', `${el.dataset.placeName ?? ''} (+${hidden})`);
        }
      };
      declutterRef.current = declutterMarkers;

      labelVisibilityRef.current = updateLabelVisibility;
      updateLabelVisibility();
      declutterMarkers();
      map.on('zoom', updateLabelVisibility);
      // 'moveend' cubre también el final de cada zoom y de cada vuelo.
      map.on('moveend', declutterMarkers);
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

  // El canvas de MapLibre conserva el tamaño con el que se midió: si el
  // contenedor cambia de alto/ancho (hoja del mapa en móvil, cruce del
  // breakpoint, rotación del teléfono, aparición del panel) hay que llamar a
  // `map.resize()` o el mapa sale estirado. Dos vigilantes complementarios:
  // el ResizeObserver del contenedor —que cubre cualquier cambio real de
  // caja— y el aviso explícito de la hoja, por si abre/cierra sin que el
  // contenedor cambie de tamaño (se oculta con transform, no con height).
  // rAF: agrupa ráfagas de cambios en un único resize por frame.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => mapRef.current?.resize());
    };

    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
    observer?.observe(el);
    window.addEventListener(MAP_PANEL_EVENT, schedule);

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener(MAP_PANEL_EVENT, schedule);
    };
  }, []);

  // Cambio de estilo en caliente (no recrea el mapa, conserva marcadores).
  // Las capas propias (regiones) sí se pierden con el estilo: re-añadir.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || appliedStyleRef.current === mapStyle) return;
    appliedStyleRef.current = mapStyle;
    // diff: false → recarga completa. Con el diff por defecto, al pasar del
    // estilo remoto al satélite MapLibre parchea el estilo en sitio, borra las
    // capas propias y no emite 'style.load': nadie volvía a pintarlas.
    map.setStyle(mapStyleFor(mapStyle), { diff: false });
    map.once('style.load', () => addRegionLayers(map));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // Sin `essential: true`: así MapLibre respeta prefers-reduced-motion
      // y salta sin animación para quien lo pide.
      map.flyTo({
        center: [targets[0].lng, targets[0].lat],
        zoom: zoomForPlace(targets[0].slug),
        duration: 1200,
      });
    } else {
      const bounds = new maplibregl.LngLatBounds();
      for (const tgt of targets) bounds.extend([tgt.lng, tgt.lat]);
      // Con una región entre los lugares del versículo manda su tope: el
      // encuadre no debe cerrarse sobre el punto representativo.
      const maxZoom = Math.min(...targets.map((tgt) => zoomForPlace(tgt.slug)));
      map.fitBounds(bounds, { padding: 80, duration: 1200, maxZoom });
    }

    markersRef.current.forEach((marker, slug) => {
      const el = marker.getElement();
      const active = verse.placeSlugs.includes(slug);
      el.dataset.active = String(active);
      el.style.filter = active ? 'drop-shadow(0 0 8px #c19f64)' : 'none';
      el.style.transform = active
        ? `${el.style.transform.replace(/scale\([^)]*\)/, '')} scale(1.25)`
        : el.style.transform.replace(/scale\([^)]*\)/, '');
    });
    // Los lugares del versículo activo muestran su etiqueta aunque el
    // capítulo sea denso y el zoom esté lejos, y nunca quedan recogidos en
    // otro marcador.
    labelVisibilityRef.current();
    declutterRef.current();
  }, [activeVerse, chapter, places, isOverview]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="h-full w-full"
        aria-label={t('mapAria')}
        role="application"
      />

      <MapStyleToggle current={mapStyle} />

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
