// Pool curado del «versículo del día».
//
// ⚠️ BORRADOR EDITORIAL — PENDIENTE DE REVISIÓN DEL MAINTAINER.
// Política del proyecto: el contenido editorial lo valida un humano antes de
// publicarse. Esta primera pasada la generó un asistente y está verificada
// contra la BD (existencia de libro, capítulo y versículos en la versión
// STRA), pero la elección de los pasajes NO está aprobada todavía.
//
// Criterio de selección:
//  - Versículos que consuelan, iluminan o invitan a la oración. Nada de
//    genealogías, prescripciones rituales, maldiciones ni imprecatorios: un
//    versículo suelto se lee sin contexto y no puede resultar cruel ni
//    desconcertante.
//  - Equilibrio Antiguo/Nuevo Testamento (~44/56), con presencia de todos los
//    bloques del canon católico: Pentateuco, históricos, sapienciales,
//    profetas, los cuatro Evangelios, Hechos, paulinas, católicas y Apocalipsis.
//  - Rangos cortos: normalmente un versículo; dos a cuatro sólo cuando la
//    frase queda partida.
//  - Sin repeticiones ni solapamientos de rango.
//
// Las entradas con `season` sólo entran en el sorteo durante ese tiempo
// litúrgico; las que no lo llevan forman el fondo general que se usa en Tiempo
// Ordinario (y como red de seguridad si un tiempo se quedara sin versículos).
//
// ⚠️ NUMERACIÓN DE LOS SALMOS: greco-latina (la de la Vulgata y la de nuestra
// BD), no la hebrea. El Miserere es el 50, «Bendice, alma mía, a Yahvé» el 102
// y «Cantad a Yahvé un cántico nuevo» el 97. Cada referencia de este fichero se
// ha comprobado leyendo el texto real de la BD.
//
// El comentario al final de cada línea reproduce las primeras palabras del
// versículo en español (Straubinger) para que la revisión se pueda hacer sin
// abrir la Biblia.

import type { VerseOfDayEntry } from '../verse-of-day';

export const VERSE_POOL: VerseOfDayEntry[] = [
  // ===========================================================================
  // FONDO GENERAL (Tiempo Ordinario) — Antiguo Testamento
  // ===========================================================================

  // --- Salmos ---
  { book: 'PSA', chapter: 1, verses: [1, 2] }, // «¡Dichoso el hombre que no sigue el consejo de los malvados...»
  { book: 'PSA', chapter: 4, verses: [9, 9] }, // «Apenas me acuesto, me duermo en paz...»
  { book: 'PSA', chapter: 8, verses: [4, 5] }, // «Cuando contemplo tus cielos, hechura de tus dedos...»
  { book: 'PSA', chapter: 15, verses: [11, 11] }, // «Tú me harás conocer la senda de la vida...»
  { book: 'PSA', chapter: 18, verses: [2, 2] }, // «Los cielos atestiguan la gloria de Dios...»
  { book: 'PSA', chapter: 22, verses: [4, 4] }, // «Aunque atraviese un valle de tinieblas, no temeré ningún mal...»
  { book: 'PSA', chapter: 22, verses: [6, 6] }, // «Bondad y misericordia me seguirán todos los días de mi vida...»
  { book: 'PSA', chapter: 24, verses: [4, 4] }, // «Muéstrame tus caminos, oh Yahvé...»
  { book: 'PSA', chapter: 26, verses: [4, 4] }, // «Una sola cosa he pedido a Yahvé...»
  { book: 'PSA', chapter: 26, verses: [14, 14] }, // «¡Aguarda a Yahvé y ten ánimo...!»
  { book: 'PSA', chapter: 29, verses: [6, 6] }, // «Porque su enojo dura un instante, mas su benevolencia es por toda la vida...»
  { book: 'PSA', chapter: 30, verses: [6, 6] }, // «En tus manos encomiendo mi espíritu...»
  { book: 'PSA', chapter: 33, verses: [9, 9] }, // «Gustad y ved cuán bueno es Yahvé...»
  { book: 'PSA', chapter: 33, verses: [19, 19] }, // «Yahvé está junto a los que tienen el corazón atribulado...»
  { book: 'PSA', chapter: 36, verses: [5, 5] }, // «Entrega a Yahvé tu camino; confíate a Él y déjale obrar.»
  { book: 'PSA', chapter: 39, verses: [2, 2] }, // «Esperé en Yahvé, con esperanza sin reserva...»
  { book: 'PSA', chapter: 41, verses: [6, 6] }, // «¿Por qué estás afligida, alma mía...?»
  { book: 'PSA', chapter: 45, verses: [2, 2] }, // «Dios es para nosotros refugio y fortaleza...»
  { book: 'PSA', chapter: 54, verses: [23, 23] }, // «Deja tu cuidado a cargo de Yahvé, y Él te sostendrá.»
  { book: 'PSA', chapter: 61, verses: [2, 2] }, // «Sólo en Dios se descansa, oh alma mía...»
  { book: 'PSA', chapter: 72, verses: [26, 26] }, // «La carne y el corazón mío desfallecen, la roca de mi corazón es Dios...»
  { book: 'PSA', chapter: 83, verses: [2, 2] }, // «¡Oh cuán amable es tu morada, Yahvé de los ejércitos!»
  { book: 'PSA', chapter: 85, verses: [5, 5] }, // «Porque Tú eres un Señor bueno y pronto a perdonar...»
  { book: 'PSA', chapter: 88, verses: [2, 2] }, // «Quiero cantar eternamente las misericordias de Yahvé...»
  { book: 'PSA', chapter: 89, verses: [12, 12] }, // «Enséñanos a contar nuestros días...»
  { book: 'PSA', chapter: 90, verses: [11, 11] }, // «Pues Él te ha encomendado a sus ángeles...»
  { book: 'PSA', chapter: 94, verses: [1, 2] }, // «Venid, alegrémonos para Yahvé; aclamemos a la Roca de nuestra salvación.»
  { book: 'PSA', chapter: 102, verses: [1, 2] }, // «Bendice a Yahvé, alma mía, y todo cuanto hay en mí...»
  { book: 'PSA', chapter: 102, verses: [8, 8] }, // «Misericordioso y benigno es Yahvé, tarde en airarse...»
  { book: 'PSA', chapter: 102, verses: [12, 12] }, // «Cuanto dista el Oriente del Occidente...»
  { book: 'PSA', chapter: 103, verses: [24, 24] }, // «¡Cuán variadas son tus obras, oh Yahvé!»
  { book: 'PSA', chapter: 106, verses: [1, 1] }, // «Celebrad a Yahvé porque es bueno...»
  { book: 'PSA', chapter: 111, verses: [4, 4] }, // «Para los rectos brilla una luz en las tinieblas...»
  { book: 'PSA', chapter: 118, verses: [105, 105] }, // «Antorcha para mis pies es tu palabra...»
  { book: 'PSA', chapter: 118, verses: [165, 165] }, // «Mucha es la paz de los que aman tu Ley...»
  { book: 'PSA', chapter: 120, verses: [1, 2] }, // «Alzo mis ojos hacia los montes: ¿De dónde me vendrá el socorro?»
  { book: 'PSA', chapter: 121, verses: [1, 1] }, // «Me llené de gozo cuando me dijeron: “Iremos a la Casa de Yahvé.”»
  { book: 'PSA', chapter: 125, verses: [1, 2] }, // «Cuando Yahvé trajo de nuevo a los cautivos de Sión...»
  { book: 'PSA', chapter: 126, verses: [1, 1] }, // «Si Yahvé no edifica la casa, en vano trabajan los que la construyen.»
  { book: 'PSA', chapter: 130, verses: [1, 2] }, // «Yahvé, mi corazón (ya) no se engríe...»
  { book: 'PSA', chapter: 132, verses: [1, 1] }, // «¡Mirad cuán bueno es y cuán deleitoso para los hermanos el estar reunidos!»
  { book: 'PSA', chapter: 138, verses: [23, 24] }, // «Escudríñame, oh Dios, y explora mi corazón...»
  { book: 'PSA', chapter: 142, verses: [8, 8] }, // «Hazme sentir al punto tu misericordia...»
  { book: 'PSA', chapter: 144, verses: [8, 9] }, // «Yahvé es benigno y misericordioso, magnánimo y grande en clemencia.»
  { book: 'PSA', chapter: 144, verses: [18, 18] }, // «Yahvé cerca está de cuantos le invocan...»
  { book: 'PSA', chapter: 150, verses: [6, 6] }, // «¡Todo lo que respira alabe al Señor!»

  // --- Pentateuco e históricos ---
  { book: 'GEN', chapter: 1, verses: [27, 27] }, // «Y creó Dios al hombre a imagen suya...»
  { book: 'GEN', chapter: 1, verses: [31, 31] }, // «Vio Dios todo cuanto había hecho; y he aquí que estaba muy bien.»
  { book: 'GEN', chapter: 12, verses: [2, 2] }, // «Pues de ti haré una nación grande y te bendeciré...»
  { book: 'GEN', chapter: 28, verses: [15, 15] }, // «Y he aquí que Yo estaré contigo, y te guardaré en todos tus caminos...»
  { book: 'GEN', chapter: 50, verses: [20, 20] }, // «Vosotros pensasteis hacerme mal, pero Dios lo dispuso para bien...»
  { book: 'EXO', chapter: 3, verses: [14, 14] }, // «Yo soy el que soy.»
  { book: 'EXO', chapter: 14, verses: [14, 14] }, // «Yahvé peleará por vosotros, y vosotros quedaos tranquilos.»
  { book: 'EXO', chapter: 33, verses: [14, 14] }, // «Mi Rostro irá (delante de ti) y te daré descanso.»
  { book: 'LEV', chapter: 19, verses: [18, 18] }, // «Amarás a tu prójimo como a ti mismo.»
  { book: 'NUM', chapter: 6, verses: [24, 26] }, // «¡Yahvé te bendiga y te guarde!»
  { book: 'DEU', chapter: 6, verses: [4, 5] }, // «Oye, Israel: Yahvé, nuestro Dios, Yahvé es uno solo.»
  { book: 'DEU', chapter: 30, verses: [19, 19] }, // «...escoge, pues, la vida, para que vivas tú y tu posteridad.»
  { book: 'DEU', chapter: 31, verses: [6, 6] }, // «Sed fuertes y valerosos; no temáis...»
  { book: 'JOS', chapter: 1, verses: [9, 9] }, // «Sé fuerte y valeroso... porque Yahvé, tu Dios, está contigo.»
  { book: 'RUT', chapter: 1, verses: [16, 16] }, // «Adonde tú vayas iré yo, y donde tú mores moraré yo.»
  { book: '1SA', chapter: 3, verses: [10, 10] }, // «Habla, tu siervo escucha.»
  { book: '1SA', chapter: 16, verses: [7, 7] }, // «El hombre ve el exterior, mas Yahvé ve el corazón.»
  { book: '2SA', chapter: 22, verses: [29, 29] }, // «Tú, Yahvé, eres mi antorcha; Yahvé ilumina mis tinieblas.»
  { book: '1KI', chapter: 19, verses: [12, 12] }, // «...y tras el fuego, un soplo tranquilo y suave.»
  { book: '2CH', chapter: 7, verses: [14, 14] }, // «...si mi pueblo se humillare, orando y buscando mi rostro...»
  { book: 'NEH', chapter: 8, verses: [10, 10] }, // «No os aflijáis, pues el gozo de Yahvé es vuestra fortaleza.»
  { book: 'TOB', chapter: 4, verses: [7, 7] }, // «Da limosna de tus bienes, y no apartes tu rostro de ningún pobre...»
  { book: 'TOB', chapter: 4, verses: [15, 15] }, // «A todo aquel que haya trabajado algo por ti, dale en seguida su jornal...»
  { book: '1MA', chapter: 3, verses: [19, 19] }, // «El triunfo en los combates no depende de la multitud de las tropas...»
  { book: '2MA', chapter: 12, verses: [46, 46] }, // «Es un pensamiento santo y saludable el rogar por los difuntos...»

  // --- Sapienciales ---
  { book: 'JOB', chapter: 1, verses: [21, 21] }, // «Yahvé lo ha dado, Yahvé lo ha quitado. ¡Sea bendito el nombre de Yahvé!»
  { book: 'JOB', chapter: 12, verses: [10, 10] }, // «En su mano está el alma de todo viviente...»
  { book: 'JOB', chapter: 19, verses: [25, 25] }, // «Mas yo sé que vive mi Redentor...»
  { book: 'JOB', chapter: 42, verses: [5, 5] }, // «Sólo de oídas te conocía; mas ahora te ven mis ojos.»
  { book: 'PRO', chapter: 3, verses: [5, 6] }, // «Confía en el Señor con todo tu corazón...»
  { book: 'PRO', chapter: 4, verses: [23, 23] }, // «Ante toda cosa guardada guarda tu corazón...»
  { book: 'PRO', chapter: 10, verses: [12, 12] }, // «El odio suscita contiendas, el amor, empero, cubre todas las faltas.»
  { book: 'PRO', chapter: 12, verses: [25, 25] }, // «Las congojas del corazón abaten al hombre, mas una palabra buena le alegra.»
  { book: 'PRO', chapter: 15, verses: [1, 1] }, // «Una respuesta blanda calma el furor...»
  { book: 'PRO', chapter: 16, verses: [3, 3] }, // «Encomienda a Yahvé tus planes...»
  { book: 'PRO', chapter: 16, verses: [9, 9] }, // «El corazón del hombre proyecta sus caminos, pero Yahvé dirige sus pasos.»
  { book: 'PRO', chapter: 17, verses: [22, 22] }, // «El corazón alegre es una excelente medicina...»
  { book: 'PRO', chapter: 18, verses: [10, 10] }, // «Ciudadela fuerte es el nombre de Yahvé...»
  { book: 'PRO', chapter: 19, verses: [17, 17] }, // «Quien se apiada del pobre, presta a Yahvé...»
  { book: 'PRO', chapter: 27, verses: [17, 17] }, // «Hierro con hierro se aguza; así un hombre aguza a otro.»
  { book: 'ECC', chapter: 3, verses: [1, 1] }, // «Todas las cosas tienen su tiempo...»
  { book: 'ECC', chapter: 3, verses: [11, 11] }, // «Todas las cosas hizo Él buenas a su tiempo...»
  { book: 'ECC', chapter: 4, verses: [9, 10] }, // «Más valen dos que uno solo...»
  { book: 'ECC', chapter: 12, verses: [13, 13] }, // «Teme a Dios y guarda sus mandamientos...»
  { book: 'SNG', chapter: 2, verses: [10, 12] }, // «Levántate, amiga mía; hermosa mía, ven... ha pasado ya el invierno.»
  { book: 'WIS', chapter: 1, verses: [13, 14] }, // «Porque no es Dios quien hizo la muerte...»
  { book: 'WIS', chapter: 2, verses: [23, 23] }, // «Porque Dios creó inmortal al hombre...»
  { book: 'WIS', chapter: 3, verses: [1, 1] }, // «Mas las almas de los justos están en la mano de Dios...»
  { book: 'WIS', chapter: 7, verses: [26, 26] }, // «...es el resplandor de la luz eterna, un espejo sin mancilla...»
  { book: 'SIR', chapter: 1, verses: [16, 16] }, // «El principio de la sabiduría es el temor del Señor...»
  { book: 'SIR', chapter: 2, verses: [6, 6] }, // «Confía en Dios, y Él te sacará a salvo...»
  { book: 'SIR', chapter: 6, verses: [14, 14] }, // «El amigo fiel es una defensa poderosa...»
  { book: 'SIR', chapter: 30, verses: [22, 23] }, // «No dejes que la tristeza se apodere de tu alma...»
  { book: 'SIR', chapter: 35, verses: [17, 17] }, // «No desechará los ruegos del huérfano...»

  // --- Profetas ---
  { book: 'ISA', chapter: 2, verses: [4, 4] }, // «De sus espadas forjarán rejas de arado...»
  { book: 'ISA', chapter: 6, verses: [8, 8] }, // «Heme aquí; envíame a mí.»
  { book: 'ISA', chapter: 12, verses: [2, 2] }, // «He aquí que Dios es mi salvación; tendré confianza y no temeré...»
  { book: 'ISA', chapter: 25, verses: [8, 8] }, // «Enjugará Yahvé el Señor las lágrimas de todos los rostros...»
  { book: 'ISA', chapter: 26, verses: [3, 3] }, // «Al alma fiel le conservarás la paz...»
  { book: 'ISA', chapter: 40, verses: [8, 8] }, // «...mas la palabra de nuestro Dios permanece eternamente.»
  { book: 'ISA', chapter: 40, verses: [31, 31] }, // «Pero los que esperan en Yahvé renovarán sus fuerzas...»
  { book: 'ISA', chapter: 41, verses: [10, 10] }, // «No temas, que Yo estoy contigo...»
  { book: 'ISA', chapter: 43, verses: [1, 1] }, // «Te he llamado por tu nombre; tú eres mío.»
  { book: 'ISA', chapter: 43, verses: [2, 2] }, // «Si pasas por las aguas, Yo estoy contigo...»
  { book: 'ISA', chapter: 49, verses: [15, 15] }, // «¿Puede acaso la mujer olvidarse del niño de su pecho...?»
  { book: 'ISA', chapter: 55, verses: [8, 9] }, // «Pues mis pensamientos no son vuestros pensamientos...»
  { book: 'ISA', chapter: 55, verses: [10, 11] }, // «Como la lluvia y la nieve bajan del cielo...»
  { book: 'ISA', chapter: 61, verses: [1, 1] }, // «El Espíritu del Señor, Yahvé, está sobre mí...»
  { book: 'ISA', chapter: 66, verses: [13, 13] }, // «Como aquel a quien consuela su madre, así os consolaré Yo...»
  { book: 'JER', chapter: 1, verses: [5, 5] }, // «Antes de formarte en el seno materno te conocí...»
  { book: 'JER', chapter: 17, verses: [7, 8] }, // «Bienaventurado el varón que confía en Yahvé...»
  { book: 'JER', chapter: 29, verses: [11, 11] }, // «Yo conozco los designios que tengo respecto de vosotros...»
  { book: 'JER', chapter: 29, verses: [13, 13] }, // «Me buscaréis y me hallaréis, si me buscareis de todo vuestro corazón.»
  { book: 'JER', chapter: 31, verses: [3, 3] }, // «Con amor eterno te he amado...»
  { book: 'JER', chapter: 33, verses: [3, 3] }, // «Clama a Mí, y te responderé...»
  { book: 'LAM', chapter: 3, verses: [22, 23] }, // «...porque nunca se acaban sus piedades. Se renuevan cada mañana.»
  { book: 'LAM', chapter: 3, verses: [25, 26] }, // «Bueno es Yahvé para quien en Él espera...»
  { book: 'BAR', chapter: 4, verses: [4, 4] }, // «Dichosos somos nosotros, los de Israel, porque sabemos lo que agrada a Dios.»
  { book: 'EZK', chapter: 34, verses: [11, 12] }, // «He aquí que Yo mismo iré en pos de mis ovejas...»
  { book: 'EZK', chapter: 47, verses: [12, 12] }, // «...crecerá toda suerte de árboles frutales, cuyas hojas nunca caerán.»
  { book: 'DAN', chapter: 12, verses: [3, 3] }, // «Entonces los sabios brillarán como el resplandor del firmamento...»
  { book: 'HOS', chapter: 11, verses: [4, 4] }, // «Yo los atraje con lazos de hombre, con vínculos de amor...»
  { book: 'JON', chapter: 2, verses: [3, 3] }, // «Clamé a Yahvé en mi angustia, y Él me oyó...»
  { book: 'MIC', chapter: 6, verses: [8, 8] }, // «Practicar la justicia, y amar la misericordia, y andar humildemente...»
  { book: 'MIC', chapter: 7, verses: [18, 18] }, // «¿Quién es Dios como Tú, que perdonas la iniquidad...?»
  { book: 'HAB', chapter: 2, verses: [3, 3] }, // «Si tarda, espérala. Vendrá con toda seguridad...»
  { book: 'ZEP', chapter: 3, verses: [17, 17] }, // «Yahvé, tu Dios, está en medio de ti... y se regocijará sobre ti.»
  { book: 'ZEC', chapter: 4, verses: [6, 6] }, // «No por medio de un ejército ni por la fuerza, sino por mi Espíritu.»
  { book: 'MAL', chapter: 4, verses: [2, 2] }, // «Se levantará el Sol de justicia, que en sus alas traerá la salvación.»

  // ===========================================================================
  // FONDO GENERAL (Tiempo Ordinario) — Nuevo Testamento
  // ===========================================================================

  // --- Mateo ---
  { book: 'MAT', chapter: 5, verses: [8, 8] }, // «Bienaventurados los de corazón puro, porque verán a Dios.»
  { book: 'MAT', chapter: 5, verses: [9, 9] }, // «Bienaventurados los pacificadores...»
  { book: 'MAT', chapter: 5, verses: [14, 16] }, // «Vosotros sois la luz del mundo.»
  { book: 'MAT', chapter: 6, verses: [33, 33] }, // «Buscad, pues, primero el reino de Dios y su justicia...»
  { book: 'MAT', chapter: 6, verses: [34, 34] }, // «No os preocupéis, entonces, del mañana.»
  { book: 'MAT', chapter: 7, verses: [7, 7] }, // «Pedid y se os dará; buscad y encontraréis...»
  { book: 'MAT', chapter: 7, verses: [12, 12] }, // «Todo cuanto queréis que los hombres os hagan, hacedlo también vosotros.»
  { book: 'MAT', chapter: 9, verses: [36, 36] }, // «Tuvo compasión de ellas, porque estaban como ovejas que no tienen pastor.»
  { book: 'MAT', chapter: 10, verses: [29, 31] }, // «Ni uno de ellos caerá en tierra sin disposición de vuestro Padre.»
  { book: 'MAT', chapter: 11, verses: [28, 30] }, // «Venid a Mí todos los agobiados y los cargados...»
  { book: 'MAT', chapter: 18, verses: [20, 20] }, // «Donde dos o tres están reunidos por causa mía, allí estoy Yo.»
  { book: 'MAT', chapter: 19, verses: [14, 14] }, // «Dejad a los niños venir a Mí...»
  { book: 'MAT', chapter: 19, verses: [26, 26] }, // «Para los hombres eso es imposible, mas para Dios todo es posible.»
  { book: 'MAT', chapter: 22, verses: [37, 39] }, // «Amarás al Señor tu Dios de todo tu corazón...»
  { book: 'MAT', chapter: 25, verses: [40, 40] }, // «En cuanto lo hicisteis a uno solo... a Mí lo hicisteis.»

  // --- Marcos ---
  { book: 'MRK', chapter: 1, verses: [35, 35] }, // «En la madrugada... fue a un lugar desierto, y se puso allí a orar.»
  { book: 'MRK', chapter: 5, verses: [36, 36] }, // «No temas, únicamente cree.»
  { book: 'MRK', chapter: 6, verses: [31, 31] }, // «Venid vosotros aparte, a un lugar desierto, para que descanséis un poco.»
  { book: 'MRK', chapter: 9, verses: [24, 24] }, // «¡Creo! ¡Ven en ayuda de mi falta de fe!»
  { book: 'MRK', chapter: 10, verses: [45, 45] }, // «El Hijo del hombre no vino para ser servido, sino para servir...»
  { book: 'MRK', chapter: 11, verses: [24, 24] }, // «Todo lo que pidiereis orando, creed que lo obtuvisteis ya...»

  // --- Lucas ---
  { book: 'LUK', chapter: 6, verses: [36, 36] }, // «Sed misericordiosos como es misericordioso vuestro Padre.»
  { book: 'LUK', chapter: 6, verses: [38, 38] }, // «Dad y se os dará; una medida buena y apretada y remecida...»
  { book: 'LUK', chapter: 7, verses: [50, 50] }, // «Tu fe te ha salvado: ve hacia la paz.»
  { book: 'LUK', chapter: 10, verses: [42, 42] }, // «Una sola es necesaria. María eligió la buena parte...»
  { book: 'LUK', chapter: 11, verses: [13, 13] }, // «¡Cuánto más el Padre dará desde el cielo el Espíritu Santo...!»
  { book: 'LUK', chapter: 12, verses: [32, 32] }, // «No tengas temor, pequeño rebaño mío...»
  { book: 'LUK', chapter: 18, verses: [1, 1] }, // «...la necesidad de que orasen siempre sin desalentarse.»
  { book: 'LUK', chapter: 21, verses: [33, 33] }, // «El cielo y la tierra pasarán, pero mis palabras no pasarán.»

  // --- Juan ---
  { book: 'JHN', chapter: 3, verses: [16, 16] }, // «Porque así amó Dios al mundo: hasta dar su Hijo único...»
  { book: 'JHN', chapter: 4, verses: [14, 14] }, // «...el agua que Yo le daré se hará en él fuente de agua surgente.»
  { book: 'JHN', chapter: 6, verses: [35, 35] }, // «Soy Yo el pan de vida...»
  { book: 'JHN', chapter: 6, verses: [68, 68] }, // «Señor, ¿a quién iríamos? Tú tienes palabras de vida eterna.»
  { book: 'JHN', chapter: 7, verses: [37, 38] }, // «Si alguno tiene sed venga a Mí, y beba...»
  { book: 'JHN', chapter: 8, verses: [12, 12] }, // «Yo soy la luz del mundo.»
  { book: 'JHN', chapter: 8, verses: [32, 32] }, // «...y conoceréis la verdad, y la verdad os hará libres.»
  { book: 'JHN', chapter: 10, verses: [14, 14] }, // «Yo soy el pastor bueno, y conozco las mías...»
  { book: 'JHN', chapter: 12, verses: [24, 24] }, // «Si el grano de trigo arrojado en tierra no muere, se queda solo...»
  { book: 'JHN', chapter: 13, verses: [35, 35] }, // «En esto reconocerán todos que sois discípulos míos...»
  { book: 'JHN', chapter: 14, verses: [1, 1] }, // «No se turbe vuestro corazón: creed en Dios...»
  { book: 'JHN', chapter: 14, verses: [6, 6] }, // «Soy Yo el camino, y la verdad, y la vida...»
  { book: 'JHN', chapter: 15, verses: [5, 5] }, // «Yo soy la vid, vosotros los sarmientos.»
  { book: 'JHN', chapter: 15, verses: [9, 9] }, // «Como mi Padre me amó, así Yo os he amado: permaneced en mi amor.»
  { book: 'JHN', chapter: 16, verses: [33, 33] }, // «Tened confianza: Yo he vencido al mundo.»
  { book: 'JHN', chapter: 17, verses: [21, 21] }, // «...a fin de que todos sean uno, como Tú, Padre, en Mí y Yo en Ti.»

  // --- Hechos de los Apóstoles ---
  { book: 'ACT', chapter: 2, verses: [42, 42] }, // «Perseveraban en la doctrina de los apóstoles y en la comunión...»
  { book: 'ACT', chapter: 4, verses: [32, 32] }, // «La multitud de los fieles tenía un mismo corazón y una misma alma...»
  { book: 'ACT', chapter: 10, verses: [34, 35] }, // «En verdad conozco que Dios no hace acepción de personas...»
  { book: 'ACT', chapter: 17, verses: [27, 28] }, // «...pues en Él vivimos y nos movemos y existimos.»
  { book: 'ACT', chapter: 20, verses: [35, 35] }, // «Más dichoso es dar que recibir.»

  // --- Cartas paulinas ---
  { book: 'ROM', chapter: 5, verses: [5, 5] }, // «Y la esperanza no engaña, porque el amor de Dios ha sido derramado...»
  { book: 'ROM', chapter: 8, verses: [26, 26] }, // «El Espíritu ayuda a nuestra flaqueza...»
  { book: 'ROM', chapter: 8, verses: [28, 28] }, // «Todas las cosas cooperan para el bien de los que aman a Dios...»
  { book: 'ROM', chapter: 8, verses: [31, 31] }, // «Si Dios está por nosotros, ¿quién contra nosotros?»
  { book: 'ROM', chapter: 8, verses: [38, 39] }, // «Ni muerte, ni vida... podrá separarnos del amor de Dios.»
  { book: 'ROM', chapter: 12, verses: [2, 2] }, // «Y no os acomodéis a este siglo, antes transformaos...»
  { book: 'ROM', chapter: 12, verses: [12, 12] }, // «Alegres en la esperanza, pacientes en la tribulación...»
  { book: 'ROM', chapter: 12, verses: [21, 21] }, // «No te dejes vencer por el mal, sino domina al mal con el bien.»
  { book: 'ROM', chapter: 14, verses: [8, 8] }, // «Si vivimos, vivimos para el Señor...»
  { book: 'ROM', chapter: 15, verses: [13, 13] }, // «El Dios de la esperanza os colme de todo gozo y paz en la fe...»
  { book: '1CO', chapter: 2, verses: [9, 9] }, // «Lo que ojo no vio, ni oído oyó...»
  { book: '1CO', chapter: 3, verses: [16, 16] }, // «¿No sabéis acaso que sois templo de Dios...?»
  { book: '1CO', chapter: 10, verses: [13, 13] }, // «Dios es fiel y no permitirá que seáis tentados sobre vuestras fuerzas...»
  { book: '1CO', chapter: 13, verses: [4, 5] }, // «El amor es paciente; el amor es benigno, sin envidia...»
  { book: '1CO', chapter: 13, verses: [7, 7] }, // «Todo lo sobrelleva, todo lo cree, todo lo espera, todo lo soporta.»
  { book: '1CO', chapter: 13, verses: [13, 13] }, // «Permanecen la fe, la esperanza y la caridad... la mayor es la caridad.»
  { book: '1CO', chapter: 15, verses: [58, 58] }, // «Estad firmes, inconmovibles... vuestra fatiga no es vana en el Señor.»
  { book: '1CO', chapter: 16, verses: [14, 14] }, // «Todas vuestras cosas se hagan con amor.»
  { book: '2CO', chapter: 1, verses: [3, 4] }, // «El Padre de las misericordias y Dios de toda consolación...»
  { book: '2CO', chapter: 4, verses: [7, 7] }, // «Este tesoro lo llevamos en vasijas de barro...»
  { book: '2CO', chapter: 4, verses: [16, 17] }, // «Aunque nuestro hombre exterior vaya decayendo, el interior se renueva...»
  { book: '2CO', chapter: 9, verses: [7, 7] }, // «Porque dador alegre ama Dios.»
  { book: '2CO', chapter: 12, verses: [9, 9] }, // «Mi gracia te basta, pues en la flaqueza se perfecciona la fuerza.»
  { book: 'GAL', chapter: 2, verses: [20, 20] }, // «Ya no vivo yo, sino que en mí vive Cristo.»
  { book: 'GAL', chapter: 3, verses: [28, 28] }, // «Todos vosotros sois uno solo en Cristo Jesús.»
  { book: 'GAL', chapter: 5, verses: [13, 13] }, // «Sed siervos unos de otros por la caridad.»
  { book: 'GAL', chapter: 6, verses: [2, 2] }, // «Sobrellevad los unos las cargas de los otros...»
  { book: 'GAL', chapter: 6, verses: [9, 9] }, // «No nos cansemos, pues, de hacer el bien...»
  { book: 'EPH', chapter: 2, verses: [10, 10] }, // «Pues de Él somos hechura, creados en Cristo Jesús para obras buenas...»
  { book: 'EPH', chapter: 3, verses: [17, 19] }, // «...arraigados y cimentados en el amor.»
  { book: 'EPH', chapter: 3, verses: [20, 20] }, // «A Él, que es poderoso para hacer... más de lo que pedimos y pensamos.»
  { book: 'EPH', chapter: 4, verses: [2, 3] }, // «Con toda humildad de espíritu y mansedumbre, con longanimidad...»
  { book: 'EPH', chapter: 4, verses: [32, 32] }, // «Sed benignos unos para con otros, compasivos, perdonándoos mutuamente...»
  { book: 'PHP', chapter: 1, verses: [6, 6] }, // «Aquel que en vosotros comenzó la buena obra, la perfeccionará...»
  { book: 'PHP', chapter: 2, verses: [3, 4] }, // «Con humilde corazón, considerando los unos a los otros como superiores.»
  { book: 'PHP', chapter: 4, verses: [6, 7] }, // «No os inquietéis por cosa alguna... la paz de Dios custodiará vuestros corazones.»
  { book: 'PHP', chapter: 4, verses: [8, 8] }, // «Cuantas cosas sean conformes a la verdad... a tales cosas atended.»
  { book: 'PHP', chapter: 4, verses: [13, 13] }, // «Todo lo puedo en Aquel que me conforta.»
  { book: 'COL', chapter: 3, verses: [12, 13] }, // «Vestíos... de entrañas de misericordia, benignidad, humildad...»
  { book: 'COL', chapter: 3, verses: [14, 14] }, // «Sobre todas estas cosas, (vestíos) del amor, vínculo de la perfección.»
  { book: 'COL', chapter: 3, verses: [15, 15] }, // «Y la paz de Cristo... prime en vuestros corazones.»
  { book: 'COL', chapter: 3, verses: [17, 17] }, // «Todo cuanto hagáis... hacedlo todo en nombre del Señor Jesús.»
  { book: '1TH', chapter: 5, verses: [11, 11] }, // «Exhortaos unos a otros, y edificaos recíprocamente...»
  { book: '1TH', chapter: 5, verses: [16, 18] }, // «Gozaos siempre. Orad sin cesar. En todo dad gracias.»
  { book: '2TH', chapter: 2, verses: [16, 17] }, // «...nos ha otorgado por gracia consolación eterna y buena esperanza.»
  { book: '2TH', chapter: 3, verses: [16, 16] }, // «El mismo Señor de la paz os conceda la paz en todo tiempo...»
  { book: '1TI', chapter: 1, verses: [15, 15] }, // «Cristo Jesús vino al mundo para salvar a los pecadores...»
  { book: '1TI', chapter: 6, verses: [6, 6] }, // «Grande granjería es la piedad con el contento...»
  { book: '2TI', chapter: 1, verses: [7, 7] }, // «No nos ha dado Dios espíritu de timidez, sino de fortaleza y de amor...»
  { book: '2TI', chapter: 2, verses: [13, 13] }, // «Si somos infieles, Él permanece fiel...»
  { book: '2TI', chapter: 4, verses: [7, 7] }, // «He peleado el buen combate, he terminado la carrera, he guardado la fe.»
  { book: 'TIT', chapter: 2, verses: [12, 12] }, // «...vivamos sobria, justa y piadosamente en este siglo actual.»
  { book: 'PHM', chapter: 1, verses: [7, 7] }, // «Tuve mucho gozo y consuelo con motivo de tu caridad...»
  { book: 'HEB', chapter: 4, verses: [12, 12] }, // «La Palabra de Dios es viva y eficaz...»
  { book: 'HEB', chapter: 4, verses: [16, 16] }, // «Lleguémonos confiadamente al trono de la gracia...»
  { book: 'HEB', chapter: 11, verses: [1, 1] }, // «La fe es la sustancia de lo que se espera, la prueba de lo que no se ve.»
  { book: 'HEB', chapter: 12, verses: [1, 2] }, // «Corramos mediante la paciencia la carrera que se nos propone...»
  { book: 'HEB', chapter: 13, verses: [5, 5] }, // «No te abandonaré ni te desampararé.»
  { book: 'HEB', chapter: 13, verses: [8, 8] }, // «Jesucristo es el mismo ayer y hoy y por los siglos.»

  // --- Cartas católicas y Apocalipsis ---
  { book: 'JAS', chapter: 1, verses: [2, 4] }, // «...sabiendo que la prueba de vuestra fe produce paciencia.»
  { book: 'JAS', chapter: 1, verses: [5, 5] }, // «Si alguno de vosotros está desprovisto de sabiduría, pídala a Dios...»
  { book: 'JAS', chapter: 1, verses: [17, 17] }, // «De lo alto es todo bien que recibimos y todo don perfecto...»
  { book: 'JAS', chapter: 1, verses: [19, 19] }, // «Pronto para oír, tardo para hablar, tardo para airarse.»
  { book: 'JAS', chapter: 4, verses: [10, 10] }, // «Abajaos delante del Señor y Él os levantará.»
  { book: 'JAS', chapter: 5, verses: [16, 16] }, // «Mucho puede la oración vigorosa del justo.»
  { book: '1PE', chapter: 2, verses: [9, 9] }, // «Vosotros sois un linaje escogido, un sacerdocio real...»
  { book: '1PE', chapter: 2, verses: [24, 24] }, // «Él mismo llevó nuestros pecados en su cuerpo sobre el madero...»
  { book: '1PE', chapter: 3, verses: [15, 15] }, // «Estad siempre prontos a dar respuesta... de la esperanza en que vivís.»
  { book: '1PE', chapter: 4, verses: [8, 8] }, // «La caridad cubre multitud de pecados.»
  { book: '1PE', chapter: 4, verses: [10, 10] }, // «Sirva cada uno a los demás con el don que haya recibido...»
  { book: '1PE', chapter: 5, verses: [7, 7] }, // «Descargad sobre Él todas vuestras preocupaciones...»
  { book: '2PE', chapter: 1, verses: [19, 19] }, // «...como a una lámpara que alumbra en un lugar oscuro.»
  { book: '1JN', chapter: 1, verses: [5, 5] }, // «Dios es luz y en Él no hay tiniebla alguna.»
  { book: '1JN', chapter: 3, verses: [1, 1] }, // «Mirad qué amor nos ha mostrado el Padre...»
  { book: '1JN', chapter: 3, verses: [18, 18] }, // «No amemos de palabra, y con la lengua, sino de obra y en verdad.»
  { book: '1JN', chapter: 4, verses: [7, 8] }, // «Amémonos unos a otros, porque el amor es de Dios...»
  { book: '1JN', chapter: 4, verses: [16, 16] }, // «Dios es amor; y el que permanece en el amor, en Dios permanece.»
  { book: '1JN', chapter: 4, verses: [18, 18] }, // «En el amor no hay temor...»
  { book: '2JN', chapter: 1, verses: [6, 6] }, // «El amor consiste en que caminemos según sus mandamientos.»
  { book: '3JN', chapter: 1, verses: [4, 4] }, // «No hay para mí gozo mayor que el oír que mis hijos andan en la verdad.»
  { book: 'JUD', chapter: 1, verses: [20, 21] }, // «...orando en el Espíritu Santo, permaneced en el amor de Dios.»
  { book: 'REV', chapter: 3, verses: [20, 20] }, // «Mira que estoy a la puerta y golpeo.»
  { book: 'REV', chapter: 21, verses: [3, 3] }, // «He aquí la morada de Dios entre los hombres.»
  { book: 'REV', chapter: 21, verses: [4, 4] }, // «Y les enjugará toda lágrima de sus ojos...»
  { book: 'REV', chapter: 22, verses: [17, 17] }, // «Y el que tenga sed venga; y el que quiera, tome gratis del agua de la vida.»

  // ===========================================================================
  // ADVIENTO — espera, promesa, vigilancia
  // ===========================================================================
  { book: 'ISA', chapter: 7, verses: [14, 14], season: 'adviento' }, // «He aquí que la virgen concebirá y dará a luz un hijo...»
  { book: 'ISA', chapter: 9, verses: [2, 2], season: 'adviento' }, // «El pueblo que andaba en tinieblas vio una gran luz...»
  { book: 'ISA', chapter: 11, verses: [1, 1], season: 'adviento' }, // «Saldrá un retoño del tronco de Isaí...»
  { book: 'ISA', chapter: 40, verses: [1, 1], season: 'adviento' }, // «Consolad, consolad a mi pueblo, dice vuestro Dios.»
  { book: 'ISA', chapter: 40, verses: [3, 3], season: 'adviento' }, // «Preparad el camino de Yahvé en el desierto...»
  { book: 'ISA', chapter: 45, verses: [8, 8], season: 'adviento' }, // «Derramad, oh cielos, desde arriba el rocío...»
  { book: 'JER', chapter: 33, verses: [14, 15], season: 'adviento' }, // «He aquí que vienen días... suscitaré a David un Vástago justo.»
  { book: 'BAR', chapter: 5, verses: [1, 1], season: 'adviento' }, // «Despójate, Jerusalén, del vestido de tu luto...»
  { book: 'MAL', chapter: 3, verses: [1, 1], season: 'adviento' }, // «He aquí que envío a mi ángel que preparará el camino delante de Mí...»
  { book: 'PSA', chapter: 84, verses: [8, 8], season: 'adviento' }, // «Muéstranos, Yahvé, tu misericordia y envíanos tu salvación.»
  { book: 'MAT', chapter: 24, verses: [42, 42], season: 'adviento' }, // «Velad, pues, porque no sabéis en qué día vendrá vuestro Señor.»
  { book: 'MRK', chapter: 13, verses: [33, 33], season: 'adviento' }, // «¡Mirad!, ¡velad! porque no sabéis cuándo será el tiempo.»
  { book: 'LUK', chapter: 1, verses: [37, 37], season: 'adviento' }, // «...porque no hay nada imposible para Dios.»
  { book: 'LUK', chapter: 1, verses: [38, 38], season: 'adviento' }, // «He aquí la esclava del Señor: Séame hecho según tu palabra.»
  { book: 'LUK', chapter: 1, verses: [45, 45], season: 'adviento' }, // «Y dichosa la que creyó...»
  { book: 'LUK', chapter: 1, verses: [46, 47], season: 'adviento' }, // «Glorifica mi alma al Señor...»
  { book: 'LUK', chapter: 21, verses: [28, 28], season: 'adviento' }, // «Levantad la cabeza, porque vuestra redención se acerca.»
  { book: 'ROM', chapter: 13, verses: [11, 12], season: 'adviento' }, // «Ya es hora de levantaros del sueño...»
  { book: 'PHP', chapter: 4, verses: [4, 5], season: 'adviento' }, // «Alegraos en el Señor siempre... El Señor está cerca.»
  { book: 'JAS', chapter: 5, verses: [7, 8], season: 'adviento' }, // «Tened, pues, paciencia, hermanos, hasta la Parusía del Señor.»
  { book: '2PE', chapter: 3, verses: [8, 9], season: 'adviento' }, // «No es moroso el Señor en la promesa...»
  { book: 'REV', chapter: 22, verses: [20, 20], season: 'adviento' }, // «¡Así sea: ven, Señor Jesús!»

  // ===========================================================================
  // NAVIDAD — encarnación, luz, nacimiento
  // ===========================================================================
  { book: 'ISA', chapter: 9, verses: [6, 6], season: 'navidad' }, // «Porque un Niño nos ha nacido, un Hijo nos ha sido dado...»
  { book: 'ISA', chapter: 60, verses: [1, 1], season: 'navidad' }, // «Álzate y resplandece, porque viene tu lumbrera...»
  { book: 'MIC', chapter: 5, verses: [2, 2], season: 'navidad' }, // «Pero tú, Belén de Efrata... de ti me saldrá el que ha de ser dominador.»
  { book: 'WIS', chapter: 18, verses: [14, 14], season: 'navidad' }, // «Cuando un tranquilo silencio ocupaba todas las cosas...»
  { book: 'PSA', chapter: 95, verses: [11, 11], season: 'navidad' }, // «Alégrense los cielos, y regocíjese la tierra...»
  { book: 'MAT', chapter: 1, verses: [21, 21], season: 'navidad' }, // «Le pondrás por nombre Jesús, porque Él salvará a su pueblo...»
  { book: 'MAT', chapter: 2, verses: [10, 11], season: 'navidad' }, // «Al ver de nuevo la estrella experimentaron un gozo muy grande.»
  { book: 'LUK', chapter: 1, verses: [78, 79], season: 'navidad' }, // «...nos visitará desde lo alto el Oriente.»
  { book: 'LUK', chapter: 2, verses: [7, 7], season: 'navidad' }, // «Y dio a luz a su hijo primogénito; y lo envolvió en pañales...»
  { book: 'LUK', chapter: 2, verses: [10, 11], season: 'navidad' }, // «Os anuncio una gran alegría... Hoy os ha nacido un Salvador.»
  { book: 'LUK', chapter: 2, verses: [14, 14], season: 'navidad' }, // «Gloria a Dios en las alturas, y en la tierra paz...»
  { book: 'LUK', chapter: 2, verses: [19, 19], season: 'navidad' }, // «Pero María retenía todas estas palabras ponderándolas en su corazón.»
  { book: 'LUK', chapter: 2, verses: [30, 32], season: 'navidad' }, // «Porque han visto mis ojos tu salvación...»
  { book: 'JHN', chapter: 1, verses: [1, 1], season: 'navidad' }, // «En el principio el Verbo era...»
  { book: 'JHN', chapter: 1, verses: [5, 5], season: 'navidad' }, // «Y la luz luce en las tinieblas...»
  { book: 'JHN', chapter: 1, verses: [14, 14], season: 'navidad' }, // «Y el Verbo se hizo carne, y puso su morada entre nosotros...»
  { book: '2CO', chapter: 8, verses: [9, 9], season: 'navidad' }, // «...que por vosotros se hizo pobre, siendo rico.»
  { book: 'GAL', chapter: 4, verses: [4, 5], season: 'navidad' }, // «Mas cuando vino la plenitud del tiempo, envió Dios a su Hijo...»
  { book: 'PHP', chapter: 2, verses: [6, 7], season: 'navidad' }, // «...se despojó a sí mismo, tomando la forma de siervo.»
  { book: 'TIT', chapter: 3, verses: [4, 5], season: 'navidad' }, // «Mas cuando se manifestó la bondad de Dios nuestro Salvador...»
  { book: 'HEB', chapter: 1, verses: [1, 2], season: 'navidad' }, // «...en los últimos días nos ha hablado a nosotros en su Hijo.»
  { book: '1JN', chapter: 4, verses: [9, 9], season: 'navidad' }, // «Dios envió al mundo su Hijo Unigénito, para que nosotros vivamos por Él.»

  // ===========================================================================
  // CUARESMA — conversión, ayuno, misericordia, desierto
  // ===========================================================================
  { book: 'JOL', chapter: 2, verses: [12, 13], season: 'cuaresma' }, // «Convertíos a Mí de todo vuestro corazón... Rasgad vuestros corazones.»
  { book: 'ISA', chapter: 1, verses: [18, 18], season: 'cuaresma' }, // «Aunque vuestros pecados fuesen como la grana, quedarán blancos...»
  { book: 'ISA', chapter: 55, verses: [6, 7], season: 'cuaresma' }, // «Buscad a Yahvé mientras puede ser hallado...»
  { book: 'ISA', chapter: 58, verses: [6, 7], season: 'cuaresma' }, // «El ayuno que Yo amo consiste en esto: soltar las ataduras injustas...»
  { book: 'EZK', chapter: 18, verses: [32, 32], season: 'cuaresma' }, // «Yo no quiero la muerte del que muere... ¡Convertíos y viviréis!»
  { book: 'EZK', chapter: 36, verses: [26, 26], season: 'cuaresma' }, // «Os daré un corazón nuevo, y pondré en vosotros un espíritu nuevo...»
  { book: 'WIS', chapter: 11, verses: [24, 24], season: 'cuaresma' }, // «Pero Tú tienes misericordia de todos, por lo mismo que todo lo puedes...»
  { book: 'SIR', chapter: 5, verses: [8, 8], season: 'cuaresma' }, // «No tardes en convertirte al Señor...»
  { book: 'PSA', chapter: 31, verses: [5, 5], season: 'cuaresma' }, // «Entonces te manifesté mi delito, y no te oculté mi culpa...»
  { book: 'PSA', chapter: 50, verses: [12, 12], season: 'cuaresma' }, // «Crea en mí, oh Dios, un corazón sencillo...»
  { book: 'PSA', chapter: 50, verses: [19, 19], season: 'cuaresma' }, // «Mi sacrificio, oh Dios, es el espíritu compungido...»
  { book: 'PSA', chapter: 129, verses: [3, 4], season: 'cuaresma' }, // «Si Tú recordaras las iniquidades... Mas en Ti está el perdón.»
  { book: 'MAT', chapter: 4, verses: [1, 2], season: 'cuaresma' }, // «Jesús fue conducido al desierto por el Espíritu... Ayunó cuarenta días.»
  { book: 'MAT', chapter: 4, verses: [4, 4], season: 'cuaresma' }, // «No de pan solo vivirá el hombre...»
  { book: 'MAT', chapter: 6, verses: [6, 6], season: 'cuaresma' }, // «Cuando quieras orar entra en tu aposento...»
  { book: 'MAT', chapter: 6, verses: [14, 14], season: 'cuaresma' }, // «Si vosotros perdonáis a los hombres sus ofensas...»
  { book: 'MAT', chapter: 6, verses: [17, 18], season: 'cuaresma' }, // «Mas tú, cuando ayunes, perfuma tu cabeza y lava tu rostro...»
  { book: 'MAT', chapter: 6, verses: [21, 21], season: 'cuaresma' }, // «Allí donde está tu tesoro, allí también estará tu corazón.»
  { book: 'MRK', chapter: 1, verses: [15, 15], season: 'cuaresma' }, // «Arrepentíos y creed en el Evangelio.»
  { book: 'LUK', chapter: 5, verses: [32, 32], season: 'cuaresma' }, // «Yo no he venido para convidar al arrepentimiento a los justos...»
  { book: 'LUK', chapter: 9, verses: [23, 23], season: 'cuaresma' }, // «Renúnciese a sí mismo, tome su cruz cada día, y sígame.»
  { book: 'LUK', chapter: 15, verses: [7, 7], season: 'cuaresma' }, // «Habrá gozo en el cielo, más por un solo pecador que se arrepiente...»
  { book: 'LUK', chapter: 15, verses: [20, 20], season: 'cuaresma' }, // «...su padre lo vio, y se le enternecieron las entrañas.»
  { book: 'LUK', chapter: 18, verses: [13, 13], season: 'cuaresma' }, // «Oh Dios, compadécete de mí, el pecador.»
  { book: 'ROM', chapter: 5, verses: [8, 8], season: 'cuaresma' }, // «Siendo aún pecadores, Cristo murió por nosotros.»
  { book: '2CO', chapter: 5, verses: [20, 20], season: 'cuaresma' }, // «De parte de Cristo os suplicamos: Reconciliaos con Dios.»
  { book: '2CO', chapter: 6, verses: [2, 2], season: 'cuaresma' }, // «He aquí ahora tiempo aceptable. He aquí ahora día de salud.»
  { book: '1JN', chapter: 1, verses: [9, 9], season: 'cuaresma' }, // «Si confesamos nuestros pecados, Él es fiel y justo para perdonarnos...»

  // ===========================================================================
  // SEMANA SANTA — pasión, cruz, entrega
  // ===========================================================================
  { book: 'ISA', chapter: 50, verses: [6, 6], season: 'semana-santa' }, // «Entregué mi espalda a los que me herían...»
  { book: 'ISA', chapter: 53, verses: [4, 5], season: 'semana-santa' }, // «Él ha tomado sobre sí nuestras dolencias... a través de sus llagas hemos sido curados.»
  { book: 'MAT', chapter: 26, verses: [39, 39], season: 'semana-santa' }, // «Mas no como Yo quiero, sino como Tú.»
  { book: 'LUK', chapter: 23, verses: [34, 34], season: 'semana-santa' }, // «Padre, perdónalos, porque no saben lo que hacen.»
  { book: 'LUK', chapter: 23, verses: [43, 43], season: 'semana-santa' }, // «Hoy estarás conmigo en el Paraíso.»
  { book: 'LUK', chapter: 23, verses: [46, 46], season: 'semana-santa' }, // «Padre, en tus manos entrego mi espíritu.»
  { book: 'JHN', chapter: 13, verses: [1, 1], season: 'semana-santa' }, // «Como amaba a los suyos... los amó hasta el fin.»
  { book: 'JHN', chapter: 13, verses: [34, 34], season: 'semana-santa' }, // «Os doy un mandamiento nuevo: que os améis unos a otros.»
  { book: 'JHN', chapter: 15, verses: [13, 13], season: 'semana-santa' }, // «Nadie puede tener amor más grande que dar la vida por sus amigos.»
  { book: 'JHN', chapter: 19, verses: [30, 30], season: 'semana-santa' }, // «Está cumplido.»
  { book: '1CO', chapter: 11, verses: [24, 24], season: 'semana-santa' }, // «Este es mi cuerpo, el (entregado) por vosotros...»
  { book: 'PHP', chapter: 2, verses: [8, 8], season: 'semana-santa' }, // «Se humilló a sí mismo, haciéndose obediente hasta la muerte, y muerte de Cruz.»

  // ===========================================================================
  // PASCUA — resurrección, vida nueva, Espíritu, misión
  // ===========================================================================
  { book: 'PSA', chapter: 117, verses: [24, 24], season: 'pascua' }, // «Este es el día que hizo Yahvé; alegrémonos por él...»
  { book: 'EZK', chapter: 37, verses: [14, 14], season: 'pascua' }, // «E infundiré en vosotros mi espíritu y viviréis...»
  { book: 'JOL', chapter: 2, verses: [28, 28], season: 'pascua' }, // «Derramaré mi Espíritu sobre toda carne...»
  { book: 'MAT', chapter: 28, verses: [6, 6], season: 'pascua' }, // «No está aquí; porque resucitó, como lo había dicho.»
  { book: 'MAT', chapter: 28, verses: [19, 20], season: 'pascua' }, // «Id, pues, y haced discípulos a todos los pueblos...»
  { book: 'LUK', chapter: 24, verses: [5, 6], season: 'pascua' }, // «¿Por qué buscáis entre los muertos al que vive?»
  { book: 'LUK', chapter: 24, verses: [32, 32], season: 'pascua' }, // «¿No es verdad que nuestro corazón estaba ardiendo dentro de nosotros...?»
  { book: 'JHN', chapter: 11, verses: [25, 26], season: 'pascua' }, // «Yo soy la resurrección y la vida...»
  { book: 'JHN', chapter: 14, verses: [27, 27], season: 'pascua' }, // «Os dejo la paz, os doy la paz mía...»
  { book: 'JHN', chapter: 16, verses: [22, 22], season: 'pascua' }, // «...vuestro corazón se alegrará y nadie os podrá quitar vuestro gozo.»
  { book: 'JHN', chapter: 20, verses: [19, 19], season: 'pascua' }, // «Vino Jesús y, de pie en medio de ellos, les dijo: ¡Paz a vosotros!»
  { book: 'JHN', chapter: 20, verses: [29, 29], season: 'pascua' }, // «Dichosos los que han creído sin haber visto.»
  { book: 'ACT', chapter: 1, verses: [8, 8], season: 'pascua' }, // «...y seréis mis testigos... hasta los extremos de la tierra.»
  { book: 'ACT', chapter: 2, verses: [4, 4], season: 'pascua' }, // «Todos fueron entonces llenos del Espíritu Santo...»
  { book: 'ACT', chapter: 2, verses: [32, 32], season: 'pascua' }, // «A este Jesús Dios le ha resucitado, de lo cual todos nosotros somos testigos.»
  { book: 'ACT', chapter: 4, verses: [12, 12], season: 'pascua' }, // «Debajo del cielo no hay otro nombre dado a los hombres...»
  { book: 'ROM', chapter: 6, verses: [4, 4], season: 'pascua' }, // «...así también nosotros caminemos en nueva vida.»
  { book: 'ROM', chapter: 6, verses: [9, 9], season: 'pascua' }, // «Cristo, resucitado de entre los muertos, ya no muere...»
  { book: 'ROM', chapter: 8, verses: [11, 11], season: 'pascua' }, // «Si el Espíritu del que resucitó a Jesús habita en vosotros...»
  { book: 'ROM', chapter: 8, verses: [15, 15], season: 'pascua' }, // «...recibisteis el espíritu de filiación, en virtud del cual clamamos: ¡Abba!»
  { book: '1CO', chapter: 15, verses: [20, 20], season: 'pascua' }, // «Mas ahora Cristo ha resucitado de entre los muertos, primicia...»
  { book: '1CO', chapter: 15, verses: [55, 55], season: 'pascua' }, // «¿Dónde quedó, oh muerte, tu victoria?»
  { book: '2CO', chapter: 5, verses: [17, 17], season: 'pascua' }, // «Si alguno vive en Cristo, es una creatura nueva.»
  { book: 'GAL', chapter: 5, verses: [22, 23], season: 'pascua' }, // «El fruto del Espíritu es amor, gozo, paz, longanimidad...»
  { book: 'COL', chapter: 3, verses: [1, 2], season: 'pascua' }, // «Si fuisteis resucitados con Cristo, buscad las cosas que son de arriba...»
  { book: '1PE', chapter: 1, verses: [3, 3], season: 'pascua' }, // «...nos ha engendrado de nuevo para una esperanza viva.»
  { book: 'REV', chapter: 1, verses: [18, 18], season: 'pascua' }, // «Estuve muerto, y ahora vivo por los siglos de los siglos...»
  { book: 'REV', chapter: 21, verses: [5, 5], season: 'pascua' }, // «He aquí, Yo hago todo nuevo.»
];
