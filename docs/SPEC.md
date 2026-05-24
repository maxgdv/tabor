# Tabor — Especificación Técnica v1.1

> *La Biblia, lugar a lugar*
>
> Documento de requisitos y especificación técnica del proyecto Tabor.
> Versión 1.1 — 10 de mayo de 2026.

Este documento describe el alcance funcional y técnico del proyecto, su
arquitectura, modelos de datos, criterios editoriales y roadmap. Es un
artefacto vivo: las decisiones que aquí se recogen pueden evolucionar y
toda contribución relevante debería discutirse antes vía
[issue en GitHub](https://github.com/maxgdv/tabor/issues).

Para la introducción al producto y cómo arrancarlo en local, ver el
[README](../README.md). Para colaborar, ver [CONTRIBUTING](../CONTRIBUTING.md).

---


TABOR
La Biblia, lugar a lugar
Documento de Requisitos y Especificación Técnica
Versión 1.1 — Nombre de la app: Tabor 10 de mayo de 2026
Promotor del proyecto Manuel G.

Control de versiones del documento
Este documento es un artefacto vivo: irá madurando junto con el producto. Cualquier cambio significativo debe registrarse en la tabla siguiente, manteniendo trazabilidad de decisiones de producto y técnicas.

Versión Fecha

1.1

2026-05-12

1.0

2026-05-10

0.2

Pendiente

0.3

Pendiente

Autor Manuel G. / Claude (asistente de redacción)
Manuel G. / Claude (asistente de redacción)
— —

Cambios
Se adopta el nombre comercial Tabor para el producto. Sin cambios funcionales ni técnicos respecto a v1.0.
Versión inicial. Define alcance del MVP web, requisitos funcionales y no funcionales, arquitectura propuesta, modelo de datos, API, roadmap y fases de Android e iOS.
Revisión por asesor teológico y revisión legal de licencias bíblicas.
Validación con grupo focal (5–8 usuarios potenciales) y refinamiento de wireframes.

Documentos relacionados
• Plan de marketing y comunicación (pendiente). • Documento de identidad visual y branding (pendiente). • Acuerdos de licencia con titulares de derechos de cada versión bíblica (pendiente). • Política de privacidad y términos de uso (pendiente). • Manual de QA y plan de pruebas (pendiente).

Tabla de contenidos
La tabla siguiente se genera automáticamente. En Microsoft Word, haga clic con el botón derecho sobre ella y seleccione «Actualizar campos» para refrescar los números de página tras cualquier modificación.

1. Resumen ejecutivo
1.1 La idea en una frase
Tabor Una aplicación web que permite leer la Biblia mientras un mapa interactivo sitúa, en tiempo real, los lugares donde sucede cada pasaje, enriqueciendo la experiencia de lectura con contexto histórico, cultural y geográfico.

1.2 Propuesta de valor
Leer la Biblia es leer la historia de un territorio: el creciente fértil, el desierto del Sinaí, las orillas del Jordán, las costas del Mediterráneo, las calzadas del Imperio Romano. Sin embargo, la inmensa mayoría de los lectores actuales desconoce dónde ocurre lo que está leyendo. Tabor resuelve esa fricción uniendo, por primera vez en una experiencia de uso cotidiano, el texto sagrado con un mapa contextual que se mueve a la par del lector.
La aplicación no pretende sustituir la oración, el estudio académico ni la liturgia: pretende ser un compañero visual que permita comprender la Palabra desde su escenario real. Está pensada para el público general y familias creyentes, con un tono accesible, una estética serena y la fiabilidad de fuentes católicas oficiales.
1.3 Diferenciadores frente a la competencia
Existen apps bíblicas excelentes y populares (YouVersion, Logos, Olive Tree, Bible Gateway) y mapas bíblicos académicos (Bible Atlas, OpenBible.info, Logos Bible Atlas). Lo que ninguna ofrece todavía como experiencia central es la fusión natural y bidireccional entre texto y mapa. Tabor se construye sobre tres pilares diferenciadores:
• Sincronización pasaje-mapa: al desplazar la lectura, el mapa se reorganiza automáticamente; al hacer clic en un lugar del mapa, el texto salta al pasaje correspondiente.
• Capa histórica viva: el usuario puede elegir el momento histórico que quiere ver representado en el mapa (Reinos de Israel, Exilio, Jesús, Iglesia primitiva), con fronteras, ciudades y rutas comerciales coherentes con esa época.
• Confianza editorial católica: contenidos basados en versiones aprobadas por la Conferencia Episcopal y el Vaticano, con notas exegéticas opcionales y sin contenido controvertido o devocional ajeno a la fe católica.

1.4 Alcance del MVP web (versión 1.0)
El primer release público se centra exclusivamente en la web. Los objetivos del MVP son demostrar la viabilidad técnica del enlace texto-mapa, validar el interés del público y construir la base de datos geobíblica que se reutilizará en las apps móviles posteriores.
• Lectura completa del Antiguo y Nuevo Testamento (incluye deuterocanónicos). • Dos versiones en español y dos en inglés (selección detallada en el capítulo 15). • Mapa mundial 2D con capa cartográfica histórica básica (un único periodo: «Tiempos de Jesús»). • Sincronización pasaje-mapa para libros narrativos (Génesis, Éxodo, Josué, Reyes, Evangelios,
Hechos). • Búsqueda por libro/capítulo/versículo, por lugar y por personaje. • Marcadores y notas personales; cuenta de usuario opcional con sincronización en la nube. • Modo lectura nocturna, ajuste tipográfico y soporte completo de accesibilidad WCAG 2.2 AA. • Donaciones en línea (Stripe) sin publicidad.

1.5 Roadmap de alto nivel

Fase

Plazo orientativo

Fase 0

Mes 0 – Mes 1

Fase 1

Mes 2 – Mes 5

Fase 2

Mes 6 – Mes 8

Fase 3 Fase 4

Mes 9 – Mes 11 Mes 12 – Mes 14

Plataforma — Web (PWA)
Web Android (Kotlin + Compose o Flutter) iOS (Swift + SwiftUI o Flutter)

Hito principal Validación, licencias, equipo, branding. MVP público con lectura sincronizada al mapa. Capas históricas múltiples, plan de lectura, narraciones de audio, comunidad. Paridad funcional con la web; offline. Paridad con Android; lanzamiento global multilingüe.

1.6 Indicadores clave de éxito (resumen)
• 10 000 usuarios únicos mensuales en los primeros 6 meses tras lanzar el MVP. • Tiempo medio de sesión > 8 minutos en escritorio y > 5 minutos en móvil. • Tasa de retención a 30 días > 30 % entre usuarios registrados. • Net Promoter Score (NPS) > 40 a los 3 meses del lanzamiento. • Cobertura geo-bíblica: 95 % de los versículos narrativos enlazados a un lugar identificado.

2. Visión, misión y principios rectores
2.1 Visión
Visión Que cualquier persona, en cualquier lugar del mundo, pueda leer la Biblia comprendiéndola en su escenario real, descubriendo que la Palabra ocurrió en lugares concretos, con personas concretas, en un tiempo histórico concreto.

2.2 Misión
Crear y mantener una aplicación gratuita, sin publicidad y de código respetuoso con los derechos de los lectores, que enriquezca la lectura cristiana del texto sagrado mediante un mapa interactivo, contenidos históricos verificados y una experiencia de uso serena, accesible y confiable.
2.3 Principios rectores
Estos principios deben aplicarse como criterio de desempate en cualquier decisión de producto, diseño o ingeniería:
Rigor doctrinal y editorial Toda traducción ofrecida debe contar con licencia válida y, en el caso de versiones católicas, contar con la aprobación correspondiente de la Conferencia Episcopal y/o la Santa Sede. Toda nota o material complementario debe estar respaldado por fuentes verificables.
Serenidad estética La interfaz debe transmitir sosiego: tipografías legibles, paleta sobria, jerarquía clara, animaciones discretas. No imitará patrones de diseño propios de redes sociales, gamificación agresiva o dark patterns.
Privacidad por diseño Los datos personales y de uso son del usuario. La cuenta es opcional. La telemetría es anónima, agregada y desactivable. No se venden datos a terceros bajo ninguna circunstancia.
Accesibilidad como requisito, no como mejora La aplicación debe cumplir WCAG 2.2 nivel AA desde el primer día: lectores de pantalla, contraste, navegación con teclado, sin dependencia exclusiva del color, soporte para preferencias del sistema.
Sostenibilidad económica El modelo es donativo, sin publicidad. La arquitectura técnica debe ser eficiente para mantener costes operativos bajos y permitir que el proyecto sea sostenible con un volumen razonable de donaciones.

2.4 Objetivos estratégicos a 18 meses
1. Publicar y mantener una aplicación web pública y gratuita con experiencia diferencial de lectura sincronizada con mapa.
2. Construir y mantener un dataset geo-bíblico abierto y reutilizable que cubra el 95 % de los versículos narrativos.
3. Disponer de aplicaciones móviles nativas en Android e iOS con paridad funcional respecto a la web.
4. Alcanzar una comunidad de usuarios activos lo suficientemente grande como para sostener económicamente el proyecto mediante donaciones recurrentes.
5. Establecer alianzas con al menos tres instituciones eclesiales (parroquias, diócesis, universidades católicas) para uso pastoral o educativo.

3. Audiencia objetivo y personas (user personas)
3.1 Audiencia objetivo
La audiencia principal es el público general católico y cristiano de habla hispana e inglesa que desea leer la Biblia con más contexto, sin ser necesariamente experto. Como audiencia secundaria se contempla a familias con niños mayores de 9 años, catequistas, peregrinos a Tierra Santa y simples curiosos por la historia bíblica.
Quedan explícitamente fuera del foco inicial los teólogos profesionales, exégetas, hebraístas/helenistas y estudiosos avanzados, que disponen ya de herramientas especializadas (Logos, Accordance, Bible Works). No se descarta atenderlos en versiones futuras como audiencia premium.
3.2 Personas representativas
Las siguientes cuatro personas se utilizarán como referencia constante durante el diseño y la priorización de funcionalidades. Cualquier propuesta de feature deberá poder asociarse a una o varias de ellas.
3.2.1 María — la madre creyente (38 años) Contexto Madre de dos hijos en edad escolar, trabaja a media jornada, asiste a misa los domingos. Quiere reanudar la lectura de la Biblia que abandonó hace años porque los textos le resultaban densos y difíciles de ubicar.
Necesidades clave • Versiones contemporáneas, comprensibles, en español. • Contexto visual que la ayude a entender qué está pasando y dónde. • Sesiones cortas (10–15 minutos) compatibles con la vida familiar. • Sin distracciones ni publicidad.
Expectativas de éxito María vuelve a la app tres o cuatro veces por semana, lee con regularidad un evangelio y siente que «por primera vez» entiende dónde y cuándo ocurrieron las cosas que le contaron de niña.
3.2.2 Pedro — el catequista (52 años) Contexto Voluntario en una parroquia, prepara catequesis de confirmación. Necesita material visual atractivo para mostrar a los adolescentes.
Necesidades clave • Capacidad de proyectar el mapa en pantalla durante una sesión. • Líneas de tiempo claras y fronteras políticas según la época.

• Posibilidad de exportar pasajes o capturas para el material impreso. • Notas exegéticas oficiales y verificadas.
Expectativas de éxito Pedro usa Tabor como herramienta semanal de preparación y proyección durante la catequesis. Recomienda la app a otros catequistas.
3.2.3 Lucía — la joven curiosa (22 años) Contexto Estudiante universitaria de Historia. No es practicante pero tiene curiosidad académica y cultural por el cristianismo. Usa el móvil como dispositivo principal.
Necesidades clave • Experiencia móvil impecable y rápida. • Información histórica neutra y bien documentada. • Posibilidad de explorar libremente el mapa, no solo siguiendo el texto. • Modo oscuro y diseño moderno.
Expectativas de éxito Lucía explora la app por curiosidad, comparte lugares y datos en redes sociales y se queda como usuaria recurrente del modo «explorar mapa».
3.2.4 Roberto — el peregrino (65 años) Contexto Jubilado, prepara una peregrinación a Tierra Santa con su parroquia. Quiere leer en orden los pasajes asociados a los lugares que visitará.
Necesidades clave • Listas de lugares que se visitarán y sus pasajes asociados. • Funcionamiento offline durante el viaje. • Tipografía grande, accesibilidad alta. • Capacidad de imprimir un dosier personalizado.
Expectativas de éxito Roberto prepara la peregrinación con la app, la utiliza durante el viaje sin conexión y recomienda la herramienta al grupo parroquial al volver.

4. Análisis de mercado y competencia

4.1 Panorama general
El mercado de aplicaciones bíblicas digitales está consolidado y dominado por un puñado de actores. La oportunidad para Tabor no se encuentra en competir en la lectura plana —donde YouVersion ha alcanzado más de 700 millones de descargas globales— sino en un segmento adyacente que actualmente está mal cubierto: la comprensión geográfica e histórica del texto en una experiencia de uso cotidiano.

4.2 Competidores principales

Producto YouVersion (Bible.com) Bible Gateway Logos Bible Software Olive Tree OpenBible.info Bible Atlas (web) eCatólico / Hozana Magnificat / iMisal

Fortaleza principal Universal, multiversión, social, planes de lectura. Catálogo enorme de versiones; comparador. Atlas, lenguas originales, biblioteca académica. Lectura cuidada, notas, biblioteca.
Atlas geográfico abierto y consultas SQL.
Mapa con marcadores por libro. Devocionales, oraciones, calendario litúrgico. Liturgia, lecturas del día, oraciones.

Carencia respecto a Tabor Mapa marginal, sin sincronización pasajemapa.

Modelo Gratis con donaciones.

Sin mapa; UX antigua.

Freemium (Plus).

Producto profesional caro, complejo, no orientado a familias.

Pago / suscripción cara.

Mapa secundario; sin foco geográfico.

Freemium.

Web académica, sin lectura integrada ni UX para público general.

Gratis (open data).

Sin integración con lectura, sin app cuidada, sin móvil.

Gratis con anuncios.

Mapa inexistente; foco devocional, no de lectura.

No es una Biblia completa ni tiene mapa.

4.3 Oportunidad detectada
Tras el análisis anterior, se confirma que Tabor ocupa un nicho poco saturado: la fusión entre lectura y mapa, hecha con calidad de producto contemporánea y con confianza editorial católica. La estrategia recomendada es no intentar competir en el catálogo de versiones (donde los líderes tienen ventajas insuperables) sino construir una experiencia diferencial alrededor del mapa, las capas históricas y la calidad editorial.

4.4 Riesgos competitivos
• YouVersion u otro líder podrían replicar la funcionalidad de mapa: la ventaja debe ser la profundidad del dataset geo-bíblico y la experiencia, no la idea aislada.
• Saturación de apps confesionales en tiendas: requiere una estrategia de marketing diferenciada (parroquias, redes católicas, prensa religiosa).
• Sensibilidad doctrinal: cualquier error histórico, cartográfico o doctrinal puede convertirse en motivo de rechazo público.

5. Alcance del producto
5.1 Dentro del alcance del MVP web
• Lectura completa de los 73 libros del canon católico (incluye deuterocanónicos). • Cuatro versiones bíblicas (dos en español, dos en inglés). • Mapa interactivo 2D mundial con un periodo histórico predeterminado: tiempos de Jesús (siglo
I). • Geo-referenciación de pasajes con cobertura mínima del 95 % de los textos narrativos. • Capa de eventos sobre el mapa con personajes, ciudades, rutas y reinos. • Búsqueda por libro/capítulo/versículo, por lugar y por personaje. • Marcadores, notas y resaltados personales. • Cuenta opcional con sincronización en la nube y export/import de datos. • Modo claro y modo oscuro; preferencias tipográficas; multiidioma de interfaz (ES y EN). • Compartir pasaje (texto + imagen del mapa) en redes sociales y por enlace. • Donaciones online y página de transparencia financiera. • Cumplimiento WCAG 2.2 AA y RGPD.
5.2 Fuera del alcance del MVP
• Apps nativas Android/iOS (Fase 3 y 4). • Lectura comparada de varias versiones en paralelo (planificada para Fase 2). • Audio profesional narrado de la Biblia (Fase 2). • Comunidad social, foros, comentarios entre usuarios (decisión pendiente — riesgo doctrinal). • Lenguas originales (hebreo, arameo, griego) y herramientas de exégesis (Fase futura premium). • Reconstrucciones 3D, realidad aumentada o tours virtuales (idea de futuro). • Calendario litúrgico, lecturas del día, oraciones (no es el foco). • Generación de contenido por IA (cualquier funcionalidad de IA debe pasar antes por un comité
editorial).
5.3 Supuestos
• Se obtendrán las licencias necesarias para usar las versiones bíblicas seleccionadas. • El equipo cuenta con un asesor teológico o eclesial validado. • Se dispone de un dataset geo-bíblico inicial (propio o adaptado de fuentes abiertas como
OpenBible.info, sujeto a su licencia CC BY 4.0). • Existe presupuesto para tres meses de desarrollo intensivo y al menos seis meses de operación.

5.4 Restricciones
• Restricción confesional: el contenido editorial será católico; eso condiciona qué versiones se incluyen y qué notas se ofrecen.
• Restricción legal: las versiones más actuales requieren licencia comercial — afecta plazos y costes.
• Restricción técnica: el mapa debe funcionar fluidamente en navegadores estándar y conexiones modestas (3G/4G).
• Restricción de marca: no se utilizarán imágenes o nombres de instituciones eclesiales sin permiso explícito.

6. Casos de uso principales
Se describen a continuación los casos de uso considerados críticos para validar el MVP. Cada uno incluye actor, precondiciones, flujo principal, flujos alternativos y postcondiciones. Los casos de uso secundarios se desarrollan en el anexo D del documento.
CU-01: Lectura sincronizada con mapa
Actor Usuario invitado o registrado.
Precondiciones • La aplicación está cargada en un navegador compatible. • Existe conexión a Internet (o el usuario ha descargado el contenido para uso offline en versiones futuras).
Flujo principal 6. El usuario abre Tabor. Por defecto se muestra el último pasaje leído o, si es la primera vez, Génesis 1. 7. La pantalla muestra dos áreas principales: panel de lectura a la izquierda y mapa a la derecha (o apilados verticalmente en móvil). 8. Mientras el usuario desplaza el texto, el sistema detecta los versículos visibles y resalta en el mapa los lugares mencionados, animando suavemente el centrado. 9. Si un versículo introduce un viaje (por ejemplo, «y salió de Ur de los caldeos hacia Canaán»), el mapa dibuja el trazo del recorrido. 10. Al hacer clic sobre un lugar del mapa, se abre una ficha lateral con información del lugar y enlaces a los pasajes que lo mencionan.
Flujos alternativos • FA-1: el usuario desactiva la sincronización automática y mueve el mapa libremente sin que el texto cambie. • FA-2: el usuario está leyendo un libro sapiencial sin geografía relevante (por ejemplo Eclesiastés). El mapa se atenúa y se muestra un mensaje informativo: «Este libro no contiene referencias geográficas relevantes».
Postcondiciones • La posición de lectura se guarda automáticamente. • Si hay sesión iniciada, la posición se sincroniza con la nube.

CU-02: Búsqueda por lugar
Actor Usuario invitado o registrado.
Flujo principal 11. El usuario escribe «Cesarea» en el campo de búsqueda. 12. El sistema sugiere coincidencias: «Cesarea Marítima», «Cesarea de Filipo». 13. El usuario selecciona «Cesarea Marítima». 14. Se centra el mapa en la ubicación, se muestra la ficha y se lista el conjunto de pasajes asociados (Hechos 10, Hechos 23, etc.). 15. Al seleccionar un pasaje, la lectura se actualiza y la sincronización mapa-texto vuelve a activarse.
CU-03: Crear marcador y nota personal
Actor Usuario registrado.
Flujo principal 16. Durante la lectura, el usuario selecciona uno o varios versículos. 17. Aparece un menú contextual: marcar, resaltar (con color), anotar, copiar, compartir. 18. Si elige anotar, se abre un panel de texto con autoguardado. 19. La nota se guarda en su perfil y se sincroniza con la nube.
Postcondiciones • Las notas son privadas por defecto y permanecen accesibles desde el menú «Mis notas».
CU-04: Cambiar la versión bíblica
Actor Usuario invitado o registrado.
Flujo principal 20. El usuario abre el selector de versiones desde la barra superior. 21. El sistema muestra las cuatro versiones disponibles agrupadas por idioma. 22. Al seleccionar una versión, se mantiene la posición de lectura y se recarga el texto en la nueva versión.

CU-05: Explorar el mapa libremente
Actor Usuario invitado o registrado.
Flujo principal 23. El usuario hace clic en el botón «Explorar mapa». 24. El mapa pasa a ocupar toda la pantalla, ocultando el panel de lectura. 25. El usuario puede activar y desactivar capas: ciudades, reinos, rutas comerciales, episodios bíblicos, viajes apostólicos. 26. El usuario puede mover el control deslizante de tiempo histórico para ver cómo cambian fronteras y ciudades.
CU-06: Donar al proyecto
Actor Cualquier visitante.
Flujo principal 27. El usuario accede a la página «Apoya el proyecto» desde el menú o desde un banner discreto. 28. Selecciona un importe (5, 10, 25, 50 € u otro) y la modalidad: única o mensual recurrente. 29. Es redirigido a Stripe Checkout para introducir los datos de pago. 30. Tras la confirmación, recibe un correo de agradecimiento y, si lo desea, su recibo fiscal correspondiente.

7. Requisitos funcionales

Cada requisito se identifica con un código jerárquico de la forma RF-<área>-<n>. Las prioridades siguen el método MoSCoW:
• M — Must have: indispensable para el MVP. • S — Should have: muy deseable; se intentará incluir en el MVP si el calendario lo permite. • C — Could have: deseable; primer candidato a Fase 2. • W — Won't have (this time): excluido del alcance actual.

7.1 Lectura de la Biblia

Código RF-LEC-01 RF-LEC-02 RF-LEC-03 RF-LEC-04 RF-LEC-05 RF-LEC-06 RF-LEC-07 RF-LEC-08 RF-LEC-09 RF-LEC-10

Descripción
El sistema permitirá navegar por libro, capítulo y versículo mediante un selector jerárquico.
El sistema mostrará el texto en una columna legible con anchura óptima de 60–75 caracteres.
El sistema permitirá ajustar tamaño de fuente, interlineado y familia tipográfica (serif/sans).
El sistema permitirá alternar entre modo claro y modo oscuro, respetando la preferencia del sistema operativo.
El sistema mostrará el número de versículo de forma discreta y permitirá ocultarlo.
El sistema permitirá ocultar/mostrar títulos de sección y títulos editoriales.
El sistema permitirá la lectura ininterrumpida (un libro entero) o por capítulos.
El sistema mostrará las notas a pie editoriales como notas emergentes (popovers).
El sistema permitirá copiar uno o varios versículos al portapapeles, con la cita normalizada.
El sistema recordará la última posición de lectura por usuario y dispositivo.

Prioridad M M M M S S M S M M

Notas
Solo si la versión licenciada las incluye.

7.2 Mapa interactivo

Código RF-MAP-01

Descripción

Prioridad

El sistema mostrará un mapa mundial 2D con proyección y M

Notas Recomendado:

Código
RF-MAP-02 RF-MAP-03 RF-MAP-04 RF-MAP-05
RF-MAP-06
RF-MAP-07 RF-MAP-08 RF-MAP-09 RF-MAP-10

Descripción
estilo cartográfico configurable.
El sistema permitirá hacer zoom, desplazamiento y rotación táctil/teclado en el mapa. El sistema mostrará marcadores de lugares bíblicos con icono, nombre y enlace a su ficha. El sistema permitirá activar/desactivar capas: ciudades, reinos, rutas, episodios, viajes apostólicos. El sistema dibujará rutas (líneas) entre puntos cuando un pasaje describe un trayecto.
El sistema dispondrá de un control deslizante temporal para cambiar el periodo histórico mostrado.
El sistema permitirá mostrar nombres de lugares en su forma bíblica, moderna o ambas. El sistema dispondrá de un mapa de calor opcional que muestre la densidad de menciones por región. El sistema permitirá imprimir o exportar la vista actual del mapa como imagen PNG. El sistema mostrará el mapa en pantalla completa con un solo clic.

Prioridad
M M M M
S
S C S M

Notas MapLibre GL + tile server propio.
Para MVP: dos periodos (Antiguo Testamento – Reinos divididos / Tiempos de Jesús). Fase 2.

7.3 Sincronización pasaje–mapa

Código RF-SYNC-01 RF-SYNC-02 RF-SYNC-03 RF-SYNC-04 RF-SYNC-05

Descripción

Prioridad

El sistema detectará los versículos visibles en el viewport del panel de lectura.

M

El sistema cruzará dichos versículos con la base geobíblica y resaltará los lugares mencionados.

M

El sistema centrará el mapa con animación suave evitando

saltos bruscos cada vez que cambia el conjunto de

M

lugares.

El usuario podrá congelar el mapa para que no se mueva al desplazar la lectura.

M

Al hacer clic en un lugar del mapa, el panel de lectura saltará al primer pasaje asociado.

M

Notas Debounce 350 ms.

Código RF-SYNC-06 RF-SYNC-07

Descripción

Prioridad

El sistema indicará gráficamente la dirección y el sentido de los desplazamientos descritos en el texto.

S

El sistema permitirá una vista cronológica que muestre los lugares en el orden temporal del relato, no del texto.

C

Notas
Útil para los viajes de Pablo.

7.4 Búsqueda

Código RF-BUS-01 RF-BUS-02 RF-BUS-03 RF-BUS-04 RF-BUS-05

Descripción

Prioridad

El sistema dispondrá de un buscador único capaz de interpretar referencias bíblicas ("Jn 3,16" o "John 3:16"), M nombres de lugares y de personajes.

El sistema sugerirá coincidencias mientras el usuario escribe (autocompletar)

M

El sistema permitirá la búsqueda full-text con resaltado de coincidencias y filtros por libro o testamento.

M

El sistema permitirá buscar términos solo dentro de la versión activa o en todas las versiones simultáneamente.

S

El sistema mantendrá un historial de búsquedas recientes por usuario.

S

Notas

7.5 Marcadores, resaltados y notas personales

Código RF-MAR-01 RF-MAR-02 RF-MAR-03 RF-MAR-04 RF-MAR-05 RF-MAR-06

Descripción

Prioridad

El usuario podrá marcar versículos como favoritos.

M

El usuario podrá resaltar versículos en al menos cinco colores distintos con etiqueta opcional.

M

El usuario podrá adjuntar una nota libre en formato texto enriquecido (Markdown subset).

M

El usuario podrá agrupar marcadores y notas en colecciones ("Para la catequesis", "Mi peregrinación").

S

El usuario podrá exportar todas sus notas en JSON, Markdown y PDF.

M

Los marcadores y notas se sincronizarán automáticamente entre dispositivos del mismo usuario.

M

Notas

7.6 Planes de lectura

Código RF-PLA-01
RF-PLA-02 RF-PLA-03 RF-PLA-04

Descripción
El sistema ofrecerá al menos cuatro planes predefinidos: «Año bíblico», «Evangelios en 30 días», «Salmos en 60 días», «Tierra Santa: lugares y pasajes».
El sistema permitirá al usuario suscribirse a un plan, recibir recordatorios y registrar progreso.
Los planes mostrarán mapas asociados a cada lectura del día.
El sistema permitirá crear planes personalizados.

Prioridad S
S S C

Notas
Reducir a 1–2 planes para MVP si el plazo aprieta.

7.7 Capas y líneas de tiempo históricas

Código RF-HIS-01 RF-HIS-02 RF-HIS-03 RF-HIS-04

Descripción El sistema dispondrá de una línea de tiempo desplazable que cubra desde Abraham (~1800 a. C.) hasta el final del libro de los Hechos (~70 d. C.). Por cada periodo histórico, el sistema mostrará fronteras, capitales, rutas e imperios coexistentes. El sistema enlazará cada periodo con sus principales pasajes y personajes. El sistema admitirá diferentes datasets cartográficos por periodo, agnóstico de la fuente (CC BY o propio).

Prioridad S S S S

Notas

7.8 Enriquecimiento multimedia

Código RF-MUL-01 RF-MUL-02 RF-MUL-03 RF-MUL-04

Descripción
El sistema mostrará fotografías actuales de los lugares cuando estén disponibles bajo licencia compatible.
El sistema podrá reproducir audios narrados de pasajes (Fase 2).
El sistema podrá mostrar reconstrucciones ilustradas de ciudades antiguas (acuerdos editoriales por confirmar).
El sistema podrá enlazar a vídeos de The Bible Project u otras fuentes editoriales aprobadas.

Prioridad Notas S C C C

7.9 Gestión de cuenta y autenticación

Código RF-CUE-01 RF-CUE-02 RF-CUE-03 RF-CUE-04 RF-CUE-05

Descripción
El sistema permitirá usar la app sin cuenta (modo invitado) con almacenamiento local del progreso.
El sistema permitirá crear una cuenta con email + contraseña, Google y Apple.
El sistema enviará confirmación por email y permitirá recuperación segura de contraseña.
El usuario podrá borrar su cuenta y todos sus datos en cualquier momento (RGPD).
El sistema soportará 2FA (autenticación en dos pasos) opcional.

Prioridad Notas M M M M S

7.10 Donaciones

Código RF-DON-01 RF-DON-02 RF-DON-03 RF-DON-04

Descripción El sistema permitirá hacer donaciones únicas y recurrentes vía Stripe.
El sistema emitirá recibos en PDF y, cuando proceda, certificado fiscal anual. El sistema mostrará una página pública de transparencia con uso agregado de los fondos. El sistema enviará un correo de agradecimiento personalizado.

Prioridad Notas M S S M

7.11 Compartir y exportar

Código RF-COM-01 RF-COM-02
RF-COM-03

Descripción
El sistema generará una imagen del pasaje seleccionado con su lugar en el mapa, lista para compartir en redes.
El sistema permitirá compartir un enlace profundo (deep link) a un versículo concreto.
El sistema permitirá exportar un dosier PDF con un conjunto de pasajes y mapas (útil para peregrinos y catequistas).

Prioridad Notas S M
S

7.12 Multilingüismo de la interfaz

Código RF-LOC-01 RF-LOC-02 RF-LOC-03 RF-LOC-04

Descripción
La interfaz estará disponible en español (es-ES, es-419) e inglés (en-US, en-GB). La interfaz detectará automáticamente la preferencia del navegador y permitirá cambiarla manualmente. La arquitectura permitirá añadir idiomas adicionales sin refactor mayor (i18n basado en archivos JSON o ICU MessageFormat). Las fechas, números y unidades se localizarán correctamente.

Prioridad M M M M

Notas

8. Requisitos no funcionales
8.1 Rendimiento
• RNF-PER-01: Tiempo de carga inicial (LCP) ≤ 2,5 s en una conexión 4G de referencia y ≤ 1,8 s en banda ancha. (M)
• RNF-PER-02: First Input Delay ≤ 100 ms. Cumulative Layout Shift ≤ 0,1. (M) • RNF-PER-03: Cambio entre capítulos ≤ 300 ms percibidos por el usuario. (M) • RNF-PER-04: El mapa debe responder a interacciones (zoom, pan) a ≥ 50 fps en hardware medio
(laptop 5 años). (M) • RNF-PER-05: Tamaño total del bundle JS inicial ≤ 250 KB gzip; carga diferida del mapa y del lector
de mapas. (M) • RNF-PER-06: La sincronización pasaje-mapa no debe consumir más de 5 % de CPU en el
navegador estándar. (S)
8.2 Disponibilidad y fiabilidad
• RNF-DIS-01: SLA objetivo del servicio público ≥ 99,5 % mensual. (S) • RNF-DIS-02: Backups automáticos diarios de la base de datos del usuario, con retención de 30
días. (M) • RNF-DIS-03: Procedimiento documentado de restauración (runbook) probado al menos cada
trimestre. (M)
8.3 Escalabilidad
• RNF-ESC-01: Arquitectura compatible con servir 100 000 usuarios activos mensuales sin reescritura mayor. (M)
• RNF-ESC-02: La capa de mapas (tiles) debe poder servirse desde CDN con caché agresiva. (M) • RNF-ESC-03: La base de datos debe poder escalar horizontalmente para lecturas (réplicas). (S)
8.4 Seguridad
• RNF-SEG-01: Conexión HTTPS obligatoria con HSTS preload. (M) • RNF-SEG-02: Cabeceras de seguridad: CSP estricta, X-Content-Type-Options, Referrer-Policy,
Permissions-Policy. (M) • RNF-SEG-03: Almacenamiento de contraseñas con Argon2id o bcrypt (factor ≥ 12). (M) • RNF-SEG-04: Rotación de tokens, expiración corta para access tokens y refresh tokens
revocables. (M) • RNF-SEG-05: Pruebas de seguridad automatizadas en CI (npm audit, Snyk, OWASP ZAP). (M)

• RNF-SEG-06: Auditoría externa antes del lanzamiento público. (S) • RNF-SEG-07: Cumplimiento del Top 10 de OWASP. (M)
8.5 Accesibilidad
• RNF-ACC-01: Cumplimiento de WCAG 2.2 nivel AA. (M) • RNF-ACC-02: Contraste ≥ 4,5:1 para texto normal y ≥ 3:1 para texto grande. (M) • RNF-ACC-03: Toda funcionalidad debe ser accesible mediante teclado. (M) • RNF-ACC-04: El mapa debe ofrecer un fallback textual con la lista de lugares para lectores de
pantalla. (M) • RNF-ACC-05: Se respetará la preferencia de reducción de movimiento (prefers-reduced-motion).
(M)
8.6 SEO y descubribilidad
• RNF-SEO-01: Renderizado SSR/SSG para que los buscadores indexen libros, capítulos y fichas de lugares. (M)
• RNF-SEO-02: URLs limpias y permanentes del tipo /es/biblia/jn/3 o /es/lugares/cesareamaritima. (M)
• RNF-SEO-03: Marcado Open Graph y Twitter Card por pasaje y por lugar. (M) • RNF-SEO-04: Sitemap XML y robots.txt correctos; rastreo amistoso. (M) • RNF-SEO-05: Datos estructurados schema.org (Book, Place, BreadcrumbList). (S)
8.7 Privacidad y cumplimiento
• RNF-PRI-01: Cumplimiento del RGPD (UE) y LOPDGDD (España). (M) • RNF-PRI-02: Aviso de cookies con consentimiento granular y posibilidad de revocar. (M) • RNF-PRI-03: Telemetría anónima y agregada (Plausible o Umami self-hosted) sin cookies por
defecto. (M) • RNF-PRI-04: Derecho de acceso, rectificación, portabilidad y olvido funcional desde el panel del
usuario. (M) • RNF-PRI-05: Política clara para menores: si el usuario declara tener menos de 14 años (o la edad
legal del país), se requiere consentimiento parental. (M)
8.8 Mantenibilidad
• RNF-MAN-01: Cobertura de pruebas automatizadas ≥ 70 % en código de dominio. (M) • RNF-MAN-02: Documentación técnica viva en el repositorio (README, ADRs, diagramas). (M) • RNF-MAN-03: Linters y formatters en CI (ESLint, Prettier, Stylelint). (M)

• RNF-MAN-04: Estrategia clara de versionado semántico para la API pública. (M)
8.9 Compatibilidad
• RNF-COM-01: Soporte de las dos últimas versiones de Chrome, Firefox, Safari y Edge en escritorio. (M)
• RNF-COM-02: Soporte de iOS Safari y Android Chrome últimos 2 años. (M) • RNF-COM-03: Diseño responsive desde 320 px hasta 4K. (M) • RNF-COM-04: Funcionalidad básica disponible sin JavaScript (texto y navegación).
8.10 Sostenibilidad técnica
• RNF-SOS-01: Optimizar tamaño de imágenes (AVIF/WebP responsive). (M) • RNF-SOS-02: Servir mapas vectoriales en lugar de imágenes raster cuando sea posible. (M) • RNF-SOS-03: CDN con datacenters de bajo impacto ambiental cuando sea posible. (S)

9. Arquitectura del sistema

9.1 Visión general
Tabor se estructura como una aplicación web de página única (SPA) sobre un framework con renderizado del lado del servidor (SSR/SSG) para garantizar SEO y rendimiento. El backend expone una API HTTP versionada que sirve los textos bíblicos, los datos geo-bíblicos y los datos de usuario. Los recursos cartográficos se sirven desde un CDN con caché agresiva. Una capa de pipeline de datos prepara y publica el dataset geo-bíblico desde fuentes documentales.

9.1.1 Diagrama lógico de capas

┌─────────────────────────────────────────────────────────────┐

│

NAVEGADOR DEL USUARIO

│

│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ │

│ │ Lector de texto│ │ Mapa interact. │ │ UI / Estado │ │

│ │ (texto cap.) │◄─┤ (MapLibre GL) │◄─┤ (Zustand) │ │

│ └────────┬───────┘ └────────┬───────┘ └────────┬───────┘ │

│

│

│

│

│

│

└────────► Bus de eventos cliente ◄─────┘

│

└────────────────────────────┬────────────────────────────────┘

│ HTTPS · JSON · GraphQL/REST

┌────────────▼─────────────┐

│ API GATEWAY

│

│ (Next.js + tRPC/REST) │

└────┬───────────┬─────────┘

│

│

┌────────────▼──┐ ┌───▼──────────────┐

│ Servicio de │ │ Servicio de │

│ Biblia / Geo │ │ Cuenta y Sync │

│ (read-only) │ │ (CRUD usuario) │

└────┬───────┬──┘ └────────┬─────────┘

││

│

┌─────────▼┐ ┌───▼──────┐ ┌──────▼─────────┐

│ Postgres │ │ ElasticS./│ │ Postgres │

│ texto+ │ │ Meilisearch│ │ user data │

│ geo data │ │ (búsqueda) │ │ + Auth │

└──────────┘ └────────────┘ └───────────────┘

Recursos estáticos:

┌────────────────┐ ┌────────────────┐

│ CDN tiles │ │ CDN imágenes, │

│ (vector OSM │ │ JS, CSS, assets│

│ + capa propia) │ │

│

└────────────────┘ └────────────────┘

9.2 Componentes principales
9.2.1 Aplicación web (frontend) Single Page Application con SSR para el primer render, hidratación progresiva y prefetching de capítulos contiguos. Estado global mínimo, sincronizado con la URL para permitir compartir enlaces profundos. El mapa se carga de forma diferida porque su bundle es el más pesado.
9.2.2 API Gateway Punto único de entrada para el frontend. Implementa autenticación, rate limiting, CORS y métricas. Internamente delega al servicio adecuado.
9.2.3 Servicio Biblia / Geo Servicio de solo lectura que entrega texto bíblico, fichas de lugares, eventos, personajes y rutas. Cacheable de forma agresiva. Stateless.
9.2.4 Servicio Cuenta y Sync Gestiona registro, login, marcadores, notas, planes de lectura del usuario. Aplica RGPD: borrado y exportación bajo demanda.
9.2.5 Pipeline de datos geo-bíblicos Conjunto de scripts que transforman fuentes (OpenBible.info, atlas históricos abiertos, dataset propio) en una base normalizada. Se ejecuta en local o en CI cuando hay actualizaciones; el resultado se publica como dump versionado.
9.2.6 Tile server Servidor de teselas vectoriales propio (basado en OpenMapTiles + Tegola o Martin). Permite servir estilos cartográficos personalizados sin depender comercialmente de Mapbox o Google.
9.2.7 CDN Cloudflare o Bunny CDN para assets, tiles e imágenes. Caché agresiva con purgas controladas.
9.3 Patrones arquitectónicos
• Backend for Frontend (BFF) ligero entre el cliente y los servicios internos. • Read-heavy: la mayoría del tráfico es lectura, por tanto se prioriza caché HTTP, ETag, stale-
while-revalidate. • Idempotencia obligatoria en todas las mutaciones de la API. • Diseño "offline-friendly": el cliente almacena en IndexedDB el último libro leído y la posición. • Versionado semántico de la API y de los datasets.

10. Stack tecnológico recomendado

La elección del stack se hace optimizando para tres criterios: (1) rendimiento y SEO, (2) productividad del equipo, (3) ecosistema con licencias permisivas y comunidad activa.

10.1 Resumen

Capa

Tecnología recomendada

Justificación

Frontend Web

Next.js 15 (React 19) con TypeScript

SSR/SSG/ISR maduros, gran ecosistema, App Router, RSC.

Estado UI

Zustand + URL state

Mínima sobrecarga, fácil de testear.

Estilos

Tailwind CSS + tokens propios

Productividad, sin CSS-in-JS pesado.

Mapa cliente

MapLibre GL JS

Open source, sin lock-in con Mapbox; tiles vectoriales.

i18n

next-intl o i18next + ICU MessageFormat

Soporta plurales, formatos por locale.

API / BFF

Next.js Route Handlers + tRPC (interno) + REST (público)

Tipado de extremo a extremo, contrato sólido para futuras apps móviles.

Lenguaje backend

TypeScript en Node.js (Bun como alternativa)

Mismo lenguaje que el frontend; rendimiento aceptable.

Base de datos relacional PostgreSQL 16 con PostGIS

PostGIS aporta consultas geoespaciales que necesitamos.

Búsqueda full-text

Meilisearch (alt. Elasticsearch)

Resultados rápidos, tipos por idioma, fácil despliegue.

Autenticación

Better-Auth o Lucia (self-hosted)

Sin lock-in, soporte de OAuth y 2FA.

Pagos / Donaciones

Stripe (Stripe Checkout + Webhooks)

Estándar; soporta donaciones recurrentes.

Email transaccional

Resend o Postmark

Buenas tasas de entrega, plantillas.

Hosting de la app

Vercel (MVP) o Coolify/Hetzner (cuando crezca)

Inicial barato; migración prevista.

Hosting BD/buscador/tiles Hetzner (Frankfurt)

Coste/rendimiento óptimo para Europa.

CDN

Cloudflare (gratuito) + Bunny (assets)

Bajo coste, alto rendimiento global.

Observabilidad

Sentry + OpenTelemetry + Grafana Errores y métricas con bajo esfuerzo.

CI/CD

GitHub Actions

Estándar; integraciones inmediatas.

Telemetría

Plausible self-hosted o Umami

Privacy-first, sin cookies.

10.2 Alternativas evaluadas y descartadas
• SvelteKit: excelente DX, pero comunidad menor y menos talento disponible para escalar el equipo.
• Remix: muy bueno, pero el ecosistema React converge hacia Next 15 con RSC. • Mapbox GL: mejor rendimiento y estilos, pero el cambio de licencia hace inviable el uso
comercial sin pagar. • Google Maps: cara para tráfico alto y poco personalizable cartográficamente. • Firebase Firestore: lock-in y modelo de datos limitado para nuestras consultas geoespaciales. • Algolia: excelente, pero más costoso que Meilisearch para nuestro perfil de uso.
10.3 Reproducibilidad del entorno
• Docker Compose para arrancar Postgres + PostGIS, Meilisearch, tile server local en desarrollo. • Devcontainers con configuración versionada en el repositorio. • Migraciones gestionadas con Drizzle ORM o Prisma + scripts SQL versionados para PostGIS. • Seed scripts que cargan un subconjunto representativo del dataset geo-bíblico.

11. Modelo de datos

11.1 Visión conjunta de entidades
El modelo se divide en dos dominios principales:
• Dominio de contenido bíblico/histórico (read-only desde el punto de vista del usuario): versiones, libros, capítulos, versículos, lugares, eventos, personajes, periodos, rutas, capas, fuentes.
• Dominio de usuario: cuentas, sesiones, marcadores, resaltados, notas, colecciones, planes de lectura, donaciones.

11.2 Diagrama de entidades (texto)

Version ─< Book ─< Chapter ─< Verse

│

├─< VerseLocation >─ Place

└─< VerseEvent >─── Event

Place ─< AlternateName

Place ─< PlacePeriodGeometry (cómo se representa en cada periodo)

Event ─< EventPlace

(lugares involucrados)

Event ─── Period

(a qué periodo pertenece)

Person ─< PersonEvent

Period ─< MapLayer

(capas cartográficas por periodo)

Route ─< RouteWaypoint (puntos de la ruta en orden)

User User User User User User

─< Bookmark ─── Verse ─< Highlight ─── Verse (rango) ─< Note ─── Verse (rango) ─< Collection ─< CollectionItem ─< ReadingPlan ─< ReadingPlanProgress ─< Donation

11.3 Esquemas SQL (extracto)
Se muestra el DDL esencial. Se omiten índices secundarios, claves externas y triggers de auditoría por brevedad.

CREATE TABLE version (

id

SERIAL PRIMARY KEY,

code

TEXT NOT NULL UNIQUE, -- 'BIA', 'NABRE', ...

language TEXT NOT NULL,

-- 'es', 'en'

full_name TEXT NOT NULL,

copyright TEXT NOT NULL,

license_type TEXT NOT NULL,

-- 'licensed', 'public_domain'

metadata JSONB

);

CREATE TABLE book (

id

SERIAL PRIMARY KEY,

canonical_id TEXT NOT NULL,

-- 'GEN', 'EXO', 'MAT', ...

testament TEXT NOT NULL, category TEXT NOT NULL );

-- 'OT' | 'NT' -- 'pentateuch', 'gospels', ...

CREATE TABLE book_translation (

book_id INT REFERENCES book(id),

version_id INT REFERENCES version(id),

name

TEXT NOT NULL,

short_name TEXT NOT NULL,

PRIMARY KEY (book_id, version_id)

);

CREATE TABLE chapter (

id

SERIAL PRIMARY KEY,

book_id INT NOT NULL REFERENCES book(id),

number

INT NOT NULL,

UNIQUE (book_id, number)

);

CREATE TABLE verse (

id

SERIAL PRIMARY KEY,

chapter_id INT NOT NULL REFERENCES chapter(id),

number

INT NOT NULL,

UNIQUE (chapter_id, number)

);

CREATE TABLE verse_text (

verse_id INT REFERENCES verse(id),

version_id INT REFERENCES version(id),

text

TEXT NOT NULL,

footnotes JSONB,

PRIMARY KEY (verse_id, version_id)

);

CREATE TABLE place (

id

SERIAL PRIMARY KEY,

slug

TEXT NOT NULL UNIQUE,

canonical_name TEXT NOT NULL,

description TEXT,

modern_name TEXT,

modern_country TEXT,

geom

GEOGRAPHY(POINT, 4326)

);

-- representación canónica

CREATE TABLE place_alternate_name (

place_id INT REFERENCES place(id),

language TEXT NOT NULL,

name

TEXT NOT NULL,

source

TEXT

);

CREATE TABLE period (

id

SERIAL PRIMARY KEY,

slug

TEXT NOT NULL UNIQUE,

name

TEXT NOT NULL,

start_year INT NOT NULL,

-- negativo si a.C.

end_year INT NOT NULL,

description TEXT

);

CREATE TABLE place_period_geometry (

place_id INT REFERENCES place(id),

period_id INT REFERENCES period(id),

geom

GEOGRAPHY,

-- punto, polígono o multipolígono

PRIMARY KEY (place_id, period_id)

);

CREATE TABLE map_layer (

id

SERIAL PRIMARY KEY,

period_id INT REFERENCES period(id),

type

TEXT NOT NULL,

-- 'kingdom', 'route', 'episode', ...

data

JSONB NOT NULL

-- GeoJSON

);

CREATE TABLE event (

id

SERIAL PRIMARY KEY,

slug

TEXT NOT NULL UNIQUE,

name

TEXT NOT NULL,

period_id INT REFERENCES period(id),

description TEXT

);

CREATE TABLE event_place (

event_id INT REFERENCES event(id),

place_id INT REFERENCES place(id),

role

TEXT,

-- 'origin', 'destination', 'venue', ...

PRIMARY KEY (event_id, place_id)

);

CREATE TABLE person (

id

SERIAL PRIMARY KEY,

slug

TEXT NOT NULL UNIQUE,

name

TEXT NOT NULL,

description TEXT

);

CREATE TABLE verse_location (

verse_id INT REFERENCES verse(id),

place_id INT REFERENCES place(id),

confidence SMALLINT NOT NULL, -- 1..5

source

TEXT,

PRIMARY KEY (verse_id, place_id)

);

CREATE TABLE verse_event ( verse_id INT REFERENCES verse(id), event_id INT REFERENCES event(id), PRIMARY KEY (verse_id, event_id)
);

CREATE TABLE app_user (

id

UUID PRIMARY KEY,

email

CITEXT NOT NULL UNIQUE,

password_hash TEXT,

display_name TEXT,

locale

TEXT NOT NULL DEFAULT 'es',

created_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ );

CREATE TABLE bookmark (

id

UUID PRIMARY KEY,

user_id UUID REFERENCES app_user(id) ON DELETE CASCADE,

verse_id INT REFERENCES verse(id),

created_at TIMESTAMPTZ NOT NULL DEFAULT now()

);

CREATE TABLE highlight (

id

UUID PRIMARY KEY,

user_id UUID REFERENCES app_user(id) ON DELETE CASCADE,

start_verse_id INT REFERENCES verse(id),

end_verse_id INT REFERENCES verse(id),

color

TEXT NOT NULL,

label

TEXT

);

CREATE TABLE note (

id

UUID PRIMARY KEY,

user_id UUID REFERENCES app_user(id) ON DELETE CASCADE,

start_verse_id INT REFERENCES verse(id),

end_verse_id INT REFERENCES verse(id),

body_md TEXT NOT NULL,

updated_at TIMESTAMPTZ NOT NULL DEFAULT now()

);

CREATE TABLE donation (

id

UUID PRIMARY KEY,

user_id UUID,

-- nullable: donaciones anónimas

stripe_pi_id TEXT NOT NULL,

amount_cents INT NOT NULL,

currency TEXT NOT NULL,

recurring BOOLEAN NOT NULL,

created_at TIMESTAMPTZ NOT NULL DEFAULT now()

);

11.4 Tamaño y volumetría estimada

Entidad Versículos × versiones Lugares bíblicos Eventos modelados

Filas estimadas ≈ 31 000 × 4 = 124 000 ≈ 1 200 ≈ 600

Personajes modelados

≈ 400

Verse_location Capas de mapa

≈ 8 000 ≈ 30

Notas Texto plano + footnotes. Cifras de OpenBible.info. Estimación inicial. Solo principales y secundarios relevantes. Aproximadamente 25 % de versículos. Por periodo y por tipo.

Entidad Marcadores/notas

Filas estimadas Variable

Notas Esperado: 5–50 por usuario activo.

11.5 Política de versionado y migraciones
• Cada cambio en el esquema genera una migración numerada y reversible.
• Las versiones bíblicas se identifican por código estable; nunca se sobreescribe el texto, se crean nuevas filas.
• Los datasets geo-bíblicos llevan un campo dataset_version para permitir A/B test entre revisiones.

12. API pública
12.1 Estilo y convenciones
La API expone dos contratos: un REST público versionado en /api/v1, pensado para ser consumido por las futuras apps móviles y por terceros, y un endpoint tRPC interno usado por el frontend web. Las respuestas son JSON; los errores siguen RFC 7807 (Problem Details for HTTP APIs).
• Autenticación: Bearer token JWT en cabecera Authorization. • Idempotencia obligatoria en POST/PUT/PATCH a través de la cabecera Idempotency-Key. • Paginación cursor-based con cabecera Link. • Cacheo: ETag + Cache-Control: public, max-age=86400, stale-while-revalidate=604800 en
endpoints de contenido. • Rate limiting: 60 req/min para invitados, 600 req/min para usuarios autenticados.
12.2 Endpoints clave
12.2.1 Lectura de la Biblia
GET /api/v1/versions GET /api/v1/versions/{code} GET /api/v1/versions/{code}/books GET /api/v1/versions/{code}/books/{book}/chapters/{chapter} GET /api/v1/versions/{code}/books/{book}/chapters/{chapter}/verses GET /api/v1/versions/{code}/passages?ref=Jn+3:16-21

12.2.2 Geografía e historia
GET /api/v1/places?q=cesarea&period=tiempos-de-jesus GET /api/v1/places/{slug} GET /api/v1/places/{slug}/passages GET /api/v1/events?period={slug} GET /api/v1/events/{slug} GET /api/v1/periods GET /api/v1/periods/{slug}/layers GET /api/v1/routes/{slug}

12.2.3 Sincronización pasaje-mapa
POST /api/v1/passage-locations Body: { "verses": [{ "version": "BIA", "ref": "Hch 9,1-9" }] } Response: { "places": [...], "routes": [...], "events": [...] }

12.2.4 Cuenta y datos del usuario

POST POST POST POST POST

/api/v1/auth/register /api/v1/auth/login /api/v1/auth/logout /api/v1/auth/refresh /api/v1/auth/password-reset

GET /api/v1/me PATCH /api/v1/me DELETE /api/v1/me GET /api/v1/me/export

(RGPD)

GET /api/v1/me/bookmarks POST /api/v1/me/bookmarks DELETE /api/v1/me/bookmarks/{id}

GET /api/v1/me/notes POST /api/v1/me/notes PATCH /api/v1/me/notes/{id} DELETE /api/v1/me/notes/{id}

GET /api/v1/me/highlights POST /api/v1/me/highlights DELETE /api/v1/me/highlights/{id}

GET /api/v1/me/reading-plans POST /api/v1/me/reading-plans DELETE /api/v1/me/reading-plans/{id}

12.2.5 Donaciones
POST /api/v1/donations/checkout-session POST /api/v1/donations/webhook (Stripe → backend) GET /api/v1/me/donations

12.3 Ejemplo de respuesta
GET /api/v1/places/cesarea-maritima 200 OK
{ "slug": "cesarea-maritima", "names": [ { "language": "es", "value": "Cesarea Marítima" }, { "language": "en", "value": "Caesarea Maritima" }, { "language": "he", "value": "‫} "ֵקיָסְרָיה‬ ], "modern": { "name": "Caesarea National Park", "country": "Israel" }, "geometry": { "type": "Point", "coordinates": [34.892, 32.501] }, "summary": "Puerto romano construido por Herodes el Grande en honor a César Augusto...", "passages": [ { "ref": "Hch 10,1-48", "label": "Conversión de Cornelio" },

{ "ref": "Hch 23,23-35", "label": "Pablo es trasladado a Cesarea" } ], "periods": [ "imperio-romano", "tiempos-de-jesus" ], "events": [ "conversion-cornelio", "prision-pablo" ], "license": "Texto y datos: CC BY 4.0 — Tabor." }
12.4 Errores estandarizados (RFC 7807)
HTTP/1.1 404 Not Found Content-Type: application/problem+json
{ "type": "https://tabor.app/errors/not-found", "title": "Recurso no encontrado", "status": 404, "detail": "No existe ningún lugar con el slug 'foo'.", "instance": "/api/v1/places/foo"
}

13. Diseño de interfaz y experiencia de usuario

13.1 Principios de diseño
• Lectura primero: el texto sagrado es el objeto principal; todo lo demás se subordina a su legibilidad.
• Mapa silencioso: el mapa apoya la lectura sin gritarla; gestiones de tipo "siempre encendido" como animaciones, banners flotantes o pop-ups quedan vetadas.
• Jerarquía clara: tres niveles tipográficos, dos niveles de color de superficie.
• Sin fricciones: las acciones más frecuentes (cambiar capítulo, marcar, anotar) están a un solo clic.
• Diseño accesible por defecto: contraste alto, foco visible, iconos con label, área táctil ≥ 44 px.

13.2 Sistema visual

13.2.1 Paleta

Token

HEX

color/primary

#1F3A5F

color/accent

#C8932E

color/sand color/ink color/night color/parchment color/danger color/success

#F5EFE0 #1A1A1A #0E1320 #E7DDC7 #A94442 #4F7942

Uso

Notas

Cabeceras, marca, fronteras de mapa

Azul noche pergamino.

Acentos, dorado, llamadas a la acción discretas

Inspirado en iluminaciones medievales.

Fondo en modo claro

Color papel envejecido.

Texto principal en modo claro

Cumple AAA con sand.

Fondo en modo oscuro

Texto en modo oscuro

Errores

Confirmaciones

13.2.2 Tipografía • Texto bíblico: «Source Serif Pro» (humanista, alta legibilidad). Variable: 17–22 px en escritorio, 18–22 px en móvil.
• Interfaz: «Inter» (sans-serif neutra).

• Títulos: «Cormorant Garamond» o «Source Serif Pro» en peso semibold. • Monoespaciada (referencias bíblicas y código): «JetBrains Mono». • Sustitutos del sistema (system-ui) si la fuente custom no carga.
13.2.3 Iconografía Conjunto único basado en Lucide Icons (MIT). Sin dependencias propietarias. Iconos siempre con etiqueta accesible.
13.2.4 Estados y microinteracciones • Hover: ligero subrayado o cambio de saturación (no escalado). • Focus: anillo de 2 px en color accent visible siempre. • Animaciones limitadas a 200–350 ms con easing «ease-out»; respeto a prefers-reduced-motion.

13.3 Patrones de navegación

13.3.1 Layout escritorio (≥ 1024 px)

┌──────────────────────────────────────────────────────────────────────┐

│ Logo Tabor │ Buscador (Jn 3,16, Cesarea, Pablo)

│ Idioma │ │ Cuenta │

├──────────────┴────────────────────────────────────────────┴────────┴────────┤

│ ┌──────────┐

│

│ │ Selector │ ┌────────────────────────┐ ┌───────────────────────────┐ │

│ │ libro/cap│ │ TEXTO BÍBLICO

│ │ MAPA INTERACTIVO

││

│ │ Genesis │ │ Jn 3 — La conversación │ │ centrado en Judea — │ │

│ │ Exodo │ │ con Nicodemo

│ │ marcadores: Jerusalén, │ │

│ │ ... │ │

│ │ Jordán, Galilea

││

│ │ NT │ │ 1 Había entre los... │ │

││

│ │ Mateo │ │ 2 ... vino a Jesús │ │ capa: Tiempos de Jesús │ │

│ │ Marcos │ │ de noche y le... │ │ [▶ Explorar mapa]

││

│ │ Lucas │ │

││

││

│ │ Juan ◄ │ │ 13 Y nadie subió al │ │

││

│ │ Hechos │ │ cielo, sino el... │ │

││

│ │ ... │ │

││

││

│ └──────────┘ └────────────────────────┘ └───────────────────────────┘ │

│ Footer: Acerca de · Donar · Privacidad · Idioma · Versión BIA / NABRE │

└─────────────────────────────────────────────────────────────────────────────┘

13.3.2 Layout tablet (640–1023 px) Mismo esquema en dos columnas pero con el panel del libro colapsable como menú lateral. El mapa ocupa el 40 % derecho y se puede maximizar a pantalla completa.
13.3.3 Layout móvil (< 640 px) Pestañas inferiores con dos vistas: «Texto» y «Mapa». Cuando el texto está activo, una franja inferior muestra los lugares del versículo visible y permite saltar al mapa con un toque. Cuando el mapa está activo, una franja superior muestra el pasaje en curso.

13.4 Estados especiales y vacíos
• Sin conexión: el lector muestra el último capítulo cacheado; el mapa indica «Modo offline limitado».
• Pasaje sin geografía: mensaje sereno, no de error. • Búsqueda sin resultados: sugerencias relacionadas y enlace a explorar el mapa. • Cargando: skeleton sin spinners agresivos.
13.5 Modo de presentación / catequesis
Pensando en personas como Pedro (catequista), la app dispone de un «Modo presentación» activable con un botón. En este modo, la tipografía aumenta automáticamente, las cabeceras se reducen y el mapa puede mostrarse en pantalla completa con marcadores extragrandes. Es ideal para proyectar.

14. Wireframes textuales y flujos clave

Se documentan a continuación los wireframes textuales de las pantallas críticas. La intención es que sirvan de base para el equipo de diseño visual; no son definitivos.

14.1 Pantalla de inicio (lectura)

┌─ Header ───────────────────────────────────────────────────────────┐

│ Tabor ▾ | [⌕ buscar pasajes, lugares, personajes] ES | ☼ │

├────────────────────────────────────────────────────────────────────┤

│ ┌── lateral ──┐ ┌── lectura ──────────────┐ ┌── mapa ─────────────┐│

│ │ AT

│ │ JUAN · Cap. 3

│ │ [+ -] [⤢] ││

│ │ Genesis │ │ Conversación con │ │

││

│ │ Exodo │ │ Nicodemo

│ │ ⚐ Jerusalén ││

│ │ ... │ │

│ │ ⚐ Galilea

││

│ │ NT

│ │ 1 Había entre los │ │

││

│ │ Mateo │ │ fariseos un hombre... │ │ capa ▼

││

│ │ Marcos │ │ 2 Éste vino a Jesús... │ │ • ciudades

││

│ │ Lucas │ │ ...

│ │ • rutas

││

│ │ ▶ Juan │ │

│ │ • episodios ││

│ │ Hechos │ │ [⏮ cap 2] [cap 4 ⏭] │ │ periodo: s. I dC ││

│ └─────────────┘ └──────────────────────────┘ └────────────────────┘│

│ Footer: Acerca de · Donar · Versión: BIA · 2026

│

└────────────────────────────────────────────────────────────────────┘

14.2 Ficha de lugar

┌─ Modal lateral derecho (slide-in) ─────────────────────────────────┐

│ Cesarea Marítima

✕

│

│ ⚐ 32.501 N, 34.892 E · hoy: Caesarea NP, Israel

│

│ ────────────────────────────────────────────────────────────────── │

│ Puerto romano construido por Herodes el Grande...

│

│

│

│ Aparece en:

│

│ • Hechos 10,1-48 — Conversión de Cornelio

│

│ • Hechos 23,23-35 — Pablo trasladado a Cesarea

│

│ • Hechos 25 — Pablo ante Festo

│

│

│

│ Personajes asociados: Pedro · Pablo · Cornelio · Felipe el Diácono │

│

│

│ [ Leer pasajes ] [ Compartir ] [ Añadir a colección ]

│

└────────────────────────────────────────────────────────────────────┘

14.3 Buscador y resultados

┌─ Buscador desplegado ──────────────────────────────────────────────┐

│ Entrada: "cesarea"

│

│

│

│ Lugares

│

│ ⚐ Cesarea Marítima — Hch 10; 23; 25

│

│ ⚐ Cesarea de Filipo — Mt 16,13; Mc 8,27

│

│

│

│ Pasajes

│

│ • Hch 10,1 "Había en Cesarea un hombre llamado Cornelio..." │

│ • Hch 18,22 "...llegó a Cesarea, subió a saludar a la Iglesia..."│

│

│

│ Personajes

│

│  Cornelio — centurión romano de Cesarea

│

└────────────────────────────────────────────────────────────────────┘

14.4 Pantalla móvil — pestañas

┌──────────────────────────────────────────┐

│ Tabor · Juan 3 ☰

⌕│

├──────────────────────────────────────────┤

│ 1 Había entre los fariseos un hombre │

│ llamado Nicodemo, principal entre... │

│ 2 Este vino a Jesús de noche y le dijo:│

│ "Rabí, sabemos que has venido de..." │

│ ...

│

├──────────────────────────────────────────┤

│ ⚐ Jerusalén · Río Jordán · Galilea │

├──────────────────────────────────────────┤

│⚙

Mapa ⭐ Notas ⚙ T│exto 

└──────────────────────────────────────────┘

14.5 Mapa pantalla completa

┌──────────────────────────────────────────────────────────────────┐

│ ◀ volver a Juan 3

Periodo: s. I dC ▼ │ ⊕ ⊖ │

├──────────────────────────────────────────────────────────────────┤

│

│

│

MAR MEDITERRÁNEO

│

│

│

│

⚐ Cesarea M.

SAMARIA

│

│

⚐ Sicar

│

│

⚐ Jerusalén

│

│

JUDEA

│

│

│

│ GALILEA

│

│ ⚐ Cafarnaún

│

│ ⚐ Nazaret RÍO JORDÁN

│

│

│

├──────────────────────────────────────────────────────────────────┤

│ Capas: ▣ ciudades ▣ rutas □ reinos ▣ episodios □ heatmap │

└──────────────────────────────────────────────────────────────────┘

15. Versiones bíblicas, derechos y selección editorial

15.1 Criterios de selección
• Aprobación eclesial: contar con aprobación de una Conferencia Episcopal y, cuando exista, confirmación de la Santa Sede.
• Vigencia: priorizar versiones contemporáneas en uso litúrgico actual. • Cobertura del canon: incluir los 73 libros del canon católico (con deuterocanónicos). • Coste y viabilidad de licencia: la negociación debe ser realista en plazo y presupuesto del MVP. • Calidad académica y belleza literaria de la traducción.

15.2 Recomendación para el MVP

Versión

Idioma

Biblia de la Iglesia en América (BIA)

es

Sagrada Biblia. Versión oficial de la Conferencia es Episcopal Española

New American Bible

Revised Edition

en

(NABRE)

Revised Standard

Version, Second Catholic Edition

en

(RSV-2CE)

Aprobación

Notas y consideraciones

CELAM, confirmada por la Santa Sede (2019)

Versión oficial litúrgica para América Latina; lenguaje contemporáneo. Necesita licencia de uso digital con CELAM y editorial PPC.

CEE, recognitio de la Santa Sede (2010)

Versión oficial litúrgica en España. Editorial BAC.

USCCB, Confraternity of Texto litúrgico oficial en Estados Unidos.

Christian Doctrine

Licencia con USCCB.

Imprimatur (Ignatius Press)

Versión académica y devocional muy apreciada; tono más clásico.

15.3 Versiones consideradas como alternativas o adiciones futuras
• Biblia de Jerusalén (Desclée de Brouwer): excelentes notas; necesita licencia. • Biblia Latinoamericana (Verbo Divino): muy popular pastoralmente. • La Biblia. Libro del Pueblo de Dios (Argentina): uso litúrgico en algunas regiones. • New Jerusalem Bible / NRSV-CE: versiones inglesas con notable acogida. • Nova Vulgata: texto latino de referencia oficial del Vaticano. Útil para mostrar como capa
académica opcional.

15.4 Estrategia de licencias
La licencia de las versiones es la mayor incertidumbre del proyecto. Recomendaciones:

31. Iniciar conversaciones con CELAM/PPC para BIA y con BAC/CEE para la versión oficial española antes de comenzar el desarrollo del MVP.
32. Para inglés, contactar con USCCB (NABRE) e Ignatius Press (RSV-2CE). 33. Si alguna licencia se demora, lanzar el MVP con las versiones disponibles e ir incorporando las
restantes. 34. Mantener un "plan B" con versiones de dominio público (Reina-Valera 1909 en español, Douay-
Rheims o KJV en inglés) para garantizar continuidad operativa. 35. Modelo de uso: estrictamente in-app, sin posibilidad de descargar el texto bruto, con marca de
agua técnica que permita auditoría.
15.5 Aspectos editoriales transversales
• Notas a pie: solo las incluidas en la versión licenciada; no se generan notas propias por IA. • Títulos de sección: respetar los introducidos por la versión; permitir ocultarlos. • Numeración Vulgata vs. masorética en Salmos: mostrar la numeración de la versión activa con
conversión opcional. • Deuterocanónicos: claramente integrados, no separados como apéndice.

16. Privacidad, protección de datos y cumplimiento legal

16.1 Marco aplicable
• RGPD (Reglamento UE 2016/679) y LOPDGDD (España, LO 3/2018). • ePrivacy (cookies y comunicaciones electrónicas). • PSD2 / SCA para pagos a través de Stripe. • DSA (Digital Services Act) en lo que aplique a servicios digitales en la UE. • Convención sobre Derechos del Niño y normativa local de protección de menores en países
donde opere la app.

16.2 Datos personales tratados

Categoría Identificación Contenido del usuario Donaciones Preferencias Telemetría agregada

Ejemplos Email, nombre opcional, foto Marcadores, notas, planes, colecciones Importe, fecha, ID de Stripe Idioma, versión bíblica, modo oscuro Páginas vistas anónimas

Logs técnicos

IP truncada, user-agent

Base jurídica Ejecución del contrato (cuenta)

Retención Mientras la cuenta exista + 30 días tras eliminación.

Ejecución del contrato Igual que la cuenta.

Obligación legal (contable, fiscal) Interés legítimo / consentimiento Interés legítimo Interés legítimo (seguridad)

Plazo legal contable (≥ 6 años en España). Mientras se utilicen. 13 meses agregada. 30 días.

16.3 Encargados de tratamiento
• Stripe: pagos. • Resend o Postmark: envío de emails transaccionales. • Cloudflare / Bunny: CDN y protección DDoS. • Hosting (Vercel, Hetzner): infraestructura. • Sentry: trazas de errores (con datos pseudonimizados).
16.4 Derechos de los usuarios
• Acceso, rectificación, supresión ("derecho al olvido"), portabilidad, oposición, limitación.

• Todas estas operaciones son autoservicio desde el panel del usuario; el equipo responde manualmente solo en casos excepcionales.
• Se publica un canal de contacto (email DPO) para reclamaciones; respuesta en menos de 30 días.
16.5 Política específica para menores
La app no está dirigida a menores de 14 años (edad mínima en España según LOPDGDD). Si en el formulario de registro el usuario declara una edad menor a la mínima legal del país, el registro se bloquea con un mensaje claro y se ofrece informar a un adulto responsable. La app puede usarse sin cuenta sin restricciones, sin recogida de datos personales.
16.6 Política de cookies
• Por defecto, no se cargan cookies salvo las estrictamente necesarias (sesión, CSRF). • La telemetría se realiza sin cookies (Plausible/Umami). • No se usan cookies publicitarias ni de terceros para analítica. • El banner de cookies se muestra solo si en el futuro se incorpora algún tracker que lo requiera.
16.7 Política de IA
• Tabor no entrena modelos de IA con los datos de los usuarios. • Cualquier funcionalidad asistida por IA debe ser opt-in, identificable visualmente y revisada por
un comité editorial antes de su lanzamiento. • Las respuestas generadas por IA se etiquetan claramente y nunca se presentan como doctrina
oficial.

17. Estrategia de pruebas y calidad
17.1 Niveles de pruebas
• Pruebas unitarias (Vitest/Jest): lógica de dominio, formateo de referencias bíblicas, parsers, utilidades.
• Pruebas de integración: endpoints de la API contra Postgres real y Meilisearch en contenedores. • Pruebas E2E (Playwright): flujos críticos en Chrome y WebKit. • Pruebas de accesibilidad automatizadas (axe-core) en CI y manuales con NVDA/VoiceOver. • Pruebas de rendimiento (Lighthouse, k6) sobre escenarios reales. • Pruebas visuales de regresión (Percy o Chromatic).
17.2 Calidad de datos
• Validación cruzada del dataset geo-bíblico: cada vínculo verso-lugar tiene fuente declarada. • Validación geométrica con PostGIS: detección de coordenadas fuera de rango razonable. • Linter de versiones bíblicas: comparar el conteo de versículos con un canon de referencia para
detectar omisiones. • Revisión editorial sistemática antes de cada release de dataset.
17.3 Criterios de aceptación generales
• Todos los CU principales pasan tests E2E sin intervención humana. • Lighthouse ≥ 90 en Performance, Accessibility, Best Practices, SEO en home, lectura y mapa. • Cobertura unitaria mínima del 70 % en /src/domain. • Sin warnings de seguridad de severidad alta o crítica.
17.4 Bug bash y release
• Antes de cada release público, sesión de bug bash con todo el equipo (2 horas). • Despliegue en staging con dataset real y prueba de regresión. • Lanzamiento gradual: 10 % → 50 % → 100 % de tráfico con monitorización activa.

18. DevOps, despliegue y operación

18.1 Entornos
Entorno dev (local) preview (PR)
staging production

Propósito
Desarrollo individual Revisión de pull requests
Pruebas integradas y QA final
Servicio público

Datos Subset sintético Subset realista Copia anonimizada de prod Datos reales

Acceso Equipo dev Equipo + invitados
Equipo + asesor editorial Acceso restringido y auditado

18.2 Pipeline CI/CD
• Pull request: lint, tipos, tests unitarios e integración, axe, Lighthouse, build. • Merge a main: build, deploy automático a staging, smoke tests. • Tag de release: pasa pruebas E2E completas, despliega a producción con feature flags. • Rollback inmediato disponible en menos de 5 minutos.

18.3 Observabilidad
• Errores: Sentry con sampling adaptativo. • Métricas: OpenTelemetry → Grafana Cloud (free tier inicial). • Logs: estructurados JSON; rotación 30 días. • Alertas: error rate > 1 %, p95 latencia > 800 ms, disponibilidad < 99 % por hora.

18.4 Backups y recuperación
• Backups diarios completos del Postgres + WAL continuo. • Pruebas de restauración mensuales en entorno aislado. • RTO objetivo: 4 horas. RPO objetivo: 1 hora.

18.5 Seguridad operativa
• Secretos en gestor (Doppler, 1Password, Vault). Nunca en repositorio. • Acceso a producción solo con 2FA y VPN/SSH bastion. • Auditoría trimestral de permisos. • Revisión semestral de dependencias y CVEs.

19. Estrategia de localización (i18n / l10n)
19.1 Idiomas previstos
• Lanzamiento: español (genérico es y variante es-419) e inglés (en-US). • Fase 2: portugués (pt-BR), italiano (it-IT). • Futuro: francés (fr-FR), alemán (de-DE), polaco (pl-PL), latín (la) como capa académica.
19.2 Arquitectura de localización
• Archivos de traducción separados por dominio (common.json, reader.json, map.json...). • Formato ICU MessageFormat para soportar plurales, géneros y variables. • Detección automática de idioma + override manual persistente. • URLs prefijadas por idioma (/es/, /en/) para SEO. • Hreflang en cabeceras y sitemap.
19.3 Localización del contenido bíblico
• Cada versión bíblica está vinculada a un idioma; el cambio de idioma de interfaz sugiere la versión correspondiente, pero permite mantener una versión distinta si el usuario lo prefiere.
• Los nombres de lugares y personajes se almacenan con sus variantes por idioma y se eligen según la versión activa.
19.4 Tono y registro
• Español: tono respetuoso, neutro, evitando regionalismos. Tratamiento de "tú" en interfaz general.
• Inglés: tono cercano y claro; consistencia con la versión bíblica activa. • Glosario propio para términos religiosos: "covenant", "Pentecost", "Sinaí", etc., con preferencias
documentadas.

20. Roadmap detallado por fases
20.1 Visión a 18 meses
El plan se organiza en cinco fases consecutivas que cubren desde la validación hasta el lanzamiento global multilingüe en iOS. Los plazos son orientativos y se ajustarán al cierre de licencias y al tamaño real del equipo.
20.2 Fase 0 — Preparación (Mes 0 – Mes 1)
• Validación del concepto con grupo focal (5–8 usuarios potenciales). • Inicio de conversaciones de licencias con CELAM, CEE, USCCB, Ignatius Press. • Identidad de marca (logotipo, paleta, voz). • Selección de equipo mínimo (ver capítulo 23). • Configuración del repositorio, CI, entornos, dominios. • Asesor teológico/eclesial confirmado.
20.3 Fase 1 — MVP web (Mes 2 – Mes 5)
Mes 2: Cimientos • Infraestructura: Postgres + PostGIS, Meilisearch, tile server local, CI/CD. • Modelo de datos y migraciones iniciales. • Autenticación (registro, login, OAuth Google/Apple, recuperación). • Skeleton de Next.js 15 con SSR, layout responsive, i18n base.
Mes 3: Lectura y mapa • Importación de la primera versión bíblica (la primera disponible licenciada). • Lector de capítulos con paginación y preferencias tipográficas. • Mapa MapLibre con tiles vectoriales propios y marcadores básicos. • Dataset geo-bíblico inicial (subset narrativo: Génesis 12–50, Éxodo, Evangelios, Hechos).
Mes 4: Sincronización y búsqueda • Sincronización pasaje-mapa con debounce y animación suave. • Buscador único con autocompletar, full-text e interpretación de referencias. • Marcadores, resaltados y notas con sincronización en la nube. • Donaciones via Stripe.

Mes 5: Pulido y lanzamiento • Accesibilidad WCAG 2.2 AA: auditoría completa y correcciones. • SEO: SSR, sitemap, Open Graph, schema.org. • Auditoría de seguridad y rendimiento. • Beta cerrada con 50–100 invitados (parroquias, catequistas). • Lanzamiento público gradual.
20.4 Fase 2 — Mejora y enriquecimiento (Mes 6 – Mes 8)
• Capas históricas múltiples (Reinos, Exilio, Imperio Persa, Tiempos de Jesús, Iglesia primitiva). • Línea de tiempo interactiva. • Lectura comparada de varias versiones en paralelo. • Planes de lectura iniciales (Año bíblico, Evangelios en 30 días). • Audio narrado en versiones con licencia. • Modo presentación / catequesis. • Cobertura geo-bíblica al 95 %. • Localización adicional (pt-BR, it-IT).
20.5 Fase 3 — Android (Mes 9 – Mes 11)
• Decisión técnica: Kotlin Multiplatform + Compose vs. Flutter (recomendado: Flutter por compartir base con iOS).
• Reutilización de la API REST. • Almacenamiento offline completo (SQLite + tiles cacheados). • Notificaciones push (recordatorios de plan de lectura). • Pruebas en al menos 6 dispositivos representativos. • Lanzamiento en Google Play.
20.6 Fase 4 — iOS (Mes 12 – Mes 14)
• Si se eligió Flutter en Fase 3: portar y certificar. • Si se decide nativo: SwiftUI + MapKit (con fallback a MapLibre por consistencia cartográfica). • Integración con Sign in with Apple. • Auditoría del flujo de donaciones según política de App Store. • Lanzamiento en App Store.

20.7 Fase 5 — Estabilización y crecimiento (Mes 15 +)
• Internacionalización a más idiomas. • Programa de embajadores (catequistas, profesores). • Posibles colaboraciones académicas para datasets enriquecidos. • Exploración cuidadosa de funcionalidades de IA: reconstrucciones, asistente de estudio.

20.8 Diagrama de Gantt simplificado

Mes: Fase 0 Fase 1 Fase 2 Fase 3 Fase 4 Fase 5

0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15+ ███
████████████████ ████████████ ████████████ ████████ █████

21. KPIs y métricas de éxito

21.1 Métricas del producto

KPI Usuarios únicos mensuales Sesión media
Retención día 30 NPS Capítulos leídos / mes Marcadores creados / usuario

Meta 6 meses

Meta 12 meses

10 000

50 000

≥ 8 min escritorio / 5 min móvil

Idem o mejor

≥ 30 % usuarios registrados

≥ 40 %

≥ 40

≥ 50

300 000

2 000 000

5

10

Cómo se mide Plausible/Umami. Plausible/Umami.
Cohorte mensual. Encuesta in-app trimestral. Telemetría agregada. Backend.

21.2 Métricas técnicas
• LCP p75 ≤ 2,5 s; INP p75 ≤ 200 ms; CLS p75 ≤ 0,1. • Disponibilidad ≥ 99,5 % mensual. • Tasa de errores < 0,5 %. • Cobertura de pruebas ≥ 70 %.
21.3 Métricas de sostenibilidad
• Donaciones recurrentes mensuales activas. • Coste por usuario activo mensual (cMAU). • Ratio donaciones/coste operativo.
21.4 Métricas editoriales
• Cobertura geo-bíblica (% de versículos narrativos enlazados). • Errores reportados de exactitud histórica/geográfica por mes. • Tiempo medio de resolución de errores editoriales.

22. Riesgos y plan de mitigación

22.1 Matriz de riesgos

Riesgo

Prob.

No conseguir licencias para versiones recomendadas

Media

Datos geo-bíblicos imprecisos o controvertidos

Media

Sobrecoste cartográfico (tiles)

Baja

Replicación de la idea por un competidor mayor

Media

Crítica doctrinal por contenido

Media

Caída de financiación / donaciones insuficientes

Media

Bug o vulnerabilidad de seguridad

Baja

Burnout del equipo voluntario

Media

Cambio regulatorio (RGPD, DSA, App Store)

Media

Fallo de proveedor cloud

Baja

Impacto Nivel

Alto

Alto

Alto

Alto

Medio

Medio

Medio

Medio

Alto

Alto

Alto

Alto

Alto Alto Medio Alto

Medio Alto Medio Medio

Mitigación Iniciar negociación en Fase 0; plan B con dominio público; lanzar con menos versiones.
Asesoramiento académico/eclesial; campo de "confianza" por dato; canal de reporte.
Tile server propio basado en OpenMapTiles.
Foco en calidad editorial y comunidad; código del dataset abierto.
Comité editorial católico; canal de reporte público; transparencia. Costes operativos bajos; búsqueda activa de mecenas y fundaciones; alianzas con diócesis. CI con Snyk; bug bounty informal; auditoría externa. Roles y plazos realistas; rotación; reconocimiento público.
DPO designado; revisión semestral.
Backups offsite; documentación de migración.

22.2 Riesgos no técnicos
• Politización del contenido: blindar editorialmente la app frente a polémicas teológicas o políticas.
• Apropiación indebida de la marca: registrar la marca en oficinas relevantes (EUIPO/USPTO). • Suplantación: monitorizar tiendas de aplicaciones.

23. Equipo, organización y costes estimados

23.1 Equipo mínimo recomendado para el MVP

Rol

FTE

Perfil

Responsabilidad

Product Owner

0,5

Promotor / fundador

Visión, priorización, alianzas.

Tech Lead Full-Stack

1,0

Senior TS/React/Node Arquitectura, frontend, API.

Frontend / UX Engineer

1,0

Senior React + accesibilidad

Lector, mapa, accesibilidad.

Backend / Datos

0,5

Senior Node + PostGIS API, dataset geo-bíblico.

Diseñador/a UX/UI

0,5

Producto digital

Sistema visual, wireframes, prototipo.

Asesor teológico/eclesial 0,2

Biblista / teólogo católico

Validación editorial.

QA / DevOps a tiempo parcial

0,3

Testing y CI/CD

Calidad, despliegue.

Total: ~4 FTE durante 4 meses para entregar el MVP. Algunos roles pueden ser voluntarios/colaboraciones

académicas.

23.2 Costes operativos anuales estimados (MVP en producción)

Partida Hosting Postgres + Meilisearch + tiles (Hetzner) Hosting frontend (Vercel Pro o Coolify autohospedado) CDN (Cloudflare) Email transaccional (Resend) Stripe (donaciones) Sentry (error tracking) Dominios (.app + .org) Imprevistos y reserva TOTAL aproximado

EUR / año 1 200
240 – 1 200 0 – 600 120 – 600 % de donaciones 0 – 600 60 1 000 ~3 000 – 5 500

Notas Servidores dedicados. Empezar gratis; subir cuando crezca. Plan gratuito hasta cierto tráfico.
1,4 % + 0,25 € por transacción europea típica. Plan dev gratuito al inicio.

23.3 Costes de licencias bíblicas
Magnitud difícil de estimar sin negociación; se sugiere reservar entre 5 000 y 25 000 € anuales para licencias en función del número de versiones e idiomas. Algunas conferencias episcopales pueden conceder uso digital sin coste para proyectos pastorales sin ánimo de lucro.
23.4 Modelo organizativo
• Recomendación: constituir el proyecto como asociación o fundación sin ánimo de lucro para facilitar donaciones, reducir cargas fiscales y dar transparencia.
• Junta directiva pequeña (3–5 personas) con representación técnica y eclesial. • Asesoría jurídica externa para contratos y licencias.

24. Glosario
Término BIA CELAM CEE Deuterocanónicos
FTE Geo-bíblico GeoJSON MoSCoW MVP NABRE Nova Vulgata PostGIS PWA RGPD RSV-2CE SSR / SSG / ISR Tiles WCAG

Definición Biblia de la Iglesia en América. Versión católica oficial confirmada por la Santa Sede en 2019, promovida por el CELAM. Consejo Episcopal Latinoamericano y Caribeño. Conferencia Episcopal Española. Libros del Antiguo Testamento aceptados por la Iglesia Católica y excluidos por la mayoría de las tradiciones protestantes. Full-Time Equivalent. Equivalente a una persona trabajando a jornada completa. Relativo a la unión de geografía e información bíblica. Formato basado en JSON para representar entidades geográficas. Método de priorización: Must, Should, Could, Won't. Minimum Viable Product. Producto Mínimo Viable. New American Bible Revised Edition. Versión católica oficial en EE. UU. Versión latina oficial promulgada por el Vaticano (Editio Typica Altera, 1986). Extensión geoespacial de PostgreSQL. Progressive Web App. Aplicación web instalable con capacidad offline. Reglamento General de Protección de Datos de la UE. Revised Standard Version, Second Catholic Edition. Server-Side Rendering / Static Site Generation / Incremental Static Regeneration. Teselas cartográficas servidas por un mapa digital. Web Content Accessibility Guidelines.

Anexo A. Lista representativa de lugares bíblicos prioritarios

Lista no exhaustiva de lugares con cobertura prioritaria para el MVP. La numeración es indicativa y se irá ampliando.

#

Lugar

1

Ur de los Caldeos

2

Harán

3

Siquem

4

Betel

5

Hebrón

6

Egipto (Goshen)

7

Mar Rojo / Yam Suf

8

Monte Sinaí / Horeb

9

Cadés-Barnea

10 Río Jordán

11 Jericó

12 Silo

13 Belén

14 Hebrón / Gabaón

15 Jerusalén

16 Samaria (ciudad)

17 Betania

18 Cafarnaún

19 Nazaret

20 Mar de Galilea / Tiberíades

21 Cesarea de Filipo

22 Decápolis (Gerasa, Gádara)

23 Cesarea Marítima

24 Damasco

Pasajes principales asociados Gn 11,28-31 Gn 11,31; 12,4 Gn 12,6; Jos 24 Gn 28; 35 Gn 23; 2 Sm 5 Gn 47; Ex 1 Ex 14 Ex 19; Dt 5 Nm 13 Jos 3; Mt 3 Jos 6; Lc 19 Jos 18; 1 Sm 1 1 Sm 16; Lc 2; Mt 2 2 Sm 2; 5 2 Sm 5; 1 R 6; Mt 21; Hch 1–2 1 R 16; Hch 8 Jn 11; Mc 11 Mt 4; Mc 1; Lc 7 Lc 1; Lc 4 Mt 4; Jn 6; Jn 21 Mt 16; Mc 8 Mc 5; Mt 8 Hch 10; 23–25 Hch 9; 22; 26

#

Lugar

25 Antioquía de Siria

26 Antioquía de Pisidia

27 Iconio

28 Listra y Derbe

29 Filipos

30 Tesalónica

31 Berea

32 Atenas

33 Corinto

34 Éfeso

35 Mileto

36 Patmos

37 Roma

38 Babilonia

39 Nínive

40 Susa

Pasajes principales asociados Hch 11; 13 Hch 13 Hch 14 Hch 14; 16 Hch 16 Hch 17 Hch 17 Hch 17 Hch 18 Hch 19 Hch 20 Ap 1 Hch 28 2 R 24–25; Sal 137; Dn 1 Jon 3; Na 1 Est 1; Esd 4

Anexo B. Esquema JSON de un pasaje geo-referenciado
Ejemplo del documento JSON que la API devuelve cuando el frontend pide los lugares y eventos asociados
a un pasaje.
{ "passage": { "version": "BIA", "ref": "Hch 9,1-9", "book": { "id": "ACT", "name": "Hechos" }, "chapter": 9, "verses": [ { "n": 1, "text": "Saulo, respirando todavía amenazas..." }, { "n": 2, "text": "y pidió cartas para las sinagogas..." } ] }, "places": [ { "slug": "jerusalen", "name": "Jerusalén", "geometry": { "type": "Point", "coordinates": [35.234, 31.776] }, "role": "origin", "verses": [1, 2] }, { "slug": "damasco", "name": "Damasco", "geometry": { "type": "Point", "coordinates": [36.292, 33.513] }, "role": "destination", "verses": [3, 8] } ], "routes": [ { "slug": "saulo-jerusalen-damasco", "geometry": { "type": "LineString", "coordinates": [ [35.234, 31.776], [35.586, 32.123], [36.292, 33.513] ] }, "label": "Camino de Saulo de Jerusalén a Damasco" } ], "events": [ { "slug": "conversion-pablo", "name": "Conversión de Pablo", "period": "tiempos-apostolicos", "verses": [3, 6], "places": ["damasco"], "people": ["pablo", "ananias"] } ]
}

Anexo C. Fuentes y referencias recomendadas
• OpenBible.info — Bible Geocoding (CC BY 4.0). • Atlas of the Bible (Carta Jerusalem). • Bible Atlas, Anson F. Rainey & R. Steven Notley. • Sagrada Biblia, Biblia de la Iglesia en América (CELAM). • Sagrada Biblia, versión oficial de la Conferencia Episcopal Española. • New American Bible Revised Edition (USCCB). • Nova Vulgata Bibliorum Sacrorum Editio (Vaticano). • Pontificia Comisión Bíblica — La interpretación de la Biblia en la Iglesia (1993). • OpenStreetMap (ODbL) y OpenMapTiles para infraestructura cartográfica. • Pleiades Project para topónimos antiguos.

Anexo D. Casos de uso secundarios
CU-07: Crear una colección personal
El usuario crea una colección titulada "Tierra Santa 2026" y va añadiendo a ella lugares y pasajes. Puede compartir un enlace de solo lectura.
CU-08: Suscribirse a un plan de lectura
El usuario elige el plan «Evangelios en 30 días». Cada día recibe una notificación discreta con el pasaje del día y un mapa miniatura.
CU-09: Exportar dosier en PDF
El usuario selecciona varios pasajes y mapas y genera un PDF imprimible para una catequesis o peregrinación.
CU-10: Reportar un error editorial
Desde una ficha de lugar, el usuario abre un formulario de reporte indicando dato incorrecto y, opcionalmente, fuente verificable. El equipo editorial recibe una notificación.
CU-11: Borrar la cuenta y todos los datos
El usuario solicita borrado completo desde su perfil. La aplicación pide confirmación, anonimiza inmediatamente y elimina por completo en menos de 30 días.
CU-12: Donar de forma anónima
Un visitante sin cuenta accede a la página de donación y completa el flujo sin registrarse. Recibe el recibo por email.

Anexo E. Decisiones arquitectónicas (ADR — extracto)
ADR-001: Elección de MapLibre frente a Mapbox
• Contexto: necesitamos un motor de mapas web rendimiento-aceptable y sin lock-in comercial. • Decisión: usar MapLibre GL JS con tile server propio. • Consecuencias: control total del estilo y coste predecible; mayor esfuerzo operativo de
mantenimiento del tile server.
ADR-002: Elección de Next.js
• Contexto: necesitamos SSR/SSG para SEO y soporte robusto de App Router con RSC. • Decisión: usar Next.js 15 con TypeScript. • Consecuencias: gran ecosistema y disponibilidad de talento; cierta complejidad en App Router
para nuevos miembros del equipo.
ADR-003: Elección de PostgreSQL + PostGIS
• Contexto: necesitamos consultas geoespaciales y datos relacionales. • Decisión: PostgreSQL con PostGIS. • Consecuencias: motor maduro y único para todo; algo más de coste operativo que un BaaS, pero
con control total.

Anexo F. Glosario eclesial breve
• Imprimatur: declaración formal de un obispo de que un texto puede ser impreso por estar libre de errores doctrinales.
• Recognitio: confirmación o aprobación de la Santa Sede para textos litúrgicos o bíblicos oficiales. • Vulgata: traducción latina de la Biblia atribuida a san Jerónimo (siglos IV–V). • Septuaginta (LXX): traducción griega del Antiguo Testamento, anterior a Cristo. • Magisterio: enseñanza oficial de la Iglesia Católica.

