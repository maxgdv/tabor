# Tabor

> *La Biblia, lugar a lugar.*

Aplicación web que permite leer la Biblia mientras un mapa interactivo
sitúa, en tiempo real, los lugares donde sucede cada pasaje. Si alguna
vez has leído un pasaje y has querido saber **dónde** ocurría, Tabor
es la herramienta que faltaba.

**🌐 Vivo en producción:** [proyectotabor.org](https://proyectotabor.org)

---

## Qué encontrarás

- **Los 73 libros del canon católico** en dos versiones de dominio público:
  - **Biblia Platense** (Straubinger), español
  - **Catholic Public Domain Version** (CPDV), inglés
- **1.335 lugares bíblicos** geolocalizados, con **8.666 vínculos**
  versículo↔lugar (datos de
  [OpenBible.info](https://www.openbible.info/geo/), CC-BY 4.0).
- **Sincronización bidireccional pasaje↔mapa**: a medida que avanzas
  en la lectura el mapa vuela al lugar correspondiente; al pulsar un
  marcador, el texto hace scroll al primer versículo donde aparece.
- **Navegación cómoda**: índice de libros, selector de capítulo,
  prev/next que cruza entre libros, panel lateral.
- **Vista satélite** opcional (Esri World Imagery).
- **Multilenguaje** (es / en) en la interfaz.
- **Diseño sobrio**, accesibilidad WCAG 2.2 AA como objetivo,
  sin publicidad ni gamificación.

## Principios editoriales (no negociables)

1. **Rigor doctrinal**: solo versiones aprobadas por las conferencias
   episcopales correspondientes (CELAM, CEE, USCCB, Ignatius Press) o
   versiones de dominio público de tradición católica.
2. **Serenidad estética**: sin publicidad, sin gamificación, sin dark
   patterns, sin redes sociales integradas.
3. **Privacidad por diseño**: cuenta opcional, telemetría anónima y
   desactivable, no vendemos datos.
4. **Accesibilidad**: WCAG 2.2 AA como compromiso desde el día uno.
5. **Sostenibilidad sin publicidad**: donativos voluntarios, nada más.

Estos principios son la línea editorial del proyecto; cualquier
contribución debe respetarlos. Ver
[CONTRIBUTING.md](./CONTRIBUTING.md) para detalles.

## Stack

- **Frontend:** Next.js 16 (App Router, Turbopack) + React 19 + TypeScript + Tailwind 4
- **Mapa:** MapLibre GL JS con teselas
  [demotiles.maplibre.org](https://demotiles.maplibre.org) (vectorial)
  y Esri World Imagery (satélite)
- **i18n:** next-intl 4
- **Estado UI:** Zustand 5
- **Backend:** Next.js Route Handlers (REST público) + tRPC (interno) — *en evolución*
- **BD:** PostgreSQL 16 + PostGIS, Drizzle ORM
- **Búsqueda:** Meilisearch *(planificada para Fase 1 final)*
- **Hosting:** Vercel (Hobby) + Supabase (Free) — *coste actual: 0 €/mes*

Ver la [especificación técnica completa](./docs/SPEC.md) para
el roadmap, decisiones arquitectónicas y modelo de datos.

## Estructura del repositorio

```
tabor/
├── apps/web/             Aplicación Next.js (frontend + BFF)
├── packages/db/          Esquema Drizzle, migraciones, importadores
├── docs/SPEC.md          Especificación técnica v1.1
├── docker-compose.yml    Postgres+PostGIS y Meilisearch para desarrollo
└── data/bible-sources/   (gitignored) Fuentes bíblicas descargadas
```

## Arranque en local

### Requisitos

- Node.js ≥ 22
- npm ≥ 10
- Docker + Docker Compose

### Pasos

```bash
# 1. Instalar dependencias del monorepo
npm install

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Levantar Postgres + PostGIS + Meilisearch en local
npm run db:up

# 4. Migrar esquema y sembrar el catálogo de libros
npm run --workspace packages/db migrate
npm run --workspace packages/db seed

# 5. Descargar las fuentes bíblicas (~30 MB)
mkdir -p data/bible-sources
curl -o data/bible-sources/SpaPlatense.json \
  https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/SpaPlatense.json
curl -o data/bible-sources/CPDV.json \
  https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/CPDV.json
curl -o data/bible-sources/ancient.jsonl \
  https://raw.githubusercontent.com/openbibleinfo/Bible-Geocoding-Data/main/data/ancient.jsonl

# 6. Importar texto bíblico y geografía
npm run --workspace packages/db import:bible
npm run --workspace packages/db import:geo

# 7. Arrancar la app
npm run dev
# → http://localhost:3000
```

### Scripts útiles

| Script              | Qué hace                                              |
|---------------------|-------------------------------------------------------|
| `npm run dev`       | Servidor de desarrollo Next.js                        |
| `npm run build`     | Compila todos los workspaces                          |
| `npm run lint`      | Lint en todos los workspaces                          |
| `npm run typecheck` | Comprobación de tipos en todos los workspaces         |
| `npm run db:up`     | Levanta Postgres + Meilisearch (Docker)               |
| `npm run db:down`   | Para los contenedores                                 |

## Fuentes y atribuciones

- **Texto bíblico:**
  - *Biblia Platense* de Mons. Juan Straubinger (dominio público)
  - *Catholic Public Domain Version* de Ronald L. Conte Jr. (dominio público)
- **Datos geográficos:** OpenBible.info Bible Geocoding Data,
  [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/).
  Atribución visible en el pie del lector.
- **Mapas:** Esri World Imagery (satélite, uso no comercial),
  demotiles.maplibre.org (vectorial).

## Contribuir

Lee primero la sección de principios editoriales y luego
[CONTRIBUTING.md](./CONTRIBUTING.md). Las PRs son bienvenidas, pero
las decisiones editoriales (qué versiones bíblicas, qué notas, qué
elementos doctrinales) las mantiene el promotor único del proyecto.

## Licencia

[Apache License 2.0](./LICENSE). Eres libre de usar, modificar y
redistribuir Tabor; te pedimos que mantengas las atribuciones y los
principios editoriales si publicas un derivado con marca o intención
católica.

---

© 2026 Proyecto Tabor. Promovido por Manuel G.
[github.com/maxgdv/tabor](https://github.com/maxgdv/tabor)
