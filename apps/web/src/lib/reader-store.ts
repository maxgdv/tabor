'use client';

import { create } from 'zustand';

// Estado mínimo compartido entre el lector y el mapa.
// El versículo activo es el último que ha cruzado la línea de lectura
// (definida por el IntersectionObserver del lector).
type ReaderState = {
  activeVerseNumber: number | null;
  setActiveVerse: (verse: number | null) => void;

  // Cuando el usuario hace click en un marcador del mapa, queremos
  // hacer scroll suave al primer versículo asociado a ese lugar.
  // El lector escucha esta señal con un efecto.
  //
  // `scrollInstant` pide el salto sin animación: es para devolver la lectura
  // a su sitio al recargar la página, donde un desplazamiento animado desde
  // el principio del capítulo solo estorbaría.
  scrollTarget: number | null;
  scrollInstant: boolean;
  requestScrollTo: (verse: number, options?: { instant?: boolean }) => void;
  clearScrollTarget: () => void;
};

export const useReaderStore = create<ReaderState>((set) => ({
  activeVerseNumber: null,
  setActiveVerse: (verse) => set({ activeVerseNumber: verse }),

  scrollTarget: null,
  scrollInstant: false,
  requestScrollTo: (verse, options) =>
    set({ scrollTarget: verse, scrollInstant: options?.instant ?? false }),
  clearScrollTarget: () => set({ scrollTarget: null, scrollInstant: false }),
}));
