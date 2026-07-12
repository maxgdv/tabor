-- Búsqueda de texto libre en Postgres (fallback de producción cuando no hay
-- Meilisearch). Índices de expresión con config fija por idioma: el planner
-- solo los usa si la consulta repite exactamente la misma expresión, por eso
-- searchVersesFts inyecta 'spanish'/'english' como literal, nunca como
-- parámetro. Cada índice cubre todas las filas (indexar la versión del otro
-- idioma con el stemmer equivocado es inocuo: nunca se consulta así).
CREATE INDEX IF NOT EXISTS "verse_text_fts_spanish_idx" ON "verse_text" USING gin (to_tsvector('spanish', "text"));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verse_text_fts_english_idx" ON "verse_text" USING gin (to_tsvector('english', "text"));
