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

/** Tiempo litúrgico al que se asocia una ruta o un plan (badge en tarjetas). */
export type LiturgicalSeason = 'adviento' | 'navidad' | 'cuaresma' | 'semana-santa' | 'pascua';

export type BibleRoute = {
  slug: string;
  name: { es: string; en: string };
  description: { es: string; en: string };
  season?: LiturgicalSeason;
  stops: RouteStop[];
};

const CORE_ROUTES: BibleRoute[] = [
  {
    slug: 'ultima-semana-de-jesus',
    season: 'semana-santa',
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

const MORE_ROUTES: BibleRoute[] = [
  {
    slug: 'infancia-de-jesus',
    season: 'navidad',
    name: { es: 'La infancia de Jesús', en: 'The Infancy of Jesus' },
    description: {
      es: 'De la Anunciación en Nazaret al regreso del exilio en Egipto: los caminos de la Sagrada Familia en torno al Nacimiento.',
      en: 'From the Annunciation in Nazareth to the return from Egypt: the paths of the Holy Family around the Nativity.',
    },
    stops: [
      {
        placeSlug: 'nazareth',
        title: { es: 'Nazaret — la Anunciación', en: 'Nazareth — the Annunciation' },
        note: {
          es: 'El ángel Gabriel visita a una virgen desposada con José. El «hágase» de María abre la historia nueva.',
          en: 'The angel Gabriel visits a virgin betrothed to Joseph. Mary’s "let it be" opens the new history.',
        },
        readings: [{ book: 'LUK', chapter: 1, verses: [26, 38] }],
      },
      {
        placeSlug: 'bethlehem-1',
        title: { es: 'Belén — el Nacimiento', en: 'Bethlehem — the Nativity' },
        note: {
          es: 'Por el censo de Augusto, José sube con María a la ciudad de David. No hay sitio en la posada; hay un pesebre, pastores y un ángel.',
          en: 'For the census of Augustus, Joseph goes up with Mary to the city of David. There is no room at the inn; there is a manger, shepherds and an angel.',
        },
        readings: [
          { book: 'LUK', chapter: 2, verses: [1, 20] },
          { book: 'MAT', chapter: 2, verses: [1, 12] },
        ],
      },
      {
        placeSlug: 'jerusalem',
        title: { es: 'Jerusalén — la Presentación', en: 'Jerusalem — the Presentation' },
        note: {
          es: 'A los cuarenta días, sus padres presentan al Niño en el Templo. Simeón lo toma en brazos: «luz para alumbrar a las naciones».',
          en: 'After forty days, his parents present the Child in the Temple. Simeon takes him in his arms: "a light to enlighten the nations".',
        },
        readings: [{ book: 'LUK', chapter: 2, verses: [22, 40] }],
      },
      {
        placeSlug: 'egypt',
        title: { es: 'Egipto — la huida', en: 'Egypt — the flight' },
        note: {
          es: 'Avisado en sueños, José toma al Niño y a su madre de noche y parte a Egipto, lejos de Herodes. «De Egipto llamé a mi hijo».',
          en: 'Warned in a dream, Joseph takes the Child and his mother by night and departs for Egypt, away from Herod. "Out of Egypt I called my son".',
        },
        readings: [{ book: 'MAT', chapter: 2, verses: [13, 18] }],
      },
      {
        placeSlug: 'nazareth',
        title: { es: 'Nazaret — el regreso', en: 'Nazareth — the return' },
        note: {
          es: 'Muerto Herodes, la familia vuelve y se establece en Nazaret. Allí el Niño crece en sabiduría y gracia.',
          en: 'After Herod’s death the family returns and settles in Nazareth. There the Child grows in wisdom and grace.',
        },
        readings: [
          { book: 'MAT', chapter: 2, verses: [19, 23] },
          { book: 'LUK', chapter: 2, verses: [41, 52] },
        ],
      },
    ],
  },
  {
    slug: 'abraham',
    name: { es: 'Abraham, el camino de la fe', en: 'Abraham, the Journey of Faith' },
    description: {
      es: 'De Ur de los caldeos al monte Moria: el itinerario del padre de los creyentes, promesa a promesa.',
      en: 'From Ur of the Chaldeans to Mount Moriah: the itinerary of the father of believers, promise by promise.',
    },
    stops: [
      {
        placeSlug: 'ur-1',
        title: { es: 'Ur de los caldeos — la partida', en: 'Ur of the Chaldeans — the departure' },
        note: {
          es: 'De la gran ciudad de Mesopotamia sale la familia de Téraj camino de Canaán. Abrán va con ellos.',
          en: 'From the great Mesopotamian city, Terah’s family sets out for Canaan. Abram goes with them.',
        },
        readings: [{ book: 'GEN', chapter: 11, verses: [27, 32] }],
      },
      {
        placeSlug: 'haran',
        title: { es: 'Harán — la llamada', en: 'Haran — the call' },
        note: {
          es: '«Sal de tu tierra y de tu parentela». Con setenta y cinco años, Abrán parte sin saber a dónde va, con una promesa por equipaje.',
          en: '"Go from your land and your kindred". At seventy-five, Abram sets out not knowing where he goes, carrying a promise.',
        },
        readings: [{ book: 'GEN', chapter: 12, verses: [1, 9] }],
      },
      {
        placeSlug: 'shechem',
        title: { es: 'Siquem — la primera promesa en Canaán', en: 'Shechem — the first promise in Canaan' },
        note: {
          es: 'Junto a la encina de Moré, el Señor se aparece: «A tu descendencia daré esta tierra». Abrán levanta su primer altar.',
          en: 'By the oak of Moreh the Lord appears: "To your offspring I will give this land". Abram builds his first altar.',
        },
        readings: [{ book: 'GEN', chapter: 12, verses: [4, 9] }],
      },
      {
        placeSlug: 'bethel-1',
        title: { es: 'Betel — el altar y el nombre', en: 'Bethel — the altar and the Name' },
        note: {
          es: 'Entre Betel y Ay planta su tienda e invoca el nombre del Señor. A este altar volverá tras Egipto.',
          en: 'Between Bethel and Ai he pitches his tent and calls on the name of the Lord. He will return to this altar after Egypt.',
        },
        readings: [{ book: 'GEN', chapter: 13, verses: [1, 18] }],
      },
      {
        placeSlug: 'mamre',
        title: { es: 'Mambré — los tres visitantes', en: 'Mamre — the three visitors' },
        note: {
          es: 'A la hora del calor, tres hombres. Abraham corre, sirve, y escucha: «Por estas fechas volveré, y Sara tendrá un hijo».',
          en: 'In the heat of the day, three men. Abraham runs, serves, and hears: "I will return about this time, and Sarah shall have a son".',
        },
        readings: [
          { book: 'GEN', chapter: 18, verses: [1, 15] },
          { book: 'GEN', chapter: 21, verses: [1, 8] },
        ],
      },
      {
        placeSlug: 'moriah',
        title: { es: 'Moria — la prueba', en: 'Moriah — the test' },
        note: {
          es: 'Tres días de camino con la leña a cuestas. En el monte, Dios provee el cordero y jura colmar la promesa.',
          en: 'Three days’ walk carrying the wood. On the mount God provides the lamb and swears to fulfil the promise.',
        },
        readings: [{ book: 'GEN', chapter: 22, verses: [1, 19] }],
      },
      {
        placeSlug: 'machpelah',
        title: { es: 'Macpelá — la primera posesión', en: 'Machpelah — the first possession' },
        note: {
          es: 'Para sepultar a Sara, Abraham compra la cueva de Macpelá: el primer palmo de la tierra prometida que es suyo.',
          en: 'To bury Sarah, Abraham buys the cave of Machpelah: the first plot of the promised land that is his own.',
        },
        readings: [{ book: 'GEN', chapter: 23 }],
      },
    ],
  },
  {
    slug: 'segundo-viaje-de-pablo',
    name: { es: 'El segundo viaje de Pablo', en: 'Paul’s Second Journey' },
    description: {
      es: 'El Evangelio salta a Europa: de Antioquía a Filipos, Atenas y Corinto (Hechos 15,36-18,22).',
      en: 'The Gospel leaps into Europe: from Antioch to Philippi, Athens and Corinth (Acts 15:36-18:22).',
    },
    stops: [
      {
        placeSlug: 'antioch-1',
        title: { es: 'Antioquía — nuevos compañeros', en: 'Antioch — new companions' },
        note: {
          es: 'Pablo y Bernabé se separan por Juan Marcos. Pablo parte con Silas; en Listra se les unirá Timoteo.',
          en: 'Paul and Barnabas part over John Mark. Paul sets out with Silas; at Lystra Timothy will join them.',
        },
        readings: [{ book: 'ACT', chapter: 15, verses: [36, 41] }],
      },
      {
        placeSlug: 'troas',
        title: { es: 'Tróade — el hombre de Macedonia', en: 'Troas — the man of Macedonia' },
        note: {
          es: 'De noche, una visión: «Pasa a Macedonia y ayúdanos». El Evangelio cruza a Europa.',
          en: 'By night, a vision: "Come over to Macedonia and help us". The Gospel crosses into Europe.',
        },
        readings: [{ book: 'ACT', chapter: 16, verses: [6, 10] }],
      },
      {
        placeSlug: 'philippi',
        title: { es: 'Filipos — Lidia y el carcelero', en: 'Philippi — Lydia and the jailer' },
        note: {
          es: 'Lidia abre su casa; una paliza y un terremoto abren la del carcelero. Nace la comunidad más querida de Pablo.',
          en: 'Lydia opens her home; a beating and an earthquake open the jailer’s. Paul’s best-loved community is born.',
        },
        readings: [{ book: 'ACT', chapter: 16, verses: [11, 40] }],
      },
      {
        placeSlug: 'thessalonica',
        title: { es: 'Tesalónica — tres sábados', en: 'Thessalonica — three sabbaths' },
        note: {
          es: 'Tres sábados razonando en la sinagoga bastan para fundar una iglesia — y para levantar un tumulto.',
          en: 'Three sabbaths reasoning in the synagogue suffice to found a church — and to raise a riot.',
        },
        readings: [{ book: 'ACT', chapter: 17, verses: [1, 9] }],
      },
      {
        placeSlug: 'berea',
        title: { es: 'Berea — examinar las Escrituras', en: 'Beroea — searching the Scriptures' },
        note: {
          es: 'Los de Berea reciben la Palabra con avidez y examinan cada día las Escrituras para ver si es así.',
          en: 'The Beroeans receive the Word eagerly and examine the Scriptures daily to see if it is so.',
        },
        readings: [{ book: 'ACT', chapter: 17, verses: [10, 15] }],
      },
      {
        placeSlug: 'athens',
        title: { es: 'Atenas — el Dios desconocido', en: 'Athens — the unknown God' },
        note: {
          es: 'En el Areópago, Pablo parte del altar «al Dios desconocido» para anunciar al Resucitado. Unos se burlan; Dionisio y Dámaris creen.',
          en: 'At the Areopagus Paul starts from the altar "to the unknown God" to proclaim the Risen One. Some mock; Dionysius and Damaris believe.',
        },
        readings: [{ book: 'ACT', chapter: 17, verses: [16, 34] }],
      },
      {
        placeSlug: 'corinth',
        title: { es: 'Corinto — año y medio', en: 'Corinth — a year and a half' },
        note: {
          es: 'Con Áquila y Priscila, tejiendo tiendas. «No temas, sigue hablando: tengo un pueblo numeroso en esta ciudad».',
          en: 'With Aquila and Priscilla, making tents. "Do not be afraid, go on speaking: I have many people in this city".',
        },
        readings: [{ book: 'ACT', chapter: 18, verses: [1, 17] }],
      },
      {
        placeSlug: 'ephesus',
        title: { es: 'Éfeso — la promesa de volver', en: 'Ephesus — the promise to return' },
        note: {
          es: 'Una escala breve camino de casa: «Volveré, si Dios quiere». La cumplirá — y serán tres años.',
          en: 'A brief stop on the way home: "I will return, God willing". He will — for three years.',
        },
        readings: [{ book: 'ACT', chapter: 18, verses: [18, 22] }],
      },
    ],
  },
  {
    slug: 'viaje-a-roma',
    name: { es: 'El viaje a Roma', en: 'The Voyage to Rome' },
    description: {
      es: 'Preso y apelando al César: tempestad, naufragio en Malta y llegada a la capital del mundo (Hechos 27-28).',
      en: 'A prisoner appealing to Caesar: storm, shipwreck on Malta, and arrival at the world’s capital (Acts 27-28).',
    },
    stops: [
      {
        placeSlug: 'caesarea',
        title: { es: 'Cesarea — rumbo al César', en: 'Caesarea — bound for Caesar' },
        note: {
          es: 'Tras dos años preso, Pablo apela al César. Lo embarcan con otros presos bajo la custodia del centurión Julio.',
          en: 'After two years in custody, Paul appeals to Caesar. He is put aboard with other prisoners under the centurion Julius.',
        },
        readings: [{ book: 'ACT', chapter: 27, verses: [1, 8] }],
      },
      {
        placeSlug: 'fair-havens',
        title: { es: 'Buenos Puertos — el aviso', en: 'Fair Havens — the warning' },
        note: {
          es: '«Veo que la navegación va a ser peligrosa», advierte Pablo. El piloto y el patrón deciden seguir.',
          en: '"I perceive that the voyage will be with injury", Paul warns. The pilot and the owner decide to sail on.',
        },
        readings: [{ book: 'ACT', chapter: 27, verses: [9, 12] }],
      },
      {
        placeSlug: 'malta',
        title: { es: 'Malta — el naufragio', en: 'Malta — the shipwreck' },
        note: {
          es: 'Catorce noches de temporal y la nave encalla: los doscientos setenta y seis llegan a tierra sanos. La isla los acoge con humanidad poco común.',
          en: 'Fourteen nights of storm and the ship runs aground: all two hundred and seventy-six reach land safe. The island shows them unusual kindness.',
        },
        readings: [
          { book: 'ACT', chapter: 27, verses: [13, 44] },
          { book: 'ACT', chapter: 28, verses: [1, 10] },
        ],
      },
      {
        placeSlug: 'syracuse',
        title: { es: 'Siracusa — escala en Sicilia', en: 'Syracuse — a Sicilian stop' },
        note: {
          es: 'En una nave alejandrina que invernó en la isla, tres días en Siracusa antes de costear hacia el estrecho.',
          en: 'Aboard an Alexandrian ship that wintered in the island, three days at Syracuse before coasting toward the strait.',
        },
        readings: [{ book: 'ACT', chapter: 28, verses: [11, 13] }],
      },
      {
        placeSlug: 'puteoli',
        title: { es: 'Puteoli — hermanos en el puerto', en: 'Puteoli — brethren at the port' },
        note: {
          es: 'En el gran puerto de Italia ya hay hermanos, que les ruegan quedarse siete días. La fe llegó antes que Pablo.',
          en: 'At Italy’s great port there are already brethren, who beg them to stay seven days. The faith arrived before Paul did.',
        },
        readings: [{ book: 'ACT', chapter: 28, verses: [13, 14] }],
      },
      {
        placeSlug: 'forum-of-appius',
        title: { es: 'Foro de Apio — el ánimo', en: 'Forum of Appius — taking courage' },
        note: {
          es: 'Los hermanos de Roma salen a su encuentro hasta el Foro de Apio. Al verlos, Pablo da gracias a Dios y cobra ánimo.',
          en: 'The brethren of Rome come out to meet him as far as the Forum of Appius. Seeing them, Paul thanks God and takes courage.',
        },
        readings: [{ book: 'ACT', chapter: 28, verses: [15, 15] }],
      },
      {
        placeSlug: 'rome',
        title: { es: 'Roma — sin trabas', en: 'Rome — without hindrance' },
        note: {
          es: 'Dos años en una casa alquilada, recibiendo a todos y anunciando el Reino «con toda libertad, sin estorbo». Así termina Hechos; no la historia.',
          en: 'Two years in rented lodgings, welcoming all and proclaiming the Kingdom "with all boldness, unhindered". So ends Acts; not the story.',
        },
        readings: [{ book: 'ACT', chapter: 28, verses: [16, 31] }],
      },
    ],
  },
];

export const ROUTES: BibleRoute[] = [...CORE_ROUTES, ...MORE_ROUTES];

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
