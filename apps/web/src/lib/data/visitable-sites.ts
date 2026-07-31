// Lugares bíblicos que hoy se pueden visitar — Tierra Santa.
//
// ⚠️ BORRADOR EDITORIAL: pendiente de revisión del maintainer. Igual que el
// resto del contenido curado (ver CONTRIBUTING), lo propone el asistente y NO
// se considera definitivo hasta que una persona lo valide. Aquí el listón es
// alto por dos motivos: se afirma qué hay en un sitio real —comprobable por
// cualquiera que vaya— y se habla de lugares sobre los que casi nadie escribe
// sin tomar partido.
//
// CRITERIOS con los que se hizo esta lista:
//
//  1. Sólo topónimos que la Biblia nombra y que existen en el atlas de la BD.
//     Masada, Qumrán, Ein Karem, Séforis o el monte de las Bienaventuranzas
//     son visitas de primer orden y no están aquí: no son lugares bíblicos, o
//     no lo son con ese nombre. La frontera la marca el atlas, no el gusto.
//     Cuando un santuario célebre cae dentro de un topónimo que sí existe
//     —Tabga dentro de Genesaret, el Cenáculo dentro del monte Sión— se
//     menciona en `preserved` sin inventarle una entrada propia.
//  2. Lo que un peregrino visita de verdad. Se descartaron tells sin nada a
//     la vista aunque el nombre sea sonoro.
//  3. `preserved` responde a «¿qué veo hoy?»: qué se conserva, de qué época y
//     en qué estado. Nada perecedero —horarios, precios, accesos de pago,
//     agencias— y nada de valoraciones de seguridad.
//  4. `whereItIs` es geografía práctica, no jurisdicción. Se usan los nombres
//     geográficos corrientes en español (Cisjordania, Altos del Golán, valle
//     de Yizreel) porque son los que permiten orientarse en un mapa, y TABOR
//     no toma partido sobre soberanías. Donde el trayecto real no se parece a
//     la distancia en línea recta, se dice, y sin dramatizar.
//  5. RIGOR sobre devoción. Muchos de estos santuarios conmemoran un lugar
//     sin que la identificación esté probada, y a veces hay dos o tres
//     candidatos. Donde es así se dice con todas las letras («la tradición
//     sitúa aquí», «se disputan el nombre», «no está probado»). Un dato que
//     se presenta como cierto sin serlo es exactamente lo que este proyecto
//     no quiere ser.
//  6. `reading` es el pasaje que pertenece a ese sitio, no un pasaje bonito
//     que lo mencione de pasada. Todos se verificaron contra el texto real de
//     la versión STRA en la base de datos: existe el libro, existe el
//     capítulo y existe el rango de versículos. Los Salmos van en numeración
//     greco-latina (la de la Vulgata y la de la BD): el «Laetatus sum» es el
//     121, no el 122.
//
// Los comentarios al final de cada lectura citan las primeras palabras del
// pasaje en español, para que la revisión humana se pueda hacer sin abrir la
// Biblia al lado.
//
// PENDIENTE: la región 'viajes-de-pablo' va en una tanda posterior.
//
// OJO: `import type`, no un import de valor — `visitable.ts` importa este
// fichero, y un import normal cerraría el ciclo en tiempo de ejecución.
import type { VisitableSite } from '../visitable';

export const VISITABLE_SITES: VisitableSite[] = [
  // === JERUSALÉN Y SU ENTORNO INMEDIATO =================================
  {
    slug: 'jerusalem',
    region: 'tierra-santa',
    preserved: {
      es: 'La ciudad vieja conserva el recinto amurallado otomano del siglo XVI y, debajo, capas que llegan hasta la Edad del Hierro. Se recorren a pie los cuatro barrios, el Muro Occidental —el flanco de contención de la explanada herodiana— y tramos de la muralla por el adarve. Del Templo mismo no queda en pie nada salvo esos muros de sostén.',
      en: 'The Old City is still enclosed by the sixteenth-century Ottoman wall, with layers beneath it reaching back to the Iron Age. You can walk the four quarters, the Western Wall — the retaining side of Herod’s temple platform — and long stretches of the ramparts. Of the Temple itself nothing stands but those supporting walls.',
    },
    whereItIs: {
      es: 'En las montañas de Judea, a unos 750 m de altitud y a 60 km del Mediterráneo. La ciudad vieja ocupa apenas un kilómetro cuadrado en el extremo sureste de la ciudad moderna.',
      en: 'In the Judean hills, about 750 m above sea level and 60 km inland from the Mediterranean. The Old City covers barely a square kilometre at the south-eastern edge of the modern city.',
    },
    reading: { book: 'PSA', chapter: 121, verses: [1, 9] }, // «Me llené de gozo cuando me dijeron: Iremos a la Casa de Yahvé» (greco-latino 121 = hebreo 122)
  },
  {
    slug: 'mount-moriah',
    region: 'tierra-santa',
    preserved: {
      es: 'La explanada del Templo es hoy un recinto de unas catorce hectáreas sostenido por muros herodianos, con la Cúpula de la Roca (siglo VII) sobre el afloramiento rocoso del centro. En el ángulo suroeste siguen en el pavimento las piedras derribadas en el año 70 y el arranque del arco de Robinson. Que el Moriah del Génesis sea esta colina lo afirma 2 Crónicas 3,1; no hay dato arqueológico que lo confirme.',
      en: 'The Temple platform is a fourteen-hectare enclosure held up by Herodian walls, with the seventh-century Dome of the Rock over the outcrop at its centre. At the south-western corner the stones toppled in AD 70 still lie where they fell, beside the springing of Robinson’s Arch. The identification of Genesis’ Moriah with this hill comes from 2 Chronicles 3:1, not from archaeology.',
    },
    whereItIs: {
      es: 'En el flanco oriental de la ciudad vieja de Jerusalén, asomada al valle del Cedrón.',
      en: 'On the eastern flank of Jerusalem’s Old City, overlooking the Kidron valley.',
    },
    reading: { book: 'GEN', chapter: 22, verses: [1, 14] }, // «Después de esto probó Dios a Abrahán»
  },
  {
    slug: 'ophel',
    region: 'tierra-santa',
    preserved: {
      es: 'El espolón donde estuvo la Jerusalén jebusea y davídica se excava desde el siglo XIX: casas de la Edad del Hierro, una gran estructura escalonada de piedra y, ya en el Ofel, escalinatas y edificios administrativos del Segundo Templo. Buena parte del recorrido es subterráneo y sale al valle del Cedrón.',
      en: 'The spur that held Jebusite and Davidic Jerusalem has been dug since the nineteenth century: Iron Age houses, a massive stepped stone structure, and — further up, on the Ophel — Second Temple stairways and administrative buildings. Much of the route runs underground and comes out into the Kidron valley.',
    },
    whereItIs: {
      es: 'Ladera abajo desde la explanada del Templo, entre la muralla sur de la ciudad vieja y el barrio de Silwán.',
      en: 'Downhill from the Temple platform, between the southern wall of the Old City and the Silwan neighbourhood.',
    },
    reading: { book: '2SA', chapter: 5, verses: [6, 12] }, // «Y marchó el rey con su gente a Jerusalén, contra los jebuseos»
  },
  {
    slug: 'gihon-2',
    region: 'tierra-santa',
    preserved: {
      es: 'La fuente sigue manando en la ladera del Cedrón, dentro de un complejo de torres cananeas excavado a su alrededor. Desde ella parten dos canales: el túnel de Ezequías, 533 m tallados en la roca por los que se camina con agua hasta la rodilla, y el canal cananeo, seco. El túnel desemboca en la piscina de Siloé.',
      en: 'The spring still runs on the Kidron slope, inside an excavated complex of Canaanite towers. Two channels lead off from it: Hezekiah’s tunnel, 533 m cut through the rock and waded knee-deep, and the dry Canaanite channel. The tunnel comes out at the Pool of Siloam.',
    },
    whereItIs: {
      es: 'En la vertiente oriental de la Ciudad de David, sobre el valle del Cedrón.',
      en: 'On the eastern side of the City of David, above the Kidron valley.',
    },
    reading: { book: '1KI', chapter: 1, verses: [32, 40] }, // «Llamadme al sacerdote Sadoc, al profeta Natán…»
  },
  {
    slug: 'siloam',
    region: 'tierra-santa',
    preserved: {
      es: 'En 2004 unas obras de alcantarillado dejaron al descubierto los peldaños de la piscina del Segundo Templo, la que menciona Juan; se excava por tramos y sólo una parte está a la vista. La piscina pequeña que se enseñaba antes, con su minarete al lado, es bizantina y posterior.',
      en: 'In 2004 sewer works uncovered the steps of the Second Temple pool, the one John names; it is being excavated in sections and only part of it is exposed. The small pool shown to visitors before that, with its minaret beside it, is Byzantine and later.',
    },
    whereItIs: {
      es: 'Al pie sur de la Ciudad de David, donde acaba el túnel de Ezequías, junto al barrio de Silwán.',
      en: 'At the southern foot of the City of David, where Hezekiah’s tunnel ends, beside the Silwan neighbourhood.',
    },
    reading: { book: 'JHN', chapter: 9, verses: [1, 11] }, // «Al pasar vio a un hombre, ciego de nacimiento»
  },
  {
    slug: 'mount-zion',
    region: 'tierra-santa',
    preserved: {
      es: 'La colina occidental lleva el nombre de Sión desde época bizantina; el Sión de los libros históricos era la colina oriental, la de la Ciudad de David. Aquí se visitan el Cenáculo —una sala gótica del siglo XII sobre construcciones anteriores, que la tradición señala como lugar de la última cena y de Pentecostés—, la abadía de la Dormición y el edificio que la tradición judía venera como tumba de David.',
      en: 'The western hill has been called Zion since Byzantine times; the Zion of the historical books was the eastern hill, that of the City of David. The visits here are the Cenacle — a twelfth-century Gothic hall over earlier structures, held by tradition to be the room of the Last Supper and of Pentecost — the Dormition abbey, and the building Jewish tradition venerates as David’s tomb.',
    },
    whereItIs: {
      es: 'Fuera de la muralla otomana, al sur de la puerta de Sión, a unos minutos a pie de la ciudad vieja de Jerusalén.',
      en: 'Outside the Ottoman wall, south of the Zion Gate, a few minutes’ walk from Jerusalem’s Old City.',
    },
    reading: { book: 'ACT', chapter: 2, verses: [1, 13] }, // «Al cumplirse el día de Pentecostés, se hallaban todos juntos»
  },
  {
    slug: 'golgotha',
    region: 'tierra-santa',
    preserved: {
      es: 'El Santo Sepulcro cubre bajo un mismo techo el afloramiento del Calvario y el edículo que guarda los restos de una tumba excavada en la roca. El lugar era una cantera abandonada fuera de la muralla del siglo I, con tumbas alrededor, lo que hace verosímil la identificación sin demostrarla. Seis comunidades cristianas comparten el edificio según el reparto fijado en el statu quo de 1852.',
      en: 'The Holy Sepulchre shelters under one roof the outcrop of Calvary and the edicule enclosing what remains of a rock-cut tomb. The site was a disused quarry outside the first-century wall, with tombs around it — which makes the identification plausible without proving it. Six Christian communities share the building under the division fixed by the 1852 status quo.',
    },
    whereItIs: {
      es: 'En el barrio cristiano de la ciudad vieja de Jerusalén, donde termina la Vía Dolorosa.',
      en: 'In the Christian Quarter of Jerusalem’s Old City, at the end of the Via Dolorosa.',
    },
    reading: { book: 'JHN', chapter: 19, verses: [17, 30] }, // «llevándose su cruz, salió para el lugar llamado El cráneo»
  },
  {
    slug: 'gethsemane',
    region: 'tierra-santa',
    preserved: {
      es: 'Un huerto vallado con ocho olivos viejos —datados por radiocarbono en varios siglos, sobre raíces probablemente más antiguas— y, al lado, la basílica de la Agonía, de 1924, levantada sobre restos de una iglesia bizantina y otra cruzada. Dentro, la roca desnuda delante del altar es la que se venera. El lugar exacto de la oración no se conoce: la gruta cercana conserva otra tradición sobre el mismo episodio.',
      en: 'A walled garden with eight old olive trees — radiocarbon-dated to several centuries, on roots probably older still — and beside it the Church of All Nations, built in 1924 over Byzantine and Crusader remains. Inside, the bare rock before the altar is what is venerated. The exact spot of the prayer is unknown; the nearby grotto preserves a rival tradition about the same night.',
    },
    whereItIs: {
      es: 'Al pie del monte de los Olivos, cruzando el valle del Cedrón desde la puerta de los Leones.',
      en: 'At the foot of the Mount of Olives, across the Kidron valley from the Lions’ Gate.',
    },
    reading: { book: 'MRK', chapter: 14, verses: [32, 42] }, // «Y llegaron al huerto llamado Getsemaní»
  },
  {
    slug: 'mount-of-olives',
    region: 'tierra-santa',
    preserved: {
      es: 'Una loma caliza de 800 m cubierta por un cementerio judío de decenas de miles de tumbas y por santuarios cristianos: la capilla octogonal de la Ascensión, hoy mezquita y con una huella en la roca venerada desde el siglo IV; el Pater Noster, con el padrenuestro en más de un centenar de lenguas; y el Dominus Flevit, sobre tumbas del siglo I. Desde la cima se abarca entera la explanada del Templo.',
      en: 'An 800-metre limestone ridge covered by a Jewish cemetery of tens of thousands of graves and by Christian shrines: the octagonal Chapel of the Ascension, now a mosque, with a footprint in the rock venerated since the fourth century; the Pater Noster, with the Lord’s Prayer in more than a hundred languages; and Dominus Flevit, built over first-century tombs. From the summit the whole Temple platform is in view.',
    },
    whereItIs: {
      es: 'Al este de la ciudad vieja de Jerusalén, separada de ella por el valle del Cedrón.',
      en: 'East of Jerusalem’s Old City, separated from it by the Kidron valley.',
    },
    reading: { book: 'ACT', chapter: 1, verses: [6, 12] }, // «¿es este el tiempo en que restablecerás el reino…?»
  },
  {
    slug: 'bethphage',
    region: 'tierra-santa',
    preserved: {
      es: 'Un santuario franciscano pequeño de finales del siglo XIX en el pueblo de et-Tur, sobre restos cruzados. Guarda una piedra cúbica pintada en el siglo XII con escenas de la entrada en Jerusalén, que la tradición relaciona con el momento de montar el asno. De aquí sale cada Domingo de Ramos la procesión hacia la ciudad vieja.',
      en: 'A small Franciscan shrine of the late nineteenth century in the village of et-Tur, over Crusader remains. It keeps a cube of stone painted in the twelfth century with scenes of the entry into Jerusalem, which tradition ties to the mounting of the donkey. The Palm Sunday procession to the Old City sets out from here.',
    },
    whereItIs: {
      es: 'En la ladera oriental del monte de los Olivos, en el camino que sube de Betania a Jerusalén.',
      en: 'On the eastern slope of the Mount of Olives, on the road climbing from Bethany to Jerusalem.',
    },
    reading: { book: 'MRK', chapter: 11, verses: [1, 11] }, // «cerca de Betfagé y Betania, junto al Monte de los Olivos»
  },
  {
    slug: 'kidron',
    region: 'tierra-santa',
    preserved: {
      es: 'Un barranco seco casi todo el año que separa la ciudad vieja del monte de los Olivos y baja hacia el desierto. En el tramo bajo se alinean cuatro monumentos funerarios tallados en la roca del periodo del Segundo Templo, conocidos por nombres tradicionales —Absalón, Zacarías, los hijos de Hezir— que no corresponden a quienes fueron enterrados en ellos.',
      en: 'A ravine, dry for most of the year, separating the Old City from the Mount of Olives and running down towards the desert. Along its lower stretch stand four rock-cut funerary monuments of the Second Temple period, known by traditional names — Absalom, Zechariah, the sons of Hezir — that do not match those actually buried in them.',
    },
    whereItIs: {
      es: 'Entre la ciudad vieja de Jerusalén y el monte de los Olivos; el cauce sigue hacia el sureste hasta el mar Muerto.',
      en: 'Between Jerusalem’s Old City and the Mount of Olives; the watercourse continues south-east to the Dead Sea.',
    },
    reading: { book: '2SA', chapter: 15, verses: [23, 30] }, // «Subía David la cuesta del Monte de los Olivos; subía llorando»
  },
  {
    slug: 'bethany-1',
    region: 'tierra-santa',
    preserved: {
      es: 'Se baja por veinticuatro escalones a una tumba excavada en la roca, con antecámara y cámara, venerada como la de Lázaro desde el siglo IV; encima se sucedieron tres iglesias. Al lado, la iglesia franciscana de 1954 dejó a la vista los ábsides bizantino y cruzado y mosaicos de pavimento.',
      en: 'Twenty-four steps go down to a rock-cut tomb with antechamber and burial chamber, venerated as Lazarus’ since the fourth century; three successive churches stood above it. Next to it, the Franciscan church of 1954 leaves the Byzantine and Crusader apses and floor mosaics on view.',
    },
    whereItIs: {
      es: 'En Cisjordania, en la ladera oriental del monte de los Olivos, a unos 3 km de la ciudad vieja de Jerusalén, aunque el trayecto por carretera es hoy bastante más largo que esa distancia.',
      en: 'In the West Bank, on the eastern slope of the Mount of Olives, about 3 km from Jerusalem’s Old City — though the drive is now considerably longer than that.',
    },
    reading: { book: 'JHN', chapter: 11, verses: [1, 44] }, // «Había uno que estaba enfermo, Lázaro de Betania»
  },
  {
    slug: 'emmaus',
    region: 'tierra-santa',
    preserved: {
      es: 'Tres lugares se disputan el nombre, y los tres tienen santuario: Nicópolis (Imwas), con basílicas bizantina y cruzada excavadas; el-Qubeibe, con una iglesia franciscana sobre una casa y muros cruzados; y Motza-Qaluniya, la que mejor cuadra con los sesenta estadios que dan la mayoría de los manuscritos de Lucas. Ninguna identificación está probada.',
      en: 'Three places claim the name, and all three have a shrine: Nicopolis (Imwas), with excavated Byzantine and Crusader basilicas; el-Qubeibeh, with a Franciscan church over a house and Crusader walls; and Motza-Qaluniya, which best fits the sixty stadia given by most manuscripts of Luke. None of the identifications is settled.',
    },
    whereItIs: {
      es: 'Al oeste de Jerusalén: Motza a unos 6 km por la carretera de Tel Aviv, el-Qubeibe a 12 km al noroeste y Nicópolis a 30 km, ya donde la montaña se abre a la llanura.',
      en: 'West of Jerusalem: Motza some 6 km out along the Tel Aviv road, el-Qubeibeh 12 km to the north-west, and Nicopolis 30 km away, where the hills open onto the plain.',
    },
    reading: { book: 'LUK', chapter: 24, verses: [13, 35] }, // «dos de ellos se dirigían a una aldea, llamada Emaús»
  },

  // === BELÉN, HEBRÓN Y EL SUR ===========================================
  {
    slug: 'bethlehem-1',
    region: 'tierra-santa',
    preserved: {
      es: 'La basílica de la Natividad conserva la planta y las columnas de la reconstrucción de Justiniano (siglo VI) sobre la constantiniana, cuyo mosaico de pavimento se ve bajo unas trampillas. Debajo, la gruta con la estrella de plata de catorce puntas se venera como lugar del nacimiento desde el siglo II, según el testimonio de Justino y Orígenes. La restauración terminada en 2019 recuperó los mosaicos cruzados de los muros altos.',
      en: 'The Church of the Nativity keeps the plan and columns of Justinian’s sixth-century rebuilding over the Constantinian church, whose floor mosaic shows through trapdoors. Below, the grotto with the fourteen-pointed silver star has been venerated as the birthplace since the second century, on the testimony of Justin and Origen. The restoration completed in 2019 brought back the Crusader mosaics on the upper walls.',
    },
    whereItIs: {
      es: 'En Cisjordania, a 10 km al sur de Jerusalén, en el borde del desierto de Judá.',
      en: 'In the West Bank, 10 km south of Jerusalem, on the rim of the Judean desert.',
    },
    reading: { book: 'LUK', chapter: 2, verses: [1, 20] }, // «apareció un edicto del César Augusto»
  },
  {
    slug: 'hebron',
    region: 'tierra-santa',
    preserved: {
      es: 'Tel Rumeida, la colina de la ciudad antigua, tiene a la vista murallas ciclópeas de la Edad del Bronce y se excava por tramos entre las casas actuales. La ciudad conserva un casco antiguo mameluco con el zoco cubierto y talleres de vidrio soplado y cerámica.',
      en: 'Tel Rumeida, the hill of the ancient city, shows Bronze Age cyclopean walls and is dug in sections between present-day houses. The town keeps a Mamluk old quarter with a covered souk and workshops for blown glass and pottery.',
    },
    whereItIs: {
      es: 'En Cisjordania, a 35 km al sur de Jerusalén y a 930 m de altitud, en lo alto de la dorsal montañosa.',
      en: 'In the West Bank, 35 km south of Jerusalem at 930 m, high on the mountain ridge.',
    },
    reading: { book: '2SA', chapter: 5, verses: [1, 5] }, // «llegaron todas las tribus de Israel a David, a Hebrón»
  },
  {
    slug: 'machpelah',
    region: 'tierra-santa',
    preserved: {
      es: 'Un recinto rectangular de sillares herodianos de doce metros de alto, el único edificio de Herodes que sigue en pie casi entero. Dentro hay cenotafios medievales de los patriarcas; las cuevas propiamente dichas están bajo el pavimento, cerradas y sin excavar. El interior está dividido desde 1994 en una parte sinagoga y otra mezquita, con entradas separadas.',
      en: 'A rectangular enclosure of Herodian ashlar twelve metres high — the one building of Herod’s still standing almost intact. Inside are medieval cenotaphs of the patriarchs; the caves themselves lie under the floor, sealed and never excavated. Since 1994 the interior has been divided into a synagogue side and a mosque side, with separate entrances.',
    },
    whereItIs: {
      es: 'En el centro de Hebrón, en Cisjordania, al pie de la colina de la ciudad antigua.',
      en: 'In the centre of Hebron, in the West Bank, below the hill of the ancient city.',
    },
    reading: { book: 'GEN', chapter: 23, verses: [1, 20] }, // «Sara vivió ciento veinte y siete años»
  },
  {
    slug: 'beersheba-2',
    region: 'tierra-santa',
    preserved: {
      es: 'Tel Beer Sheva está excavado por completo: una ciudad israelita de planta ovalada de los siglos IX-VIII a.C., con puerta de tres cámaras, casas adosadas a la muralla, un sistema de drenaje y un pozo de más de cuarenta metros junto a la entrada. El altar de cuernos que se ve en el recinto es una reconstrucción con los sillares reutilizados que aparecieron en un almacén; el original está en museo.',
      en: 'Tel Beer Sheva has been excavated in full: an oval-planned Israelite town of the ninth and eighth centuries BC, with a three-chambered gate, houses backing onto the wall, a drainage system, and a well over forty metres deep beside the entrance. The horned altar on site is a reconstruction from reused blocks found in a storehouse; the original is in a museum.',
    },
    whereItIs: {
      es: 'En el Néguev septentrional, a las afueras de la ciudad moderna de Beer Sheva y a unos 115 km al sur de Jerusalén.',
      en: 'In the northern Negev, on the edge of the modern city of Beer Sheva, about 115 km south of Jerusalem.',
    },
    reading: { book: 'GEN', chapter: 21, verses: [22, 34] }, // «Abimelec, acompañado de Picol, capitán de sus tropas»
  },
  // El Néguev estuvo aquí y se retiró a propósito: es una de las 82 entradas
  // que `place-regions.ts` marca como región, y su punto en la BD coincide
  // exactamente con el de Berseba (Tel Beer Sheva). Una chincheta sobre un
  // desierto entero no señala nada, y dos chinchetas superpuestas en el mapa
  // de la guía señalan mal. Conserva su ficha de lugar como cualquier región;
  // lo que no tiene sentido es presentarlo como un sitio al que se va.
  {
    slug: 'engedi',
    region: 'tierra-santa',
    preserved: {
      es: 'Un oasis con cascadas permanentes en dos cañones que cortan el acantilado sobre el mar Muerto; hoy es reserva natural, con íbices y damanes a la vista. En la ladera hay un santuario calcolítico del IV milenio y, más abajo, los restos de una sinagoga del siglo III con mosaico e inscripción.',
      en: 'An oasis with year-round waterfalls in two canyons cutting the cliff above the Dead Sea, now a nature reserve where ibex and hyrax are easily seen. On the slope stands a Chalcolithic sanctuary of the fourth millennium, and lower down the remains of a third-century synagogue with a mosaic floor and inscription.',
    },
    whereItIs: {
      es: 'En la orilla occidental del mar Muerto, a unos 55 km al sureste de Jerusalén y a 400 m bajo el nivel del mar.',
      en: 'On the western shore of the Dead Sea, some 55 km south-east of Jerusalem and 400 m below sea level.',
    },
    reading: { book: '1SA', chapter: 24, verses: [1, 8] }, // «David subió de allí y se estableció en los lugares fuertes de Engadí»
  },
  {
    slug: 'salt-sea',
    region: 'tierra-santa',
    preserved: {
      es: 'El lago salado más bajo de la Tierra: la superficie está hacia los 435 m bajo el nivel del mar y baja alrededor de un metro al año, de modo que la orilla se aleja y aparecen socavones donde antes hubo agua. Con una salinidad cercana al 34% no hay en él vida animal, y el cuerpo flota sin esfuerzo. La mitad norte y la sur están hoy separadas por un istmo emergido.',
      en: 'The lowest lake on earth: its surface is around 435 m below sea level and falls about a metre a year, so the shoreline retreats and sinkholes open where water used to stand. At roughly 34% salinity nothing lives in it, and a body floats without effort. The northern and southern basins are now divided by an exposed isthmus.',
    },
    whereItIs: {
      es: 'En el fondo de la falla del Jordán, entre el desierto de Judá y las montañas de Moab.',
      en: 'At the bottom of the Jordan rift, between the Judean desert and the mountains of Moab.',
    },
    reading: { book: 'EZK', chapter: 47, verses: [6, 12] }, // «Luego me hizo volver a la orilla del río»
  },
  {
    slug: 'lachish',
    region: 'tierra-santa',
    preserved: {
      es: 'Un tell con doble muralla, una puerta de seis cámaras y la rampa de asedio asiria —la más antigua conservada en el mundo— con su contrarrampa por dentro. El asalto que se ve aquí sobre el terreno está narrado en los relieves del palacio de Nínive, hoy en el Museo Británico.',
      en: 'A tell with a double wall, a six-chambered gate and the Assyrian siege ramp — the oldest surviving anywhere — with the defenders’ counter-ramp inside it. The assault you are standing on is the one carved in the reliefs from the palace at Nineveh, now in the British Museum.',
    },
    whereItIs: {
      es: 'En la Sefelá, la faja de colinas entre la llanura costera y las montañas de Judea, a unos 40 km al suroeste de Jerusalén.',
      en: 'In the Shephelah, the belt of low hills between the coastal plain and the Judean mountains, about 40 km south-west of Jerusalem.',
    },
    reading: { book: '2KI', chapter: 18, verses: [13, 17] }, // «subió Senaquerib, rey de Asiria, contra todas las ciudades fuertes de Judá»
  },
  {
    slug: 'valley-of-elah',
    region: 'tierra-santa',
    preserved: {
      es: 'Un valle ancho y cultivado con un cauce seco de guijarros redondeados en el fondo. En la ladera norte se excava Khirbet Qeiyafa, una ciudad amurallada de comienzos del siglo X a.C. que domina el paso hacia la montaña de Judá.',
      en: 'A broad farmed valley with a dry bed of rounded pebbles running through it. On the northern slope lies Khirbet Qeiyafa, an excavated walled town of the early tenth century BC commanding the pass up into the Judean hills.',
    },
    whereItIs: {
      es: 'En la Sefelá, a unos 30 km al suroeste de Jerusalén, en la carretera de Bet Shemesh.',
      en: 'In the Shephelah, about 30 km south-west of Jerusalem, on the Beit Shemesh road.',
    },
    reading: { book: '1SA', chapter: 17, verses: [38, 51] }, // «Vistió Saúl a David con su armadura»
  },

  // === EL JORDÁN Y JERICÓ ===============================================
  {
    slug: 'jericho-1',
    region: 'tierra-santa',
    preserved: {
      es: 'Tell es-Sultan acumula más de veinte niveles desde el neolítico; a la vista quedan la torre circular de piedra de hacia el 8000 a.C. y tramos de muralla de varias épocas. Las excavaciones de Kathleen Kenyon no encontraron muralla en pie al final del Bronce tardío, lo que mantiene abierta la discusión sobre la fecha del relato de Josué. Al pie del tell brota la fuente que riega el oasis.',
      en: 'Tell es-Sultan stacks more than twenty levels from the Neolithic on; visible today are the round stone tower of around 8000 BC and stretches of wall from several periods. Kathleen Kenyon’s excavations found no standing wall at the end of the Late Bronze Age, which keeps the dating of the Joshua account under discussion. The spring that waters the oasis rises at the foot of the mound.',
    },
    whereItIs: {
      es: 'En Cisjordania, en el valle del Jordán, a 250 m bajo el nivel del mar y a unos 10 km del río.',
      en: 'In the West Bank, in the Jordan valley, 250 m below sea level and some 10 km from the river.',
    },
    reading: { book: 'JOS', chapter: 6, verses: [1, 21] }, // «Jericó tenía bien atrancadas las puertas»
  },
  {
    slug: 'jericho-2',
    region: 'tierra-santa',
    preserved: {
      es: 'Tell el-Alayiq conserva los palacios de invierno de los asmoneos y de Herodes a ambos lados del uadi Qelt: piscinas, jardines hundidos y una sala de recepción construida en opus reticulatum por obreros traídos de Italia. En la ciudad se enseña un sicómoro viejo asociado a Zaqueo, sin más fundamento que la costumbre.',
      en: 'Tell el-Alayiq holds the winter palaces of the Hasmoneans and of Herod on both banks of the Wadi Qelt: pools, sunken gardens and a reception hall built in opus reticulatum by workmen brought from Italy. In the town an old sycamore is pointed out as Zacchaeus’ tree, on the strength of custom alone.',
    },
    whereItIs: {
      es: 'En Cisjordania, a unos 2 km al suroeste del tell antiguo, donde el uadi Qelt sale al valle.',
      en: 'In the West Bank, about 2 km south-west of the ancient mound, where the Wadi Qelt opens into the valley.',
    },
    reading: { book: 'LUK', chapter: 19, verses: [1, 10] }, // «Entró en Jericó, e iba pasando»
  },
  {
    slug: 'bethany-2',
    region: 'tierra-santa',
    preserved: {
      es: 'En la orilla oriental se excava desde 1996 un conjunto de iglesias bizantinas, piscinas bautismales y una capilla sobre pilares junto al cauce antiguo, que se identifica con la Betania «al otro lado del Jordán» de Juan. Enfrente, en la orilla occidental, Qasr al-Yahud conmemora lo mismo con una escalinata que baja al agua. El río mide aquí pocos metros de ancho.',
      en: 'On the eastern bank, excavation since 1996 has uncovered Byzantine churches, baptismal pools and a pillared chapel beside the old channel, identified with John’s Bethany “beyond the Jordan”. Facing it on the western bank, Qasr al-Yahud marks the same event with steps going down into the water. The river is only a few metres wide here.',
    },
    whereItIs: {
      es: 'En Jordania, a 9 km al norte del mar Muerto y a unos 50 km de Jerusalén; el lugar de la orilla occidental está en Cisjordania, justo enfrente.',
      en: 'In Jordan, 9 km north of the Dead Sea and about 50 km from Jerusalem; the western-bank site lies in the West Bank, directly opposite.',
    },
    reading: { book: 'JHN', chapter: 1, verses: [26, 34] }, // «Yo, por mi parte, bautizo con agua»
  },
  {
    slug: 'jordan',
    region: 'tierra-santa',
    preserved: {
      es: 'El río corre encajado en una franja de tarajes y adelfas —el «orgullo del Jordán» de los profetas— por el fondo de la falla, y llega al mar Muerto con una fracción de su caudal histórico por los trasvases del norte. Se llega a la orilla en Yardenit, a la salida del lago de Galilea, y en los dos lugares del bautismo, mucho más al sur.',
      en: 'The river runs sunk in a strip of tamarisk and oleander — the prophets’ “pride of the Jordan” — along the floor of the rift, and reaches the Dead Sea with a fraction of its historic flow, drawn off upstream. You can reach the bank at Yardenit, where it leaves the Sea of Galilee, and at the two baptism sites far to the south.',
    },
    whereItIs: {
      es: 'Nace al pie del Hermón, atraviesa el lago de Galilea y desemboca en el mar Muerto tras 250 km de curso en apenas 100 km de línea recta.',
      en: 'It rises at the foot of Mount Hermon, passes through the Sea of Galilee and ends in the Dead Sea after 250 km of channel across barely 100 km in a straight line.',
    },
    reading: { book: 'JOS', chapter: 3, verses: [14, 17] }, // «salió el pueblo de sus tiendas para pasar el Jordán»
  },
  {
    slug: 'mount-nebo',
    region: 'tierra-santa',
    preserved: {
      es: 'Desde la cumbre se ve el valle del Jordán, el mar Muerto y, en día claro, las alturas de Jerusalén. El memorial de Moisés cubre una iglesia bizantina cuyos mosaicos del siglo VI están casi completos, entre ellos una gran escena de caza y pastoreo.',
      en: 'From the summit you look over the Jordan valley, the Dead Sea and, on a clear day, the heights of Jerusalem. The Moses memorial shelters a Byzantine church whose sixth-century mosaics survive almost entire, among them a large hunting and herding scene.',
    },
    whereItIs: {
      es: 'En Jordania, a 10 km al noroeste de Madaba, en el reborde de la meseta, unos 800 m por encima del valle.',
      en: 'In Jordan, 10 km north-west of Madaba, on the edge of the plateau some 800 m above the valley floor.',
    },
    reading: { book: 'DEU', chapter: 34, verses: [1, 8] }, // «Subió Moisés desde las campiñas de Moab al monte Nebo»
  },

  // === SAMARÍA Y LA MONTAÑA CENTRAL =====================================
  {
    slug: 'sychar',
    region: 'tierra-santa',
    preserved: {
      es: 'El pozo, de más de cuarenta metros, sigue dando agua y se saca con cubo desde la cripta de una iglesia ortodoxa terminada en 2007 sobre plantas cruzada y bizantina. Es una de las tradiciones mejor sostenidas de Tierra Santa: el lugar se venera sin interrupción desde el siglo IV y no ha tenido nunca un candidato rival.',
      en: 'The well, over forty metres deep, still yields water, drawn by bucket from the crypt of an Orthodox church completed in 2007 on Crusader and Byzantine foundations. It is among the best-supported traditions in the Holy Land: venerated without interruption since the fourth century, and never seriously claimed by a rival site.',
    },
    whereItIs: {
      es: 'En Cisjordania, en el barrio de Balata, a la entrada oriental de Nablus y al pie del monte Garizim.',
      en: 'In the West Bank, in the Balata quarter at the eastern entrance to Nablus, below Mount Gerizim.',
    },
    reading: { book: 'JHN', chapter: 4, verses: [4, 26] }, // «Debía, pues, pasar por Samaria»
  },
  {
    slug: 'shechem',
    region: 'tierra-santa',
    preserved: {
      es: 'Tell Balata tiene a la vista la puerta norte, tramos de muralla ciclópea del Bronce medio y los cimientos del gran templo-fortaleza que suele relacionarse con el «templo de Baal-Berit» de Jueces 9. El yacimiento está excavado y señalizado, sin reconstrucciones.',
      en: 'Tell Balata shows its northern gate, stretches of Middle Bronze cyclopean wall and the foundations of the great fortress-temple usually connected with the “house of Baal-berith” of Judges 9. The site is excavated and signposted, with nothing rebuilt.',
    },
    whereItIs: {
      es: 'En Cisjordania, en el extremo oriental de Nablus, a un paso del pozo de Jacob.',
      en: 'In the West Bank, at the eastern edge of Nablus, a short walk from Jacob’s well.',
    },
    reading: { book: 'JOS', chapter: 24, verses: [1, 28] }, // «Josué congregó a todas las tribus de Israel en Siquem»
  },
  {
    slug: 'mount-gerizim',
    region: 'tierra-santa',
    preserved: {
      es: 'En la cima se han excavado el recinto sagrado samaritano de época helenística y una iglesia bizantina octogonal levantada encima, con su muralla. En la ladera vive la comunidad samaritana de Kiryat Luza, que celebra allí la Pascua con el sacrificio de corderos.',
      en: 'The summit holds the excavated Samaritan sacred precinct of the Hellenistic period and, built over it, an octagonal Byzantine church with its own wall. On the slope lives the Samaritan community of Kiryat Luza, which still keeps Passover there with the sacrifice of lambs.',
    },
    whereItIs: {
      es: 'En Cisjordania, sobre Nablus, a 880 m; enfrente, al otro lado del valle, se levanta el monte Ebal.',
      en: 'In the West Bank, rising 880 m above Nablus; Mount Ebal stands facing it across the valley.',
    },
    reading: { book: 'JOS', chapter: 8, verses: [30, 35] }, // «la mitad de ellos dando frente al monte Garizim»
  },
  {
    slug: 'samaria-1',
    region: 'tierra-santa',
    preserved: {
      es: 'La acrópolis conserva los cimientos del palacio de los reyes de Israel, con el estanque en el que suele situarse el lavado del carro de Ajab, y encima las obras de Herodes: templo de Augusto, foro, teatro y una calle de columnas de casi 800 m. En el pueblo de Sebastia, la iglesia cruzada convertida en mezquita guarda la tradición del sepulcro de Juan Bautista.',
      en: 'The acropolis keeps the foundations of the palace of the kings of Israel, with the pool where the washing of Ahab’s chariot is usually placed, and above them Herod’s works: a temple to Augustus, forum, theatre and a colonnaded street nearly 800 m long. In the village of Sebastia, the Crusader church turned mosque preserves the tradition of John the Baptist’s tomb.',
    },
    whereItIs: {
      es: 'En Cisjordania, a 12 km al noroeste de Nablus, en una colina aislada sobre un valle fértil.',
      en: 'In the West Bank, 12 km north-west of Nablus, on an isolated hill above a fertile valley.',
    },
    reading: { book: '1KI', chapter: 16, verses: [23, 33] }, // «comenzó a reinar Amrí sobre Israel»
  },
  {
    slug: 'shiloh',
    region: 'tierra-santa',
    preserved: {
      es: 'Khirbet Seilun conserva muralla del Bronce medio, almacenes con vasijas rotas por un incendio del siglo XI a.C. y los restos de dos basílicas bizantinas con mosaico. Dónde estuvo exactamente el santuario del Arca se discute: se han propuesto la explanada norte y la cumbre, sin acuerdo.',
      en: 'Khirbet Seilun preserves a Middle Bronze wall, storerooms with jars smashed in an eleventh-century BC fire, and the remains of two Byzantine basilicas with mosaic floors. Where exactly the sanctuary of the Ark stood is disputed: both the northern terrace and the summit have been proposed, with no agreement.',
    },
    whereItIs: {
      es: 'En Cisjordania, a 30 km al norte de Jerusalén, junto a la carretera de la montaña que va hacia Nablus.',
      en: 'In the West Bank, 30 km north of Jerusalem, beside the hill road running towards Nablus.',
    },
    reading: { book: '1SA', chapter: 3, verses: [1, 18] }, // «el joven Samuel servía a Yahvé en presencia de Helí»
  },
  {
    slug: 'bethel-1',
    region: 'tierra-santa',
    preserved: {
      es: 'Del Betel bíblico queda poco a la vista: el pueblo de Beitin cubre el yacimiento y las excavaciones de los años treinta y cincuenta están hoy en gran parte tapadas. Se reconocen entre las casas tramos de muro, cisternas y el afloramiento rocoso del paraje, que es lo que da sentido al relato de la piedra.',
      en: 'Little of biblical Bethel is on view: the village of Beitin sits over the site, and the excavations of the 1930s and 1950s are largely covered again. Between the houses one can still make out stretches of wall, cisterns, and the bare rock outcrop of the place — which is what gives the story of the stone its point.',
    },
    whereItIs: {
      es: 'En Cisjordania, a 17 km al norte de Jerusalén, sobre la divisoria de aguas, a 880 m.',
      en: 'In the West Bank, 17 km north of Jerusalem, on the watershed ridge at 880 m.',
    },
    reading: { book: 'GEN', chapter: 28, verses: [10, 22] }, // «Jacob salió de Bersabee y se dirigió a Harán»
  },
  {
    slug: 'gibeon',
    region: 'tierra-santa',
    preserved: {
      es: 'En el-Jib se conserva el gran pozo circular de once metros de diámetro con escalera helicoidal tallada en la roca, un túnel escalonado hasta un manantial fuera de la muralla y bodegas excavadas para tinajas de vino. El estanque suele identificarse con el de 2 Samuel 2.',
      en: 'El-Jib preserves the great round shaft eleven metres across, with a spiral stair cut into the rock, a stepped tunnel to a spring outside the wall, and rock-cut cellars for wine jars. The pool is usually identified with the one in 2 Samuel 2.',
    },
    whereItIs: {
      es: 'En Cisjordania, a unos 10 km al noroeste de Jerusalén.',
      en: 'In the West Bank, about 10 km north-west of Jerusalem.',
    },
    reading: { book: '1KI', chapter: 3, verses: [4, 15] }, // «Fue el rey a Gabaón para ofrecer allí sacrificios»
  },

  // === NAZARET Y LA BAJA GALILEA ========================================
  {
    slug: 'nazareth',
    region: 'tierra-santa',
    preserved: {
      es: 'La basílica de la Anunciación, de 1969, cubre una gruta-vivienda venerada desde antiguo; en un muro de la construcción anterior apareció un grafito griego dirigido a María, de los testimonios más tempranos de ese culto. Que sea la casa de María es tradición, no dato probado. Cerca quedan la iglesia de San José, la sinagoga-iglesia del casco viejo y la fuente de la Virgen, junto al único manantial del pueblo.',
      en: 'The Basilica of the Annunciation, built in 1969, covers a cave-dwelling venerated from early on; on a wall of the previous church a Greek graffito addressed to Mary came to light, among the earliest traces of that devotion. That it is Mary’s house is tradition, not established fact. Nearby stand St Joseph’s church, the synagogue-church in the old town, and Mary’s Well at the village’s only spring.',
    },
    whereItIs: {
      es: 'En la Baja Galilea, en una hondonada a unos 350 m de altitud, a 25 km al oeste del lago de Galilea y a 30 del Mediterráneo.',
      en: 'In Lower Galilee, in a hollow some 350 m up, 25 km west of the Sea of Galilee and 30 km from the Mediterranean.',
    },
    reading: { book: 'LUK', chapter: 1, verses: [26, 38] }, // «el ángel Gabriel fue enviado por Dios a una ciudad de Galilea llamada Nazaret»
  },
  {
    slug: 'cana',
    region: 'tierra-santa',
    preserved: {
      es: 'Dos lugares se disputan el nombre. Kafr Kanna, que es el que visitan los peregrinos, tiene una iglesia franciscana de 1881 sobre restos de una sinagoga y de casas del siglo I. Khirbet Qana, un cerro deshabitado unos 9 km al norte, tiene una aldea del siglo I excavada y una cueva de peregrinación medieval; la investigación reciente se inclina por él, la costumbre sigue con el primero.',
      en: 'Two places claim the name. Kafr Kanna, the one pilgrims visit, has an 1881 Franciscan church over remains of a synagogue and first-century houses. Khirbet Qana, a deserted hill some 9 km north, has an excavated first-century village and a medieval pilgrimage cave; recent scholarship leans towards it, while custom stays with the former.',
    },
    whereItIs: {
      es: 'En la Baja Galilea, al noreste de Nazaret, en la carretera hacia Tiberíades.',
      en: 'In Lower Galilee, north-east of Nazareth, on the road towards Tiberias.',
    },
    reading: { book: 'JHN', chapter: 2, verses: [1, 11] }, // «Al tercer día hubo unas bodas en Caná de Galilea»
  },
  {
    slug: 'mount-tabor',
    region: 'tierra-santa',
    preserved: {
      es: 'Una cúpula caliza aislada de 588 m con la basílica franciscana de 1924, obra de Barluzzi, levantada sobre iglesias bizantina y cruzada cuyos ábsides quedan a la vista en el atrio. La tradición de la transfiguración aquí se documenta desde el siglo IV; los evangelios sólo hablan de «un monte alto», y también se ha propuesto el Hermón. Se sube por una carretera de curvas cerradas.',
      en: 'An isolated limestone dome 588 m high, crowned by Barluzzi’s Franciscan basilica of 1924, built over Byzantine and Crusader churches whose apses are left exposed in the forecourt. The Transfiguration tradition here is attested from the fourth century; the Gospels say only “a high mountain”, and Hermon has also been proposed. The road up is a series of hairpin bends.',
    },
    whereItIs: {
      es: 'En el borde nororiental del valle de Yizreel, a unos 20 km al oeste del lago de Galilea.',
      en: 'On the north-eastern rim of the Jezreel valley, some 20 km west of the Sea of Galilee.',
    },
    reading: { book: 'MAT', chapter: 17, verses: [1, 9] }, // «los llevó aparte, sobre un monte alto»
  },
  {
    slug: 'nain',
    region: 'tierra-santa',
    preserved: {
      es: 'Nein es hoy una aldea pequeña en la ladera norte del monte Moré. Hay una iglesia franciscana modesta, de 1880, sobre restos bizantinos y cruzados; la ciudad antigua no está excavada. Desde la puerta se ve la ladera por donde bajaría el cortejo.',
      en: 'Nein is now a small village on the northern slope of the Hill of Moreh. There is a modest Franciscan church of 1880 over Byzantine and Crusader remains; the ancient town is unexcavated. From the doorway you can see the slope the funeral procession would have come down.',
    },
    whereItIs: {
      es: 'A unos 10 km al sureste de Nazaret, en el borde norte del valle de Yizreel.',
      en: 'About 10 km south-east of Nazareth, on the northern edge of the Jezreel valley.',
    },
    reading: { book: 'LUK', chapter: 7, verses: [11, 17] }, // «se encaminó a una ciudad llamada Naím»
  },

  // === EL LAGO DE GALILEA ===============================================
  {
    slug: 'sea-of-galilee',
    region: 'tierra-santa',
    preserved: {
      es: 'Un lago dulce de unos 21 por 12 km, a 210 m bajo el nivel del mar, cerrado por colinas que encañonan vientos súbitos del oeste. En el kibutz Ginosar se expone la llamada barca de Jesús, un casco de pesca del siglo I hallado en el fango en 1986 durante una bajada del nivel del agua. Hay travesías en barco entre Tiberíades y la orilla nororiental.',
      en: 'A freshwater lake roughly 21 by 12 km, 210 m below sea level, ringed by hills that funnel sudden westerly winds onto it. At Kibbutz Ginosar the so-called Jesus Boat is on display, a first-century fishing hull found in the mud in 1986 when the water dropped. Boats cross between Tiberias and the north-eastern shore.',
    },
    whereItIs: {
      es: 'En el norte del valle del Jordán, entre la Baja Galilea y los Altos del Golán.',
      en: 'At the northern end of the Jordan valley, between Lower Galilee and the Golan Heights.',
    },
    reading: { book: 'MRK', chapter: 4, verses: [35, 40] }, // «Pasemos a la otra orilla»
  },
  {
    slug: 'capernaum',
    region: 'tierra-santa',
    preserved: {
      es: 'Sobre la casa de Pedro se levanta una iglesia moderna suspendida sobre las ruinas, que se ven desde el interior. Junto a ella queda la sinagoga de piedra blanca del siglo IV, construida sobre la basáltica del tiempo de Jesús, cuyos muros negros asoman en la base. Alrededor se conservan calles y manzanas enteras de casas de basalto del pueblo de pescadores.',
      en: 'A modern church stands suspended over Peter’s house, and the ruins are visible through the floor from inside. Beside it is the white limestone synagogue of the fourth century, built on the black basalt one of Jesus’ day, whose courses show along the base. Around them lie streets and whole blocks of basalt houses from the fishing village.',
    },
    whereItIs: {
      es: 'En la orilla norte del lago de Galilea, a unos 4 km al oeste de la desembocadura del Jordán.',
      en: 'On the northern shore of the Sea of Galilee, about 4 km west of where the Jordan comes in.',
    },
    reading: { book: 'MRK', chapter: 1, verses: [21, 34] }, // «Entraron a Cafarnaúm; y luego, el día de sábado, entró en la sinagoga»
  },
  {
    slug: 'gennesaret',
    region: 'tierra-santa',
    preserved: {
      es: 'La llanura fértil que bordea el lago por el noroeste, todavía cultivada de plátanos y mangos. En su extremo norte, en el paraje de Tabga, están la iglesia de la Multiplicación —con el mosaico bizantino de los panes y los peces delante del altar— y la capilla del Primado sobre una roca al borde del agua; el monte de las Bienaventuranzas queda en la cuesta de encima.',
      en: 'The fertile plain along the north-western shore of the lake, still farmed with bananas and mangoes. At its northern end, at Tabgha, stand the Church of the Multiplication — with its Byzantine mosaic of loaves and fishes before the altar — and the Chapel of the Primacy on a rock at the water’s edge; the Mount of Beatitudes rises on the slope above.',
    },
    whereItIs: {
      es: 'Entre Magdala y Tabga, en la orilla noroeste del lago de Galilea.',
      en: 'Between Magdala and Tabgha, along the north-western shore of the Sea of Galilee.',
    },
    reading: { book: 'MRK', chapter: 6, verses: [34, 44] }, // «vio una gran muchedumbre, y tuvo compasión de ellos»
  },
  {
    slug: 'magdala',
    region: 'tierra-santa',
    preserved: {
      es: 'Se excava desde 2009: un puerto con embarcadero, calles, piletas de salazón de pescado y una sinagoga del siglo I, una de las pocas anteriores al año 70, con una piedra tallada en el centro que representa el Templo. Sobre el yacimiento se ha construido un centro de acogida con capillas.',
      en: 'Under excavation since 2009: a harbour with a landing stage, streets, fish-salting vats, and a first-century synagogue — one of the few predating AD 70 — with a carved stone at its centre representing the Temple. A guesthouse with chapels has been built over the site.',
    },
    whereItIs: {
      es: 'En la orilla occidental del lago de Galilea, a unos 6 km al norte de Tiberíades.',
      en: 'On the western shore of the Sea of Galilee, about 6 km north of Tiberias.',
    },
    reading: { book: 'LUK', chapter: 8, verses: [1, 3] }, // «María, la llamada Magdalena»
  },
  {
    slug: 'bethsaida-1',
    region: 'tierra-santa',
    preserved: {
      es: 'Hay dos yacimientos en disputa a la entrada del valle del Jordán: et-Tell, con una puerta monumental de la Edad del Hierro y casas del siglo I, y el-Araj, más cerca del agua, donde desde 2016 se excava una iglesia bizantina que podría ser la «iglesia de los Apóstoles» descrita por un peregrino del siglo VIII. La cuestión no está zanjada.',
      en: 'Two sites compete at the mouth of the Jordan valley: et-Tell, with a monumental Iron Age gate and first-century houses, and el-Araj, closer to the water, where since 2016 a Byzantine church has been excavated that may be the “church of the Apostles” described by an eighth-century pilgrim. The question is still open.',
    },
    whereItIs: {
      es: 'En la orilla nororiental del lago de Galilea, donde el Jordán entra en él; la línea de costa ha retrocedido y los dos yacimientos quedan hoy tierra adentro.',
      en: 'On the north-eastern shore of the Sea of Galilee, where the Jordan enters it; the shoreline has receded and both sites now lie inland.',
    },
    reading: { book: 'MRK', chapter: 8, verses: [22, 26] }, // «Fueron luego a Betsaida. Y le trajeron un ciego»
  },
  {
    slug: 'tiberias',
    region: 'tierra-santa',
    preserved: {
      es: 'De la ciudad de Herodes Antipas se excava el barrio sur: la puerta con sus torres redondas, una calle de columnas, un teatro de unos siete mil asientos y las termas. En la ciudad moderna están las tumbas de Maimónides y de Rabí Meir, lugar de peregrinación judía, y en Hamat Tiberias la sinagoga del siglo IV con el mosaico del zodíaco, junto a las fuentes termales.',
      en: 'The southern quarter of Herod Antipas’ city is under excavation: the gate with its round towers, a colonnaded street, a theatre of some seven thousand seats, and the baths. In the modern town are the tombs of Maimonides and Rabbi Meir, a place of Jewish pilgrimage, and at Hamat Tiberias the fourth-century synagogue with its zodiac mosaic beside the hot springs.',
    },
    whereItIs: {
      es: 'En la orilla occidental del lago de Galilea, a 200 m bajo el nivel del mar.',
      en: 'On the western shore of the Sea of Galilee, 200 m below sea level.',
    },
    reading: { book: 'JHN', chapter: 6, verses: [22, 29] }, // «la muchedumbre que permaneció al otro lado del mar»
  },

  // === LA ALTA GALILEA, EL GOLÁN Y EL VALLE DE YIZREEL ==================
  {
    slug: 'caesarea-philippi',
    region: 'tierra-santa',
    preserved: {
      es: 'Al pie de un acantilado brota una de las fuentes del Jordán, junto a la gruta de Pan y a los nichos tallados del santuario helenístico y romano, cuyos cimientos están a la vista. Ladera abajo se excava un palacio de Agripa II; la reserva incluye una cascada y, en la altura, los restos del castillo cruzado de Nimrod.',
      en: 'One of the Jordan’s springs rises at the foot of a cliff, beside the grotto of Pan and the carved niches of the Hellenistic and Roman sanctuary, whose foundations are exposed. Downhill a palace of Agrippa II is being dug; the reserve also takes in a waterfall and, on the heights above, the Crusader castle of Nimrod.',
    },
    whereItIs: {
      es: 'Al pie sur del monte Hermón, en los Altos del Golán, a unos 50 km al norte del lago de Galilea.',
      en: 'At the southern foot of Mount Hermon, in the Golan Heights, some 50 km north of the Sea of Galilee.',
    },
    reading: { book: 'MAT', chapter: 16, verses: [13, 20] }, // «llegado Jesús a la región de Cesarea de Filipo»
  },
  {
    slug: 'dan',
    region: 'tierra-santa',
    preserved: {
      es: 'Tel Dan está dentro de una reserva boscosa por la que corre otra de las fuentes del Jordán. A la vista quedan la puerta cananea de adobe con arco, del Bronce medio, el «lugar alto» israelita con su plataforma escalonada y la puerta de la ciudad israelita con el estrado del rey. Aquí apareció en 1993 la estela aramea que menciona la «casa de David».',
      en: 'Tel Dan sits inside a wooded reserve through which another source of the Jordan runs. On view are the Middle Bronze mudbrick gate with its arch, the Israelite high place with its stepped platform, and the Israelite city gate with the king’s dais. It was here, in 1993, that the Aramaic stele naming the “house of David” was found.',
    },
    whereItIs: {
      es: 'En el extremo norte del valle del Hule, al pie del Hermón y junto a la frontera libanesa.',
      en: 'At the northern end of the Hula valley, below Mount Hermon and close to the Lebanese border.',
    },
    reading: { book: '1KI', chapter: 12, verses: [26, 33] }, // «Jeroboam decía en su corazón: Pronto va a volver el reino»
  },
  {
    slug: 'mount-carmel',
    region: 'tierra-santa',
    preserved: {
      es: 'Una sierra de unos 39 km que cae al mar en Haifa. En el extremo sureste, el Muhraqa —monasterio carmelita con una estatua de Elías y una terraza que domina el valle de Yizreel— conmemora el desafío a los profetas de Baal; en la punta noroeste está Stella Maris, sobre la cueva llamada de Elías. Ninguno de los dos emplazamientos es más que tradición.',
      en: 'A ridge some 39 km long that drops into the sea at Haifa. At its south-eastern end the Muhraqa — a Carmelite monastery with a statue of Elijah and a terrace overlooking the Jezreel valley — commemorates the contest with the prophets of Baal; at the north-western tip stands Stella Maris, above the cave called Elijah’s. Neither location is more than tradition.',
    },
    whereItIs: {
      es: 'Entre Haifa y el valle de Yizreel, paralela a la costa mediterránea.',
      en: 'Between Haifa and the Jezreel valley, running parallel to the Mediterranean coast.',
    },
    reading: { book: '1KI', chapter: 18, verses: [20, 40] }, // «congregó a los profetas en el monte Carmelo»
  },
  {
    slug: 'megiddo',
    region: 'tierra-santa',
    preserved: {
      es: 'Veinte estratos superpuestos y buena parte a la vista: puerta de seis cámaras, dos complejos de columnas interpretados como establos o almacenes, un altar circular del III milenio y un pozo con túnel de agua de setenta metros que se recorre hasta un manantial fuera de la muralla. Desde lo alto se abarca todo el valle de Yizreel.',
      en: 'Twenty superimposed strata, much of it exposed: a six-chambered gate, two pillared complexes read as either stables or storehouses, a round altar of the third millennium, and a shaft with a seventy-metre water tunnel you can walk to a spring outside the wall. From the top the whole Jezreel valley is laid out.',
    },
    whereItIs: {
      es: 'En el paso que comunica la llanura costera con el valle de Yizreel, a unos 30 km al sureste de Haifa.',
      en: 'At the pass linking the coastal plain with the Jezreel valley, about 30 km south-east of Haifa.',
    },
    reading: { book: '2KI', chapter: 23, verses: [28, 30] }, // «Sus siervos lo llevaron muerto desde Megiddó»
  },
  {
    slug: 'mount-gilboa',
    region: 'tierra-santa',
    preserved: {
      es: 'Una cresta de unos 500 m, hoy reserva forestal con senderos y miradores sobre el valle de Yizreel y, al otro lado, el valle del Jordán. A sus pies brota el manantial de Harod, donde se sitúa la criba de los hombres de Gedeón. En primavera florece en las laderas el lirio del Gilboa, que no crece en ningún otro sitio.',
      en: 'A ridge of some 500 m, now a forest reserve with trails and lookouts over the Jezreel valley and, on the far side, the Jordan valley. At its foot rises the spring of Harod, where the sifting of Gideon’s men is placed. In spring the slopes carry the Gilboa iris, which grows nowhere else.',
    },
    whereItIs: {
      es: 'En el borde sureste del valle de Yizreel, entre Bet Shean y Yenín.',
      en: 'On the south-eastern edge of the Jezreel valley, between Beit She’an and Jenin.',
    },
    reading: { book: '2SA', chapter: 1, verses: [17, 27] }, // «¡Cómo han caído los héroes!»
  },

  // === LA COSTA =========================================================
  {
    slug: 'caesarea',
    region: 'tierra-santa',
    preserved: {
      es: 'El parque arqueológico reúne el teatro romano restaurado, el palacio sobre el mar, el hipódromo, el acueducto que corre por la playa y los restos del puerto de Herodes, hoy sumergidos y visitables en inmersión. Aquí apareció la inscripción que nombra a Poncio Pilato como prefecto de Judea, único testimonio epigráfico de su cargo.',
      en: 'The archaeological park brings together the restored Roman theatre, the seaside palace, the hippodrome, the aqueduct running along the beach, and the remains of Herod’s harbour, now submerged and open to divers. It was here that the inscription naming Pontius Pilate as prefect of Judea was found, the only epigraphic record of his office.',
    },
    whereItIs: {
      es: 'En la costa mediterránea, a medio camino entre Tel Aviv y Haifa.',
      en: 'On the Mediterranean coast, halfway between Tel Aviv and Haifa.',
    },
    reading: { book: 'ACT', chapter: 10, verses: [1, 8] }, // «Había en Cesarea un varón de nombre Cornelio»
  },
  {
    slug: 'joppa',
    region: 'tierra-santa',
    preserved: {
      es: 'El casco viejo de Jafa conserva el puerto natural todavía en uso, callejuelas otomanas sobre la colina y un área excavada con una puerta egipcia del Bronce tardío. La iglesia franciscana de San Pedro y la llamada casa de Simón el Curtidor señalan lugares por tradición, sin apoyo arqueológico.',
      en: 'Old Jaffa keeps its natural harbour, still working, Ottoman lanes over the hill, and an excavated area with a Late Bronze Egyptian gateway. The Franciscan church of St Peter and the so-called house of Simon the Tanner mark their spots by tradition alone, with no archaeological support.',
    },
    whereItIs: {
      es: 'En el extremo sur de Tel Aviv, sobre un promontorio junto al Mediterráneo.',
      en: 'At the southern end of Tel Aviv, on a promontory above the Mediterranean.',
    },
    reading: { book: 'ACT', chapter: 9, verses: [36, 43] }, // «Había en Joppe una discípula por nombre Tabita»
  },

  // === FENICIA ==========================================================
  {
    slug: 'tyre',
    region: 'tierra-santa',
    preserved: {
      es: 'Dos zonas excavadas: la de tierra firme, con un hipódromo romano de 480 m, un arco monumental y una necrópolis con sarcófagos; y la de la antigua isla, con termas, palestra y calles pavimentadas de mosaico. El istmo que une isla y costa nació del terraplén que levantó Alejandro en el 332 a.C. y lo han ensanchado los sedimentos.',
      en: 'Two excavated zones: the mainland site, with a 480-metre Roman hippodrome, a monumental arch and a necropolis of sarcophagi; and the former island, with baths, a palaestra and mosaic-paved streets. The isthmus joining island to shore began as the causeway Alexander threw across in 332 BC, since widened by silt.',
    },
    whereItIs: {
      es: 'En el sur del Líbano, a unos 80 km al sur de Beirut y a 20 de la frontera meridional.',
      en: 'In southern Lebanon, some 80 km south of Beirut and 20 km from the southern border.',
    },
    reading: { book: 'EZK', chapter: 26, verses: [1, 14] }, // «vendrás a ser un lugar donde se tienden las redes»
  },
  {
    slug: 'sidon',
    region: 'tierra-santa',
    preserved: {
      es: 'Sobre un islote frente al puerto está el castillo del Mar, cruzado, con columnas romanas reaprovechadas atravesando los muros como tirantes. En tierra quedan el templo de Eshmún —santuario fenicio con tronos, canalizaciones y un podio de sillares— y el zoco antiguo con su caravasar.',
      en: 'On an islet off the harbour stands the Crusader Sea Castle, with reused Roman columns run through the walls as ties. Inland are the temple of Eshmun — a Phoenician sanctuary with thrones, water channels and an ashlar podium — and the old souk with its caravanserai.',
    },
    whereItIs: {
      es: 'En la costa del Líbano, a unos 45 km al sur de Beirut.',
      en: 'On the Lebanese coast, about 45 km south of Beirut.',
    },
    reading: { book: 'MAT', chapter: 15, verses: [21, 28] }, // «se retiró Jesús a la región de Tiro y de Sidón»
  },
];
