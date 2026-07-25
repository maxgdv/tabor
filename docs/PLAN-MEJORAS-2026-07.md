# Plan de mejoras — julio 2026

Trabajo iterativo acordado con el promotor el 2026-07-24. Cada iteración
es una porción desplegable: se implementa, se prueba, se pasa revisión de
seguridad y se commitea en local. **No se hace push sin luz verde del
promotor.**

## Decisiones cerradas (2026-07-24)

- **Versículo del día**: pool curado determinista por fecha, versionado en
  git. Mismo versículo para todos, sin BD, con override por tiempo
  litúrgico. No es el leccionario de la misa (no hay fuente PD
  estructurada) y no es aleatorio (choca con la serenidad editorial).
- **Planes por estado de ánimo**: set completo (~12) incluyendo duelo,
  ansiedad y enfermedad, **con nota pastoral visible** aclarando que no
  sustituye ayuda profesional ni acompañamiento pastoral.
- **Móvil**: UX adaptativa + PWA instalable (manifest, iconos,
  themeColor, viewport). **Sin service worker offline** — el riesgo de
  servir texto bíblico cacheado obsoleto no compensa.
- **Despliegue**: el loop commitea en local y se detiene antes del push.

## Invariantes que no se tocan

- `packages/db/src/index.ts`: si una petición añade queries paralelas,
  hay que subir `max` del pool. Ver post-mortem 2026-07-19.
- Los salmos citados usan la numeración **greco-latina** de la BD
  (50 = Miserere, 103 = Bendice alma mía, 97 = Cantate Domino).
- Los `canonical_id` de libro van en MAYÚSCULAS (`'JOS'`, `'GEN'`).
- Todo `placeSlug` nuevo se verifica contra la BD antes de commitear.
- Contenido editorial nuevo = BORRADOR pendiente de revisión del
  maintainer; se marca como tal en el fichero.
- Accesibilidad WCAG 2.2 AA: lo ya auditado no se degrada.

## Iteraciones

### 0. Higiene del árbol de trabajo — HECHO
- [x] Borrar `packages/db/pnpm-lock.yaml` y `packages/db/pnpm-workspace.yaml`.
      Resultó ser más gordo: `packages/db/node_modules` era un árbol **pnpm
      completo** (`.pnpm/`, `.modules.yaml`) de un `pnpm install` accidental
      del 22-jul, que sombreaba las dependencias de npm workspaces y podía
      resolver versiones distintas a las de CI y Vercel. Borrado entero y
      reinstalado con npm desde la raíz.
- [x] Commitear el fix editorial de Fihahirot en `routes.ts`.
- [x] Commitear la migración `0005_enable_rls.sql` + journal (RLS ya
      aplicado en prod el 2026-07-22; el fichero deja constancia en git).
- [x] Base verde: typecheck, lint, 154 tests y `next build`.

#### Seguridad de dependencias (no estaba en el plan; salió al reinstalar)

`npm audit` daba 4 HIGH. El importante era **`next`, con 9 avisos que sí
afectan a un sitio público**: bypass de middleware/proxy en App Router,
SSRF en Server Actions y en rewrites, cache confusion de cuerpos de
respuesta, DoS en la optimización de imágenes con SVG y **disclosure no
autenticado de endpoints internos de Server Functions**.

- [x] `next` 16.2.10 → **16.2.11** (última): cierra los 9 avisos propios.
- [x] `postcss` 8.5.17 → **8.5.23** (XSS, path traversal, lectura de
      ficheros vía `sourceMappingURL`).
- [x] `brace-expansion` → parcheado (DoS por expansión exponencial).
- [x] `sharp` 0.34.5 → **0.35.3** (CVEs heredados de libvips). Next lo
      trae como dependencia opcional fijada en 0.34.5 y no hay release
      suya que lo suba: se fuerza con `overrides` en el `package.json`
      raíz **y** se declara como `optionalDependencies` de `apps/web`
      para que no desaparezca del lockfile (sin esto Vercel desplegaría
      sin `sharp`). Revisar en cada subida de Next.

**Riesgo residual aceptado** (1 HIGH + 8 moderadas, ninguno con fix
upstream; `npm audit fix --force` sólo propone bajar a `next@9.3.3` y
`drizzle-kit@0.18.1`, que son downgrades absurdos):

- `postcss@8.4.31` **anidado dentro de Next** (`node_modules/next/node_modules/postcss`):
  copia interna de Next, fijada por él. Sólo actúa en tiempo de build y
  TABOR no procesa CSS de terceros. Se va cuando Next lo suba.
- `esbuild` / `@esbuild-kit/*` vía `drizzle-kit`: dev-only, no viaja al
  bundle de producción.
- `better-auth`: la única corrección ofrecida es bajar de 1.6.23 a 1.4.6.
  No se toca sin leer el aviso concreto.

### 1. Versículo del día — HECHO
- [x] `apps/web/src/lib/verse-of-day.ts`: selección determinista + override
      por tiempo litúrgico. El día de referencia se calcula en
      **Europe/Madrid**: Vercel corre en UTC y el versículo cambiaría a la
      01:00 o 02:00 peninsular.
- [x] `apps/web/src/lib/data/verse-pool.ts`: **382 versículos** curados
      (270 general, 22 adviento, 22 navidad, 28 cuaresma, 12 semana santa,
      28 pascua). Equilibrio AT/NT 44/56.
- [x] `apps/web/src/lib/verse-of-day-content.ts`: capa compartida que
      resuelve el pasaje a texto (memoizada con `React.cache`), para que
      portada y página no dupliquen ni el cálculo ni la query.
- [x] Página `/[locale]/versiculo-del-dia` con SEO propio y OG.
- [x] Tarjeta en la portada + enlace en el pie.
- [x] Tests (163 en total) + sitemap (`daily`, 0.9).

**Referencias verificadas dos veces contra la BD** (una por el agente que
curó el pool, otra independiente): 382/382 existen. Errores de numeración
cazados en esa verificación, que es justo para lo que servía:

- `MAL 3,20` («nacerá el Sol de justicia») **no existe**: Malaquías 3
  termina en el v. 18 en esta edición. El texto está en `MAL 4,2`.
- `JOL 3,1` no es «derramaré mi Espíritu» en STRA (habla de la
  repatriación de los cautivos); el de Pentecostés es `JOL 2,28`.
- Isaías sigue el corte hebreo, no el de la Vulgata: «el pueblo que
  andaba en tinieblas» es `9,2` y «un Niño nos ha nacido», `9,6`.
- Salmos: numeración greco-latina confirmada leyendo el texto real
  (Miserere 50, De profundis 129, «El Señor es mi pastor» 22).

También se descartaron pasajes que fuera de contexto resultan duros o
engañosos (`EZK 34,16` acaba «a las gordas y fuertes las destruiré`;
`JHN 10,10` arranca por el ladrón que viene a degollar; `JDT 9,11` es
imprecatoria). El pool queda marcado como BORRADOR EDITORIAL.

**Para revisión del promotor:**
- El bloque va en portada **encima** del destacado de tiempo litúrgico
  (el versículo cambia a diario; la temporada dura semanas). Intercambiarlos
  es mover dos líneas.
- La página dice explícitamente que **no es la lectura litúrgica del día**.
  Es texto visible, no nota al pie: revisar si el tono encaja.
- Algunos salmos arrastran su encabezado dentro del versículo 1
  («Cántico gradual. De David. Me llené de gozo…»). Es fiel al texto, pero
  en una tarjeta devocional suena a ruido; se puede empezar el rango en el
  versículo siguiente si molesta.
- Citar un versículo suelto a veces deja comillas huérfanas (`… su propia
  pena”.`) por venir de un discurso que empieza antes.

### 2. Planes para estados de ánimo y situaciones — HECHO
- [x] Modelo: `ReadingPlan.kind` ('itinerario' | 'situacion') y
      `PlanReading.verses` opcional. `plan_progress` intacto: la clave
      sigue siendo el slug.
- [x] 12 planes (60 días, 63 lecturas): ansiedad-5, duelo-7,
      enfermedad-5, perdon-5, soledad-5, gratitud-3, decision-5, culpa-5,
      miedo-5, cansancio-5, esperanza-7, alegria-3.
- [x] Nota pastoral en el índice y en cada plan de situación, antes de
      empezar a leer.
- [x] Índice `/planes` en dos secciones («Itinerarios» y «Para lo que
      estás viviendo»), con la jerarquía de encabezados corregida.
- [x] Tests (14 en `plans.test.ts`) + sitemap (automático desde `PLANS`).

**Por qué las lecturas señalan versículos y no capítulos**: a quien está
angustiado se le ofrecen diez versículos, no cuarenta. De ahí el campo
`verses`, que `readingLabel` convierte en «Mateo 6, 25-34» y `readingHref`
en un ancla `#v25`.

**Las 63 lecturas verificadas dos veces contra la BD.** Hallazgos de la
verificación, ambos confirmados de forma independiente:

- **Hechos 7 termina en el versículo 59** en esta edición, y ese versículo
  ya contiene las dos frases de Esteban («recibe mi espíritu» y «no les
  imputes este pecado»). La referencia habitual 7,59-60 habría fallado.
- **Los títulos de los salmos ocupan versículo propio** — dos en el Salmo
  50 («Al maestro de coro» y «Cuando después que pecó con Betsabee»), así
  que el Miserere empieza en 50,3. Todos los rangos de salmos arrancan en
  el v. 2 o posterior.

**Criterio de tono aplicado** (esto es lo que más conviene que revise el
maintainer): se descartaron pasajes que fuera de contexto hacen daño.
1 Pe 5,6-11 en ansiedad, por «el diablo ronda como un león rugiente»;
1 Tes 4,13-18 en duelo, por «que no os contristéis como los demás»;
Mc 4,35-41 y Mt 14,22-33 en miedo, porque rematan en reproche («¿aún no
tenéis fe?»); el Salmo 90 en miedo, porque «mil caerán a tu lado y a ti no
te alcanzará» promete una invulnerabilidad que la vida no siempre cumple;
Eclo 28 en perdón, por amenazante. En enfermedad se recortó el Salmo 6,2
(«no me corrijas en tu furor», que enmarca la enfermedad como castigo) y
se evitaron la hemorroísa y el paralítico, que fuera de contexto se leen
como «si no sanas, te falta fe».

Dos decisiones conservadas a propósito, comentadas en el fichero: «hombres
de poca fe» en Mt 6,30 (ahí funciona *a fortiori*, no como acusación) e
Is 53,4 «le reputamos como herido por Dios» (el sentido del pasaje es
justamente que ese juicio era falso).

### 3. Más rutas en el mapa — HECHO

Adelantada por delante de los planes clásicos a petición del promotor
(2026-07-25).

- [x] De 13 a **20 rutas**. Nuevas: Jacob (9 paradas), José (7), Rut (5),
      Salomón y el Templo (8), Jonás (5, cuaresma), Daniel en Babilonia
      (6) y las siete iglesias del Apocalipsis (8) — esta última dibuja
      un circuito cerrado por Asia Menor, muy vistoso en el mapa.
- [x] **137 placeSlugs (105 únicos) verificados dos veces**: todos existen
      en `place` y **todos tienen coordenadas**, que es lo que de verdad
      rompe el mapa si falla. 162 lecturas dentro de rango.
- [x] Comprobado además, vía `verse_location`, que cada lugar está
      realmente vinculado al pasaje que se cita.
- [x] Renderizado real verificado en local (las siete iglesias resuelven
      sus nombres en español desde la BD).

**Bug preexistente corregido de paso**: la parada de Derbe del primer
viaje de Pablo apuntaba a `ACT 14,20-28`, pero Hechos 14 termina en el
versículo 27 en esta edición. Confirmado contra la BD.

Pendiente para la próxima tanda, recomendado por el agente: **Pedro y los
primeros pasos fuera de Jerusalén** (Hechos 8-12) — es el hueco narrativo
que queda entre los Evangelios y los viajes de Pablo, y todos sus lugares
existen ya con coordenadas.

### 4. Más planes de lectura clásicos — HECHO
- [x] De 12 a **21 itinerarios**. Nuevos: `primeros-pasos-21` (para quien
      nunca ha leído la Biblia), `genesis-25`, `samuel-reyes-34`,
      `salmos-30` (ritmo más vivo que el de 60), `sapienciales-44`,
      `isaias-33`, `jeremias-lamentaciones-29`, `cartas-pablo-50` y
      `cartas-catolicas-apocalipsis-43`.
- [x] **33 planes en total** (21 itinerarios + 12 de situación).

### 5. Móvil: UX + PWA — HECHO (con una verificación pendiente)

El problema de partida: el lector partía la pantalla en 2/3 texto y 1/3
mapa de forma fija, así que en un teléfono **ninguno de los dos usos
quedaba bien** — se leía por una rendija y el mapa era demasiado pequeño
para servir de nada.

- [x] `components/reader/ReaderShell.tsx`: en móvil el texto ocupa la
      pantalla y el mapa es una **hoja deslizante** que sube desde abajo
      (70% del alto, con el texto aún visible arriba, para que el vuelo
      del mapa al versículo activo se siga viendo). En `lg:` el 50/50
      lado a lado no cambia.
- [x] La hoja se oculta con `translate`, **nunca con `display:none`**:
      así el contenedor de MapLibre conserva su tamaño y el canvas no se
      mide a 0 px. Además se avisa al mapa en cada cambio
      (`map/panel-events.ts`) y el mapa observa su contenedor.
- [x] Es un *disclosure*, no un modal: sin scrim ni trampa de foco,
      `aria-expanded` + `aria-controls`, `inert` al estar recogida, y
      Escape devuelve el foco al disparador.
- [x] La barra inferior **nombra el lugar del versículo que se está
      leyendo**, para que la sincronización pasaje↔mapa se perciba aunque
      el mapa esté recogido.
- [x] Áreas táctiles de 44 px (9 controles), `safe-area-inset-bottom`,
      y los botones de zoom de MapLibre agrandados en móvil.
- [x] Prev/next de capítulo también abajo en móvil, al alcance del pulgar,
      sin duplicar landmarks (arriba en escritorio, abajo en móvil).
- [x] `prefers-reduced-motion` respetado en las transiciones nuevas.
- [x] `viewport` + `themeColor` (claro y oscuro), `manifest.ts`, iconos
      192/512/maskable/apple-touch + favicons. **Sin service worker.**
      `start_url: '/es'` para evitar el 307 del proxy de i18n en cada
      apertura de la app instalada; `scope: '/'` para que cambiar a /en
      no se salga de la app.
- [x] Zoom NO bloqueado (`maximumScale`/`userScalable` deliberadamente
      ausentes): impedirlo viola WCAG 1.4.4.
- [x] **Verificado en navegador** con Juan 3 y Josué 15 (163 marcadores):
      la barra inferior cae exactamente en el borde de la ventana, el mapa
      se convoca sin deformación (canvas 485×362 CSS con buffer 606×452 a
      dpr 1,25 — desviación de proporción < 0,002 al abrir, al pasar a
      escritorio y al volver), Escape recoge y devuelve el foco, `inert`
      impide enfocar dentro cuando está recogida, y el escritorio queda
      intacto. **axe-core** (WCAG 2.0/2.1/2.2 AA + best-practice) con la
      hoja abierta y cerrada: sólo la violación **preexistente**
      `aria-allowed-role` en `#book-sidebar`, ajena a este trabajo.
- [ ] **Matiz de la verificación**: Chrome impone un ancho mínimo de
      ventana de ~500 px y no había emulación de dispositivo, así que se
      probó a 502 px y no a 390. Todos los breakpoints en juego son
      `< 640`, o sea el mismo camino de código, pero **un teléfono real
      sigue sin haberlo visto**. Tampoco se pudo emular
      `prefers-reduced-motion` (la regla CSS sí se sirve).

**Hallazgo de bulto durante la verificación**: la cabecera del sitio mide
~109 px en móvil, no los 64 que suponía la resta fija en CSS, así que la
barra del pulgar quedaba 48 px por debajo del pliegue. `ReaderShell` mide
ahora el alto disponible en cliente y reobserva la cabecera y los eventos
`resize`/`orientationchange`, con la clase CSS de siempre como reserva —
lo que además sigue a la barra de direcciones del móvil mejor que `100dvh`.

**Limitaciones conocidas que quedan** (menores, ninguna bloqueante):

- El enlace profundo `#v13` aún desplaza la página unos 89 px: no corta
  nada (la barra sigue visible), pero no es limpio. Se arreglaría
  quitando los `id="v{n}"`, que ya sólo sirven de ancla.
- Con la hoja abierta, la barra de acciones del versículo queda tapada
  por ella. Sólo aparece con sesión iniciada, así que no se pudo probar
  en vivo.
- Las pastillas de «Comparar» quedaron en 26 px y no en 44: a 44 la
  cabecera del capítulo se comía dos filas. Pasan el `target-size` de axe.

**Bugs reales de móvil encontrados y corregidos** (no estaban en el plan):

- La cabecera se **desbordaba** entre 320 y 375 px: los tres grupos no
  caben en una fila, el contenedor central quedaba en 0 px y el buscador
  se salía por encima del selector de idioma, tapándolo (medido:
  `input.right = 179` vs `select.left = 146`).
- **Ninguna** área táctil de la cabecera llegaba a 44×44: hamburguesa
  36×36, rótulo 58×28, selector de idioma 86×30, «Entrar» 53×32.
- Los botones de zoom de MapLibre necesitaban doble selector:
  `maplibre-gl.css` se inyecta después de nuestra hoja y ganaba.
- `ListenControls` devolvía un `[]` nuevo en cada llamada del snapshot de
  servidor de `useSyncExternalStore`, lo que dispara el aviso de posible
  bucle infinito de React.

**Para revisión del promotor:**

- El **icono** es una marca creada de cero (el proyecto no tenía logo):
  la cúpula del Tabor sobre la línea del llano, con una aureola que pasa
  sobre la cima, en el degradado lapislázuli que ya usaba la imagen OG.
  A tamaño pequeño puede leerse de más de una forma; es tu marca.
- **Chrome en Android no mostrará el aviso automático de instalación**:
  `beforeinstallprompt` no dispara sin service worker. La instalación
  sigue disponible desde el menú → «Instalar aplicación», y arranca en
  standalone con icono y tema correctos. En iOS («Añadir a inicio») y en
  escritorio funciona igual. Es el precio de no cachear, que era la
  decisión tomada.
- **Quien instale desde `/en` arrancará en `/es`** y tendrá que cambiar
  el idioma una vez: el manifiesto no se puede localizar.

**Limpieza**: un agente dejó `apps/web/public/__axe.js` (550 kB de
axe-core) al verificar accesibilidad. Estaba sin versionar y sin ignorar,
así que un `git add -A` lo habría publicado en el dominio. Borrado.

### 6. Cierre — ESPERANDO LUZ VERDE
- [x] `/security-review` sobre el diff acumulado: **cero hallazgos**.
      Ningún route handler, server action, comprobación de autenticación,
      redirección ni construcción de SQL nuevos; el único valor dinámico
      es un `locale` validado contra una lista de dos elementos. Se
      verificó además que la migración RLS cubre las 25 tablas existentes
      y que las 52 entradas nuevas del lockfile vienen del registro
      oficial con hash de integridad.
- [ ] **Espera de luz verde del promotor para el push.**
- [ ] Tras el OK: push, verificar deploy, ping IndexNow con las URLs
      nuevas (`api.indexnow.org` + `bing.com`; Google no lo usa).

URLs nuevas para el ping de IndexNow tras desplegar: `/es` y `/en` de
`versiculo-del-dia`, de las 7 rutas nuevas y de los 21 planes nuevos
(12 de situación + 9 itinerarios) — 2 × (1 + 7 + 21) = **58 URLs**.

## Revisiones editoriales pendientes del maintainer

Se acumulan; el loop no las resuelve, sólo las anota.

- 12 planes previos + los nuevos de esta tanda
- 18 obras de arte sacro
- asignación de épocas por libro
- 13 rutas previas + las nuevas
- pool del versículo del día (382 entradas)

## Deuda técnica detectada de paso

- **Formato**: 53 ficheros ya comiteados no cumplen la config de prettier
  actual (`prettier-plugin-tailwindcss` reordena clases con criterio v4).
  No se toca dentro de commits de funcionalidad porque enterraría el diff
  real; merece un commit de formato propio. CI no lo comprueba.
- **`revalidate` inerte**: `[locale]/layout.tsx` declara `force-dynamic`
  por el `listBooks()` del header, y eso arrastra todo el árbol. Envolver
  ese query en `unstable_cache` haría cacheables las páginas que no
  dependen de la sesión.
