-- Activa Row-Level Security en todas las tablas de `public`.
-- Sin políticas: deny-all para los roles `anon` y `authenticated` de la API
-- REST de Supabase (PostgREST), que TABOR no usa. La app no se ve afectada:
-- Drizzle conecta como el rol propietario de las tablas, y el propietario
-- omite RLS salvo que se declare FORCE (que aquí NO se declara a propósito).
ALTER TABLE "version" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "book" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "book_translation" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "chapter" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "verse" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "verse_text" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "place" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "place_alternate_name" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "period" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "place_period_geometry" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "map_layer" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "event" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "event_place" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "person" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "verse_location" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "verse_event" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "app_user" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "verification" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "bookmark" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "plan_progress" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "highlight" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "note" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "donation" ENABLE ROW LEVEL SECURITY;
