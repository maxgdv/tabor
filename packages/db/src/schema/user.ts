import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  customType,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { verse } from './bible';

// CITEXT — emails case-insensitive según §11.3 de la spec.
const citext = customType<{ data: string }>({
  dataType() {
    return 'citext';
  },
});

export const appUser = pgTable('app_user', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  email: citext('email').notNull().unique(),
  passwordHash: text('password_hash'),
  displayName: text('display_name'),
  locale: text('locale').notNull().default('es'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const bookmark = pgTable('bookmark', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .notNull()
    .references(() => appUser.id, { onDelete: 'cascade' }),
  verseId: integer('verse_id')
    .notNull()
    .references(() => verse.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

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
