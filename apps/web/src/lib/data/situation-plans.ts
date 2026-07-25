// Planes de situación — unos pocos días para lo que alguien está viviendo.
//
// ⚠️ BORRADOR EDITORIAL: pendiente de revisión del maintainer. Igual que el
// resto del contenido curado (ver CONTRIBUTING), la selección de pasajes la
// propone el asistente y NO se considera definitiva hasta que una persona la
// valide. Aquí el listón es más alto que en los itinerarios: quien abre
// «duelo» o «enfermedad» no está estudiando, está sufriendo.
//
// CRITERIOS con los que se eligieron los pasajes:
//
//  1. Rango de versículos, no capítulo entero. Todas las lecturas usan
//     `verses`: entre 3 y 15 versículos. A quien está angustiado se le ofrece
//     un pasaje que quepa en cinco minutos, no cuarenta versículos.
//  2. Nada de proof-texting. El pasaje se eligió leyendo su contexto, y se
//     recortó para que fuera del capítulo siga diciendo lo que dice dentro.
//  3. El lamento antes que el consuelo. En `duelo` y `enfermedad` los
//     primeros días son Job y los salmos de lamentación: la Biblia deja
//     llorar, y saltar directo al consuelo suena a prisa.
//  4. Nada que culpabilice a quien sufre. Se descartaron pasajes que fuera de
//     contexto puedan leerse como «te pasa esto por tu pecado» o como un
//     «no tengas miedo» dicho a modo de reproche.
//  5. Equilibrio Antiguo/Nuevo Testamento. Los Salmos son terreno natural
//     aquí, pero no pasan de la mitad de las lecturas de ningún plan.
//  6. El plan acompaña; no promete resultados ni sermonea.
//
// NUMERACIÓN DE LOS SALMOS: greco-latina (la de la Vulgata y la de la BD).
// El Miserere es el 50, el De profundis el 129, «El Señor es mi pastor» el 22.
// Todos los rangos de esta lista se verificaron leyendo el texto real de la
// versión STRA en la base de datos, no de memoria.
//
// Los comentarios al final de cada lectura citan las primeras palabras del
// pasaje en español, para que la revisión humana se pueda hacer sin abrir la
// Biblia al lado.
//
// OJO: `import type`, no un import de valor — `plans.ts` importa este fichero,
// y un import normal cerraría el ciclo en tiempo de ejecución.
import type { ReadingPlan } from '../plans';

export const SITUATION_PLANS: ReadingPlan[] = [
  // --- Ansiedad ---------------------------------------------------------
  // Se evitó 1Pe 5,6-11: el «león rugiente» del v. 8 es lo último que
  // necesita leer alguien con ansiedad. De Mt 6 se conserva el «hombres de
  // poca fe» (v. 30) porque ahí es parte del argumento —si Dios viste la
  // hierba, cuánto más a vosotros—, no un reproche al lector.
  {
    slug: 'ansiedad-5',
    kind: 'situacion',
    name: {
      es: 'Cuando la ansiedad aprieta (5 días)',
      en: 'When Anxiety Presses In (5 Days)',
    },
    description: {
      es: 'Cinco pasajes breves para los días en que la cabeza no para y el pecho va por delante del cuerpo.\nNo prometen que se pase: ofrecen dónde apoyar el peso mientras dura.',
      en: 'Five short passages for the days when the mind will not stop and the chest runs ahead of the body.\nThey do not promise it will pass: they offer somewhere to set down the weight while it lasts.',
    },
    days: [
      { readings: [{ book: 'PSA', chapters: [61, 61], verses: [2, 9] }] }, // «Solo en Dios se descansa, oh alma mía»
      { readings: [{ book: 'MAT', chapters: [6, 6], verses: [25, 34] }] }, // «Mirad las aves del cielo, que no siembran ni siegan»
      { readings: [{ book: 'PSA', chapters: [130, 130], verses: [1, 3] }] }, // «como un niño que se recuesta sobre el pecho de su madre»
      { readings: [{ book: 'HEB', chapters: [4, 4], verses: [14, 16] }] }, // «no tenemos un Sumo Sacerdote incapaz de compadecerse»
      { readings: [{ book: 'PHP', chapters: [4, 4], verses: [4, 7] }] }, // «No os inquietéis por cosa alguna»
    ],
  },

  // --- Duelo ------------------------------------------------------------
  // El orden es deliberado: cuatro días de lamento (Job, el salmo más oscuro
  // del salterio, el «como el ciervo» y las Lamentaciones) antes de que
  // aparezca ninguna consolación. El día 5 es Jesús llorando ante la tumba
  // de un amigo: el consuelo entra por ahí, no por un argumento.
  // Descartado 1Tes 4,13-18 («para que no os contristéis como los demás»):
  // fuera de una liturgia se puede leer como un reproche al llanto.
  {
    slug: 'duelo-7',
    kind: 'situacion',
    name: {
      es: 'Duelo: siete días para el llanto (7 días)',
      en: 'Grief: Seven Days for Weeping (7 Days)',
    },
    description: {
      es: 'Una semana para quien acaba de perder a alguien: primero el lamento, sin prisa por consolar.\nLa Escritura deja llorar antes de decir nada, y este plan hace lo mismo.',
      en: 'A week for someone who has just lost a loved one: lament first, with no hurry to console.\nScripture lets us weep before it says anything, and this plan does the same.',
    },
    days: [
      { readings: [{ book: 'JOB', chapters: [3, 3], verses: [1, 13] }] }, // «Perezca el día en que nací»
      { readings: [{ book: 'PSA', chapters: [87, 87], verses: [2, 10] }] }, // «día y noche clamo en tu presencia»
      { readings: [{ book: 'PSA', chapters: [41, 41], verses: [2, 6] }] }, // «Como el ciervo ansía las corrientes de aguas»
      { readings: [{ book: 'LAM', chapters: [3, 3], verses: [17, 26] }] }, // «Alejaste de mi alma la paz»
      { readings: [{ book: 'JHN', chapters: [11, 11], verses: [32, 38] }] }, // «Señor, si Tú hubieras estado aquí» / «Y Jesús lloró»
      { readings: [{ book: '2CO', chapters: [1, 1], verses: [3, 7] }] }, // «el Padre de las misericordias y Dios de toda consolación»
      { readings: [{ book: 'REV', chapters: [21, 21], verses: [1, 5] }] }, // «les enjugará toda lágrima de sus ojos»
    ],
  },

  // --- Enfermedad -------------------------------------------------------
  // Job 7 y el Salmo 6 dan permiso para quejarse antes de nada. Del Salmo 6
  // se recorta el v. 2 («no quieras argüirme en tu ira»), que enmarcaría la
  // enfermedad como castigo. El último día junta la oración de la Iglesia
  // sobre el enfermo (la unción, Sant 5) con la honestidad de Pablo, que
  // pidió tres veces la curación y no la obtuvo.
  {
    slug: 'enfermedad-5',
    kind: 'situacion',
    name: {
      es: 'En la enfermedad (5 días)',
      en: 'In Sickness (5 Days)',
    },
    description: {
      es: 'Para quien está enfermo o cuida a alguien que lo está: la queja también es oración.\nNi culpa ni promesa de curación; la compañía de un Dios que conoce el dolor por dentro.',
      en: 'For those who are ill, or caring for someone who is: complaint is prayer too.\nNo blame and no promise of a cure; the company of a God who knows pain from the inside.',
    },
    days: [
      { readings: [{ book: 'JOB', chapters: [7, 7], verses: [1, 11] }] }, // «noches de dolor me tocaron en suerte»
      { readings: [{ book: 'PSA', chapters: [6, 6], verses: [3, 8] }] }, // «Ten misericordia de mí, porque soy débil; sáname»
      { readings: [{ book: 'ISA', chapters: [53, 53], verses: [3, 6] }] }, // «varón de dolores y que sabe lo que es padecer»
      { readings: [{ book: 'JHN', chapters: [5, 5], verses: [1, 9] }] }, // «Señor, yo no tengo a nadie que me meta en la piscina»
      {
        readings: [
          { book: 'JAS', chapters: [5, 5], verses: [13, 16] }, // «Haga venir a los presbíteros... ungiéndole con óleo»
          { book: '2CO', chapters: [12, 12], verses: [7, 10] }, // «Mi gracia te basta»
        ],
      },
    ],
  },

  // --- Perdonar ---------------------------------------------------------
  // Plan para quien tiene que perdonar a otro (recibir el perdón es
  // `culpa-5`). De Mt 18 se corta en el v. 27, cuando el rey perdona la
  // deuda: el final de la parábola —el siervo entregado a los verdugos— es
  // una amenaza y aquí sobraría. Descartado Eclo 28,1-7: en la Straubinger
  // suena a advertencia («experimentará la venganza del Señor»), no a
  // acompañamiento.
  {
    slug: 'perdon-5',
    kind: 'situacion',
    name: {
      es: 'Perdonar a quien me hizo daño (5 días)',
      en: 'Forgiving the One Who Hurt Me (5 Days)',
    },
    description: {
      es: 'Cinco pasajes para cuando el rencor pesa y perdonar todavía parece imposible.\nNo mandan sentir otra cosa: muestran a quien lo hizo antes, empezando por el Crucificado.',
      en: 'Five passages for when resentment weighs and forgiveness still looks impossible.\nThey do not order you to feel differently: they show those who did it first, beginning with the Crucified.',
    },
    days: [
      { readings: [{ book: 'GEN', chapters: [50, 50], verses: [15, 21] }] }, // «Vosotros pensasteis hacerme mal, pero Dios lo dispuso para bien»
      { readings: [{ book: '1SA', chapters: [24, 24], verses: [4, 8] }] }, // «No permita Yahvé que yo haga tal cosa contra mi señor»
      { readings: [{ book: 'MAT', chapters: [18, 18], verses: [21, 27] }] }, // «sino hasta setenta veces siete»
      {
        readings: [
          { book: 'LUK', chapters: [23, 23], verses: [32, 34] }, // «Padre, perdónalos, porque no saben lo que hacen»
          { book: 'ACT', chapters: [7, 7], verses: [57, 59] }, // «Señor, no les imputes este pecado»
        ],
      },
      { readings: [{ book: 'COL', chapters: [3, 3], verses: [12, 15] }] }, // «Como el Señor os ha perdonado, así perdonad también vosotros»
    ],
  },

  // --- Soledad ----------------------------------------------------------
  // De Jn 14 se toma desde el v. 16 y no desde el 15: poner «si me amáis,
  // conservaréis mis mandamientos» delante de «no os dejaré huérfanos»
  // convierte la promesa en condición, justo lo contrario de lo que hace
  // falta aquí.
  {
    slug: 'soledad-5',
    kind: 'situacion',
    name: {
      es: 'Cuando uno se siente solo (5 días)',
      en: 'When You Feel Alone (5 Days)',
    },
    description: {
      es: 'Para los días de casa vacía o de sentirse invisible entre la gente.\nLa soledad se dice primero tal cual es, y sólo después aparece quien se sienta al lado.',
      en: 'For the days of an empty house, or of feeling invisible among people.\nLoneliness is first said plainly, and only then does someone sit down beside you.',
    },
    days: [
      { readings: [{ book: 'PSA', chapters: [24, 24], verses: [15, 18] }] }, // «tenme lástima, porque soy miserable y estoy solo»
      { readings: [{ book: '1KI', chapters: [19, 19], verses: [9, 14] }] }, // «he quedado yo solo» / «un soplo tranquilo y suave»
      { readings: [{ book: 'PSA', chapters: [138, 138], verses: [1, 12] }] }, // «¿Adónde iré que me sustraiga a tu espíritu?»
      { readings: [{ book: 'LUK', chapters: [24, 24], verses: [28, 35] }] }, // «Quédate con nosotros, porque es tarde»
      { readings: [{ book: 'JHN', chapters: [14, 14], verses: [16, 18] }] }, // «No os dejaré huérfanos; volveré a vosotros»
    ],
  },

  // --- Gratitud ---------------------------------------------------------
  // Tres días, uno por movimiento: bendecir, volver a dar las gracias,
  // reconocer de dónde viene todo.
  {
    slug: 'gratitud-3',
    kind: 'situacion',
    name: {
      es: 'Dar gracias (3 días)',
      en: 'Giving Thanks (3 Days)',
    },
    description: {
      es: 'Tres días cortos para cuando uno quiere agradecer algo y no sabe con qué palabras.\nUn salmo, un evangelio y una bendición de Pablo: el vocabulario ya está escrito.',
      en: 'Three short days for when you want to give thanks and cannot find the words.\nA psalm, a Gospel scene and one of Paul’s blessings: the vocabulary is already written.',
    },
    days: [
      { readings: [{ book: 'PSA', chapters: [102, 102], verses: [1, 5] }] }, // «Bendice a Yahvé, alma mía... no quieras olvidar todos sus favores»
      { readings: [{ book: 'LUK', chapters: [17, 17], verses: [11, 19] }] }, // «Uno de ellos... se volvió glorificando a Dios en alta voz»
      { readings: [{ book: 'EPH', chapters: [1, 1], verses: [3, 6] }] }, // «Bendito sea el Dios y Padre de Nuestro Señor Jesucristo»
    ],
  },

  // --- Decisión ---------------------------------------------------------
  // Descartado Sant 1,5-8: el v. 5 («pídala a Dios, que a todos da... sin
  // echarlo en cara») es perfecto, pero los vv. 6-8 condenan al que vacila,
  // que es exactamente quien abre este plan. En su lugar, Hch 16: puertas
  // cerradas y una abierta, que es como suele parecerse un discernimiento.
  {
    slug: 'decision-5',
    kind: 'situacion',
    name: {
      es: 'Ante una decisión (5 días)',
      en: 'Facing a Decision (5 Days)',
    },
    description: {
      es: 'Cinco días para quien tiene delante una elección que le supera y quiere rezarla antes de tomarla.\nNo dan la respuesta: enseñan a pedir un corazón capaz de reconocerla.',
      en: 'Five days for someone facing a choice too big for them, who wants to pray it before making it.\nThey do not supply the answer: they teach you to ask for a heart able to recognise it.',
    },
    days: [
      { readings: [{ book: '1KI', chapters: [3, 3], verses: [5, 12] }] }, // «Da, pues, a tu siervo un corazón dócil»
      { readings: [{ book: 'PSA', chapters: [142, 142], verses: [7, 11] }] }, // «Muéstrame el camino que debo seguir»
      { readings: [{ book: 'PRO', chapters: [3, 3], verses: [5, 8] }] }, // «Confía en el Señor con todo tu corazón»
      { readings: [{ book: 'LUK', chapters: [1, 1], verses: [26, 38] }] }, // «He aquí la esclava del Señor: Séame hecho según tu palabra»
      { readings: [{ book: 'ACT', chapters: [16, 16], verses: [6, 10] }] }, // «les prohibió el Espíritu Santo predicar la Palabra en Asia»
    ],
  },

  // --- Culpa ------------------------------------------------------------
  // Para quien no se perdona a sí mismo. El arco va de la confesión (los dos
  // grandes salmos penitenciales) al abrazo del padre, a «tampoco yo te
  // condeno», y termina en la frase que desactiva el escrúpulo: Dios es más
  // grande que nuestro corazón. Descartado Jn 21,15-19 (la rehabilitación de
  // Pedro) sólo por espacio: es un buen sustituto de cualquiera de estos.
  {
    slug: 'culpa-5',
    kind: 'situacion',
    name: {
      es: 'Cuando uno no se perdona (5 días)',
      en: 'When You Cannot Forgive Yourself (5 Days)',
    },
    description: {
      es: 'Para el peso que queda después de haber hecho daño, incluso después de confesarlo.\nDe lo hondo del pozo al abrazo del padre, sin pasar por ningún castigo añadido.',
      en: 'For the weight that remains after doing harm, even after confessing it.\nFrom the depths of the pit to the father’s embrace, with no added punishment on the way.',
    },
    days: [
      { readings: [{ book: 'PSA', chapters: [129, 129], verses: [1, 8] }] }, // «Desde lo más profundo clamo a Ti, Yahvé»
      { readings: [{ book: 'PSA', chapters: [50, 50], verses: [3, 14] }] }, // «Ten compasión de mí, oh Dios» (el Miserere)
      { readings: [{ book: 'LUK', chapters: [15, 15], verses: [17, 24] }] }, // «cuando estaba todavía lejos, su padre lo vio»
      { readings: [{ book: 'JHN', chapters: [8, 8], verses: [3, 11] }] }, // «Yo no te condeno tampoco»
      {
        readings: [
          { book: '1JN', chapters: [3, 3], verses: [18, 20] }, // «Dios es más grande que nuestro corazón»
          { book: 'ROM', chapters: [8, 8], verses: [1, 4] }, // «ahora no hay condenación alguna para los que están en Cristo»
        ],
      },
    ],
  },

  // --- Miedo ------------------------------------------------------------
  // Todos los «no temas» de este plan vienen acompañados de una presencia o
  // de un gesto, nunca sueltos. Por eso se descartó Mc 4,35-41 («¿aún no
  // tenéis fe?») y Mt 14,22-33 («hombre de poca fe, ¿por qué dudaste?») a
  // favor de Jn 6,16-21, donde Jesús se acerca por el agua y sólo dice «no
  // tengáis miedo». Descartado también el Sal 90 (91): prometer que «mil
  // caerán a tu lado y a ti no te alcanzará» es una promesa que la vida no
  // siempre cumple.
  {
    slug: 'miedo-5',
    kind: 'situacion',
    name: {
      es: 'Cuando da miedo (5 días)',
      en: 'When You Are Afraid (5 Days)',
    },
    description: {
      es: 'Cinco pasajes para el miedo que no se va con razones: una prueba médica, una noticia, lo que viene.\nNinguno regaña por tenerlo; todos ofrecen una compañía concreta.',
      en: 'Five passages for the fear that reasoning does not dispel: a test result, a piece of news, what lies ahead.\nNone of them scolds you for it; each offers concrete company.',
    },
    days: [
      { readings: [{ book: 'ISA', chapters: [43, 43], verses: [1, 5] }] }, // «te he llamado por tu nombre; tú eres mío»
      { readings: [{ book: 'PSA', chapters: [26, 26], verses: [1, 6] }] }, // «Yahvé es mi luz y mi socorro; ¿a quién temeré?»
      { readings: [{ book: 'DEU', chapters: [31, 31], verses: [6, 8] }] }, // «Yahvé marchará delante de ti... no te abandonará»
      { readings: [{ book: 'JHN', chapters: [6, 6], verses: [16, 21] }] }, // «Pero Él les dijo: No tengáis miedo»
      { readings: [{ book: 'ROM', chapters: [8, 8], verses: [35, 39] }] }, // «¿Quién nos separará del amor de Cristo?»
    ],
  },

  // --- Cansancio --------------------------------------------------------
  // El plan del agotamiento, no el de la pereza. Empieza con Elías pidiendo
  // morirse y un ángel que no le predica: le da de comer y le deja dormir.
  // Jetró (Ex 18) está aquí porque el remedio bíblico al agotamiento incluye
  // repartir el trabajo, no sólo rezar.
  {
    slug: 'cansancio-5',
    kind: 'situacion',
    name: {
      es: 'Agotado (5 días)',
      en: 'Worn Out (5 Days)',
    },
    description: {
      es: 'Para el cansancio que ya no se arregla durmiendo: el trabajo, los cuidados, el ir tirando.\nLa Escritura trata el agotamiento con comida, descanso y ayuda repartida, antes que con consejos.',
      en: 'For the tiredness that sleep no longer fixes: work, caregiving, just getting by.\nScripture treats exhaustion with food, rest and shared help before it offers any advice.',
    },
    days: [
      { readings: [{ book: '1KI', chapters: [19, 19], verses: [4, 9] }] }, // «se sentó debajo de una retama y pidió para sí la muerte»
      { readings: [{ book: 'EXO', chapters: [18, 18], verses: [13, 23] }] }, // «Te cansarás demasiado... no podrás hacerlo tú solo»
      { readings: [{ book: 'ISA', chapters: [40, 40], verses: [27, 31] }] }, // «los que esperan en Yahvé renovarán sus fuerzas»
      { readings: [{ book: 'MAT', chapters: [11, 11], verses: [25, 30] }] }, // «Venid a Mí todos los agobiados y los cargados»
      { readings: [{ book: 'MRK', chapters: [6, 6], verses: [30, 34] }] }, // «Venid vosotros aparte, a un lugar desierto, para que descanséis un poco»
    ],
  },

  // --- Esperanza --------------------------------------------------------
  // De Jer 29 se conservan los «setenta años» del v. 10: sin ellos, el
  // famoso «designios de paz y no de mal» se convierte en la promesa barata
  // que suele citarse. De Isa 35 se toma desde el v. 5 para dejar fuera la
  // «venganza» del v. 4 y terminar en «huirán el dolor y el llanto».
  {
    slug: 'esperanza-7',
    kind: 'situacion',
    name: {
      es: 'Volver a esperar (7 días)',
      en: 'Learning to Hope Again (7 Days)',
    },
    description: {
      es: 'Una semana para cuando lo que viene parece cerrado y la esperanza suena a consuelo barato.\nEmpieza en un valle de huesos secos y en un destierro que aún dura, no en un final feliz.',
      en: 'A week for when the future looks shut and hope sounds like cheap comfort.\nIt begins in a valley of dry bones and in an exile that is not over yet, not at a happy ending.',
    },
    days: [
      { readings: [{ book: 'EZK', chapters: [37, 37], verses: [1, 10] }] }, // «la llanura estaba llena de huesos... secos en extremo»
      { readings: [{ book: 'JER', chapters: [29, 29], verses: [10, 14] }] }, // «Concluidos los setenta años... pensamientos de paz, y no de mal»
      { readings: [{ book: 'ISA', chapters: [35, 35], verses: [5, 10] }] }, // «brotarán aguas en el desierto» / «huirán el dolor y el llanto»
      { readings: [{ book: 'PSA', chapters: [39, 39], verses: [2, 6] }] }, // «Me sacó de una fosa mortal, del fango cenagoso»
      { readings: [{ book: 'MRK', chapters: [4, 4], verses: [26, 32] }] }, // «la simiente germina y crece, y él no sabe cómo»
      { readings: [{ book: 'ROM', chapters: [5, 5], verses: [1, 5] }] }, // «y la esperanza no engaña»
      { readings: [{ book: '1PE', chapters: [1, 1], verses: [3, 9] }] }, // «nos ha engendrado de nuevo para una esperanza viva»
    ],
  },

  // --- Alegría ----------------------------------------------------------
  // Tres días para una alegría que también sabe de dónde viene: el salmo del
  // regreso incluye a los que sembraron llorando.
  {
    slug: 'alegria-3',
    kind: 'situacion',
    name: {
      es: 'Días de alegría (3 días)',
      en: 'Days of Joy (3 Days)',
    },
    description: {
      es: 'Tres días para cuando ha pasado algo bueno y uno quiere hacer algo con esa alegría.\nEl salmo del regreso, la fiesta de Nehemías y el cántico de María.',
      en: 'Three days for when something good has happened and you want to do something with the joy.\nThe psalm of the return, Nehemiah’s feast, and Mary’s canticle.',
    },
    days: [
      { readings: [{ book: 'PSA', chapters: [125, 125], verses: [1, 6] }] }, // «Se llenó nuestra boca de risas»
      { readings: [{ book: 'NEH', chapters: [8, 8], verses: [9, 12] }] }, // «el gozo de Yahvé es vuestra fortaleza»
      { readings: [{ book: 'LUK', chapters: [1, 1], verses: [46, 55] }] }, // «Glorifica mi alma al Señor» (el Magníficat)
    ],
  },
];
