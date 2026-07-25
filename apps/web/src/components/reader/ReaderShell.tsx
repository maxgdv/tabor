'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useReaderStore } from '@/lib/reader-store';
import { MAP_PANEL_EVENT } from '@/components/map/panel-events';

/** `lg` de Tailwind (64rem). Por encima, el lector es 50/50 lado a lado. */
const DESKTOP_QUERY = '(min-width: 64rem)';

const PANEL_ID = 'reader-map-panel';

function subscribeDesktop(onChange: () => void): () => void {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

type Props = {
  /** Panel de texto (ChapterReader + ActiveVerseMarker). */
  text: React.ReactNode;
  /** Panel geográfico: mapa sincronizado, o arte sacro si no hay lugares. */
  panel: React.ReactNode;
  /** Prev/next de capítulo para la barra inferior móvil (solo `< lg`). */
  chapterNav: React.ReactNode;
  textLabel: string;
  /** aria-label de la sección del panel («Mapa del capítulo»). */
  panelLabel: string;
  /** Texto visible del disparador: «Mapa» o «Ilustración». */
  toggleLabel: string;
  /** Primer lugar de cada versículo, para nombrarlo en el disparador. */
  versePlaces: Record<number, string>;
};

/**
 * Estructura del lector, con dos comportamientos según el ancho.
 *
 * En escritorio (`lg:`) es el 50/50 lado a lado de siempre: dos celdas de
 * grid, sin nada superpuesto.
 *
 * En móvil el texto ocupa toda la pantalla y el panel del mapa se convierte
 * en una hoja deslizante que sube desde abajo (70% del alto del lector, con
 * el texto todavía visible arriba: el vuelo del mapa al versículo activo se
 * sigue viendo mientras se lee). La hoja NO es un diálogo modal — no hay
 * scrim ni trampa de foco: es un disclosure clásico (aria-expanded +
 * aria-controls) y el texto de detrás sigue siendo operable.
 *
 * Detalles que sostienen la decisión:
 * - La hoja se oculta con `translate`, nunca con `display:none` ni cambiando
 *   su alto: el contenedor de MapLibre conserva siempre su tamaño real, así
 *   que el canvas nunca se mide a 0 px. Aun así se avisa al mapa en cada
 *   cambio (MAP_PANEL_EVENT) y BibleMap observa su contenedor.
 * - Cerrada, la hoja lleva `inert`: sus controles (marcadores, selector de
 *   estilo) salen del orden de tabulación y del árbol de accesibilidad,
 *   como corresponde a una región colapsada.
 * - La barra inferior nombra el lugar del versículo que se está leyendo, de
 *   modo que la sincronización pasaje↔mapa se percibe aunque el mapa esté
 *   recogido; el mapa se convoca, no se esconde.
 */
export function ReaderShell({
  text,
  panel,
  chapterNav,
  textLabel,
  panelLabel,
  toggleLabel,
  versePlaces,
}: Props) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  // El SSR asume escritorio (sin superposición ni `inert`); tras hidratar,
  // useSyncExternalStore reconcilia con el ancho real sin setState en efectos.
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => true,
  );

  const activeVerse = useReaderStore((s) => s.activeVerseNumber);
  const activePlace = activeVerse != null ? versePlaces[activeVerse] : undefined;

  // El canvas de MapLibre se queda con el tamaño con el que se midió: cada
  // vez que la hoja se abre/cierra o se cruza el breakpoint, se avisa.
  useEffect(() => {
    window.dispatchEvent(new Event(MAP_PANEL_EVENT));
  }, [open, isDesktop]);

  // Escape recoge la hoja. Si el foco estaba dentro, vuelve al disparador
  // (WCAG 2.4.3): sin esto el foco quedaría en un contenedor `inert`.
  useEffect(() => {
    if (!open || isDesktop) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const wasInside = panelRef.current?.contains(document.activeElement) ?? false;
      setOpen(false);
      if (wasInside) toggleRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, isDesktop]);

  return (
    <>
      <div className="relative grid min-h-0 flex-1 grid-cols-1 grid-rows-1 overflow-hidden lg:grid-cols-2 lg:overflow-visible">
        <section
          aria-label={textLabel}
          className="min-h-0 overflow-hidden lg:border-r lg:border-sand-200 dark:lg:border-stone-700"
        >
          {text}
        </section>

        <section
          ref={panelRef}
          id={PANEL_ID}
          aria-label={panelLabel}
          // Región colapsada: fuera del tabulador y del árbol de a11y.
          inert={!isDesktop && !open}
          className={`reader-motion relative min-h-0 max-lg:absolute max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-20 max-lg:h-[70%] max-lg:overflow-hidden max-lg:rounded-t-2xl max-lg:border-t max-lg:border-sand-200 max-lg:shadow-[0_-10px_30px_-12px_rgba(23,21,19,0.5)] max-lg:transition-transform max-lg:duration-300 max-lg:ease-out dark:max-lg:border-stone-700 ${
            open ? 'max-lg:translate-y-0' : 'max-lg:translate-y-full'
          }`}
        >
          {panel}
        </section>
      </div>

      {/* Barra inferior — solo móvil. Reúne lo que el pulgar necesita: el
          disparador del mapa y el salto de capítulo. En `lg` desaparece
          (display:none), así que el <nav> de capítulos nunca está duplicado
          en el árbol de accesibilidad: arriba en escritorio, aquí en móvil. */}
      <div
        className="flex items-center gap-2 border-t border-sand-200 bg-sand-50/95 px-3 pt-2 backdrop-blur lg:hidden dark:border-stone-700 dark:bg-stone-900/95"
        // La barra queda pegada al borde inferior: en iPhone con indicador
        // de inicio hay que apartarla de la zona segura.
        style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
      >
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={PANEL_ID}
          className="inline-flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-md border border-sand-200 bg-white/70 px-3 text-stone-700 transition-colors hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-700 dark:bg-stone-800/60 dark:text-sand-100"
        >
          <svg
            className="h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"
            />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          <span className="shrink-0 font-sans text-sm">{toggleLabel}</span>
          {activePlace && (
            <span className="truncate font-sans text-xs text-stone-500 dark:text-stone-400">
              · {activePlace}
            </span>
          )}
          <svg
            className={`reader-motion ml-auto h-4 w-4 shrink-0 transition-transform duration-300 ${
              open ? 'rotate-180' : ''
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 15l6-6 6 6" />
          </svg>
        </button>
        {chapterNav}
      </div>
    </>
  );
}
