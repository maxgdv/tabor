// Le dice a MapLibre GL dónde está su worker. Módulo de efecto lateral: lo
// importan los cuatro mapas (lector, ficha, ruta y guía) antes de crear
// ninguno.
//
// Sin esto MapLibre 6 pide el worker «al lado» de su propio módulo, que tras
// el empaquetado es un chunk de Next, y recibe un 404: el satélite se sigue
// viendo, pero nada vectorial se pinta. El fichero lo copia a public/
// `scripts/copy-maplibre-worker.mjs` (ahí está la explicación completa), en
// una carpeta con el número de versión que aquí se reconstruye con
// `getVersion()`: las dos mitades no pueden desincronizarse.

import { getVersion, setWorkerUrl } from 'maplibre-gl';

if (typeof window !== 'undefined') {
  setWorkerUrl(`/vendor/maplibre-gl/${getVersion()}/maplibre-gl-worker.mjs`);
}
