import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  customType,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { verse } from './bible';

// CITEXT — emails case-insensitive según §11.3 de la spec.
const citext = customType<{ data: string }>({
  dataType() {
    return 'citext';
  },
});

// El modelo `user` de Better-Auth se mapea sobre esta tabla (ver
// apps/web/src/lib/auth.ts): `name` es el campo que Better-Auth espera,
// aunque la columna física siga llamándose display_name.
export const appUser = pgTable('app_user', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  email: citext('email').notNull().unique(),
  // Legado del esquema inicial: Better-Auth guarda el hash de contraseña en
  // account.password (provider 'credential'), no aquí. Se conserva nullable
  // y sin uso.
  passwordHash: text('password_hash'),
  name: text('display_name'),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  locale: text('locale').notNull().default('es'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// --- Tablas de Better-Auth (sesiones y credenciales) ----------------------

export const session = pgTable(
  'session',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    token: text('token').notNull().unique(),
    userId: uuid('user_id')
      .notNull()
      .references(() => appUser.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('session_user_idx').on(t.userId)],
);

export const account = pgTable(
  'account',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => appUser.id, { onDelete: 'cascade' }),
    // Para 'credential' coincide con user.id; para OAuth futuro, el id externo.
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    scope: text('scope'),
    idToken: text('id_token'),
    // Hash scrypt del login email+contraseña.
    password: text('password'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('account_user_idx').on(t.userId)],
);

export const verification = pgTable(
  'verification',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('verification_identifier_idx').on(t.identifier)],
);

// --- Contenido personal del usuario ---------------------------------------

export const bookmark = pgTable(
  'bookmark',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => appUser.id, { onDelete: 'cascade' }),
    verseId: integer('verse_id')
      .notNull()
      .references(() => verse.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  // Un versículo solo puede marcarse una vez por usuario; el toggle se apoya
  // en este índice para ser inmune a dobles clicks concurrentes.
  (t) => [uniqueIndex('bookmark_user_verse_idx').on(t.userId, t.verseId)],
);

export const highlight = pgTable('highlight', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .notNull()
    .references(() => appUser.id, { onDelete: 'cascade' }),
  startVerseId: integer('start_verse_id')
    .notNull()
    .references(() => verse.id),
  endVerseId: integer('end_verse_id')
    .notNull()
    .references(() => verse.id),
  color: text('color').notNull(),
  label: text('label'),
});

export const note = pgTable('note', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .notNull()
    .references(() => appUser.id, { onDelete: 'cascade' }),
  startVerseId: integer('start_verse_id')
    .notNull()
    .references(() => verse.id),
  endVerseId: integer('end_verse_id')
    .notNull()
    .references(() => verse.id),
  bodyMd: text('body_md').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const donation = pgTable('donation', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => appUser.id, { onDelete: 'set null' }),
  stripePiId: text('stripe_pi_id').notNull().unique(),
  amountCents: integer('amount_cents').notNull(),
  currency: text('currency').notNull(),
  recurring: boolean('recurring').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
