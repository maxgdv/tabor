// Copia el worker de MapLibre GL a public/, donde el navegador puede pedirlo.
//
// POR QUÉ HACE FALTA
//
// Desde la versión 6, MapLibre GL ya no lleva el worker incrustado: lo busca
// en un fichero aparte, `maplibre-gl-worker.mjs`, «al lado» del módulo
// principal (lo deduce de `import.meta.url`). Con un empaquetador eso no
// existe —el módulo acaba dentro de un chunk de `/_next/static/chunks/`— y la
// petición da 404. El fallo es silencioso y parcial: las teselas raster
// (satélite) no usan el worker y se siguen viendo, pero todo lo vectorial
// —el mapa actual, los rótulos de las regiones históricas, las rutas— deja
// de pintarse sin un solo error en consola.
//
// La solución que documenta MapLibre es servir ese fichero uno mismo y
// decírselo con `setWorkerUrl` (ver src/components/map/worker.ts). Va en una
// carpeta con el número de versión: así una subida de la librería cambia la
// URL y ningún navegador ni CDN puede servir un worker de la versión
// anterior contra el código nuevo.
//
// Lo invoca next.config.mjs, de modo que se ejecuta en `next dev`, en
// `next build` y en el build de Vercel sin depender de cómo se lance. La
// carpeta de destino está en .gitignore: es un artefacto, no código.

import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const WORKER_FILE = 'maplibre-gl-worker.mjs';

export function copyMaplibreWorker() {
  const require = createRequire(import.meta.url);
  const packageJsonPath = require.resolve('maplibre-gl/package.json');
  const { version } = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const source = join(dirname(packageJsonPath), 'dist', WORKER_FILE);

  const vendorDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'vendor', 'maplibre-gl');
  const targetDir = join(vendorDir, version);
  const target = join(targetDir, WORKER_FILE);

  // Idempotente: next.config.mjs se evalúa varias veces durante un build.
  if (existsSync(target) && statSync(target).size === statSync(source).size) return target;

  mkdirSync(targetDir, { recursive: true });
  copyFileSync(source, target);

  // Fuera las versiones anteriores: no deben quedar desplegadas.
  for (const entry of readdirSync(vendorDir)) {
    if (entry !== version) rmSync(join(vendorDir, entry), { recursive: true, force: true });
  }
  return target;
}

// Ejecutable también a mano: `node scripts/copy-maplibre-worker.mjs`.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  console.log(`Worker de MapLibre copiado en ${copyMaplibreWorker()}`);
}
