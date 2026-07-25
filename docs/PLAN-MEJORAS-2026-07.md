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

### 2. Planes para estados de ánimo y situaciones — PENDIENTE
- [ ] Modelo: distinguir plan «itinerario» de plan «situación» sin
      romper `plan_progress` (la clave sigue siendo el slug).
- [ ] 12 planes cortos (3-7 días) con nota pastoral.
- [ ] Índice `/planes` reorganizado en secciones.
- [ ] Tests + SEO + sitemap.

### 3. Más planes de lectura clásicos — PENDIENTE
- [ ] Ampliar el catálogo de itinerarios (sabiduría, profetas, cartas,
      Pentateuco…), respetando la numeración greco-latina de los salmos.

### 4. Más rutas en el mapa — PENDIENTE
- [ ] De 13 a ~20 rutas, cada `placeSlug` verificado contra la BD.

### 5. Móvil: UX + PWA — PENDIENTE
- [ ] Lector adaptativo (texto a pantalla completa, mapa plegable).
- [ ] Áreas táctiles ≥44 px, `safe-area-inset`, tipografía móvil.
- [ ] Navegación de capítulo cómoda con el pulgar.
- [ ] `viewport` + `themeColor` (hoy no existen), `manifest.ts`, iconos.
- [ ] Verificación real en viewport móvil.

### 6. Cierre — PENDIENTE
- [ ] `/security-review` sobre el diff acumulado.
- [ ] Resumen al promotor y **espera de luz verde** para push.
- [ ] Tras el OK: push, verificar deploy, ping IndexNow con las URLs
      nuevas (`api.indexnow.org` + `bing.com`; Google no lo usa).

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
