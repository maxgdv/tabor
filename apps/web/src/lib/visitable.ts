// Lugares bíblicos que hoy se pueden visitar.
//
// Qué es y qué NO es. Esto no es una guía de viajes: son datos perennes
// —qué se conserva, dónde está, qué leer allí— y nada perecedero. Sin
// horarios, sin precios, sin entradas, sin recomendaciones de agencias y
// sin valoraciones de seguridad. Un dato de viaje caducado es peor que no
// tenerlo, y este proyecto lo mantiene una sola persona.
//
// La frontera la marca el propio atlas: sólo entran topónimos que la Biblia
// nombra. Masada, Qumrán o Ein Karem son visitas magníficas y no están aquí,
// porque no son lugares bíblicos. Esa restricción es deliberada: sin ella
// esto se convierte en un TripAdvisor devocional y deja de ser TABOR.
//
// Lo que sí aporta, y no hace bien nadie: **el pasaje que leer estando
// allí**. Es el proyecto del revés — en vez de «dónde ocurrió lo que leo»,
// «qué leo ahora que estoy aquí».

import { VISITABLE_SITES } from './data/visitable-sites';

/** Bloque geográfico; el orden de publicación fue Tierra Santa primero. */
export type VisitableRegion = 'tierra-santa' | 'viajes-de-pablo';

export type VisitableSite = {
  /** Slug de `place` en la BD. */
  slug: string;
  region: VisitableRegion;
  /**
   * Qué se conserva y se ve hoy: una basílica, un parque arqueológico, un
   * tell excavado, un accidente natural. Dos o tres frases, sin adjetivos
   * de folleto.
   */
  preserved: { es: string; en: string };
  /**
   * Dónde está, en términos prácticos para quien viaja («en Cisjordania, a
   * 10 km al sur de Jerusalén»). Deliberadamente descriptivo y no
   * jurisdiccional: TABOR no toma partido sobre soberanías.
   */
  whereItIs: { es: string; en: string };
  /** El pasaje para leer en el sitio. */
  reading: { book: string; chapter: number; verses?: [number, number] };
};

/** Índice por slug, para resolver en O(1) desde la ficha del lugar. */
const BY_SLUG = new Map(VISITABLE_SITES.map((s) => [s.slug, s]));

/** Los slugs visitables, para que `isListedPlace` los publique siempre. */
export const VISITABLE_SLUGS: ReadonlySet<string> = new Set(VISITABLE_SITES.map((s) => s.slug));

export function visitableSite(slug: string): VisitableSite | null {
  return BY_SLUG.get(slug) ?? null;
}

/** Los sitios de una región, en el orden en que se declararon. */
export function sitesInRegion(region: VisitableRegion): VisitableSite[] {
  return VISITABLE_SITES.filter((s) => s.region === region);
}
