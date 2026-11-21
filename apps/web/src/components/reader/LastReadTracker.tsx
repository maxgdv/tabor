'use client';

import { useEffect } from 'react';
import { useReaderStore } from '@/lib/reader-store';
import { getLastReadSnapshot, parseLastRead, saveLastRead } from '@/lib/last-read';

// Solo el primer lector que se monta en el documento puede venir de una
// recarga; los siguientes son navegaciones dentro de la app.
let firstMountInDocument = true;

/**
 * ¿Esta página se ha cargado por una recarga (o por atrás/adelante) y no por
 * una navegación nueva? Incluye el caso que más importa: el móvil que
 * descarta la pestaña en segundo plano y la vuelve a cargar cuando el
 * usuario regresa al día siguiente.
 */
function isReload(): boolean {
  const [entry] = performance.getEntriesByType('navigation');
  const type = (entry as PerformanceNavigationTiming | undefined)?.type;
  return type === 'reload' || type === 'back_forward';
}

/** Versículo de un enlace `#v12`, o `null` si la URL no lleva ninguno. */
function hashVerse(): number | null {
  const match = window.location.hash.match(/^#v(\d+)$/);
  return match ? Number(match[1]) : null;
}

// Gestos con los que el usuario mueve la lectura (o la pone a sonar).
const USER_INPUT_EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;

/**
 * Apunta en este dispositivo el capítulo abierto y el versículo por el que
 * va la lectura, para el «Seguir leyendo» de la portada.
 *
 * Al llegar se apunta el versículo con el que se llegó: el de un enlace
 * `#v12`, el que estaba guardado si la página se ha recargado, o ninguno si
 * el capítulo se abre por el principio. Después solo se actualiza cuando el
 * usuario mueve la lectura. Las dos reglas evitan lo mismo: que la posición
 * se estropee sola. El versículo activo del store es global (recién llegados
 * todavía es el del capítulo anterior), y al colocar un versículo en
 * pantalla el lector marca como activo el que queda en la línea de lectura,
 * que es uno anterior; apuntar eso haría retroceder la posición unos
 * versículos en cada visita.
 *
 * Al recargar el mismo capítulo, además, se devuelve el texto a su sitio: el
 * panel tiene scroll propio y el navegador no lo restaura.
 *
 * Debe renderizarse ANTES que ChapterReader: los efectos de hermanos corren
 * en orden, y la petición de scroll tiene que estar hecha cuando el lector
 * monta los suyos.
 */
export function LastReadTracker({ book, chapter }: { book: string; chapter: number }) {
  useEffect(() => {
    const first = firstMountInDocument;
    firstMountInDocument = false;

    let arrival = hashVerse();
    if (arrival === null && first && isReload()) {
      const stored = parseLastRead(getLastReadSnapshot());
      if (stored?.book === book && stored.chapter === chapter && stored.verse !== null) {
        arrival = stored.verse;
        if (arrival > 1) {
          const store = useReaderStore.getState();
          store.setActiveVerse(arrival);
          store.requestScrollTo(arrival, { instant: true });
        }
      }
    }
    saveLastRead({ book, chapter, verse: arrival });

    let userMoved = false;
    const onUserInput = () => {
      userMoved = true;
      for (const type of USER_INPUT_EVENTS) window.removeEventListener(type, onUserInput, true);
    };
    for (const type of USER_INPUT_EVENTS) {
      window.addEventListener(type, onUserInput, { capture: true, passive: true });
    }

    const unsubscribe = useReaderStore.subscribe((state, previous) => {
      const verse = state.activeVerseNumber;
      if (!userMoved || verse === null || verse === previous.activeVerseNumber) return;
      saveLastRead({ book, chapter, verse });
    });

    return () => {
      unsubscribe();
      for (const type of USER_INPUT_EVENTS) window.removeEventListener(type, onUserInput, true);
    };
  }, [book, chapter]);

  return null;
}
