# Roadmap

Tabor es un proyecto vivo. Este documento mapea **hacia dónde va** y
**qué tipo de ayuda encaja en cada momento**. Para cómo arrancar a
contribuir, ver [CONTRIBUTING.md](./CONTRIBUTING.md).

Los grandes hitos siguen la [especificación técnica v1.1](./docs/SPEC.md),
con ajustes según el aprendizaje real.

---

## ✅ Lo que ya funciona (alpha pública)

- Lector de los **73 libros del canon católico** en español
  (Straubinger) e inglés (CPDV).
- Mapa con **1.335 lugares bíblicos** geolocalizados y **8.666**
  vínculos versículo↔lugar.
- **Sincronización pasaje↔mapa** bidireccional, con animación.
- **Navegación** completa: índice de libros, selector de capítulo,
  prev/next que cruza libros, panel lateral.
- **Vista satélite** opcional.
- **Multi-idioma** (es / en) en la interfaz.
- **Responsive** con ratio adaptado a móvil.
- Desplegado en [proyectotabor.org](https://proyectotabor.org)
  sobre infraestructura gratuita (Vercel + Supabase).
- **SEO**: título y descripción únicos por capítulo y libro, sitemap
  con las ~2.800 URLs, robots.txt, canonical + hreflang es/en,
  Open Graph con imagen de marca y breadcrumbs schema.org.
- **Nombres de lugares en español**: dataset curado con los **1.335
  lugares** traducidos (formas de la Biblia de Jerusalén, cediendo a
  la forma tradicional castellana cuando es más reconocible).
- **Búsqueda global** en el header: por referencia («Mt 5»,
  «1 Co 13, 4» — parser es/en con abreviaturas), por lugar (ignora
  acentos) y por texto libre sobre los 71.603 versículos (Meilisearch).
  Los resultados enlazan al versículo exacto (`#v12`).
- **Cuentas** (email + contraseña, Better-Auth) con borrado RGPD y
  export de datos en JSON/Markdown.
- **Marcadores, resaltados y notas** sincronizados con la cuenta;
  páginas propias en `/cuenta`. Los resaltados admiten **rangos de
  versículos** (selección multi-tap), 5 colores y **etiqueta corta**
  opcional; los solapes se recortan de forma natural.
- **Planes de lectura** con progreso por dispositivo (invitado) o
  sincronizado con la cuenta.
- **Lectura en voz alta** con la síntesis de voz del navegador
  (Web Speech API): versículo a versículo desde el versículo actual,
  con el texto y el mapa siguiendo la lectura, y voz y velocidad
  configurables. Sin licencias ni backend; también para invitados.
- **Arte sacro** de dominio público en 18 capítulos sin geografía
  (Rembrandt, Caravaggio, Durero, Van Eyck…), con atribución y
  enlace a Wikimedia Commons.
- **Época histórica del pasaje**: cada capítulo se sitúa en su época
  (Orígenes → Iglesia primitiva) con una línea de tiempo sobre el
  mapa, y capas históricas dibujadas sobre él: regiones de la
  Palestina del s. I en los Evangelios, reinos de Israel y Judá en
  los libros históricos, y la ruta tradicional del Éxodo — siempre
  con límites declarados aproximados.
- **Vulgata Clementina** (dominio público, 73 libros) como tercera
  versión, y **lectura comparada**: cualquier capítulo puede leerse
  con una segunda versión intercalada por versículo — español,
  inglés o latín.

---

## 🎯 Próximo (Fase 1 final)

Lo que cerraría el alcance del MVP web de la spec:

- **Revisión editorial de nombres de lugares**: la cola larga
  (~1.060 lugares poco mencionados) se tradujo por transliteración
  sistemática; se agradecen correcciones puntuales en
  `packages/db/src/data/place-names-es.ts`.
- **Meilisearch en producción**: la búsqueda de texto libre ya
  funciona en local; falta una instancia hosteada (Meilisearch Cloud
  free tier o VPS), indexar con `npm run --workspace packages/db
  import:search` y definir `MEILI_HOST` + `MEILI_SEARCH_KEY` en
  Vercel. Sin ella, la búsqueda degrada con elegancia a referencias
  y lugares (que van contra Postgres).
- **Email transaccional** (verificación de cuenta y reset de
  contraseña) y **Google OAuth**.
- **Donaciones via Stripe Checkout** + página de transparencia.
- **Tile server propio** (OpenMapTiles + Tegola/Martin) en vez de
  demotiles públicas.
- **Auditoría WCAG 2.2 AA** completa.

---

## 🎨 Fase 2 — Enriquecimiento editorial

Ideas que multiplican el valor del lector. Casi todas requieren
**curaduría editorial** (qué entra, qué no) tanto o más que código.

- **Comentarios en vídeo de voces reconocidas**: embeds de YouTube
  de homilías y comentarios de Bishop Robert Barron, P. Raniero
  Cantalamessa, obispos hispanos, etc. asociados a cada pasaje. El
  embed es legal vía iframe oficial; la curaduría es la parte difícil.
- **Arte sacro clásico por pasaje**: pinturas, grabados, frescos de
  dominio público (Doré, Caravaggio, Rembrandt, Tissot, El Greco…)
  desde Wikimedia Commons. Idea ya esbozada para los capítulos sin
  geografía; ampliable a todos.
- **Audio narrado con grabaciones humanas** licenciadas (cuando se
  cierren acuerdos con CELAM/CEE/USCCB). Hoy la lectura en voz alta
  usa el TTS del navegador; las grabaciones lo sustituirían donde
  existan.
- **Planes de lectura**: Año bíblico, Cuaresma, Adviento, Evangelios
  en 30 días, Salmos en 60 días.
- **Más capas históricas**: la época por pasaje y las regiones del
  s. I ya existen; faltan overlays para el resto de épocas (reinos
  de Israel y Judá, imperios, viajes de Pablo…).
- **Línea de tiempo interactiva** que permita cambiar la capa
  histórica del mapa (hoy la línea de tiempo es informativa).
- **Modo presentación / catequesis** (pantalla grande, controles
  simplificados).

---

## 📱 Fase 3-4 — Apps móviles

Ya con el web maduro. Decisión técnica preferida: **Flutter**
(comparte base entre Android e iOS).

- **Android** primero (mayor base de usuarios hispano-católicos).
- **iOS** después.
- **Offline completo**: SQLite local + teselas cacheadas.
- **Notificaciones**: recordatorios de plan de lectura.

---

## 🌍 Fase 5 — Crecimiento

- **Más idiomas de interfaz**: pt-BR, it-IT, fr-FR, pl-PL…
- **Programa de embajadores** (catequistas, profesores de religión,
  parroquias).
- **Colaboraciones académicas** para datasets enriquecidos
  (arqueología bíblica, lenguas originales).

---

## 🤔 Ideas que requieren decisión editorial previa

Cosas que la comunidad ha propuesto o están en discusión, pero que
**chocan con principios actuales del proyecto** y necesitan resolverse
antes de implementar.

### Salas de debate / oración compartida

Permitir a usuarios reunirse a comentar pasajes o rezar juntos
sobre un texto.

- **Conflicto con la spec**: §5.2 lista explícitamente
  *"Comunidad social, foros, comentarios entre usuarios"* como **fuera
  del MVP**, por riesgo doctrinal.
- **Coste real**: moderación competente (alguien con formación
  teológica), normas claras, infraestructura de identidad, sistema
  de denuncias.
- **Pendiente**: decisión del maintainer sobre si actualizar la
  política editorial. Si se aprueba, abrir issue con diseño
  detallado.

### Escenas de series y películas bíblicas

Embeds de momentos de series como *The Chosen*, películas como
*La Pasión de Cristo*, *Jesús de Nazaret*, etc.

- **Conflicto legal**: la mayor parte tiene copyright vigente.
  Aunque YouTube permite embeds, el clip puede desaparecer cuando el
  rights holder lo retire.
- **Excepción viable**: clips oficialmente subidos por el rights
  holder en YouTube (p. ej. el canal oficial de *The Chosen*) son
  legítimos para embebir.
- **Pendiente**: definir política de fuentes audiovisuales
  permitidas.

### Funcionalidades de IA

Resúmenes generados, "explica este pasaje", reconstrucciones
visuales 3D, asistente de estudio…

- **Conflicto con la spec**: §5.2 dice *"Generación de contenido
  por IA (cualquier funcionalidad de IA debe pasar antes por un
  comité editorial)"*.
- **Pendiente**: necesita comité editorial; un solo maintainer no
  alcanza para arbitrar contenido doctrinal generado.

---

## 🛠️ Buenas primeras contribuciones

Si quieres empezar y no sabes por dónde:

- **Bug fixes** en accesibilidad (navega con teclado, lector de
  pantalla) — ver issues etiquetados `a11y`.
- **Mejoras de rendimiento** en el render del mapa (clustering de
  marcadores en chapters densos como Josué 15).
- **Traducción de la UI** a otro idioma.
- **Tests** (hay esqueleto de Vitest, falta cobertura real).
- **Documentación** del código en zonas poco comentadas.

Abre un *issue* describiendo qué quieres hacer **antes** de mandar
una PR grande, para que podamos validar dirección.

---

*Este roadmap es indicativo, no un contrato. Las prioridades pueden
cambiar según licencias bíblicas que se cierren, feedback de uso real
y energía disponible del maintainer. Lo que no cambia son los
[principios editoriales](./README.md#principios-editoriales-no-negociables).*
