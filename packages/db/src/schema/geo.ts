import {
  pgTable,
  serial,
  text,
  integer,
  smallint,
  jsonb,
  customType,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core';
import { verse } from './bible';

// PostGIS GEOGRAPHY no está incluido nativamente en drizzle-orm.
// Lo modelamos como tipo personalizado serializado a texto (WKT/GeoJSON gestionado por la app).
const geography = customType<{ data: string; driverData: string }>({
  dataType() {
    return 'geography';
  },
});

// --- Lugares bíblicos ---
export const place = pgTable(
  'place',
  {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    canonicalName: text('canonical_name').notNull(),
    description: text('description'),
    modernName: text('modern_name'),
    modernCountry: text('modern_country'),
    // GEOGRAPHY(POINT, 4326) — representación canónica del lugar.
    geom: geography('geom'),
  },
  (t) => ({
    bySlug: index('place_slug_idx').on(t.slug),
  }),
);

export const placeAlternateName = pgTable('place_alternate_name', {
  id: serial('id').primaryKey(),
  placeId: integer('place_id')
    .notNull()
    .references(() => place.id, { onDelete: 'cascade' }),
  language: text('language').notNull(),
  name: text('name').notNull(),
  source: text('source'),
});

// --- Periodos históricos ---
export const period = pgTable('period', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  startYear: integer('start_year').notNull(), // negativo = a.C.
  endYear: integer('end_year').notNull(),
  description: text('description'),
});

// --- Geometría de un lugar en un periodo concreto (frontera política, extensión...) ---
export const placePeriodGeometry = pgTable(
  'place_period_geometry',
  {
    placeId: integer('place_id')
      .notNull()
      .references(() => place.id, { onDelete: 'cascade' }),
    periodId: integer('period_id')
      .notNull()
      .references(() => period.id, { onDelete: 'cascade' }),
    geom: geography('geom').notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.placeId, t.periodId] }),
  }),
);

// --- Capas cartográficas (reinos, rutas, episodios) ---
export const mapLayer = pgTable('map_layer', {
  id: serial('id').primaryKey(),
  periodId: integer('period_id')
    .notNull()
    .references(() => period.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'kingdom' | 'route' | 'episode'
  data: jsonb('data').notNull(), // GeoJSON
});

// --- Eventos bíblicos ---
export const event = pgTable('event', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  periodId: integer('period_id').references(() => period.id, { onDelete: 'set null' }),
  description: text('description'),
});

export const eventPlace = pgTable(
  'event_place',
  {
    eventId: integer('event_id')
      .notNull()
      .references(() => event.id, { onDelete: 'cascade' }),
    placeId: integer('place_id')
      .notNull()
      .references(() => place.id, { onDelete: 'cascade' }),
    role: text('role'), // 'origin' | 'destination' | 'venue' | ...
  },
  (t) => ({
    pk: primaryKey({ columns: [t.eventId, t.placeId] }),
  }),
);

// --- Personajes ---
export const person = pgTable('person', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
});

// --- Enlaces vers�culo→lugar/evento (corazón del producto) ---
export const verseLocation = pgTable(
  'verse_location',
  {
    verseId: integer('verse_id')
      .notNull()
      .references(() => verse.id, { onDelete: 'cascade' }),
    placeId: integer('place_id')
      .notNull()
      .references(() => place.id, { onDelete: 'cascade' }),
    confidence: smallint('confidence').notNull(), // 1..5
    source: text('source'),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.verseId, t.placeId] }),
    byVerse: index('verse_location_verse_idx').on(t.verseId),
    byPlace: index('verse_location_place_idx').on(t.placeId),
  }),
);

export const verseEvent = pgTable(
  'verse_event',
  {
    verseId: integer('verse_id')
      .notNull()
      .references(() => verse.id, { onDelete: 'cascade' }),
    eventId: integer('event_id')
      .notNull()
      .references(() => event.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.verseId, t.eventId] }),
  }),
);
