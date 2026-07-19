// Rutas bíblicas — itinerarios geográficos con lecturas en cada parada.
// El formato más "Tabor" posible: el mapa guía y el texto acompaña.
//
// BORRADOR EDITORIAL: la selección de paradas, lecturas y notas la propone
// el asistente y está pendiente de revisión del maintainer (como los planes
// y el arte). Cada parada referencia un lugar de la BD por su slug
// (OpenBible.info); las coordenadas y el nombre localizado se resuelven en
// el servidor al renderizar.
//
// El progreso reutiliza la maquinaria de los planes (localStorage para
// invitados, plan_progress en BD con sesión) bajo el slug `ruta-<slug>`.

import { BOOK_META } from '@tabor/db/book-meta';

export type RouteReading = {
  book: string; // canonicalId ('JHN')
  chapter: number;
  /** Rango de versículos inclusivo; ausente = capítulo entero. */
  verses?: [number, number];
};

export type RouteStop = {
  /** Slug de `place` en la BD (dataset OpenBible.info). */
  placeSlug: string;
  title: { es: string; en: string };
  note: { es: string; en: string };
  readings: RouteReading[];
};

export type BibleRoute = {
  slug: string;
  name: { es: string; en: string };
  description: { es: string; en: string };
  stops: RouteStop[];
};

export const ROUTES: BibleRoute[] = [
  {
    slug: 'ultima-semana-de-jesus',
    name: { es: 'La última semana de Jesús', en: 'The Last Week of Jesus' },
    description: {
      es: 'De la unción en Betania al encuentro de Emaús: los lugares de la Pasión, muerte y resurrección, paso a paso alrededor de Jerusalén.',
      en: 'From the anointing at Bethany to the encounter at Emmaus: the places of the Passion, death and resurrection, step by step around Jerusalem.',
    },
    stops: [
      {
        placeSlug: 'bethany-1',
        title: { es: 'Betania — la unción', en: 'Bethany — the anointing' },
        note: {
          es: 'En casa de Lázaro, María unge los pies de Jesús con perfume de nardo. Aquí se hospeda el Señor las noches de su última semana.',
          en: 'At the house of Lazarus, Mary anoints the feet of Jesus with nard. The Lord lodges here during the nights of his last week.',
        },
        readings: [{ book: 'JHN', chapter: 12, verses: [1, 11] }],
      },
      {
        placeSlug: 'bethphage',
        title: { es: 'Betfagé — la entrada en Jerusalén', en: 'Bethphage — the entry into Jerusalem' },
        note: {
          es: 'Desde la ladera del Monte de los Olivos, Jesús entra en la ciudad montado en un pollino, aclamado con ramos y hosannas.',
          en: 'From the slope of the Mount of Olives, Jesus enters the city riding a colt, acclaimed with branches and hosannas.',
        },
        readings: [{ book: 'LUK', chapter: 19, verses: [28, 44] }],
      },
      {
        placeSlug: 'jerusalem',
        title: { es: 'Jerusalén — el Templo y el Cenáculo', en: 'Jerusalem — the Temple and the Upper Room' },
        note: {
          es: 'Jesús purifica el Templo y enseña en él cada día; el jueves, en una sala alta de la ciudad, instituye la Eucaristía.',
          en: 'Jesus cleanses the Temple and teaches there daily; on Thursday, in an upper room in the city, he institutes the Eucharist.',
        },
        readings: [
          { book: 'MAT', chapter: 21, verses: [12, 17] },
          { book: 'LUK', chapter: 22, verses: [7, 38] },
        ],
      },
      {
        placeSlug: 'gethsemane',
        title: { es: 'Getsemaní — la oración y el arresto', en: 'Gethsemane — the prayer and the arrest' },
        note: {
          es: 'En el huerto de los olivos, al pie del monte, Jesús ora con sudor de sangre y es entregado con un beso.',
          en: 'In the olive grove at the foot of the mount, Jesus prays in agony and is betrayed with a kiss.',
        },
        readings: [{ book: 'MAT', chapter: 26, verses: [36, 56] }],
      },
      {
        placeSlug: 'golgotha',
        title: { es: 'Gólgota — la cruz y el sepulcro', en: 'Golgotha — the cross and the tomb' },
        note: {
          es: 'Fuera de la muralla, en el lugar llamado «de la Calavera», Jesús es crucificado y sepultado en un huerto cercano. Al tercer día, el sepulcro está vacío.',
          en: 'Outside the wall, at the place called "of the Skull", Jesus is crucified and buried in a nearby garden. On the third day, the tomb is empty.',
        },
        readings: [
          { book: 'JHN', chapter: 19, verses: [16, 42] },
          { book: 'JHN', chapter: 20, verses: [1, 18] },
        ],
      },
      {
        placeSlug: 'emmaus',
        title: { es: 'Emaús — el Resucitado en el camino', en: 'Emmaus — the Risen One on the road' },
        note: {
          es: 'Dos discípulos reconocen al Señor resucitado al partir el pan, después de que les abriera las Escrituras por el camino.',
          en: 'Two disciples recognise the risen Lord in the breaking of the bread, after he opened the Scriptures to them on the way.',
        },
        readings: [{ book: 'LUK', chapter: 24, verses: [13, 35] }],
      },
    ],
  },
  {
    slug: 'el-exodo',
    name: { es: 'El Éxodo', en: 'The Exodus' },
    description: {
      es: 'De la esclavitud de Egipto a las puertas de la Tierra Prometida: la ruta tradicional del pueblo de Israel por el desierto del Sinaí.',
      en: 'From slavery in Egypt to the threshold of the Promised Land: the traditional route of Israel through the Sinai desert.',
    },
    stops: [
      {
        placeSlug: 'rameses',
        title: { es: 'Ramesés — la salida de Egipto', en: 'Rameses — the departure from Egypt' },
        note: {
          es: 'La noche de la primera Pascua, Israel parte de Ramesés: seiscientos mil hombres a pie, con sus familias, tras cuatrocientos treinta años.',
          en: 'On the night of the first Passover, Israel sets out from Rameses after four hundred and thirty years.',
        },
        readings: [{ book: 'EXO', chapter: 12, verses: [29, 42] }],
      },
      {
        placeSlug: 'red-sea-1',
        title: { es: 'El mar Rojo — el paso', en: 'The Red Sea — the crossing' },
        note: {
          es: 'Con el ejército del faraón a la espalda, el mar se abre; Israel pasa a pie enjuto y canta la primera alabanza de su historia.',
          en: 'With Pharaoh’s army behind them, the sea parts; Israel crosses on dry ground and sings its first song of praise.',
        },
        readings: [{ book: 'EXO', chapter: 14 }],
      },
      {
        placeSlug: 'marah',
        title: { es: 'Mará — las aguas amargas', en: 'Marah — the bitter waters' },
        note: {
          es: 'Tres días sin agua, y la que encuentran es amarga. Un madero la endulza: primera prueba y primera provisión en el desierto.',
          en: 'Three days without water, and what they find is bitter. A piece of wood sweetens it: first trial and first provision in the desert.',
        },
        readings: [{ book: 'EXO', chapter: 15, verses: [22, 27] }],
      },
      {
        placeSlug: 'sin',
        title: { es: 'Desierto de Sin — el maná', en: 'Wilderness of Sin — the manna' },
        note: {
          es: 'El pueblo murmura de hambre y el cielo responde: codornices al atardecer y, cada mañana, el pan que no conocían.',
          en: 'The people grumble with hunger and heaven answers: quail at evening and, each morning, the bread they did not know.',
        },
        readings: [{ book: 'EXO', chapter: 16 }],
      },
      {
        placeSlug: 'rephidim',
        title: { es: 'Refidim — el agua de la roca', en: 'Rephidim — water from the rock' },
        note: {
          es: 'Moisés golpea la roca en Horeb y brota agua; con los brazos en alto, Israel vence a Amalec.',
          en: 'Moses strikes the rock at Horeb and water flows; with arms raised, Israel prevails over Amalek.',
        },
        readings: [{ book: 'EXO', chapter: 17 }],
      },
      {
        placeSlug: 'mount-sinai',
        title: { es: 'Monte Sinaí — la Alianza', en: 'Mount Sinai — the Covenant' },
        note: {
          es: 'Entre truenos y nube espesa, Dios sella su Alianza con Israel y entrega las diez palabras que fundan al pueblo.',
          en: 'Amid thunder and thick cloud, God seals his Covenant with Israel and gives the ten words that constitute the people.',
        },
        readings: [
          { book: 'EXO', chapter: 19 },
          { book: 'EXO', chapter: 20, verses: [1, 21] },
        ],
      },
      {
        placeSlug: 'kadesh-barnea',
        title: { es: 'Cades Barnea — los exploradores', en: 'Kadesh-barnea — the scouts' },
        note: {
          es: 'Desde aquí parten los doce a explorar Canaán. El miedo de diez pesa más que la fe de dos, y la entrada se aplaza una generación.',
          en: 'From here the twelve set out to scout Canaan. The fear of ten outweighs the faith of two, and entry is delayed a generation.',
        },
        readings: [{ book: 'NUM', chapter: 13 }],
      },
      {
        placeSlug: 'mount-hor-1',
        title: { es: 'Monte Hor — la muerte de Aarón', en: 'Mount Hor — the death of Aaron' },
        note: {
          es: 'En la frontera de Edom muere Aarón, el primer sumo sacerdote; su hijo Eleazar recibe sus vestiduras.',
          en: 'On the border of Edom Aaron dies, the first high priest; his son Eleazar receives his vestments.',
        },
        readings: [{ book: 'NUM', chapter: 20, verses: [22, 29] }],
      },
      {
        placeSlug: 'mount-nebo',
        title: { es: 'Monte Nebo — la Tierra a la vista', en: 'Mount Nebo — the Land in sight' },
        note: {
          es: 'Moisés contempla desde la cumbre toda la Tierra Prometida que no pisará, y muere allí, con los ojos sin apagarse.',
          en: 'From the summit Moses beholds the whole Promised Land he will not enter, and dies there, his sight undimmed.',
        },
        readings: [{ book: 'DEU', chapter: 34 }],
      },
    ],
  },
  {
    slug: 'primer-viaje-de-pablo',
    name: { es: 'El primer viaje de Pablo', en: 'Paul’s First Journey' },
    description: {
      es: 'De Antioquía a Chipre y el corazón de Anatolia: el primer viaje misionero de Pablo y Bernabé, ciudad a ciudad (Hechos 13-14).',
      en: 'From Antioch to Cyprus and the heart of Anatolia: the first missionary journey of Paul and Barnabas, city by city (Acts 13-14).',
    },
    stops: [
      {
        placeSlug: 'antioch-1',
        title: { es: 'Antioquía de Siria — el envío', en: 'Antioch in Syria — the sending' },
        note: {
          es: 'Mientras la comunidad celebra el culto, el Espíritu Santo pide apartar a Bernabé y Saulo. La Iglesia les impone las manos y los envía.',
          en: 'As the community worships, the Holy Spirit asks that Barnabas and Saul be set apart. The Church lays hands on them and sends them out.',
        },
        readings: [{ book: 'ACT', chapter: 13, verses: [1, 3] }],
      },
      {
        placeSlug: 'salamis',
        title: { es: 'Salamina de Chipre — primeras sinagogas', en: 'Salamis, Cyprus — first synagogues' },
        note: {
          es: 'Desembarcan en la isla de Bernabé y anuncian la Palabra en las sinagogas, con Juan Marcos como ayudante.',
          en: 'They land on Barnabas’s home island and proclaim the Word in the synagogues, with John Mark as their helper.',
        },
        readings: [{ book: 'ACT', chapter: 13, verses: [4, 5] }],
      },
      {
        placeSlug: 'paphos',
        title: { es: 'Pafos — el procónsul cree', en: 'Paphos — the proconsul believes' },
        note: {
          es: 'Frente al mago Elimas, Saulo —llamado también Pablo— deja ciego al adversario, y el procónsul Sergio Paulo abraza la fe.',
          en: 'Confronting Elymas the magician, Saul — also called Paul — blinds the adversary, and the proconsul Sergius Paulus believes.',
        },
        readings: [{ book: 'ACT', chapter: 13, verses: [6, 12] }],
      },
      {
        placeSlug: 'perga',
        title: { es: 'Perge de Panfilia — rumbo al interior', en: 'Perga in Pamphylia — inland' },
        note: {
          es: 'Saltan al continente. Juan Marcos se vuelve a Jerusalén — una despedida que años después separará a Pablo y Bernabé.',
          en: 'They cross to the mainland. John Mark turns back to Jerusalem — a parting that will later divide Paul and Barnabas.',
        },
        readings: [{ book: 'ACT', chapter: 13, verses: [13, 13] }],
      },
      {
        placeSlug: 'antioch-2',
        title: { es: 'Antioquía de Pisidia — el gran discurso', en: 'Antioch in Pisidia — the great sermon' },
        note: {
          es: 'En la sinagoga, Pablo recorre la historia de Israel hasta Jesús. Muchos creen; la oposición los empuja más adentro.',
          en: 'In the synagogue Paul traces the history of Israel up to Jesus. Many believe; opposition pushes them further inland.',
        },
        readings: [{ book: 'ACT', chapter: 13, verses: [14, 52] }],
      },
      {
        placeSlug: 'iconium',
        title: { es: 'Iconio — entre la fe y las piedras', en: 'Iconium — between faith and stones' },
        note: {
          es: 'Hablan con tal libertad que la ciudad se divide. Al saber que quieren apedrearlos, parten hacia Licaonia.',
          en: 'They speak so boldly that the city divides. Learning of a plot to stone them, they leave for Lycaonia.',
        },
        readings: [{ book: 'ACT', chapter: 14, verses: [1, 7] }],
      },
      {
        placeSlug: 'lystra',
        title: { es: 'Listra — dioses y lapidación', en: 'Lystra — gods and stoning' },
        note: {
          es: 'Curan a un tullido y los toman por Zeus y Hermes; poco después, la misma multitud apedrea a Pablo y lo da por muerto.',
          en: 'They heal a crippled man and are hailed as Zeus and Hermes; soon after, the same crowd stones Paul and leaves him for dead.',
        },
        readings: [{ book: 'ACT', chapter: 14, verses: [8, 20] }],
      },
      {
        placeSlug: 'derbe',
        title: { es: 'Derbe — y el camino de vuelta', en: 'Derbe — and the way back' },
        note: {
          es: 'Tras evangelizar Derbe, rehacen el camino confirmando a los discípulos y nombrando presbíteros, hasta rendir cuentas en Antioquía.',
          en: 'After evangelising Derbe they retrace their steps, strengthening the disciples and appointing elders, and report back at Antioch.',
        },
        readings: [{ book: 'ACT', chapter: 14, verses: [20, 28] }],
      },
    ],
  },
];

export function getRoute(slug: string): BibleRoute | null {
  return ROUTES.find((r) => r.slug === slug) ?? null;
}

/** Slug bajo el que viaja el progreso de una ruta por plan_progress. */
export function routeProgressSlug(slug: string): string {
  return `ruta-${slug}`;
}

// --- Etiquetas de lecturas ---------------------------------------------

const BOOK_NAME = new Map(BOOK_META.map((m) => [m.canonicalId, { es: m.es.name, en: m.en.name }]));

/** «Juan 12, 1-11» / «Éxodo 14» — nombre localizado + capítulo (+ versículos). */
export function routeReadingLabel(reading: RouteReading, locale: string): string {
  const names = BOOK_NAME.get(reading.book);
  const name = (locale === 'en' ? names?.en : names?.es) ?? reading.book;
  if (!reading.verses) return `${name} ${reading.chapter}`;
  const [from, to] = reading.verses;
  return from === to
    ? `${name} ${reading.chapter}, ${from}`
    : `${name} ${reading.chapter}, ${from}-${to}`;
}

/** URL del lector, con deep-link al primer versículo de la lectura. */
export function routeReadingHref(reading: RouteReading): string {
  const base = `/leer/${reading.book.toLowerCase()}/${reading.chapter}`;
  return reading.verses ? `${base}#v${reading.verses[0]}` : base;
}
