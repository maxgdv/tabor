// Estilos de mapa compartidos por BibleMap (lector) y RouteMap (rutas).

import type { StyleSpecification } from 'maplibre-gl';

// Estilo vectorial gratuito y open-source. Para el MVP basta y no requiere
// API key. En el futuro podemos servir nuestro propio tile server.
export const VECTOR_STYLE = 'https://demotiles.maplibre.org/style.json';

// Estilo satélite con teselas raster de Esri World Imagery — gratis para
// uso no comercial, atribución obligatoria visible.
export const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  // Glyphs para capas de texto propias (rótulos de regiones y rutas);
  // el estilo vectorial de demotiles ya trae los suyos.
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
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
