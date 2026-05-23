# Tabor

> La Biblia, lugar a lugar.

Aplicación web que permite leer la Biblia mientras un mapa interactivo sitúa, en tiempo real, los lugares donde sucede cada pasaje.

Especificación técnica completa: [`Tabor_Especificacion_Tecnica_v1.1.pdf`](./Tabor_Especificacion_Tecnica_v1.1.pdf).

## Estructura del monorepo

```
TABOR/
├── apps/
│   └── web/         # Next.js 15 + React 19 (frontend + BFF)
├── packages/
│   └── db/          # Esquema Drizzle ORM, migraciones, seed
├── docker-compose.yml
├── .env.example
└── package.json     # workspaces npm
```

## Stack

- **Frontend**: Next.js 16 (App Router, Turbopack) + React 19.2 + TypeScript + Tailwind CSS 4
- **i18n**: next-intl 4 (es, en)
- **Estado UI**: Zustand 5
- **Mapa**: MapLibre GL JS *(Fase 1)*
- **API**: Next.js Route Handlers (REST público) + tRPC (interno) — *Fase 1*
- **Base de datos**: PostgreSQL 16 + PostGIS, Drizzle ORM
- **Búsqueda**: Meilisearch
- **Node**: 22 LTS

> La especificación v1.1 recomienda Next.js 15; el bootstrap usa Next 16 (estable, sucesor directo)
> manteniendo App Router, React Server Components y todos los principios de la spec.
> La capa de routing equivalente al `middleware.ts` se llama ahora `proxy.ts`
> (renombrado en Next 16).

## Requisitos previos

- Node.js ≥ 22
- npm ≥ 10
- Docker + Docker Compose

## Puesta en marcha

```bash
# 1. Instalar dependencias del monorepo
npm install

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Arrancar Postgres + PostGIS + Meilisearch
npm run db:up

# 4. Aplicar migraciones e insertar seed inicial
npm run --workspace packages/db migrate
npm run --workspace packages/db seed

# 5. Arrancar la app web
npm run dev
# → http://localhost:3000
```

## Scripts útiles

| Script              | Qué hace                                          |
|---------------------|---------------------------------------------------|
| `npm run dev`       | Servidor de desarrollo Next.js                    |
| `npm run build`     | Compila todos los workspaces                      |
| `npm run lint`      | Lint en todos los workspaces                      |
| `npm run typecheck` | Comprobación de tipos en todos los workspaces     |
| `npm run db:up`     | Levanta Postgres + Meilisearch (Docker)           |
| `npm run db:down`   | Para los contenedores                             |
| `npm run db:logs`   | Sigue los logs de Postgres + Meilisearch          |

## Estado

**Fase 0 — Preparación.** Scaffold inicial; el lector y mapa llegan en Fase 1.

Ver §20 de la especificación para el roadmap completo.

---

© 2026 Proyecto Tabor — documento confidencial, uso interno.
