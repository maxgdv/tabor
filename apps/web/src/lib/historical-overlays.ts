// Capas históricas del mapa por época: regiones (polígonos), rutas (líneas)
// e hitos (puntos). Geometrías APROXIMADAS dibujadas a mano alzada con fines
// de lectura — los límites y recorridos antiguos son discutidos y variaron;
// la atribución del mapa los declara aproximados. Colores de la paleta de la
// app; la opacidad la aplica la capa.
//
// BORRADOR editorial, como los planes y el arte: corregir una geometría o
// una asignación es editar este fichero.

import type { PeriodId } from './periods';

type OverlayProps = { nameEs?: string; nameEn?: string; color: string };
type Geometry =
  | { type: 'Polygon'; coordinates: number[][][] }
  | { type: 'LineString'; coordinates: number[][] }
  | { type: 'Point'; coordinates: number[] };
export type OverlayFeature = { type: 'Feature'; properties: OverlayProps; geometry: Geometry };
export type OverlayCollection = { type: 'FeatureCollection'; features: OverlayFeature[] };

const polygon = (
  nameEs: string,
  nameEn: string,
  color: string,
  ring: number[][],
): OverlayFeature => ({
  type: 'Feature',
  properties: { nameEs, nameEn, color },
  geometry: { type: 'Polygon', coordinates: [[...ring, ring[0]!]] },
});

const waypoint = (nameEs: string, nameEn: string, color: string, at: number[]): OverlayFeature => ({
  type: 'Feature',
  properties: { nameEs, nameEn, color },
  geometry: { type: 'Point', coordinates: at },
});

// --- Tiempos de Jesús: regiones de la Palestina del s. I --------------------
const JESUS: OverlayCollection = {
  type: 'FeatureCollection',
  features: [
    polygon('Galilea', 'Galilee', '#6a7c49', [
      [35.1, 32.6],
      [35.55, 32.6],
      [35.62, 32.68],
      [35.62, 33.05],
      [35.35, 33.1],
      [35.1, 33.05],
      [35.05, 32.85],
    ]),
    polygon('Samaria', 'Samaria', '#a98249', [
      [34.95, 32.05],
      [35.55, 32.05],
      [35.57, 32.58],
      [35.1, 32.58],
      [34.95, 32.35],
    ]),
    polygon('Judea', 'Judaea', '#3a5a85', [
      [34.85, 31.35],
      [35.45, 31.35],
      [35.55, 31.75],
      [35.55, 32.03],
      [34.95, 32.03],
      [34.85, 31.7],
    ]),
    polygon('Idumea', 'Idumaea', '#9a5b4f', [
      [34.7, 30.85],
      [35.4, 30.9],
      [35.45, 31.33],
      [34.85, 31.33],
    ]),
    polygon('Perea', 'Peraea', '#5b7a99', [
      [35.6, 31.45],
      [35.95, 31.55],
      [35.95, 32.25],
      [35.62, 32.3],
      [35.57, 31.8],
    ]),
    polygon('Decápolis', 'Decapolis', '#7a6a8a', [
      [35.62, 32.32],
      [36.1, 32.2],
      [36.35, 32.7],
      [35.95, 33.0],
      [35.65, 32.75],
    ]),
    polygon('Fenicia', 'Phoenicia', '#4a7a7a', [
      [35.0, 33.0],
      [35.35, 33.05],
      [35.55, 33.55],
      [35.2, 33.6],
      [34.95, 33.2],
    ]),
  ],
};

// --- Reinos: Israel y Judá con sus vecinos (c. 930-722 a. C.) ---------------
const KINGDOMS: OverlayCollection = {
  type: 'FeatureCollection',
  features: [
    polygon('Reino de Israel', 'Kingdom of Israel', '#6a7c49', [
      [34.95, 31.95],
      [35.55, 31.95],
      [35.95, 32.1],
      [36.0, 32.6],
      [35.62, 33.1],
      [35.35, 33.15],
      [35.1, 33.0],
      [34.95, 32.4],
    ]),
    polygon('Reino de Judá', 'Kingdom of Judah', '#3a5a85', [
      [34.85, 31.1],
      [35.45, 31.05],
      [35.55, 31.55],
      [35.55, 31.93],
      [34.95, 31.93],
      [34.82, 31.5],
    ]),
    polygon('Filistea', 'Philistia', '#9a5b4f', [
      [34.25, 31.35],
      [34.8, 31.4],
      [34.92, 31.9],
      [34.6, 31.95],
      [34.2, 31.55],
    ]),
    polygon('Amón', 'Ammon', '#7a6a8a', [
      [35.75, 31.75],
      [36.3, 31.8],
      [36.35, 32.25],
      [35.98, 32.25],
      [35.75, 31.95],
    ]),
    polygon('Moab', 'Moab', '#a98249', [
      [35.5, 31.05],
      [36.1, 31.1],
      [36.25, 31.7],
      [35.7, 31.7],
      [35.5, 31.4],
    ]),
    polygon('Edom', 'Edom', '#8a6839', [
      [35.0, 29.8],
      [35.8, 29.9],
      [36.05, 30.9],
      [35.45, 31.0],
      [35.05, 30.4],
    ]),
    polygon('Aram', 'Aram', '#4a7a7a', [
      [35.9, 32.9],
      [36.6, 32.9],
      [36.9, 33.5],
      [36.5, 33.9],
      [35.95, 33.6],
    ]),
  ],
};

// --- Éxodo: ruta tradicional del Sinaí (aprox.) -----------------------------
const EXODUS_ROUTE_COLOR = '#8a6839';
const EXODUS: OverlayCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { color: EXODUS_ROUTE_COLOR },
      geometry: {
        type: 'LineString',
        coordinates: [
          [31.83, 30.8],
          [32.3, 30.5],
          [32.58, 29.95],
          [33.0, 29.5],
          [33.6, 28.9],
          [33.97, 28.54],
          [34.3, 29.3],
          [34.42, 30.65],
          [34.97, 29.55],
          [35.5, 30.2],
          [35.65, 31.0],
          [35.63, 31.77],
        ],
      },
    },
    waypoint('Ramesés', 'Rameses', EXODUS_ROUTE_COLOR, [31.83, 30.8]),
    waypoint('Monte Sinaí', 'Mount Sinai', EXODUS_ROUTE_COLOR, [33.97, 28.54]),
    waypoint('Cades Barnea', 'Kadesh-barnea', EXODUS_ROUTE_COLOR, [34.42, 30.65]),
    waypoint('Llanuras de Moab', 'Plains of Moab', EXODUS_ROUTE_COLOR, [35.63, 31.77]),
  ],
};

/** Capa histórica por época; las épocas sin overlay muestran solo la pastilla. */
export const HISTORICAL_OVERLAYS: Partial<Record<PeriodId, OverlayCollection>> = {
  jesus: JESUS,
  kingdoms: KINGDOMS,
  exodus: EXODUS,
};
