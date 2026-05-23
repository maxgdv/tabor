import {
  pgTable,
  serial,
  text,
  integer,
  jsonb,
  uniqueIndex,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core';

// --- Versiones bíblicas (catálogo de traducciones licenciadas) ---
export const version = pgTable(
  'version',
  {
    id: serial('id').primaryKey(),
    code: text('code').notNull().unique(), // 'BIA', 'NABRE', ...
    language: text('language').notNull(), // 'es', 'en'
    fullName: text('full_name').notNull(),
    copyright: text('copyright').notNull(),
    licenseType: text('license_type').notNull(), // 'licensed' | 'public_domain'
    metadata: jsonb('metadata'),
  },
  (t) => ({
    byLanguage: index('version_language_idx').on(t.language),
  }),
);

// --- Libros del canon (independiente de versión) ---
export const book = pgTable(
  'book',
  {
    id: serial('id').primaryKey(),
    canonicalId: text('canonical_id').notNull().unique(), // 'GEN', 'EXO', 'MAT', ...
    testament: text('testament').notNull(), // 'OT' | 'NT'
    category: text('category').notNull(), // 'pentateuch', 'gospels', ...
    orderIndex: integer('order_index').notNull(),
  },
  (t) => ({
    byOrder: uniqueIndex('book_order_idx').on(t.orderIndex),
  }),
);

// --- Nombre del libro en cada versión (Génesis / Genesis / ...) ---
export const bookTranslation = pgTable(
  'book_translation',
  {
    bookId: integer('book_id')
      .notNull()
      .references(() => book.id, { onDelete: 'cascade' }),
    versionId: integer('version_id')
      .notNull()
      .references(() => version.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    shortName: text('short_name').notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.bookId, t.versionId] }),
  }),
);

// --- Capítulos (compartidos por todas las versiones del canon) ---
export const chapter = pgTable(
  'chapter',
  {
    id: serial('id').primaryKey(),
    bookId: integer('book_id')
      .notNull()
      .references(() => book.id, { onDelete: 'cascade' }),
    number: integer('number').notNull(),
  },
  (t) => ({
    byBookNumber: uniqueIndex('chapter_book_number_idx').on(t.bookId, t.number),
  }),
);

// --- Versículos (slot canónico; el texto vive en verse_text) ---
export const verse = pgTable(
  'verse',
  {
    id: serial('id').primaryKey(),
    chapterId: integer('chapter_id')
      .notNull()
      .references(() => chapter.id, { onDelete: 'cascade' }),
    number: integer('number').notNull(),
  },
  (t) => ({
    byChapterNumber: uniqueIndex('verse_chapter_number_idx').on(t.chapterId, t.number),
  }),
);

// --- Texto del versículo por versión ---
export const verseText = pgTable(
  'verse_text',
  {
    verseId: integer('verse_id')
      .notNull()
      .references(() => verse.id, { onDelete: 'cascade' }),
    versionId: integer('version_id')
      .notNull()
      .references(() => version.id, { onDelete: 'cascade' }),
    text: text('text').notNull(),
    footnotes: jsonb('footnotes'),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.verseId, t.versionId] }),
  }),
);
