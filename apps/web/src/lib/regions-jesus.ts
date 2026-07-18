// Regiones de la Palestina del siglo I para la capa histórica «Tiempos de
// Jesús». Límites APROXIMADOS dibujados a mano alzada con fines de lectura
// (los límites antiguos son discutidos y variaron durante el propio s. I);
// la interfaz los declara aproximados. Colores de la paleta de la app, con
// la opacidad aplicada en la capa del mapa.

export type RegionFeature = {
  type: 'Feature';
  properties: { nameEs: string; nameEn: string; color: string };
  geometry: { type: 'Polygon'; coordinates: number[][][] };
};

export const JESUS_REGIONS: { type: 'FeatureCollection'; features: RegionFeature[] } = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { nameEs: 'Galilea', nameEn: 'Galilee', color: '#6a7c49' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [35.1, 32.6],
            [35.55, 32.6],
            [35.62, 32.68],
            [35.62, 33.05],
            [35.35, 33.1],
            [35.1, 33.05],
            [35.05, 32.85],
            [35.1, 32.6],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { nameEs: 'Samaria', nameEn: 'Samaria', color: '#a98249' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [34.95, 32.05],
            [35.55, 32.05],
            [35.57, 32.58],
            [35.1, 32.58],
            [34.95, 32.35],
            [34.95, 32.05],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { nameEs: 'Judea', nameEn: 'Judaea', color: '#3a5a85' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [34.85, 31.35],
            [35.45, 31.35],
            [35.55, 31.75],
            [35.55, 32.03],
            [34.95, 32.03],
            [34.85, 31.7],
            [34.85, 31.35],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { nameEs: 'Idumea', nameEn: 'Idumaea', color: '#9a5b4f' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [34.7, 30.85],
            [35.4, 30.9],
            [35.45, 31.33],
            [34.85, 31.33],
            [34.7, 30.85],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { nameEs: 'Perea', nameEn: 'Peraea', color: '#5b7a99' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [35.6, 31.45],
            [35.95, 31.55],
            [35.95, 32.25],
            [35.62, 32.3],
            [35.57, 31.8],
            [35.6, 31.45],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { nameEs: 'Decápolis', nameEn: 'Decapolis', color: '#7a6a8a' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [35.62, 32.32],
            [36.1, 32.2],
            [36.35, 32.7],
            [35.95, 33.0],
            [35.65, 32.75],
            [35.62, 32.32],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { nameEs: 'Fenicia', nameEn: 'Phoenicia', color: '#4a7a7a' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [35.0, 33.0],
            [35.35, 33.05],
            [35.55, 33.55],
            [35.2, 33.6],
            [34.95, 33.2],
            [35.0, 33.0],
          ],
        ],
      },
    },
  ],
};
