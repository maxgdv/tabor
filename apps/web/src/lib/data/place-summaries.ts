// Qué ocurre en cada lugar — resumen breve para la ficha.
//
// ⚠️ BORRADOR EDITORIAL: pendiente de revisión del maintainer. Como el resto
// del contenido curado (ver CONTRIBUTING), lo propone el asistente y NO se
// considera definitivo hasta que una persona lo valide.
//
// POR QUÉ EXISTE
//
// Una ficha de lugar era un mapa y una lista de versículos. Para quien llega
// preguntando «¿dónde queda Berea en la Biblia?» o «¿qué pasó en Betel?» eso
// no responde nada, y para un buscador es una página igual a otras
// trescientas. Dos o tres frases dicen lo que el lugar significa en el
// relato bíblico, y `readings` señala los capítulos donde leerlo.
//
// CRITERIOS
//
//  1. Solo lo que el texto bíblico cuenta de ese lugar, sin devoción añadida
//     ni datos perecederos. Donde la identificación del sitio es tradicional
//     o discutida, se dice (Sinaí, Tabor, Caná, Emaús, Gólgota).
//  2. Geografía práctica, no jurisdicción: se nombra el país actual solo
//     donde no hay disputa (Turquía, Grecia, Egipto) y, en Tierra Santa, se
//     sitúa el lugar por su entorno físico. Mismo criterio que
//     `visitable-sites.ts`.
//  3. Sin citas literales del texto: las traducciones difieren y una cita
//     entrecomillada habría que casarla con cada versión.
//  4. `readings` son capítulos, no versículos, y todos están comprobados
//     contra la BD: existe el capítulo y el atlas vincula ese lugar con algún
//     versículo suyo. Se evitan los Salmos (numeración greco-latina) y los
//     libros con cortes de capítulo distintos entre ediciones.
//  5. Las fechas son las convencionales (722 y 587 a. C.); otras cronologías
//     las desplazan un año.
//
// Las claves son los `slug` del atlas. Un lugar sin entrada simplemente no
// muestra el bloque.

export type PlaceSummary = {
  es: string;
  en: string;
  /** Capítulos donde leer lo que se cuenta: libro (canonical_id) y número. */
  readings: readonly { book: string; chapter: number }[];
};

export const PLACE_SUMMARIES: Readonly<Record<string, PlaceSummary>> = {
  jerusalem: {
    es: 'La ciudad que David conquista y convierte en su capital, y donde Salomón levanta el Templo. En ella transcurren la pasión, la muerte y la resurrección de Jesús, y allí nace la Iglesia el día de Pentecostés.',
    en: 'The city David captures and makes his capital, and where Solomon builds the Temple. The passion, death and resurrection of Jesus take place here, and here the Church is born on the day of Pentecost.',
    readings: [
      { book: '2SA', chapter: 5 },
      { book: '1KI', chapter: 8 },
      { book: 'LUK', chapter: 19 },
      { book: 'ACT', chapter: 2 },
    ],
  },
  'bethlehem-1': {
    es: 'Pequeña ciudad de la montaña de Judá, al sur de Jerusalén. Es la patria de David, a quien Samuel unge rey en ella, y el lugar donde nace Jesús según los evangelios de Mateo y Lucas.',
    en: 'A small town in the hill country of Judah, south of Jerusalem. It is the home of David, whom Samuel anoints king there, and the place where Jesus is born according to the gospels of Matthew and Luke.',
    readings: [
      { book: 'RUT', chapter: 1 },
      { book: '1SA', chapter: 16 },
      { book: 'MAT', chapter: 2 },
      { book: 'LUK', chapter: 2 },
    ],
  },
  nazareth: {
    es: 'Aldea de Galilea donde el ángel anuncia a María el nacimiento de Jesús. Allí crece y vive Jesús hasta el comienzo de su vida pública, y por eso lo llaman «el Nazareno».',
    en: 'A village in Galilee where the angel announces to Mary the birth of Jesus. Jesus grows up and lives there until the beginning of his public life, which is why he is called "the Nazarene".',
    readings: [
      { book: 'LUK', chapter: 1 },
      { book: 'LUK', chapter: 4 },
      { book: 'MAT', chapter: 2 },
    ],
  },
  capernaum: {
    es: 'Ciudad de pescadores en la orilla norte del mar de Galilea. Jesús se establece en ella al dejar Nazaret y la convierte en el centro de su predicación: enseña en su sinagoga, cura a muchos enfermos y llama allí a varios de los apóstoles.',
    en: 'A fishing town on the northern shore of the Sea of Galilee. Jesus settles there after leaving Nazareth and makes it the centre of his preaching: he teaches in its synagogue, heals many of the sick and calls several of the apostles there.',
    readings: [
      { book: 'MAT', chapter: 4 },
      { book: 'MRK', chapter: 1 },
      { book: 'JHN', chapter: 6 },
    ],
  },
  'jericho-1': {
    es: 'Ciudad del valle del Jordán, junto a un oasis y cerca del mar Muerto. Es la primera que toma Israel al entrar en la tierra prometida, cuando caen sus murallas. Por ella pasan Elías y Eliseo antes de que el primero sea arrebatado al cielo, y Eliseo sanea después su manantial. La Jericó que visita Jesús es un emplazamiento vecino, con ficha propia.',
    en: 'A city in the Jordan valley, beside an oasis and near the Dead Sea. It is the first city Israel takes on entering the promised land, when its walls fall. Elijah and Elisha pass through it before Elijah is taken up to heaven, and Elisha afterwards makes its spring wholesome. The Jericho Jesus visits is a neighbouring site, with a page of its own.',
    readings: [
      { book: 'JOS', chapter: 6 },
      { book: '2KI', chapter: 2 },
    ],
  },
  // El atlas distingue la Jericó del Antiguo Testamento (Tell es Sultan) de
  // la de época herodiana (Tell el Alayiq), y vincula a esta los pasajes de
  // los evangelios.
  'jericho-2': {
    es: 'La Jericó de tiempos de Jesús, a poca distancia de la ciudad antigua. Al pasar por ella, Jesús devuelve la vista a un ciego y se hospeda en casa de Zaqueo, jefe de publicanos.',
    en: 'The Jericho of the time of Jesus, a short distance from the ancient city. Passing through it, Jesus restores the sight of a blind man and stays at the house of Zacchaeus, a chief tax collector.',
    readings: [
      { book: 'MRK', chapter: 10 },
      { book: 'LUK', chapter: 19 },
    ],
  },
  'bethany-1': {
    es: 'Aldea en la ladera oriental del monte de los Olivos, a unos tres kilómetros de Jerusalén. Es el hogar de Marta, María y Lázaro: allí resucita Jesús a su amigo, y allí se aloja en los días previos a la Pasión.',
    en: 'A village on the eastern slope of the Mount of Olives, about two miles from Jerusalem. It is the home of Martha, Mary and Lazarus: there Jesus raises his friend from the dead, and there he stays in the days before the Passion.',
    readings: [
      { book: 'JHN', chapter: 11 },
      { book: 'JHN', chapter: 12 },
      { book: 'MRK', chapter: 14 },
    ],
  },
  'galilee-1': {
    es: 'Región del norte del país, en torno al lago que lleva su nombre. En ella transcurre la mayor parte de la vida pública de Jesús: la predicación, la llamada de los discípulos y muchos de los milagros.',
    en: 'The northern region of the country, around the lake that bears its name. Most of the public life of Jesus takes place here: the preaching, the calling of the disciples and many of the miracles.',
    readings: [
      { book: 'MAT', chapter: 4 },
      { book: 'MRK', chapter: 1 },
      { book: 'JHN', chapter: 2 },
    ],
  },
  'sea-of-galilee': {
    es: 'Lago de agua dulce que atraviesa el Jordán, llamado también lago de Genesaret y mar de Tiberíades. En sus orillas Jesús llama a los primeros discípulos; en sus aguas calma la tempestad y camina hacia la barca.',
    en: 'A freshwater lake crossed by the Jordan, also called the Lake of Gennesaret and the Sea of Tiberias. On its shores Jesus calls the first disciples; on its waters he calms the storm and walks towards the boat.',
    readings: [
      { book: 'MAT', chapter: 4 },
      { book: 'MRK', chapter: 1 },
      { book: 'JHN', chapter: 6 },
    ],
  },
  jordan: {
    es: 'El río que baja desde el norte del país hasta el mar Muerto. Israel lo cruza a pie enjuto para entrar en la tierra prometida, Naamán el sirio se cura de la lepra en sus aguas, y en él bautiza Juan a Jesús.',
    en: 'The river that flows from the north of the country down to the Dead Sea. Israel crosses it on dry ground to enter the promised land, Naaman the Syrian is healed of leprosy in its waters, and in it John baptizes Jesus.',
    readings: [
      { book: 'JOS', chapter: 3 },
      { book: '2KI', chapter: 5 },
      { book: 'MAT', chapter: 3 },
    ],
  },
  'mount-tabor': {
    es: 'Monte aislado que se alza sobre la llanura de Yizreel, en Galilea. Débora y Barac reúnen en él al ejército de Israel antes de vencer a Sísara. La tradición cristiana sitúa en su cima la Transfiguración, aunque los evangelios no dan el nombre del monte.',
    en: 'A solitary mountain rising above the plain of Jezreel, in Galilee. Deborah and Barak gather the army of Israel on it before defeating Sisera. Christian tradition places the Transfiguration on its summit, although the gospels do not name the mountain.',
    readings: [{ book: 'JDG', chapter: 4 }],
  },
  'mount-sinai': {
    es: 'El monte del desierto donde Dios se manifiesta a Moisés, sella la alianza con Israel y le entrega la Ley. Su localización es tradicional: desde antiguo se identifica con el Jebel Musa, al sur de la península del Sinaí.',
    en: 'The mountain in the wilderness where God reveals himself to Moses, seals the covenant with Israel and gives the Law. Its location is traditional: since antiquity it has been identified with Jebel Musa, in the south of the Sinai peninsula.',
    readings: [
      { book: 'EXO', chapter: 19 },
      { book: 'EXO', chapter: 24 },
      { book: 'EXO', chapter: 34 },
    ],
  },
  egypt: {
    es: 'El país del Nilo. José llega a él vendido por sus hermanos y allí se establece después toda la familia de Jacob; generaciones más tarde, Moisés saca al pueblo de la esclavitud. También la Sagrada Familia se refugia en Egipto huyendo de Herodes.',
    en: 'The land of the Nile. Joseph arrives there sold by his brothers, and the whole family of Jacob later settles there; generations afterwards, Moses leads the people out of slavery. The Holy Family also takes refuge in Egypt, fleeing from Herod.',
    readings: [
      { book: 'GEN', chapter: 46 },
      { book: 'EXO', chapter: 12 },
      { book: 'MAT', chapter: 2 },
    ],
  },
  'babylon-1': {
    es: 'Capital del imperio que destruye Jerusalén y su Templo en el 587 a. C. y deporta a sus habitantes. El destierro en Babilonia marca la historia y la oración de Israel; el profeta Jeremías escribe a los deportados para que echen raíces allí y esperen el regreso.',
    en: 'The capital of the empire that destroys Jerusalem and its Temple in 587 BC and deports its inhabitants. The exile in Babylon marks the history and the prayer of Israel; the prophet Jeremiah writes to the exiles telling them to put down roots there and wait for the return.',
    readings: [
      { book: '2KI', chapter: 25 },
      { book: 'JER', chapter: 29 },
      { book: 'DAN', chapter: 1 },
    ],
  },
  nineveh: {
    es: 'Capital de Asiria, a orillas del Tigris. A ella envía Dios al profeta Jonás, y la ciudad entera se convierte al oír su predicación; el profeta Nahúm anuncia más tarde su caída.',
    en: 'The capital of Assyria, on the banks of the Tigris. God sends the prophet Jonah to it, and the whole city repents on hearing his preaching; the prophet Nahum later announces its fall.',
    readings: [
      { book: 'JON', chapter: 3 },
      { book: 'NAM', chapter: 1 },
    ],
  },
  damascus: {
    es: 'Capital de los arameos, vecina y a menudo rival de Israel. En el camino hacia ella Saulo de Tarso cae a tierra ante Cristo resucitado; en Damasco recibe el bautismo y empieza a predicar.',
    en: 'The capital of the Arameans, neighbour and often rival of Israel. On the road to it Saul of Tarsus falls to the ground before the risen Christ; in Damascus he is baptized and begins to preach.',
    readings: [
      { book: '2KI', chapter: 5 },
      { book: 'ACT', chapter: 9 },
    ],
  },
  hebron: {
    es: 'Ciudad de la montaña de Judá. Abrahán se establece junto a ella y compra allí la cueva de Macpelá para sepultar a Sara; David reina en Hebrón siete años antes de conquistar Jerusalén.',
    en: 'A city in the hill country of Judah. Abraham settles beside it and buys the cave of Machpelah there to bury Sarah; David reigns in Hebron for seven years before he captures Jerusalem.',
    readings: [
      { book: 'GEN', chapter: 23 },
      { book: '2SA', chapter: 2 },
      { book: '2SA', chapter: 5 },
    ],
  },
  'bethel-1': {
    es: 'Su nombre significa «casa de Dios»: es el lugar donde Jacob ve en sueños la escalera que une el cielo y la tierra. Tras la división del reino, Jeroboán coloca allí uno de sus becerros de oro.',
    en: 'Its name means "house of God": it is the place where Jacob sees in a dream the ladder joining heaven and earth. After the kingdom divides, Jeroboam sets up one of his golden calves there.',
    readings: [
      { book: 'GEN', chapter: 28 },
      { book: '1KI', chapter: 12 },
    ],
  },
  shechem: {
    es: 'Ciudad situada entre los montes Ebal y Garizim. Es la primera parada de Abrahán en Canaán y el lugar donde Josué reúne a las tribus para renovar la alianza.',
    en: 'A city lying between Mount Ebal and Mount Gerizim. It is the first stop of Abraham in Canaan and the place where Joshua gathers the tribes to renew the covenant.',
    readings: [
      { book: 'GEN', chapter: 12 },
      { book: 'JOS', chapter: 24 },
    ],
  },
  'samaria-1': {
    es: 'Capital del reino del Norte, fundada por el rey Omrí sobre una colina que compra a un hombre llamado Sémer. Asiria la toma en el 722 a. C. y deporta a sus habitantes; su nombre acaba designando toda la región central del país.',
    en: 'The capital of the Northern Kingdom, founded by King Omri on a hill he buys from a man named Shemer. Assyria takes it in 722 BC and deports its inhabitants; its name comes to stand for the whole central region of the country.',
    readings: [
      { book: '1KI', chapter: 16 },
      { book: '2KI', chapter: 17 },
    ],
  },
  'mount-carmel': {
    es: 'Sierra que termina en un promontorio sobre el Mediterráneo. En ella el profeta Elías desafía a los profetas de Baal, y el fuego del cielo consume su sacrificio.',
    en: 'A range ending in a headland above the Mediterranean. On it the prophet Elijah challenges the prophets of Baal, and fire from heaven consumes his sacrifice.',
    readings: [{ book: '1KI', chapter: 18 }],
  },
  'mount-of-olives': {
    es: 'La colina que domina Jerusalén desde el este, al otro lado del torrente Cedrón. Jesús enseña en ella sobre el fin de los tiempos, ora a sus pies la noche de su arresto, y desde allí asciende al cielo.',
    en: 'The hill overlooking Jerusalem from the east, across the Kidron valley. Jesus teaches on it about the end of the age, prays at its foot on the night of his arrest, and from there ascends into heaven.',
    readings: [
      { book: 'MAT', chapter: 24 },
      { book: 'LUK', chapter: 22 },
      { book: 'ACT', chapter: 1 },
    ],
  },
  cana: {
    es: 'Aldea de Galilea donde Jesús, en unas bodas, convierte el agua en vino: el primero de sus signos según el evangelio de Juan. No hay acuerdo sobre su localización exacta; el atlas marca una de las candidatas.',
    en: 'A village in Galilee where Jesus, at a wedding, turns water into wine: the first of his signs according to the gospel of John. Its exact location is disputed; the atlas marks one of the candidates.',
    readings: [
      { book: 'JHN', chapter: 2 },
      { book: 'JHN', chapter: 4 },
    ],
  },
  emmaus: {
    es: 'Aldea hacia la que caminan dos discípulos la tarde de Pascua, cuando Jesús resucitado se les une sin que lo reconozcan hasta que parte el pan. Varias localidades se disputan el nombre.',
    en: 'A village towards which two disciples are walking on Easter afternoon, when the risen Jesus joins them and they do not recognize him until he breaks the bread. Several sites claim the name.',
    readings: [{ book: 'LUK', chapter: 24 }],
  },
  ephesus: {
    es: 'Gran ciudad portuaria de la provincia romana de Asia, hoy en la costa de Turquía. Pablo vive en ella más de dos años, y es la primera de las siete iglesias a las que se dirige el Apocalipsis.',
    en: 'A great port city of the Roman province of Asia, today on the coast of Turkey. Paul lives there for more than two years, and it is the first of the seven churches addressed in the book of Revelation.',
    readings: [
      { book: 'ACT', chapter: 19 },
      { book: 'REV', chapter: 2 },
    ],
  },
  corinth: {
    es: 'Ciudad griega situada en el istmo, próspera y cosmopolita. Pablo funda en ella una comunidad a la que después dirige dos de sus cartas más extensas.',
    en: 'A Greek city on the isthmus, prosperous and cosmopolitan. Paul founds a community there to which he later writes two of his longest letters.',
    readings: [
      { book: 'ACT', chapter: 18 },
      { book: '1CO', chapter: 1 },
    ],
  },
  'antioch-1': {
    es: 'Antioquía de Siria, a orillas del Orontes, hoy en el sur de Turquía. En ella los discípulos reciben por primera vez el nombre de cristianos, y de su comunidad parten Pablo y Bernabé en sus viajes misioneros.',
    en: 'Antioch of Syria, on the banks of the Orontes, today in southern Turkey. There the disciples are first called Christians, and from its community Paul and Barnabas set out on their missionary journeys.',
    readings: [
      { book: 'ACT', chapter: 11 },
      { book: 'ACT', chapter: 13 },
    ],
  },
  rome: {
    es: 'Capital del imperio. Pablo escribe a sus cristianos la más larga de sus cartas y llega a ella preso, después de apelar al César; con su estancia en Roma termina el libro de los Hechos.',
    en: 'The capital of the empire. Paul writes to its Christians the longest of his letters and arrives there as a prisoner, after appealing to Caesar; the book of Acts ends with his stay in Rome.',
    readings: [
      { book: 'ACT', chapter: 28 },
      { book: 'ROM', chapter: 1 },
    ],
  },
  patmos: {
    es: 'Pequeña isla del mar Egeo, hoy griega. En ella se encuentra Juan, desterrado por su testimonio de Jesús, cuando recibe las visiones del Apocalipsis.',
    en: 'A small island in the Aegean Sea, today part of Greece. John is there, exiled for his witness to Jesus, when he receives the visions of the book of Revelation.',
    readings: [{ book: 'REV', chapter: 1 }],
  },
  chebar: {
    es: 'Río o canal de Babilonia junto al que viven los deportados de Judá. A su orilla el profeta Ezequiel contempla la visión de la gloria de Dios con la que comienza su libro.',
    en: 'A river or canal in Babylonia beside which the exiles from Judah live. On its bank the prophet Ezekiel sees the vision of the glory of God with which his book begins.',
    readings: [
      { book: 'EZK', chapter: 1 },
      { book: 'EZK', chapter: 3 },
      { book: 'EZK', chapter: 10 },
    ],
  },
  berea: {
    es: 'Ciudad de Macedonia, hoy Veria, en el norte de Grecia. Pablo y Silas llegan a ella desde Tesalónica; los judíos de su sinagoga acogen la predicación con buena disposición y examinan cada día las Escrituras para comprobarla.',
    en: 'A city of Macedonia, today Veria, in northern Greece. Paul and Silas arrive there from Thessalonica; the Jews of its synagogue receive the preaching readily and examine the Scriptures every day to test it.',
    readings: [{ book: 'ACT', chapter: 17 }],
  },
  gennesaret: {
    es: 'Llanura fértil en la orilla noroeste del mar de Galilea, que a veces da nombre al lago entero. Jesús desembarca en ella y le llevan enfermos de toda la comarca.',
    en: 'A fertile plain on the north-western shore of the Sea of Galilee, which sometimes gives its name to the whole lake. Jesus lands there and the sick of the whole district are brought to him.',
    readings: [
      { book: 'MAT', chapter: 14 },
      { book: 'MRK', chapter: 6 },
      { book: 'LUK', chapter: 5 },
    ],
  },
  golgotha: {
    es: 'El «lugar de la Calavera»: la roca, fuera de las murallas de Jerusalén, donde crucifican a Jesús. La tradición lo sitúa dentro de la actual basílica del Santo Sepulcro.',
    en: 'The "place of the Skull": the rock, outside the walls of Jerusalem, where Jesus is crucified. Tradition places it inside the present-day Church of the Holy Sepulchre.',
    readings: [
      { book: 'MAT', chapter: 27 },
      { book: 'MRK', chapter: 15 },
      { book: 'JHN', chapter: 19 },
    ],
  },
  gethsemane: {
    es: 'Huerto al pie del monte de los Olivos, al otro lado del Cedrón. Jesús se retira a orar en él después de la Última Cena, y allí lo prenden.',
    en: 'A garden at the foot of the Mount of Olives, across the Kidron. Jesus withdraws there to pray after the Last Supper, and there he is arrested.',
    readings: [
      { book: 'MAT', chapter: 26 },
      { book: 'MRK', chapter: 14 },
    ],
  },
};
