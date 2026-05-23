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
  scrollTarget: number | null;
  requestScrollTo: (verse: number) => void;
  clearScrollTarget: () => void;
};

export const useReaderStore = create<ReaderState>((set) => ({
  activeVerseNumber: null,
  setActiveVerse: (verse) => set({ activeVerseNumber: verse }),

  scrollTarget: null,
  requestScrollTo: (verse) => set({ scrollTarget: verse }),
  clearScrollTarget: () => set({ scrollTarget: null }),
}));
