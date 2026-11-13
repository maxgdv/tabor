// Estilos de mapa compartidos por BibleMap (lector), RouteMap (rutas),
// PlaceMap (fichas) y VisitMap (guía de visita).

import type { StyleSpecification } from 'maplibre-gl';

// Mapa actual: OpenFreeMap (datos de OpenStreetMap), gratuito, sin API key y
// sin límite de uso. Es el mapa de HOY —carreteras, pueblos, fronteras
// vigentes—, y por eso el botón dice «Mapa actual»: a quien quiere visitar
// estos lugares le sirve para orientarse, y a nadie le hace pensar que eso
// era la geografía del pasaje.
//
// Sustituye a las teselas de demostración de MapLibre (demotiles), que solo
// pintaban países en colores planos, sin una carretera ni un pueblo: no
// servían ni para leer ni para viajar. Estilo «liberty»: el más completo de
// los tres que ofrece el servicio.
export const VECTOR_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

// Fuente de los rótulos propios (regiones históricas, zonas de la guía).
// MapLibre pide los glyphs al servidor del estilo activo, así que tiene que
// existir en el de OpenFreeMap, que es el que usan los dos estilos: sirve
// Noto Sans Regular, Bold e Italic. Con un nombre que el servidor no tenga,
// el texto no se pinta.
export const MAP_LABEL_FONT = ['Noto Sans Bold'];

// Estilo satélite con teselas raster de Esri World Imagery — gratis para
// uso no comercial, atribución obligatoria visible.
export const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  // Glyphs para las capas de texto propias: el mismo servidor que usa el
  // estilo vectorial, para que MAP_LABEL_FONT valga en ambos.
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
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
