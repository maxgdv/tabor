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

### 1. Versículo del día — PENDIENTE
- [ ] `apps/web/src/lib/verse-of-day.ts`: pool curado (366) + selección
      determinista por fecha + override por tiempo litúrgico
      (reutiliza `lib/liturgical.ts`).
- [ ] Página `/[locale]/versiculo-del-dia` con SEO propio y OG.
- [ ] Tarjeta en la portada enlazando al lector en el pasaje exacto.
- [ ] Tests: determinismo, cobertura del pool, refs válidas contra
      `BOOK_META`, override litúrgico.
- [ ] Sitemap.

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
- pool del versículo del día
