// A qué zona de Tierra Santa pertenece cada lugar visitable.
//
// Por qué una lista curada y no una regla sobre las coordenadas: el criterio
// de agrupación no es geométrico sino de viaje. Belén está a ocho kilómetros
// de Jerusalén y ningún radio la separaría de ella, pero quien busca «qué ver
// en Tierra Santa» las tiene en la cabeza como dos días distintos. Lo mismo
// con el Carmelo, que geográficamente es el extremo de Galilea y en cualquier
// itinerario real se visita subiendo por la costa.
//
// La lista cubre de sobra los topónimos de Tierra Santa del atlas, no sólo los
// publicados hoy como visitables: así, cuando entre un sitio nuevo, ya tiene
// zona. Lo que no esté aquí cae en el reparto por coordenadas de `visit.ts`,
// que acierta en lo grueso y nunca deja un sitio fuera de la guía.
//
// Las zonas describen paisaje y recorrido, no jurisdicciones: Tabor no toma
// partido sobre soberanías, ni aquí ni en el texto de cada sitio.

import type { VisitAreaId } from '@/lib/visit';

/** Slugs de `place` por zona. El orden dentro de cada lista es indiferente. */
const AREA_SLUGS: Record<VisitAreaId, readonly string[]> = {
  // Jerusalén y lo que se recorre desde ella en una mañana: el monte de los
  // Olivos, los valles que ciñen la ciudad y los pueblos de Betania y Betfagé.
  jerusalen: [
    'jerusalem',
    'mount-moriah',
    'zion',
    'mount-zion',
    'city-of-david',
    'jebus',
    'ophel',
    'millo',
    'gihon-2',
    'siloam',
    'bethesda',
    'kidron',
    'valley-of-hinnom',
    'topheth',
    'en-rogel',
    'valley-of-rephaim',
    'mount-of-olives',
    'gethsemane',
    'golgotha',
    'bethany-1',
    'bethphage',
    'emmaus',
    'bahurim',
    'nob',
    'anathoth',
    'ramah-1',
    'naioth',
    'gibeah-1',
    'geba-1',
    'michmash',
    'gibeon',
    'mizpah-3',
    'beeroth',
    'kiriath-jearim',
  ],
  // La montaña de Judá al sur de Jerusalén: Belén, Hebrón y el desierto que
  // baja hacia el Négueb.
  judea: [
    'bethlehem-1',
    'tekoa',
    'netophah',
    'hushah',
    'hebron',
    'machpelah',
    'mamre',
    'carmel-1',
    'ziph-1',
    'horesh',
    'jattir',
    'debir-1',
    'adullam',
    'keilah',
    'beersheba-1',
    'beersheba-2',
    'negeb',
    'arabah',
    'kadesh-barnea',
  ],
  // La falla del Jordán, de norte a sur: Jericó, el río, el mar Muerto y la
  // orilla de enfrente, con el Nebo asomado a la Tierra prometida.
  jordan: [
    'jordan',
    'jordan-valley',
    'jericho-1',
    'jericho-2',
    // Betania «al otro lado del Jordán», la del bautismo, que no es la de
    // Lázaro: el atlas las distingue por el sufijo y aquí caen en zonas
    // distintas.
    'bethany-2',
    'gilgal-1',
    'valley-of-achor',
    'jeshimon',
    'engedi',
    'salt-sea',
    'sodom',
    'gomorrah',
    'zoar',
    'aenon',
    'salim',
    'shittim',
    'moab-2',
    'beth-jeshimoth',
    'mount-nebo',
    'nebo-1',
    'pisgah',
    'abarim',
    'medeba',
    'heshbon',
    'arnon',
    'valley-of-the-arnon',
    'moab-1',
  ],
  // Galilea entera: el lago y sus pueblos, Nazaret, el Tabor, la llanura de
  // Jezrael y el norte del Hermón.
  galilea: [
    'galilee-1',
    'nazareth',
    'cana',
    'capernaum',
    'magdala',
    'chorazin',
    'bethsaida-1',
    'bethsaida-2',
    'sea-of-galilee',
    'gennesaret',
    'tiberias',
    'mount-tabor',
    'nain',
    'shunem',
    'ophrah-2',
    'caesarea-philippi',
    'mount-hermon',
    'dan',
    'hazor-1',
    'kedesh-1',
    'abel-beth-maacah',
    'decapolis',
    'geshur',
    'golan',
    'bashan',
    'beth-shan',
    'megiddo',
    'taanach',
    'jezreel-2',
    'valley-of-jezreel',
    'mount-gilboa',
    'kishon',
  ],
  // La montaña central entre Jerusalén y Galilea: Siquem al pie del Garizín,
  // Silo, Betel y la Samaría de los Omridas.
  samaria: [
    'samaria-1',
    'samaria-2',
    'shechem',
    'sychar',
    'mount-gerizim',
    'mount-ebal',
    'shiloh',
    'bethel-1',
    'luz-1',
    'ai-1',
    'tirzah',
    'pirathon',
    'ephraim-1',
    'ephraim-2',
    'arimathea',
    'beth-horon',
    'lower-beth-horon',
  ],
  // De Tiro a Gaza por el mar, con el Carmelo y la Sefelá: la franja llana
  // por la que pasó todo el que venía de fuera.
  costa: [
    'great-sea',
    'mount-carmel',
    'jokneam',
    'ptolemais',
    'tyre',
    'sidon',
    'zarephath',
    'phoenicia',
    'caesarea',
    'sharon-1',
    'joppa',
    'lod',
    'ono',
    'harim',
    'aijalon-1',
    'gezer',
    'shephelah',
    'beth-shemesh-1',
    'zorah',
    'eshtaol',
    'timnah-1',
    'azekah',
    // El valle de Elá abre la Sefelá desde la llanura filistea: por ahí
    // subieron los filisteos a los que salió David.
    'valley-of-elah',
    'jarmuth-1',
    'makkedah',
    'libnah-1',
    'lachish',
    'mareshah',
    'eglon',
    'philistia',
    'gath-1',
    'ekron',
    'gibbethon',
    'ashdod',
    'ashkelon',
    'gaza',
    'gerar',
    'ziklag',
  ],
};

/** Slug → zona, aplanado una sola vez al cargar el módulo. */
export const AREA_BY_SLUG: ReadonlyMap<string, VisitAreaId> = new Map(
  Object.entries(AREA_SLUGS).flatMap(([area, slugs]) =>
    slugs.map((slug) => [slug, area as VisitAreaId] as const),
  ),
);
