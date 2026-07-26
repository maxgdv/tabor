// Lugares cuyo «nombre moderno» NO es una identificación.
//
// ⚠️ BORRADOR EDITORIAL — PENDIENTE DE REVISIÓN DEL MAINTAINER.
// Política del proyecto: el contenido editorial lo valida un humano antes de
// publicarse (ver CONTRIBUTING). Esta primera clasificación la propuso un
// asistente lugar por lugar sobre los 314 que hoy entran en el índice; los
// slugs están comprobados contra la BD, pero la clasificación NO está
// aprobada todavía.
//
// EL PROBLEMA QUE RESUELVE ESTE FICHERO
//
// El atlas de OpenBible.info da a cada lugar un `modern_name`. Para una
// ciudad es una identificación arqueológica de primera —Jericó es Tell es
// Sultan, Siquem es Tell Balatah, Cafarnaúm es Tell Hum—, y la ficha hace
// bien en decir «identificado con». Pero el atlas también pone un punto en
// las regiones, y ahí el `modern_name` es sólo la localidad que cae bajo ese
// punto. Presentarlo como identificación es sencillamente falso:
//
//   Egipto → «Ain Shams» (un barrio de El Cairo)
//   Asiria → «Nineveh»; Moab → «Kerak»; Edom → «Buseira»; Amón → «Amman»
//   Judea → «Jerusalem»; Líbano → «Jezzine»; Négueb → «Tel Beer Sheva»
//
// Los slugs de esta lista son los que NO deben afirmar identificación. La
// ficha los presenta como «punto marcado en el mapa», que es lo único que el
// dato dice de verdad, y el índice no los muestra.
//
// CRITERIO: entidad frente a punto
//
// No se pregunta «¿es esto una región?» sino «¿el nombre moderno nombra la
// MISMA entidad, o sólo un punto dentro de ella?».
//
//  · Nombra la misma entidad → se conserva «identificado con»: asentamientos
//    (Jericó → Tell es Sultan), ríos (Arnón → Wadi Mujib), montes concretos
//    (Monte Horeb → Jebel Musa), valles con nombre (Valle de la Sal → Es
//    Sebkha) y equivalencias reales aunque el lugar sea grande (ver la lista
//    de excepciones más abajo).
//  · Sólo un punto dentro → entra en esta lista: países, provincias,
//    territorios de pueblos, regiones, desiertos y cordilleras, más dos casos
//    vecinos que mienten igual (partes de un lugar mayor y localizaciones
//    aproximadas), separados abajo en sus propios bloques.
//
// RÍOS Y MONTES (el caso que el criterio resuelve de otra manera)
//
// «Jordán → Jordan River» no es falso, sólo redundante: es el mismo río con
// el sustantivo genérico delante. Esa redundancia no se cura con una lista
// curada sino en `places.ts`, donde `distinctModernName` ya descarta el
// nombre moderno que repite el bíblico y ahora también el que sólo le añade
// un descriptor genérico (River, Valley, Mount, Sea, Desert, Spring…). Así
// caen solos Jordán, Nilo, Éufrates, Tigris, Cedrón, Quisón, Valle de
// Hinnom, Valle de Yizreel, llanura de Sarón, Sin (desierto de Zin) y el
// estanque de Siloé. Los ríos y montes cuyo nombre moderno SÍ aporta —Arnón
// → Wadi Mujib, Yaboc → Zarqa River, Querit → Wadi al Yabis, Torrente de
// Egipto → Wadi al Arish, Monte Nebo → Jabal al Naba, Monte Tabor → Jebel et
// Tur, Monte Sinaí/Horeb → Jebel Musa— conservan la identificación: nombran
// el mismo accidente, no un pueblo de al lado.
//
// REGIONES Y ACCIDENTES QUE, AUN SIÉNDOLO, NO ENTRAN EN LA LISTA
// (el nombre moderno nombra la misma entidad, así que la afirmación es
// verdadera; si el revisor prefiere el criterio literal «toda región fuera»,
// basta con mover estos slugs a los bloques de abajo):
//
//   great-sea      Mar Grande → Mediterranean Sea   (es el Mediterráneo)
//   salt-sea       Mar de la Sal → Dead Sea         (es el mar Muerto)
//   red-sea-1/2    Mar Rojo → Gulf of Suez / Aqaba  (precisa qué brazo)
//   sea-of-galilee Mar de Galilea → Sea of Galilee   (redundante, ya se cae)
//   pathros        Patrós → Upper Egypt             (Patrós es el Alto Egipto)
//   mount-seir-1   Monte Seír → Jebel esh Shera     (la misma cordillera)
//   caphtor        Caftor → Crete                   (la misma isla)
//   tubal          Tubal → Tabal                    (el mismo país, en asirio)
//   crete, cyprus, malta, patmos                    (islas: entidad única)
//
// Y dos identificaciones que son equivalencias bíblicas, no arqueología, y
// que se conservan porque son ciertas y útiles: jebus (Jebús → Jerusalem) y
// ephrathah (Efratá → Bethlehem).
//
// Cada línea lleva el nombre en español y el `modern_name` del atlas para que
// la revisión se pueda hacer sin abrir la base de datos.

/** Países, reinos y provincias. El punto cae en su capital o en una ciudad. */
const COUNTRIES = [
  'achaia', // Acaya → Achaia (provincia romana)
  'arabia-1', // Arabia → Arabian Peninsula
  'aram', // Aram → Damascus
  'asia', // Asia → Asia (provincia romana)
  'assyria', // Asiria → Nineveh
  'babylonia', // Babilonia (el país) → Babylon
  'chaldea', // Caldea → Tell el Muqayyar (Ur)
  'cilicia', // Cilicia → Tarsus
  'cush-1', // Cus → Meroe
  'egypt', // Egipto → Ain Shams
  'elam', // Elam → Shush (Susa)
  'ethiopia', // Etiopía → Meroe
  'galatia', // Galacia → Galatia
  'greece', // Grecia → Athens
  'macedonia', // Macedonia → Macedonia
  'media', // Media → Tell Hagmatana (Ecbatana)
  'mesopotamia', // Mesopotamia → Harran
  'pamphylia', // Panfilia → Pamphylia
  'persia', // Persia → Tell Hagmatana
  'sheba-1', // Sabá → Sheba
  'shinar', // Senaar → Babylon
  'syria-1', // Siria → Damascus
  'syria-2', // Siria (provincia romana) → Damascus
];

/** Territorios de pueblos: el nombre designa a la gente y a su tierra. */
const PEOPLES = [
  'amalek', // Amalec → Ain el Qudeirat
  'ammon', // Amón → Amman
  'edom', // Edom → Buseira
  'geshur', // Guesur → Fiq
  'kedar', // Quedar → Dumat al Jandal
  'maacah', // Maacá → Tel Abel Beth Maacah (el atlas avisa: «possibly on the border»)
  'meshech', // Mesec → Gordion
  'midian', // Madián → Al Bad
  'moab-1', // Moab → Kerak
  'philistia', // Filistea → Tel Ashkelon
  'put', // Put → Cyrene
  'tarshish-1', // Tarsis → Huelva (identificación discutida, y de una tierra entera)
  'tarshish-2', // Tarsis → Huelva
  'teman', // Temán → Tawilan (el atlas: «sometimes treated as synonymous with Edom»)
  'zobah', // Sobá → Brital
];

/** Regiones y comarcas, incluidos los usos direccionales del texto. */
const REGIONS = [
  'arabah', // Arabá → Arabah
  'beyond-the-river', // Transeufratina (satrapía) → Jerusalem
  'canaan', // Canaán → Canaan
  'east', // Oriente → Amman (el atlas: «isn't necessarily depicting a specific location»)
  'galilee-1', // Galilea → Galilee
  'gilead-1', // Galaad → Tell edh Dhahab esh Sherqiyeh
  'goshen-1', // Gosen → Qantir
  'havvoth-jair', // Javot Yaír (los poblados de Jaír) → Qamm
  'jordan-valley', // Valle del Jordán → Jordan Valley
  'judea-1', // Judea → Jerusalem
  'lebanon', // Líbano (la cordillera) → Jezzine
  'moab-2', // Llanuras de Moab → Tall el Hammam
  'negeb', // Négueb → Tel Beer Sheva
  'north', // Norte (el reino seléucida) → Antioch on the Orontes
  'paddan-aram', // Padán Aram → Harran
  'samaria-2', // Samaria, la región del NT (Jn 4; Hch 8) → Samaria, la ciudad
  'sharon-1', // Sarón (la llanura) → Sharon Plain
  'shephelah', // Sefelá → Shephelah
  'south-3', // Sur (el reino ptolemaico) → Alexandria
];

/** Desiertos y cordilleras: el punto es un monte o un paraje dentro de ellos. */
const WILDERNESSES = [
  'abarim', // Abarim (la cordillera) → Abarim
  'jeshimon', // Yesimón, «el yermo» → Zahrat al Kula
  'paran', // Parán → Paran
  'shur', // Sur (el desierto) → Ar Ruwaysat
  'sin', // Sin (el desierto) → Debbet er Ramleh
  'wilderness-of-sinai', // Desierto del Sinaí → Jebel Musa (un monte, no el desierto)
  'zin-1', // Sin (el desierto de Zin) → Zin Desert
];

/**
 * Partes de un lugar mayor. Aquí el nombre moderno es el del sitio que los
 * contiene: la puerta de las Aguas no «es» Jerusalén, ni el Lugar Santo «es»
 * el monte Moria.
 */
const PARTS_OF_A_LARGER_PLACE = [
  'angle', // el Ángulo (un tramo de muralla) → Jerusalem
  'corner-gate', // Puerta del Ángulo → Jerusalem
  'holy-place-2', // Lugar Santo (una sala del Templo) → Mount Moriah
  'house-of-the-forest-of-lebanon', // Casa del Bosque del Líbano → Jerusalem
  'millo', // Miló → Jerusalem
  'most-holy-place-2', // Santo de los Santos → Mount Moriah
  'topheth', // Tofet (un punto del valle) → Hinnom Valley
  'valley-of-hebron', // Valle de Hebrón → Tel Rumeida (que es la ciudad, no el valle)
  // Sión: ver el razonamiento en el comentario de abajo.
  'zion',
];

/**
 * Localización aproximada. El atlas no identifica nada: describe una zona
 * («south of the Lisan») o pone el punto en el lugar conocido más cercano.
 * «Identificado con south of the Lisan» sería falso y además ilegible.
 */
const APPROXIMATE = [
  'admah', // Admá → south of the Lisan
  'ahava', // Ahavá (un canal sin localizar) → Babylon
  'eden-1', // Edén → Armenia
  'gomorrah', // Gomorra → south of the Lisan
  'ophir', // Ofir → southwestern Arabia
  'pi-hahiroth', // Pi Hajirot → plain near Jabal Jinayfah
  'sepharvaim', // Sefarvaim → between Damascus and Hamath
  'sodom', // Sodoma → south of the Lisan
  'zeboiim', // Seboyim → south of the Lisan
];

// --- Casos ambiguos, con el razonamiento para el revisor ---------------------
//
// SIÓN (`zion`, 143 menciones) → «Jerusalem». Sión es la colina del Templo y,
// por extensión, la ciudad y su pueblo. El dataset ya tiene `mount-zion` para
// la colina, así que este slug recoge sobre todo el uso poético. Se ha puesto
// entre las «partes de un lugar mayor» porque «Sión identificado con
// Jerusalén» presenta como hallazgo lo que es una sinécdoque bíblica, y
// porque un lector puede leerlo como que Sión es otra ciudad distinta.
//
// SAMARIA. Dos slugs con el mismo nombre y las mismas coordenadas:
// `samaria-1` (112 menciones, todas de Reyes/Profetas) es la ciudad, capital
// del reino del Norte, y conserva la identificación; `samaria-2` (13
// menciones: Lc 17,11; Jn 4; Hch 1—15) es la región del NT y entra en la
// lista. Comprobado leyendo los versículos que la BD asocia a cada uno.
//
// MOAB. `moab-1` (162 menciones) es el país; `moab-2` (12) son las «llanuras
// de Moab» de Números 22—36, una comarca junto al Jordán. Los dos son región.
//
// MONTE SEÍR (`mount-seir-1`) → «Jebel esh Shera». Seír se usa muchas veces
// como sinónimo de Edom (que sí está en la lista, porque su punto es la
// ciudad de Buseira), pero Jebel esh-Shara es exactamente esa cordillera: el
// nombre moderno nombra la misma entidad y la afirmación es verdadera.
//
// BABILONIA DE APOCALIPSIS (`babylon-3`, 6 menciones: 1P 5,13; Ap 14—18) →
// «Rome». No es arqueología sino la lectura corriente del símbolo, y es una
// identificación de ciudad a ciudad: se conserva. Si el maintainer prefiere
// no tomar partido exegético en una ficha geográfica, este es el slug a
// mover.
//
// DEDAN (`dedan`) → «Al Khuraybah». Dedán es un pueblo, pero al-Khuraybah es
// el yacimiento excavado del oasis de Dedán: identificación de verdad, se
// conserva.
//
// GOZÁN (`gozan`) → «Tell Halaf», la Guzana asiria: misma ciudad, se conserva,
// aunque el nombre valga también para el distrito.

/**
 * Slugs cuya ficha no debe afirmar «identificado con». Congelado: es un
 * dataset, no un estado.
 */
export const REGION_PLACE_SLUGS: ReadonlySet<string> = new Set([
  ...COUNTRIES,
  ...PEOPLES,
  ...REGIONS,
  ...WILDERNESSES,
  ...PARTS_OF_A_LARGER_PLACE,
  ...APPROXIMATE,
]);
