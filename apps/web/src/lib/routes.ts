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
        title: {
          es: 'Betfagé — la entrada en Jerusalén',
          en: 'Bethphage — the entry into Jerusalem',
        },
        note: {
          es: 'Desde la ladera del Monte de los Olivos, Jesús entra en la ciudad montado en un pollino, aclamado con ramos y hosannas.',
          en: 'From the slope of the Mount of Olives, Jesus enters the city riding a colt, acclaimed with branches and hosannas.',
        },
        readings: [{ book: 'LUK', chapter: 19, verses: [28, 44] }],
      },
      {
        placeSlug: 'jerusalem',
        title: {
          es: 'Jerusalén — el Templo y el Cenáculo',
          en: 'Jerusalem — the Temple and the Upper Room',
        },
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
        title: {
          es: 'Getsemaní — la oración y el arresto',
          en: 'Gethsemane — the prayer and the arrest',
        },
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
        title: {
          es: 'Emaús — el Resucitado en el camino',
          en: 'Emmaus — the Risen One on the road',
        },
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
        // Ex 14, 2 sitúa el paso en el campamento de Fihahirot, «entre Migdol
        // y el mar»: la franja de lagos del istmo de Suez (el «mar de las
        // Cañas» hebreo), no el mar Rojo profundo de red-sea-1.
        placeSlug: 'pi-hahiroth',
        title: { es: 'Fihahirot — el paso del mar', en: 'Pi-hahiroth — the crossing of the sea' },
        note: {
          es: 'Acampados «entre Migdol y el mar», con el ejército del faraón a la espalda, el mar se abre; Israel pasa a pie enjuto y canta la primera alabanza de su historia. El hebreo lo llama yam suf, «mar de las Cañas»: los lagos poco profundos del istmo de Suez.',
          en: 'Camped "between Migdol and the sea", with Pharaoh’s army behind them, the sea parts; Israel crosses on dry ground and sings its first song of praise. The Hebrew calls it yam suph, the "Sea of Reeds": the shallow lakes of the isthmus of Suez.',
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
        title: {
          es: 'Salamina de Chipre — primeras sinagogas',
          en: 'Salamis, Cyprus — first synagogues',
        },
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
        title: {
          es: 'Antioquía de Pisidia — el gran discurso',
          en: 'Antioch in Pisidia — the great sermon',
        },
        note: {
          es: 'En la sinagoga, Pablo recorre la historia de Israel hasta Jesús. Muchos creen; la oposición los empuja más adentro.',
          en: 'In the synagogue Paul traces the history of Israel up to Jesus. Many believe; opposition pushes them further inland.',
        },
        readings: [{ book: 'ACT', chapter: 13, verses: [14, 52] }],
      },
      {
        placeSlug: 'iconium',
        title: {
          es: 'Iconio — entre la fe y las piedras',
          en: 'Iconium — between faith and stones',
        },
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
        // La STRA sigue la numeración de la Vulgata: Hch 14 acaba en el v. 27.
        readings: [{ book: 'ACT', chapter: 14, verses: [20, 27] }],
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
        title: {
          es: 'Siquem — la primera promesa en Canaán',
          en: 'Shechem — the first promise in Canaan',
        },
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

const HEROES_ROUTES: BibleRoute[] = [
  {
    slug: 'elias',
    name: { es: 'Elías, el profeta del fuego', en: 'Elijah, the Prophet of Fire' },
    description: {
      es: 'Del arroyo Querit al carro de fuego: la geografía del profeta que caminó hasta el Horeb para oír una brisa suave (1 Reyes 17 - 2 Reyes 2).',
      en: 'From the brook Cherith to the chariot of fire: the geography of the prophet who walked to Horeb to hear a gentle whisper (1 Kings 17 - 2 Kings 2).',
    },
    stops: [
      {
        placeSlug: 'cherith',
        title: {
          es: 'El arroyo Querit — alimentado por cuervos',
          en: 'The Brook Cherith — fed by ravens',
        },
        note: {
          es: 'Anunciada la sequía a Ajab, Elías se esconde junto al torrente: agua del arroyo y pan que traen los cuervos, mañana y tarde.',
          en: 'Having announced the drought to Ahab, Elijah hides by the brook: water from the stream and bread brought by ravens, morning and evening.',
        },
        readings: [{ book: '1KI', chapter: 17, verses: [1, 7] }],
      },
      {
        placeSlug: 'zarephath',
        title: { es: 'Sarepta — la viuda y el aceite', en: 'Zarephath — the widow and the oil' },
        note: {
          es: 'En tierra pagana, una viuda comparte su último puñado de harina. Ni la harina ni el aceite se acaban, y su hijo vuelve a la vida.',
          en: 'In pagan territory a widow shares her last handful of flour. Neither the flour nor the oil runs out, and her son is restored to life.',
        },
        readings: [{ book: '1KI', chapter: 17, verses: [8, 24] }],
      },
      {
        placeSlug: 'mount-carmel',
        title: { es: 'Monte Carmelo — el fuego del cielo', en: 'Mount Carmel — fire from heaven' },
        note: {
          es: '«¿Hasta cuándo cojearéis con los dos pies?». Contra cuatrocientos cincuenta profetas de Baal, cae el fuego y el pueblo cae de rodillas.',
          en: '"How long will you limp between two opinions?" Against four hundred and fifty prophets of Baal, the fire falls and the people fall to their knees.',
        },
        readings: [{ book: '1KI', chapter: 18, verses: [20, 46] }],
      },
      {
        placeSlug: 'beersheba-1',
        title: { es: 'Berseba — el pan del ángel', en: 'Beersheba — the angel’s bread' },
        note: {
          es: 'Huyendo de Jezabel, el profeta se rinde bajo la retama: «Basta ya, Señor». Un ángel lo despierta dos veces: «Levántate y come; el camino es largo».',
          en: 'Fleeing Jezebel, the prophet gives up under the broom tree: "It is enough, Lord". An angel wakes him twice: "Arise and eat; the journey is long".',
        },
        readings: [{ book: '1KI', chapter: 19, verses: [1, 8] }],
      },
      {
        placeSlug: 'mount-horeb',
        title: { es: 'Monte Horeb — la brisa suave', en: 'Mount Horeb — the gentle whisper' },
        note: {
          es: 'Cuarenta días hasta el monte de Moisés. Ni el huracán, ni el terremoto, ni el fuego: el Señor pasa en el susurro de una brisa.',
          en: 'Forty days to the mountain of Moses. Not the wind, nor the earthquake, nor the fire: the Lord passes in the sound of a gentle whisper.',
        },
        readings: [{ book: '1KI', chapter: 19, verses: [9, 18] }],
      },
      {
        placeSlug: 'jezreel-2',
        title: { es: 'Yizreel — la viña de Nabot', en: 'Jezreel — Naboth’s vineyard' },
        note: {
          es: 'Un rey que codicia, una reina que mata, y el profeta que baja a la viña robada: «¿Has asesinado y además heredas?».',
          en: 'A coveting king, a murdering queen, and the prophet who comes down to the stolen vineyard: "Have you killed and also taken possession?".',
        },
        readings: [{ book: '1KI', chapter: 21 }],
      },
      {
        placeSlug: 'jordan',
        title: { es: 'El Jordán — el carro de fuego', en: 'The Jordan — the chariot of fire' },
        note: {
          es: 'El manto golpea las aguas y se abren. Al otro lado, un torbellino se lleva a Elías, y Eliseo recoge el manto que cae.',
          en: 'The mantle strikes the waters and they part. On the far side a whirlwind takes Elijah up, and Elisha picks up the fallen mantle.',
        },
        readings: [{ book: '2KI', chapter: 2, verses: [1, 14] }],
      },
    ],
  },
  {
    slug: 'david',
    name: { es: 'David, del rebaño al trono', en: 'David, from Flock to Throne' },
    description: {
      es: 'De la unción secreta en Belén a la Ciudad de David: el largo camino del pastor ungido, huida a huida, hasta el trono (1 Samuel 16 - 2 Samuel 6).',
      en: 'From the secret anointing at Bethlehem to the City of David: the long road of the anointed shepherd, flight after flight, to the throne (1 Samuel 16 - 2 Samuel 6).',
    },
    stops: [
      {
        placeSlug: 'bethlehem-1',
        title: { es: 'Belén — la unción', en: 'Bethlehem — the anointing' },
        note: {
          es: 'Samuel descarta a siete hermanos; falta el menor, que guarda el rebaño. «El hombre mira las apariencias; el Señor mira el corazón».',
          en: 'Samuel passes over seven brothers; the youngest is missing, keeping the sheep. "Man looks on the outward appearance; the Lord looks on the heart".',
        },
        readings: [{ book: '1SA', chapter: 16, verses: [1, 13] }],
      },
      {
        placeSlug: 'valley-of-elah',
        title: { es: 'El valle del Terebinto — Goliat', en: 'The Valley of Elah — Goliath' },
        note: {
          es: 'Cuarenta días de desafío y un zagal con cinco piedras: «Tú vienes con espada y lanza; yo voy contra ti en nombre del Señor de los ejércitos».',
          en: 'Forty days of defiance and a shepherd boy with five stones: "You come with sword and spear; I come against you in the name of the Lord of hosts".',
        },
        readings: [{ book: '1SA', chapter: 17 }],
      },
      {
        placeSlug: 'adullam',
        title: {
          es: 'La cueva de Adulam — los descartados',
          en: 'The Cave of Adullam — the outcasts',
        },
        note: {
          es: 'Huyendo de Saúl, David se refugia en la cueva. Se le unen los apurados, los endeudados y los amargados: cuatrocientos hombres — el germen de un reino.',
          en: 'Fleeing Saul, David shelters in the cave. The distressed, the indebted and the bitter gather to him: four hundred men — the seed of a kingdom.',
        },
        readings: [{ book: '1SA', chapter: 22, verses: [1, 5] }],
      },
      {
        placeSlug: 'engedi',
        title: { es: 'Engadí — perdonar al rey', en: 'En-gedi — sparing the king' },
        note: {
          es: 'Saúl duerme al alcance de su lanza en la cueva, y David corta solo la orla de su manto: «No alzaré mi mano contra el ungido del Señor».',
          en: 'Saul sleeps within reach in the cave, and David cuts only the corner of his robe: "I will not raise my hand against the Lord’s anointed".',
        },
        readings: [{ book: '1SA', chapter: 24 }],
      },
      {
        placeSlug: 'ziklag',
        title: { es: 'Siquelag — la hora más baja', en: 'Ziklag — the darkest hour' },
        note: {
          es: 'La ciudad arrasada, las familias cautivas, y sus propios hombres hablando de apedrearlo. «David se fortaleció en el Señor su Dios» — y lo recuperó todo.',
          en: 'The town burned, the families taken, and his own men speaking of stoning him. "David strengthened himself in the Lord his God" — and recovered all.',
        },
        readings: [{ book: '1SA', chapter: 30 }],
      },
      {
        placeSlug: 'hebron',
        title: { es: 'Hebrón — rey al fin', en: 'Hebron — king at last' },
        note: {
          es: 'Muerto Saúl, Judá unge a David en Hebrón; siete años después, todo Israel. El pastor de Belén tiene treinta años.',
          en: 'After Saul’s death, Judah anoints David at Hebron; seven years later, all Israel. The shepherd of Bethlehem is thirty years old.',
        },
        readings: [
          { book: '2SA', chapter: 2, verses: [1, 7] },
          { book: '2SA', chapter: 5, verses: [1, 5] },
        ],
      },
      {
        placeSlug: 'jerusalem',
        title: { es: 'Jerusalén — la Ciudad de David', en: 'Jerusalem — the City of David' },
        note: {
          es: 'Toma la fortaleza jebusea y sube el Arca entre danzas: la ciudad conquistada se convierte en la ciudad santa.',
          en: 'He takes the Jebusite stronghold and brings up the Ark with dancing: the conquered city becomes the holy city.',
        },
        readings: [
          { book: '2SA', chapter: 5, verses: [6, 16] },
          { book: '2SA', chapter: 6, verses: [12, 19] },
        ],
      },
    ],
  },
  {
    slug: 'tercer-viaje-de-pablo',
    name: { es: 'El tercer viaje de Pablo', en: 'Paul’s Third Journey' },
    description: {
      es: 'Tres años en Éfeso y la larga subida a Jerusalén, despedida a despedida: el viaje del adiós (Hechos 18,23-21,17).',
      en: 'Three years at Ephesus and the long road up to Jerusalem, farewell after farewell: the journey of goodbyes (Acts 18:23-21:17).',
    },
    stops: [
      {
        placeSlug: 'ephesus',
        title: {
          es: 'Éfeso — tres años que cambian Asia',
          en: 'Ephesus — three years that change Asia',
        },
        note: {
          es: 'La escuela de Tiranno, los libros de magia ardiendo, y un tumulto de plateros al grito de «¡Grande es Artemisa!»: la Palabra crecía con fuerza.',
          en: 'The hall of Tyrannus, the magic books burning, and a silversmiths’ riot shouting "Great is Artemis!": the Word grew mightily.',
        },
        readings: [{ book: 'ACT', chapter: 19 }],
      },
      {
        placeSlug: 'corinth',
        title: { es: 'Corinto — tres meses de invierno', en: 'Corinth — three winter months' },
        note: {
          es: 'En Grecia pasa el invierno con la comunidad de Corinto. De aquí, según la tradición, escribe la carta a los Romanos.',
          en: 'He winters in Greece with the church of Corinth. From here, by tradition, he writes the letter to the Romans.',
        },
        readings: [{ book: 'ACT', chapter: 20, verses: [1, 6] }],
      },
      {
        placeSlug: 'troas',
        title: { es: 'Tróade — Eutico en la ventana', en: 'Troas — Eutychus at the window' },
        note: {
          es: 'Pablo alarga el discurso hasta medianoche y un muchacho se duerme en la ventana del tercer piso. Cae, lo dan por muerto — y vuelve vivo a casa.',
          en: 'Paul speaks on till midnight and a young man dozes off in the third-floor window. He falls, is taken for dead — and goes home alive.',
        },
        readings: [{ book: 'ACT', chapter: 20, verses: [7, 12] }],
      },
      {
        placeSlug: 'miletus',
        title: {
          es: 'Mileto — el adiós a los presbíteros',
          en: 'Miletus — farewell to the elders',
        },
        note: {
          es: 'Los ancianos de Éfeso bajan al puerto. «Hay más dicha en dar que en recibir» — y lloran abrazados, sabiendo que no volverán a verle.',
          en: 'The elders of Ephesus come down to the harbour. "It is more blessed to give than to receive" — and they weep and embrace him, knowing they will not see his face again.',
        },
        readings: [{ book: 'ACT', chapter: 20, verses: [17, 38] }],
      },
      {
        placeSlug: 'tyre',
        title: {
          es: 'Tiro — siete días con los discípulos',
          en: 'Tyre — seven days with the disciples',
        },
        note: {
          es: 'Mientras descargan la nave, los discípulos le repiten por el Espíritu que no suba a Jerusalén. Toda la comunidad lo despide de rodillas en la playa.',
          en: 'While the ship unloads, the disciples urge him through the Spirit not to go up to Jerusalem. The whole community kneels on the beach to bid him farewell.',
        },
        readings: [{ book: 'ACT', chapter: 21, verses: [1, 6] }],
      },
      {
        placeSlug: 'caesarea',
        title: { es: 'Cesarea — el cinturón de Ágabo', en: 'Caesarea — Agabus’s belt' },
        note: {
          es: 'El profeta Ágabo se ata pies y manos con el cinturón de Pablo: «Así atarán en Jerusalén a su dueño». «Dispuesto estoy no solo a ser atado, sino a morir».',
          en: 'The prophet Agabus binds his own feet and hands with Paul’s belt: "So shall they bind its owner in Jerusalem". "I am ready not only to be bound, but to die".',
        },
        readings: [{ book: 'ACT', chapter: 21, verses: [7, 14] }],
      },
      {
        placeSlug: 'jerusalem',
        title: {
          es: 'Jerusalén — el final del camino libre',
          en: 'Jerusalem — the end of the free road',
        },
        note: {
          es: 'Los hermanos lo reciben con alegría; días después, el arresto en el Templo. Empieza el camino de cadenas que lo llevará a Roma.',
          en: 'The brethren receive him gladly; days later, the arrest in the Temple. The road in chains that will lead him to Rome begins.',
        },
        readings: [{ book: 'ACT', chapter: 21, verses: [15, 26] }],
      },
    ],
  },
];

const CONQUEST_ROUTES: BibleRoute[] = [
  {
    slug: 'josue-y-la-conquista',
    name: { es: 'Josué y la conquista', en: 'Joshua and the Conquest' },
    description: {
      es: 'Del campamento de Sitim a la asamblea de Siquem: el paso del Jordán, las murallas de Jericó y la tierra por fin pisada.',
      en: 'From the camp at Shittim to the assembly at Shechem: the Jordan crossing, the walls of Jericho, and the land finally trodden.',
    },
    stops: [
      {
        placeSlug: 'shittim',
        title: {
          es: 'Sitim — el relevo y los espías',
          en: 'Shittim — the succession and the spies',
        },
        note: {
          es: 'Muerto Moisés, el Señor habla a Josué: «Sé fuerte y valiente». Del campamento parten dos espías hacia Jericó, donde Rajab los esconde.',
          en: 'After Moses’ death the Lord speaks to Joshua: "Be strong and courageous". From the camp two spies set out for Jericho, where Rahab hides them.',
        },
        readings: [
          { book: 'JOS', chapter: 1 },
          { book: 'JOS', chapter: 2 },
        ],
      },
      {
        placeSlug: 'jordan',
        title: {
          es: 'El Jordán — el paso a pie enjuto',
          en: 'The Jordan — crossing on dry ground',
        },
        note: {
          es: 'El Arca entra en el río y las aguas se detienen. Doce piedras del cauce guardarán la memoria: «¿Qué significan estas piedras?».',
          en: 'The Ark enters the river and the waters stand still. Twelve stones from the riverbed will keep the memory: "What do these stones mean?".',
        },
        readings: [
          { book: 'JOS', chapter: 3 },
          { book: 'JOS', chapter: 4 },
        ],
      },
      {
        placeSlug: 'gilgal-1',
        title: {
          es: 'Guilgal — la primera Pascua en la tierra',
          en: 'Gilgal — the first Passover in the land',
        },
        note: {
          es: 'Cesa el maná: el pueblo come ya del fruto de la tierra. Y ante Josué, un guerrero con la espada desenvainada: «Descálzate».',
          en: 'The manna ceases: the people now eat the produce of the land. And before Joshua, a warrior with drawn sword: "Take off your sandals".',
        },
        readings: [{ book: 'JOS', chapter: 5 }],
      },
      {
        placeSlug: 'jericho-1',
        title: { es: 'Jericó — las murallas', en: 'Jericho — the walls' },
        note: {
          es: 'Siete días de vueltas en silencio, siete trompetas, y al séptimo día el grito: la muralla se desploma. Solo se salva la casa de Rajab, la del cordón rojo.',
          en: 'Seven days of silent circuits, seven trumpets, and on the seventh day the shout: the wall collapses. Only Rahab’s house, marked with the scarlet cord, is spared.',
        },
        readings: [{ book: 'JOS', chapter: 6 }],
      },
      {
        placeSlug: 'ai-1',
        title: { es: 'Hai — la derrota y la lección', en: 'Ai — defeat and lesson' },
        note: {
          es: 'La ciudad pequeña vence al pueblo confiado: el pecado de Acán pesaba en el campamento. Purificado Israel, Hai cae con estrategia y obediencia.',
          en: 'The small city defeats the overconfident people: Achan’s sin weighed on the camp. Once Israel is purified, Ai falls by strategy and obedience.',
        },
        readings: [
          { book: 'JOS', chapter: 7 },
          { book: 'JOS', chapter: 8, verses: [1, 29] },
        ],
      },
      {
        placeSlug: 'gibeon',
        title: { es: 'Gabaón — el sol detenido', en: 'Gibeon — the sun stands still' },
        note: {
          es: 'Los gabaonitas salvan la vida con astucia, y defendiendo a los nuevos aliados Josué reza en plena batalla: «Sol, detente en Gabaón».',
          en: 'The Gibeonites save their lives by cunning, and defending his new allies Joshua prays mid-battle: "Sun, stand still over Gibeon".',
        },
        readings: [
          { book: 'JOS', chapter: 9 },
          { book: 'JOS', chapter: 10, verses: [1, 15] },
        ],
      },
      {
        placeSlug: 'shechem',
        title: {
          es: 'Siquem — «yo y mi casa serviremos al Señor»',
          en: 'Shechem — "as for me and my house"',
        },
        note: {
          es: 'Anciano ya, Josué reúne a las tribus donde Abraham levantó su primer altar y les hace elegir: «Escoged hoy a quién queréis servir».',
          en: 'Now old, Joshua gathers the tribes where Abraham built his first altar and makes them choose: "Choose this day whom you will serve".',
        },
        readings: [{ book: 'JOS', chapter: 24, verses: [1, 28] }],
      },
    ],
  },
  {
    slug: 'jesus-en-galilea',
    name: { es: 'Jesús en Galilea', en: 'Jesus in Galilee' },
    description: {
      es: 'Del rechazo en Nazaret a la luz del Tabor: los caminos del ministerio junto al lago, pueblo a pueblo.',
      en: 'From the rejection at Nazareth to the light of Tabor: the paths of the ministry around the lake, village by village.',
    },
    stops: [
      {
        placeSlug: 'nazareth',
        title: {
          es: 'Nazaret — «hoy se cumple esta Escritura»',
          en: 'Nazareth — "today this Scripture is fulfilled"',
        },
        note: {
          es: 'En la sinagoga de su pueblo, Jesús lee a Isaías y anuncia su programa. La admiración se vuelve furia: nadie es profeta en su tierra.',
          en: 'In his hometown synagogue Jesus reads Isaiah and announces his mission. Wonder turns to fury: no prophet is accepted in his own country.',
        },
        readings: [{ book: 'LUK', chapter: 4, verses: [16, 30] }],
      },
      {
        placeSlug: 'capernaum',
        title: { es: 'Cafarnaúm — «su ciudad»', en: 'Capernaum — "his own town"' },
        note: {
          es: 'Junto al lago, la base del ministerio: enseña con autoridad, cura a la suegra de Pedro y, al anochecer, el pueblo entero se agolpa a la puerta.',
          en: 'By the lake, the base of the ministry: he teaches with authority, heals Peter’s mother-in-law and, at sundown, the whole town crowds the door.',
        },
        readings: [
          { book: 'MRK', chapter: 1, verses: [21, 39] },
          { book: 'MRK', chapter: 2, verses: [1, 12] },
        ],
      },
      {
        placeSlug: 'sea-of-galilee',
        title: {
          es: 'El mar de Galilea — pescadores de hombres',
          en: 'The Sea of Galilee — fishers of men',
        },
        note: {
          es: 'La pesca milagrosa dobla las rodillas de Pedro: «Apártate de mí, que soy pecador». Dejan las barcas en la orilla y lo siguen.',
          en: 'The miraculous catch brings Peter to his knees: "Depart from me, for I am a sinful man". They leave the boats on the shore and follow him.',
        },
        readings: [{ book: 'LUK', chapter: 5, verses: [1, 11] }],
      },
      {
        placeSlug: 'nain',
        title: { es: 'Naín — el hijo de la viuda', en: 'Nain — the widow’s son' },
        note: {
          es: 'Dos cortejos se cruzan a la puerta del pueblo: el de la muerte y el de la Vida. «Joven, a ti te digo: levántate».',
          en: 'Two processions meet at the town gate: death’s and Life’s. "Young man, I say to you, arise".',
        },
        readings: [{ book: 'LUK', chapter: 7, verses: [11, 17] }],
      },
      {
        placeSlug: 'bethsaida-1',
        title: { es: 'Betsaida — los cinco panes', en: 'Bethsaida — the five loaves' },
        note: {
          es: 'En un lugar apartado, cinco panes y dos peces para cinco mil: «Dadles vosotros de comer». Sobraron doce canastos.',
          en: 'In a deserted place, five loaves and two fish for five thousand: "You give them something to eat". Twelve baskets were left over.',
        },
        readings: [{ book: 'LUK', chapter: 9, verses: [10, 17] }],
      },
      {
        placeSlug: 'caesarea-philippi',
        title: {
          es: 'Cesarea de Filipo — «¿quién decís que soy yo?»',
          en: 'Caesarea Philippi — "who do you say that I am?"',
        },
        note: {
          es: 'Lejos, al pie del Hermón, la pregunta decisiva y la confesión de Pedro: «Tú eres el Cristo». Y el primer anuncio de la cruz.',
          en: 'Far north, at the foot of Hermon, the decisive question and Peter’s confession: "You are the Christ". And the first announcement of the cross.',
        },
        readings: [{ book: 'MAT', chapter: 16, verses: [13, 28] }],
      },
      {
        placeSlug: 'mount-tabor',
        title: {
          es: 'El monte Tabor — la Transfiguración',
          en: 'Mount Tabor — the Transfiguration',
        },
        note: {
          es: 'En el monte alto su rostro se vuelve luz, con Moisés y Elías a los lados: «Este es mi Hijo amado; escuchadle». El monte que da nombre a este proyecto.',
          en: 'On the high mountain his face becomes light, with Moses and Elijah beside him: "This is my beloved Son; listen to him". The mountain that gives this project its name.',
        },
        readings: [{ book: 'LUK', chapter: 9, verses: [28, 36] }],
      },
    ],
  },
  {
    slug: 'regreso-del-exilio',
    name: { es: 'El regreso del Exilio', en: 'The Return from Exile' },
    description: {
      es: 'De los ríos de Babilonia a la Ley leída en la plaza: el pueblo que vuelve, reconstruye el Templo y levanta las murallas (Esdras y Nehemías).',
      en: 'From the rivers of Babylon to the Law read in the square: the people who return, rebuild the Temple and raise the walls (Ezra and Nehemiah).',
    },
    stops: [
      {
        placeSlug: 'babylon-1',
        title: { es: 'Babilonia — el edicto de Ciro', en: 'Babylon — the edict of Cyrus' },
        note: {
          es: 'Setenta años después, un rey persa firma la libertad: «Quien de entre vosotros pertenezca a su pueblo, suba a Jerusalén».',
          en: 'Seventy years on, a Persian king signs the liberation: "Whoever among you belongs to his people, let him go up to Jerusalem".',
        },
        readings: [
          { book: 'EZR', chapter: 1 },
          { book: 'PSA', chapter: 125 },
        ],
      },
      {
        placeSlug: 'ahava',
        title: {
          es: 'El río Ahavá — el ayuno del camino',
          en: 'The river Ahava — the fast of the road',
        },
        note: {
          es: 'Antes de cruzar el desierto sin escolta, Esdras proclama un ayuno: «La mano de nuestro Dios protege a los que le buscan».',
          en: 'Before crossing the desert without an escort, Ezra proclaims a fast: "The hand of our God is upon all who seek him".',
        },
        readings: [{ book: 'EZR', chapter: 8, verses: [15, 36] }],
      },
      {
        placeSlug: 'jerusalem',
        title: {
          es: 'Jerusalén — los cimientos del Templo',
          en: 'Jerusalem — the Temple foundations',
        },
        note: {
          es: 'Al poner los cimientos, los jóvenes gritan de alegría y los ancianos, que conocieron el primer Templo, lloran: nadie distingue un clamor del otro.',
          en: 'As the foundations are laid, the young shout for joy and the elders, who knew the first Temple, weep: no one can tell one sound from the other.',
        },
        readings: [
          { book: 'EZR', chapter: 3 },
          { book: 'EZR', chapter: 6, verses: [13, 22] },
        ],
      },
      {
        placeSlug: 'jerusalem',
        title: { es: 'Jerusalén — las murallas y la Ley', en: 'Jerusalem — the walls and the Law' },
        note: {
          es: 'Nehemías ronda de noche las ruinas y las levanta en cincuenta y dos días; después, junto a la puerta de las Aguas, Esdras lee la Ley y el pueblo llora y celebra.',
          en: 'Nehemiah surveys the ruins by night and raises them in fifty-two days; then, by the Water Gate, Ezra reads the Law and the people weep and rejoice.',
        },
        readings: [
          { book: 'NEH', chapter: 2 },
          { book: 'NEH', chapter: 8, verses: [1, 12] },
        ],
      },
    ],
  },
];

const PATRIARCHS_ROUTES: BibleRoute[] = [
  {
    slug: 'jacob',
    name: { es: 'Jacob, la escalera y la lucha', en: 'Jacob, the Ladder and the Wrestling' },
    description: {
      es: 'De la huida de Berseba al descenso a Egipto: el patriarca que sale con un cayado y vuelve hecho pueblo, cojo de una cadera y con un nombre nuevo.',
      en: 'From the flight out of Beersheba to the descent into Egypt: the patriarch who leaves with a staff and returns a people, limping on one hip and bearing a new name.',
    },
    stops: [
      {
        placeSlug: 'beersheba-2',
        title: { es: 'Berseba — la huida', en: 'Beersheba — the flight' },
        note: {
          es: 'Con la bendición arrebatada a cuestas y Esaú buscándole, Jacob sale de Berseba hacia la casa de Labán. Isaac lo despide, sin saberlo, con la promesa de Abraham.',
          en: 'Carrying the blessing he snatched and with Esau after him, Jacob leaves Beersheba for Laban’s house. Isaac sends him off, unwittingly, with Abraham’s promise.',
        },
        readings: [{ book: 'GEN', chapter: 28, verses: [1, 9] }],
      },
      {
        placeSlug: 'bethel-1',
        title: { es: 'Betel — la escalera', en: 'Bethel — the ladder' },
        note: {
          es: 'A campo raso, con una piedra por almohada, sueña una escalera por la que suben y bajan los ángeles de Dios. Al despertar: «Realmente el Señor está en este lugar, y yo no lo sabía».',
          en: 'In the open country, a stone for a pillow, he dreams of a ladder with the angels of God ascending and descending. Waking: "Surely the Lord is in this place, and I did not know it".',
        },
        readings: [{ book: 'GEN', chapter: 28, verses: [10, 22] }],
      },
      {
        placeSlug: 'haran',
        title: { es: 'Harán — siete años por Raquel', en: 'Haran — seven years for Rachel' },
        note: {
          es: 'Siete años de servicio «que le parecieron unos pocos días», y a la mañana siguiente de la boda era Lía. Otros siete: en casa del tío, el que engañó aprende lo que es ser engañado.',
          en: 'Seven years of service "that seemed to him but a few days", and the morning after the wedding it was Leah. Seven more: in his uncle’s house the deceiver learns what being deceived is.',
        },
        readings: [{ book: 'GEN', chapter: 29, verses: [1, 30] }],
      },
      {
        placeSlug: 'mahanaim',
        title: { es: 'Majanaim — el campamento de Dios', en: 'Mahanaim — the camp of God' },
        note: {
          es: 'De vuelta a casa, los ángeles de Dios le salen al encuentro: «Este es el campamento de Dios». Y aun así reza con miedo, porque Esaú viene con cuatrocientos hombres.',
          en: 'On his way home the angels of God meet him: "This is God’s camp". And still he prays in fear, because Esau is coming with four hundred men.',
        },
        readings: [{ book: 'GEN', chapter: 32, verses: [1, 12] }],
      },
      {
        placeSlug: 'penuel',
        title: { es: 'Penuel — la lucha hasta el alba', en: 'Penuel — wrestling until dawn' },
        note: {
          es: 'Solo, de noche, junto al vado del Yaboc, lucha con un desconocido hasta rayar el alba. Sale cojo y bendecido, y ya no se llama Jacob: se llama Israel.',
          en: 'Alone, by night, at the ford of the Jabbok, he wrestles with a stranger until daybreak. He leaves limping and blessed, and no longer named Jacob: his name is Israel.',
        },
        readings: [{ book: 'GEN', chapter: 32, verses: [22, 32] }],
      },
      {
        placeSlug: 'shechem',
        title: { es: 'Siquem — el abrazo y el altar', en: 'Shechem — the embrace and the altar' },
        note: {
          es: 'Lo que temía era una batalla y fue un abrazo: Esaú corre a su encuentro y los dos lloran. Jacob acampa a la vista de la ciudad, compra el terreno y levanta un altar.',
          en: 'He feared a battle and found an embrace: Esau runs to meet him and both weep. Jacob camps within sight of the city, buys the ground and raises an altar.',
        },
        readings: [{ book: 'GEN', chapter: 33 }],
      },
      {
        placeSlug: 'el-bethel',
        title: { es: 'El-Betel — el voto cumplido', en: 'El-bethel — the vow fulfilled' },
        note: {
          es: 'Vuelve al lugar del sueño con toda su casa, entierra los ídolos bajo la encina y erige por fin el altar prometido. Allí Dios le repite el nombre nuevo y la promesa.',
          en: 'He returns to the place of the dream with his whole household, buries the idols under the oak and at last builds the altar he vowed. There God repeats the new name and the promise.',
        },
        readings: [{ book: 'GEN', chapter: 35, verses: [1, 15] }],
      },
      {
        placeSlug: 'mamre',
        title: { es: 'Mambré — el adiós a Isaac', en: 'Mamre — farewell to Isaac' },
        note: {
          es: 'Después de veinte años, Jacob llega a la tienda de su padre. Isaac muere anciano y colmado de días, y los dos hermanos que se disputaron su bendición lo entierran juntos.',
          en: 'After twenty years Jacob reaches his father’s tent. Isaac dies old and full of days, and the two brothers who fought over his blessing bury him together.',
        },
        readings: [{ book: 'GEN', chapter: 35, verses: [27, 29] }],
      },
      {
        placeSlug: 'goshen-1',
        title: { es: 'Gosén — el reencuentro en Egipto', en: 'Goshen — the reunion in Egypt' },
        note: {
          es: 'Camino de Egipto, Dios le habla de noche: «No temas bajar allá, porque allí te haré una gran nación». José engancha su carro, y llora largo rato sobre el cuello de su padre.',
          en: 'On the road to Egypt God speaks by night: "Do not fear to go down, for there I will make of you a great nation". Joseph harnesses his chariot and weeps a long while on his father’s neck.',
        },
        readings: [
          { book: 'GEN', chapter: 46, verses: [1, 7] },
          { book: 'GEN', chapter: 46, verses: [28, 34] },
        ],
      },
    ],
  },
  {
    slug: 'jose',
    name: {
      es: 'José, de la cisterna al gobierno de Egipto',
      en: 'Joseph, from the Cistern to the Rule of Egypt',
    },
    description: {
      es: 'Vendido por sus hermanos y levantado por Dios: de la túnica rota al carro del faraón, y de la venganza posible al perdón.',
      en: 'Sold by his brothers and raised up by God: from the torn tunic to Pharaoh’s chariot, and from possible revenge to forgiveness.',
    },
    stops: [
      {
        placeSlug: 'valley-of-hebron',
        title: { es: 'El valle de Hebrón — el envío', en: 'The valley of Hebron — the errand' },
        note: {
          es: 'La túnica de mangas largas, los sueños de las gavillas y el odio callado de los hermanos. Israel manda al pequeño a ver cómo están, y él responde: «Aquí estoy».',
          en: 'The long-sleeved tunic, the dreams of the sheaves and the brothers’ silent hatred. Israel sends the youngest to see how they are, and he answers: "Here I am".',
        },
        readings: [{ book: 'GEN', chapter: 37, verses: [1, 14] }],
      },
      {
        placeSlug: 'dothan',
        title: { es: 'Dotán — la cisterna', en: 'Dothan — the cistern' },
        note: {
          es: 'Lo ven venir de lejos y lo despojan; la cisterna está seca. Pasa una caravana de ismaelitas camino de Egipto y veinte monedas de plata cambian una vida.',
          en: 'They see him coming from afar and strip him; the cistern is dry. An Ishmaelite caravan passes on its way to Egypt and twenty pieces of silver change a life.',
        },
        readings: [{ book: 'GEN', chapter: 37, verses: [15, 36] }],
      },
      {
        placeSlug: 'egypt',
        title: {
          es: 'Egipto — la casa de Putifar y la cárcel',
          en: 'Egypt — Potiphar’s house and the prison',
        },
        note: {
          es: 'Esclavo y enseguida administrador; calumniado y enseguida preso. «El Señor estaba con José»: la frase se repite igual en lo alto y en lo más bajo.',
          en: 'A slave and at once a steward; slandered and at once a prisoner. "The Lord was with Joseph": the same sentence repeats at the top and at the very bottom.',
        },
        readings: [{ book: 'GEN', chapter: 39 }],
      },
      {
        placeSlug: 'nile',
        title: { es: 'El Nilo — las siete vacas', en: 'The Nile — the seven cows' },
        note: {
          es: 'Del río suben siete vacas hermosas y siete escuálidas que se las comen. Nadie sabe leer el sueño, hasta que el copero se acuerda del muchacho de la cárcel.',
          en: 'Out of the river come seven fine cows and seven gaunt ones that devour them. No one can read the dream, until the cupbearer remembers the young man in the prison.',
        },
        readings: [{ book: 'GEN', chapter: 41, verses: [1, 36] }],
      },
      {
        placeSlug: 'heliopolis',
        title: { es: 'On — el segundo del reino', en: 'On — second in the kingdom' },
        note: {
          es: 'El faraón le da su anillo, un carro y un nombre egipcio, y por esposa a Asenat, hija del sacerdote de On. Siete años de espigas llenas para los siete de hambre.',
          en: 'Pharaoh gives him his ring, a chariot and an Egyptian name, and Asenath, daughter of the priest of On, as wife. Seven years of full ears against the seven of famine.',
        },
        readings: [{ book: 'GEN', chapter: 41, verses: [37, 57] }],
      },
      {
        placeSlug: 'goshen-1',
        title: { es: 'Gosén — «yo soy José»', en: 'Goshen — "I am Joseph"' },
        note: {
          es: 'No aguanta más y despide a los egipcios: «Yo soy José, vuestro hermano, el que vendisteis». No los acusa — «Dios me envió delante de vosotros» — y les da lo mejor del país.',
          en: 'He can bear it no longer and sends the Egyptians out: "I am Joseph your brother, whom you sold". He does not accuse them — "God sent me before you" — and gives them the best of the land.',
        },
        readings: [
          { book: 'GEN', chapter: 45, verses: [1, 15] },
          { book: 'GEN', chapter: 47, verses: [1, 12] },
        ],
      },
      {
        placeSlug: 'machpelah',
        title: {
          es: 'Macpelá — el entierro y el perdón',
          en: 'Machpelah — the burial and the pardon',
        },
        note: {
          es: 'Una comitiva de carros egipcios sube a Canaán y sepulta a Jacob en la cueva de Abraham. De vuelta, los hermanos temen la revancha: «¿Estoy yo acaso en el lugar de Dios?».',
          en: 'A train of Egyptian chariots goes up to Canaan and lays Jacob in Abraham’s cave. Back home the brothers fear revenge: "Am I in the place of God?".',
        },
        readings: [{ book: 'GEN', chapter: 50 }],
      },
    ],
  },
];

const KINGDOM_ROUTES: BibleRoute[] = [
  {
    slug: 'rut',
    name: { es: 'Rut, la espigadora de Belén', en: 'Ruth, the Gleaner of Bethlehem' },
    description: {
      es: 'De la hambruna que vacía Belén a la puerta de la ciudad: el camino corto de una extranjera que eligió quedarse, y que acabó siendo bisabuela de David.',
      en: 'From the famine that empties Bethlehem to the city gate: the short road of a foreigner who chose to stay, and who became David’s great-grandmother.',
    },
    stops: [
      {
        placeSlug: 'bethlehem-1',
        title: { es: 'Belén — el hambre y la marcha', en: 'Bethlehem — famine and departure' },
        note: {
          es: 'La «casa del pan» se queda sin pan y una familia emigra a los campos de Moab. Allí mueren el padre y los dos hijos, y Noemí queda sin marido, sin hijos y sin tierra.',
          en: 'The "house of bread" runs out of bread and a family emigrates to the fields of Moab. There the father and both sons die, and Naomi is left without husband, sons or land.',
        },
        readings: [{ book: 'RUT', chapter: 1, verses: [1, 5] }],
      },
      {
        placeSlug: 'moab-1',
        title: {
          es: 'Moab — «tu pueblo será mi pueblo»',
          en: 'Moab — "your people shall be my people"',
        },
        note: {
          es: 'Noemí despide a sus nueras y Orfá se vuelve, con razón y con lágrimas. Rut se agarra a ella: «Adonde tú vayas, iré yo; donde tú mueras, moriré yo».',
          en: 'Naomi sends her daughters-in-law away and Orpah turns back, rightly and in tears. Ruth clings to her: "Where you go I will go; where you die I will die".',
        },
        readings: [{ book: 'RUT', chapter: 1, verses: [6, 18] }],
      },
      {
        placeSlug: 'bethlehem-1',
        title: { es: 'Belén — la vuelta amarga', en: 'Bethlehem — the bitter return' },
        note: {
          es: 'Toda la aldea se conmueve al verlas llegar. «No me llaméis Noemí, dulzura; llamadme Mará, amargura». Es el comienzo de la siega de la cebada.',
          en: 'The whole village stirs at the sight of them. "Do not call me Naomi, sweetness; call me Mara, bitterness". It is the beginning of the barley harvest.',
        },
        readings: [{ book: 'RUT', chapter: 1, verses: [19, 22] }],
      },
      {
        placeSlug: 'bethlehem-1',
        title: {
          es: 'Los campos de Booz — espigar y la era',
          en: 'The fields of Boaz — gleaning and the threshing floor',
        },
        note: {
          es: 'Rut sale a espigar detrás de los segadores y da, «por casualidad», con la parcela de un pariente. Aquella noche, en la era, le pide amparo: «Extiende tu manto sobre tu sierva».',
          en: 'Ruth goes out to glean behind the reapers and lights, "by chance", on the plot of a kinsman. That night, on the threshing floor, she asks for shelter: "Spread your cloak over your servant".',
        },
        readings: [
          { book: 'RUT', chapter: 2 },
          { book: 'RUT', chapter: 3 },
        ],
      },
      {
        placeSlug: 'ephrathah',
        title: { es: 'Efrata — la puerta de la ciudad', en: 'Ephrathah — the city gate' },
        note: {
          es: 'Diez ancianos, una sandalia que cambia de mano y un rescate cumplido. De aquella boda nace Obed, y de Obed, Jesé; y de Jesé, David.',
          en: 'Ten elders, a sandal passed from hand to hand and a redemption completed. From that marriage Obed is born, and from Obed Jesse; and from Jesse, David.',
        },
        readings: [{ book: 'RUT', chapter: 4 }],
      },
    ],
  },
  {
    slug: 'salomon-y-el-templo',
    name: { es: 'Salomón y el Templo', en: 'Solomon and the Temple' },
    description: {
      es: 'Del sueño de Gabaón a las flotas que vuelven de Ofir: los cedros del Líbano, el oro del sur y la piedra con que Israel levantó la casa del Nombre.',
      en: 'From the dream at Gibeon to the fleets returning from Ophir: the cedars of Lebanon, the gold of the south and the stone with which Israel raised the house of the Name.',
    },
    stops: [
      {
        placeSlug: 'gibeon',
        title: { es: 'Gabaón — «un corazón que escuche»', en: 'Gibeon — "a listening heart"' },
        note: {
          es: 'Mil holocaustos en el santuario del alto, y de noche la pregunta de Dios: «Pide lo que quieras». No pide años, ni riquezas, ni la vida de sus enemigos: pide saber gobernar.',
          en: 'A thousand burnt offerings at the high place, and by night God’s question: "Ask what you wish". He asks neither long life, nor riches, nor the life of his enemies: he asks to know how to govern.',
        },
        readings: [{ book: '1KI', chapter: 3, verses: [4, 15] }],
      },
      {
        placeSlug: 'tyre',
        title: { es: 'Tiro — los cedros de Hiram', en: 'Tyre — the cedars of Hiram' },
        note: {
          es: 'El rey de Tiro, que siempre había querido a David, manda decir a su hijo que sí. Los troncos bajarán del monte y viajarán en balsas por el mar hasta la costa.',
          en: 'The king of Tyre, who had always loved David, sends word to his son that he agrees. The logs will come down from the mountain and travel by sea in rafts to the coast.',
        },
        readings: [{ book: '1KI', chapter: 5, verses: [1, 12] }],
      },
      {
        placeSlug: 'lebanon',
        title: {
          es: 'El Líbano — treinta mil taladores',
          en: 'Lebanon — thirty thousand woodcutters',
        },
        note: {
          es: 'Turnos de diez mil hombres al mes en la montaña, ochenta mil canteros y setenta mil porteadores. Una nación entera trabajando durante años en una sola casa.',
          en: 'Shifts of ten thousand men a month in the mountains, eighty thousand stonecutters and seventy thousand carriers. A whole nation working for years on a single house.',
        },
        readings: [{ book: '1KI', chapter: 5, verses: [13, 18] }],
      },
      {
        placeSlug: 'mount-moriah',
        title: { es: 'El monte Moria — los cimientos', en: 'Mount Moriah — the foundations' },
        note: {
          es: 'Sobre la era que David compró, en el monte donde Abraham había cargado la leña, empieza la obra. Siete años, y en el recinto no se oyó ni un golpe de martillo.',
          en: 'On the threshing floor David bought, on the mount where Abraham had carried the wood, the work begins. Seven years, and in the precinct not one hammer blow was heard.',
        },
        readings: [
          { book: '2CH', chapter: 3, verses: [1, 7] },
          { book: 'PSA', chapter: 126 },
        ],
      },
      {
        placeSlug: 'jerusalem',
        title: { es: 'Jerusalén — la dedicación', en: 'Jerusalem — the dedication' },
        note: {
          es: 'Sube el Arca al Santísimo y la nube llena la casa. Salomón abre los brazos: «¿Es que Dios va a habitar sobre la tierra? Ni los cielos te abarcan, cuánto menos esta casa».',
          en: 'The Ark goes up into the Holy of Holies and the cloud fills the house. Solomon spreads out his hands: "Will God indeed dwell on earth? The heavens cannot contain you, much less this house".',
        },
        readings: [
          { book: '1KI', chapter: 8, verses: [1, 13] },
          { book: '1KI', chapter: 8, verses: [22, 30] },
        ],
      },
      {
        placeSlug: 'ezion-geber',
        title: {
          es: 'Esión-Guéber — la flota del mar Rojo',
          en: 'Ezion-geber — the Red Sea fleet',
        },
        note: {
          es: 'En el fondo del golfo, junto a Elat, Salomón arma naves; Hiram le presta marineros que conocen el mar. Zarpan hacia el sur y tardan años en volver.',
          en: 'At the head of the gulf, next to Elath, Solomon builds ships; Hiram lends him seamen who know the sea. They sail south and take years to return.',
        },
        readings: [{ book: '1KI', chapter: 9, verses: [26, 28] }],
      },
      {
        placeSlug: 'ophir',
        title: { es: 'Ofir — el oro que vuelve', en: 'Ophir — the gold that returns' },
        note: {
          es: 'De aquel puerto remoto, cuya posición nadie sabe hoy, traen cuatrocientos veinte talentos de oro y una madera de sándalo como no se había visto nunca en Jerusalén.',
          en: 'From that far-off port, whose position no one knows today, they bring four hundred and twenty talents of gold and sandalwood such as Jerusalem had never seen.',
        },
        readings: [{ book: '1KI', chapter: 10, verses: [11, 12] }],
      },
      {
        placeSlug: 'sheba-1',
        title: { es: 'Sabá — la reina que vino a ver', en: 'Sheba — the queen who came to see' },
        note: {
          es: 'Llega del extremo sur con especias, oro y preguntas difíciles. Cuando lo ha visto todo se queda sin aliento: «No me habían contado ni la mitad».',
          en: 'She comes from the far south with spices, gold and hard questions. When she has seen it all there is no more breath in her: "They did not tell me the half of it".',
        },
        readings: [{ book: '1KI', chapter: 10, verses: [1, 13] }],
      },
    ],
  },
];

const PROPHETS_ROUTES: BibleRoute[] = [
  {
    slug: 'jonas',
    season: 'cuaresma',
    name: {
      es: 'Jonás, la huida y la ciudad convertida',
      en: 'Jonah, the Flight and the Converted City',
    },
    description: {
      es: 'De un pueblecito de Galilea al confín de occidente, y de vuelta hasta Nínive: la ruta más torcida de la Biblia, y la misericordia que la endereza.',
      en: 'From a small Galilean village to the western edge of the world, and back to Nineveh: the most crooked route in the Bible, and the mercy that straightens it.',
    },
    stops: [
      {
        placeSlug: 'gath-hepher',
        title: {
          es: 'Gat-Héfer — el profeta de Galilea',
          en: 'Gath-hepher — the prophet from Galilee',
        },
        note: {
          es: 'Un profeta de carne y hueso, de una aldea a un paso de Nazaret, que anunció a Jeroboam la restauración de las fronteras. Siglos después dirán que de Galilea no sale ningún profeta.',
          en: 'A flesh-and-blood prophet from a village a step away from Nazareth, who announced to Jeroboam the restoring of the borders. Centuries later they will say no prophet comes from Galilee.',
        },
        readings: [{ book: '2KI', chapter: 14, verses: [23, 27] }],
      },
      {
        placeSlug: 'joppa',
        title: { es: 'Jafa — el pasaje a Tarsis', en: 'Joppa — passage to Tarshish' },
        note: {
          es: 'Dios dice «levántate y ve a Nínive», al oriente. Jonás baja a Jafa, paga el pasaje y se embarca al occidente. En hebreo, todos los verbos de su huida son descensos.',
          en: 'God says "arise and go to Nineveh", to the east. Jonah goes down to Joppa, pays the fare and sails west. In Hebrew, every verb of his flight is a going down.',
        },
        readings: [{ book: 'JON', chapter: 1, verses: [1, 3] }],
      },
      {
        placeSlug: 'tarshish-1',
        title: { es: 'Tarsis — el rumbo contrario', en: 'Tarshish — the opposite course' },
        note: {
          es: 'Rumbo al último puerto conocido, Dios lanza un viento y el barco cruje. Los marineros paganos rezan, echan suertes y se resisten a tirarlo al agua; el profeta dormía en la bodega.',
          en: 'Bound for the last known port, God hurls a wind and the ship groans. The pagan sailors pray, cast lots and are loath to throw him overboard; the prophet was asleep in the hold.',
        },
        readings: [{ book: 'JON', chapter: 1, verses: [4, 16] }],
      },
      {
        placeSlug: 'great-sea',
        title: {
          es: 'El mar — tres días en el vientre del pez',
          en: 'The sea — three days in the belly of the fish',
        },
        note: {
          es: 'Desde las entrañas del abismo, un salmo: «Invoqué al Señor en mi angustia y me respondió». Es el signo que Jesús dará a los que le pidan señales.',
          en: 'From the depths of the abyss, a psalm: "I called to the Lord out of my distress and he answered me". This is the sign Jesus will give to those who ask him for signs.',
        },
        readings: [{ book: 'JON', chapter: 2 }],
      },
      {
        placeSlug: 'nineveh',
        title: { es: 'Nínive — la ciudad convertida', en: 'Nineveh — the converted city' },
        note: {
          es: 'Bastan cinco palabras y la ciudad entera se cubre de saco, del rey al ganado. Jonás se enfada, se le seca el ricino, y Dios se queda con la última palabra: «¿Y no me voy a compadecer yo?».',
          en: 'Five words are enough and the whole city puts on sackcloth, from the king to the cattle. Jonah is angry, his gourd withers, and God keeps the last word: "And should I not have pity?".',
        },
        readings: [
          { book: 'JON', chapter: 3 },
          { book: 'JON', chapter: 4 },
        ],
      },
    ],
  },
  {
    slug: 'daniel-en-babilonia',
    name: { es: 'Daniel y los desterrados de Babilonia', en: 'Daniel and the Exiles in Babylon' },
    description: {
      es: 'De la deportación de unos muchachos de Judá a las visiones junto al Tigris: la fe que se mantiene entera dentro de la corte del imperio.',
      en: 'From the deportation of a few young men of Judah to the visions by the Tigris: faith kept whole inside the court of empire.',
    },
    stops: [
      {
        placeSlug: 'jerusalem',
        title: {
          es: 'Jerusalén — la primera deportación',
          en: 'Jerusalem — the first deportation',
        },
        note: {
          es: 'Nabucodonosor se lleva los vasos del Templo y a unos jóvenes de sangre real, «sin defecto y hábiles en toda sabiduría». Les cambian hasta el nombre: Daniel será Baltasar.',
          en: 'Nebuchadnezzar carries off the vessels of the Temple and some young men of royal blood, "without blemish and skilful in all wisdom". Even their names are changed: Daniel becomes Belteshazzar.',
        },
        readings: [{ book: 'DAN', chapter: 1, verses: [1, 7] }],
      },
      {
        placeSlug: 'babylon-1',
        title: {
          es: 'Babilonia — la mesa del rey y la estatua',
          en: 'Babylon — the king’s table and the statue',
        },
        note: {
          es: 'Legumbres y agua en lugar de los manjares reales: a los diez días tienen mejor aspecto que todos. Y cuando nadie acierta el sueño del rey, Daniel ve la estatua y la piedra que la derriba.',
          en: 'Vegetables and water instead of the royal fare: after ten days they look better than all the rest. And when no one can tell the king his dream, Daniel sees the statue and the stone that shatters it.',
        },
        readings: [
          { book: 'DAN', chapter: 1, verses: [8, 21] },
          { book: 'DAN', chapter: 2, verses: [31, 49] },
        ],
      },
      {
        placeSlug: 'dura',
        title: { es: 'La llanura de Dura — el horno', en: 'The plain of Dura — the furnace' },
        note: {
          es: 'Una estatua de oro, una orquesta y la orden de postrarse. Tres jóvenes se niegan: «Y si no nos libra, sábelo, oh rey: no adoraremos tu estatua». Dentro del horno pasean cuatro.',
          en: 'A golden statue, an orchestra and the order to bow down. Three young men refuse: "And if he does not deliver us, know, O king: we will not worship your statue". Inside the furnace, four are walking.',
        },
        readings: [{ book: 'DAN', chapter: 3 }],
      },
      {
        placeSlug: 'babylon-1',
        title: {
          es: 'Babilonia — la escritura y el foso',
          en: 'Babylon — the writing and the den',
        },
        note: {
          es: 'Mane, Técel, Fares: los dedos escriben en la pared del banquete y aquella misma noche cae Baltasar. Bajo el rey siguiente, la envidia lleva a Daniel al foso de los leones.',
          en: 'Mene, Tekel, Peres: fingers write on the banquet wall and that very night Belshazzar falls. Under the next king, envy sends Daniel down to the lions’ den.',
        },
        readings: [
          { book: 'DAN', chapter: 5 },
          { book: 'DAN', chapter: 6 },
        ],
      },
      {
        placeSlug: 'susa',
        title: { es: 'Susa — la visión junto al Ulai', en: 'Susa — the vision by the Ulai' },
        note: {
          es: 'Llevado en visión a la ciudadela de Elam, ve el carnero y el macho cabrío: los imperios que vendrán y se irán. Daniel se desmaya y queda enfermo varios días.',
          en: 'Carried in vision to the citadel of Elam, he sees the ram and the he-goat: the empires that will come and go. Daniel faints and lies ill for several days.',
        },
        readings: [{ book: 'DAN', chapter: 8 }],
      },
      {
        placeSlug: 'tigris',
        title: {
          es: 'El Tigris — el hombre vestido de lino',
          en: 'The Tigris — the man clothed in linen',
        },
        note: {
          es: 'Tres semanas de ayuno a la orilla del gran río, y entonces la aparición: lino, oro de Ufaz, ojos como antorchas. «No temas, hombre predilecto: la paz sea contigo, ten ánimo».',
          en: 'Three weeks of fasting on the bank of the great river, and then the apparition: linen, gold of Uphaz, eyes like torches. "Fear not, greatly beloved: peace be with you, be strong".',
        },
        readings: [{ book: 'DAN', chapter: 10 }],
      },
    ],
  },
];

const APOCALYPSE_ROUTES: BibleRoute[] = [
  {
    slug: 'siete-iglesias-del-apocalipsis',
    name: { es: 'Las siete iglesias del Apocalipsis', en: 'The Seven Churches of Revelation' },
    description: {
      es: 'Desde el destierro de Patmos, siete cartas siguen la ruta postal de Asia Menor: un círculo de ciudades muy reales, con sus virtudes y sus heridas.',
      en: 'From exile on Patmos, seven letters follow the postal road of Asia Minor: a circle of very real cities, each with its virtues and its wounds.',
    },
    stops: [
      {
        placeSlug: 'patmos',
        title: { es: 'Patmos — el Día del Señor', en: 'Patmos — the Lord’s Day' },
        note: {
          es: 'Desterrado en una isla pequeña «por causa de la Palabra de Dios», Juan oye a su espalda una voz como de trompeta y se vuelve: el que camina entre los siete candeleros de oro.',
          en: 'Exiled on a small island "because of the word of God", John hears behind him a voice like a trumpet and turns: the one who walks among the seven golden lampstands.',
        },
        readings: [{ book: 'REV', chapter: 1, verses: [9, 20] }],
      },
      {
        placeSlug: 'ephesus',
        title: { es: 'Éfeso — el primer amor', en: 'Ephesus — the first love' },
        note: {
          es: 'La gran capital de Asia: trabajo, constancia y doctrina sana. Y un solo reproche, el más triste de los siete: «has dejado tu amor primero».',
          en: 'The great capital of Asia: toil, endurance and sound doctrine. And a single reproach, the saddest of the seven: "you have abandoned the love you had at first".',
        },
        readings: [{ book: 'REV', chapter: 2, verses: [1, 7] }],
      },
      {
        placeSlug: 'smyrna',
        title: { es: 'Esmirna — pobre y rica', en: 'Smyrna — poor and rich' },
        note: {
          es: 'Ni un solo reproche a esta comunidad perseguida: «Conozco tu tribulación y tu pobreza — pero eres rica». Solo se le pide fidelidad durante diez días.',
          en: 'Not one reproach to this persecuted community: "I know your tribulation and your poverty — but you are rich". All that is asked is faithfulness for ten days.',
        },
        readings: [{ book: 'REV', chapter: 2, verses: [8, 11] }],
      },
      {
        placeSlug: 'pergamum',
        title: { es: 'Pérgamo — donde está el trono', en: 'Pergamum — where the throne is' },
        note: {
          es: 'Ciudad de templos y del gran altar sobre la acrópolis: allí la fe vive bajo presión y allí murió Antipas, el testigo fiel. Al vencedor, el maná escondido y una piedra blanca.',
          en: 'A city of temples and of the great altar on the acropolis: there the faith lives under pressure and there Antipas, the faithful witness, died. To the victor, hidden manna and a white stone.',
        },
        readings: [{ book: 'REV', chapter: 2, verses: [12, 17] }],
      },
      {
        placeSlug: 'thyatira',
        title: { es: 'Tiatira — los gremios', en: 'Thyatira — the guilds' },
        note: {
          es: 'La ciudad de los tintoreros de púrpura, de donde venía Lidia. Se le alaba lo raro — «tus últimas obras son mejores que las primeras» — y se le reprocha tolerar a «Jezabel».',
          en: 'The city of the purple dyers, where Lydia came from. It is praised for something rare — "your last works are greater than the first" — and reproached for tolerating "Jezebel".',
        },
        readings: [{ book: 'REV', chapter: 2, verses: [18, 29] }],
      },
      {
        placeSlug: 'sardis',
        title: { es: 'Sardes — nombre de vivo', en: 'Sardis — a name of being alive' },
        note: {
          es: 'La vieja capital de Creso, tomada dos veces por descuidar la vigilancia de noche. «Tienes nombre de que vives, y estás muerto. Sé vigilante».',
          en: 'The old capital of Croesus, twice taken because the night watch slackened. "You have the name of being alive, and you are dead. Be watchful".',
        },
        readings: [{ book: 'REV', chapter: 3, verses: [1, 6] }],
      },
      {
        placeSlug: 'philadelphia',
        title: { es: 'Filadelfia — la puerta abierta', en: 'Philadelphia — the open door' },
        note: {
          es: 'La más joven de las siete, con poca fuerza y la palabra bien guardada. «He puesto delante de ti una puerta abierta que nadie puede cerrar».',
          en: 'The youngest of the seven, with little power and the word well kept. "I have set before you an open door which no one can shut".',
        },
        readings: [{ book: 'REV', chapter: 3, verses: [7, 13] }],
      },
      {
        placeSlug: 'laodicea',
        title: { es: 'Laodicea — ni fría ni caliente', en: 'Laodicea — neither cold nor hot' },
        note: {
          es: 'Rica, banquera, famosa por su colirio y su lana negra — y sin embargo ciega, pobre y desnuda. Al final, la imagen más doméstica del libro: «Estoy a la puerta y llamo».',
          en: 'Rich, a banking city, famous for its eye-salve and its black wool — and yet blind, poor and naked. At the end, the most domestic image in the book: "I stand at the door and knock".',
        },
        readings: [{ book: 'REV', chapter: 3, verses: [14, 22] }],
      },
    ],
  },
];

export const ROUTES: BibleRoute[] = [
  ...CORE_ROUTES,
  ...MORE_ROUTES,
  ...HEROES_ROUTES,
  ...CONQUEST_ROUTES,
  ...PATRIARCHS_ROUTES,
  ...KINGDOM_ROUTES,
  ...PROPHETS_ROUTES,
  ...APOCALYPSE_ROUTES,
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
