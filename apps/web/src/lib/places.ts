// Lugares bíblicos como páginas propias.
//
// El texto de los capítulos está en decenas de sitios con veinte años de
// antigüedad; el dataset geográfico no. 1.277 lugares con coordenadas, nombre
// curado en español y los versículos exactos que los mencionan es lo único
// que Tabor tiene y nadie más. Este módulo reúne lo que comparten el índice,
// la ficha de cada lugar y el sitemap: qué lugares merecen página, cómo se
// ordenan y cómo se presenta el nombre moderno.
//
// Aquí solo hay lógica pura y comprobable; las consultas viven en
// `places-data.ts` para que este módulo se pueda probar sin levantar la BD.

import type { DbPlaceMention } from '@tabor/db';
import { REGION_PLACE_SLUGS } from '@/lib/data/place-regions';
import { ROUTES, type BibleRoute } from '@/lib/routes';
import { VISITABLE_SLUGS } from '@/lib/visitable';

/**
 * Menciones mínimas para que un lugar entre en el índice y en el sitemap.
 * Con 5 salen 273 lugares, todos con material suficiente para una página que
 * se sostenga sola.
 */
export const PLACE_MIN_MENTIONS = 5;

/**
 * Versículos que se listan como máximo en una ficha. El reparto es muy
 * desigual (Jerusalén: 948; Betania: 12) y volcarlos todos daría una página
 * inmanejable. `mentionCount` permite decir cuántos quedan fuera.
 */
export const PLACE_MENTION_LIMIT = 120;

/** Lugares que son parada de alguna ruta. */
const ROUTE_PLACE_SLUGS: ReadonlySet<string> = new Set(
  ROUTES.flatMap((route) => route.stops.map((stop) => stop.placeSlug)),
);

/** Rutas con una parada en este lugar — enlazado interno entre las dos secciones. */
export function routesForPlace(slug: string): BibleRoute[] {
  return ROUTES.filter((route) => route.stops.some((stop) => stop.placeSlug === slug));
}

/**
 * ¿Merece este lugar estar en el índice y en el sitemap?
 *
 * El corte de menciones deja fuera lugares de primera magnitud para quien
 * busca —Getsemaní (2), Gólgota (4), Emaús (3), Patmos (1)— porque el Nuevo
 * Testamento los nombra pocas veces. Los que además son parada de una ruta
 * entran igualmente: están curados editorialmente y son justo los que la
 * gente escribe en el buscador.
 *
 * Lo mismo con los sitios visitables: Magdala no tiene ni una mención
 * enlazada en el atlas y es parada obligada de cualquier peregrinación a
 * Galilea. Si se publica como visitable, tiene ficha.
 */
export function isListedPlace(place: { slug: string; mentionCount: number }): boolean {
  return (
    place.mentionCount >= PLACE_MIN_MENTIONS ||
    ROUTE_PLACE_SLUGS.has(place.slug) ||
    VISITABLE_SLUGS.has(place.slug)
  );
}

// --- Presentación del nombre moderno ---------------------------------------

/** Minúsculas sin diacríticos ni signos: para comparar nombres, no para mostrar. */
function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

/** «Bethany 1» → «Bethany»: el sufijo desambigua homónimos en el dataset. */
function stripDisambiguation(name: string): string {
  return name.replace(/\s+\d+$/, '');
}

/**
 * Sustantivos genéricos con los que el atlas envuelve un topónimo. Sólo en
 * inglés: la repetición viene siempre del nombre canónico, que es inglés
 * («Kidron» → «Kidron River»), nunca del nombre español visible.
 */
const GEOGRAPHIC_DESCRIPTORS: ReadonlySet<string> = new Set([
  'mount',
  'mt',
  'mountain',
  'mountains',
  'river',
  'valley',
  'sea',
  'lake',
  'desert',
  'wilderness',
  'spring',
  'pool',
  'plain',
  'plains',
  'brook',
  'gulf',
  'of',
  'the',
]);

/**
 * Palabras propias del nombre, ordenadas: «Valley of Jezreel» y «Jezreel
 * Valley» dan lo mismo, y «Jordan» y «Jordan River» también. Devuelve cadena
 * vacía si no queda nada propio (nombres que son sólo descriptores).
 */
function significantTokens(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token && !GEOGRAPHIC_DESCRIPTORS.has(token))
    .sort()
    .join(' ');
}

/**
 * Nombre moderno solo cuando aporta algo. El dataset repite el nombre bíblico
 * en la mitad de los casos (Jerusalem → Jerusalem, Patmos → Patmos) y
 * mostrarlo entonces es ruido; se compara contra el nombre visible y contra
 * el canónico en inglés, que es la forma de la que suele venir la repetición.
 *
 * También se descarta la repetición con descriptor —Jordán → «Jordan River»,
 * Valle de Hinnom → «Hinnom Valley», Siloé → «Pool of Siloam»—: no es falsa,
 * pero es el mismo nombre con el sustantivo genérico delante o detrás. Los
 * ríos, montes y valles cuyo nombre moderno sí aporta (Arnón → Wadi Mujib,
 * Monte Nebo → Jabal al Naba) sobreviven al filtro y conservan por tanto su
 * identificación: nombran el mismo accidente, no un punto de al lado.
 */
export function distinctModernName(place: {
  name: string;
  canonicalName: string;
  modernName: string | null;
}): string | null {
  if (!place.modernName) return null;
  const modern = fold(place.modernName);
  if (!modern) return null;
  const canonical = stripDisambiguation(place.canonicalName);
  if (modern === fold(place.name)) return null;
  if (modern === fold(canonical)) return null;
  const modernTokens = significantTokens(place.modernName);
  if (
    modernTokens &&
    (modernTokens === significantTokens(place.name) ||
      modernTokens === significantTokens(canonical))
  ) {
    return null;
  }
  return place.modernName;
}

/**
 * ¿Es este lugar una región (o un país, un pueblo, un accidente extenso) en
 * la que el `modern_name` del atlas es sólo un punto representativo?
 *
 * La lista curada vive en `data/place-regions.ts`, con el criterio y el
 * razonamiento de los casos dudosos.
 */
export function isRegionPlace(slug: string): boolean {
  return REGION_PLACE_SLUGS.has(slug);
}

/**
 * Cómo presentar el nombre moderno: `identifies` distingue la identificación
 * arqueológica de un asentamiento (Cafarnaúm es Tell Hum) del punto que el
 * atlas marca dentro de una región (Egipto no es Ain Shams, un barrio de El
 * Cairo). La ficha usa una etiqueta distinta para cada caso; el índice, donde
 * no cabe matizar, sólo muestra el primero.
 */
export type ModernNameDisplay = { name: string; identifies: boolean };

export function modernNameDisplay(place: {
  slug: string;
  name: string;
  canonicalName: string;
  modernName: string | null;
}): ModernNameDisplay | null {
  const name = distinctModernName(place);
  if (!name) return null;
  return { name, identifies: !isRegionPlace(place.slug) };
}

// --- Agrupación del índice --------------------------------------------------

/**
 * Inicial con la que se agrupa un lugar en el índice: mayúscula sin
 * diacríticos (Éfeso → E, Ñ → N, para que el alfabeto no se fragmente entre
 * español e inglés). Lo que no es letra latina cae en '#'.
 */
export function indexLetter(name: string): string {
  const first = name.trim().normalize('NFD').replace(/\p{M}/gu, '').charAt(0).toUpperCase();
  return /^[A-Z]$/.test(first) ? first : '#';
}

export type PlaceLetterGroup<T> = { letter: string; places: T[] };

/**
 * Lugares ordenados alfabéticamente y partidos por inicial. El grupo '#'
 * (nombres que no empiezan por letra latina) va al final.
 */
export function groupPlacesByLetter<T extends { name: string }>(
  places: readonly T[],
  locale: string,
): PlaceLetterGroup<T>[] {
  const collator = new Intl.Collator(locale, { sensitivity: 'base', numeric: true });
  const sorted = [...places].sort((a, b) => {
    const la = indexLetter(a.name);
    const lb = indexLetter(b.name);
    if (la !== lb) {
      if (la === '#') return 1;
      if (lb === '#') return -1;
      return la < lb ? -1 : 1;
    }
    return collator.compare(a.name, b.name);
  });

  const groups: PlaceLetterGroup<T>[] = [];
  for (const place of sorted) {
    const letter = indexLetter(place.name);
    const last = groups.at(-1);
    if (last && last.letter === letter) last.places.push(place);
    else groups.push({ letter, places: [place] });
  }
  return groups;
}

/** Los `n` lugares más mencionados, de más a menos. */
export function mostMentioned<T extends { mentionCount: number }>(
  places: readonly T[],
  n: number,
): T[] {
  return [...places].sort((a, b) => b.mentionCount - a.mentionCount).slice(0, n);
}

// --- Agrupación de los pasajes ---------------------------------------------

export type MentionBookGroup = {
  bookCanonicalId: string;
  bookName: string;
  bookUrlSegment: string;
  mentions: DbPlaceMention[];
};

/**
 * Menciones partidas por libro. Vienen ya en orden canónico, así que basta
 * con cortar cada vez que cambia el libro (nada de reordenar ni de mapas
 * intermedios que perderían el orden bíblico).
 */
export function groupMentionsByBook(mentions: readonly DbPlaceMention[]): MentionBookGroup[] {
  const groups: MentionBookGroup[] = [];
  for (const mention of mentions) {
    const last = groups.at(-1);
    if (last && last.bookCanonicalId === mention.bookCanonicalId) {
      last.mentions.push(mention);
      continue;
    }
    groups.push({
      bookCanonicalId: mention.bookCanonicalId,
      bookName: mention.bookName,
      bookUrlSegment: mention.bookUrlSegment,
      mentions: [mention],
    });
  }
  return groups;
}
