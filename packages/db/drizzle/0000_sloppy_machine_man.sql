CREATE TABLE IF NOT EXISTS "book" (
	"id" serial PRIMARY KEY NOT NULL,
	"canonical_id" text NOT NULL,
	"testament" text NOT NULL,
	"category" text NOT NULL,
	"order_index" integer NOT NULL,
	CONSTRAINT "book_canonical_id_unique" UNIQUE("canonical_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "book_translation" (
	"book_id" integer NOT NULL,
	"version_id" integer NOT NULL,
	"name" text NOT NULL,
	"short_name" text NOT NULL,
	CONSTRAINT "book_translation_book_id_version_id_pk" PRIMARY KEY("book_id","version_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chapter" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" integer NOT NULL,
	"number" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verse" (
	"id" serial PRIMARY KEY NOT NULL,
	"chapter_id" integer NOT NULL,
	"number" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verse_text" (
	"verse_id" integer NOT NULL,
	"version_id" integer NOT NULL,
	"text" text NOT NULL,
	"footnotes" jsonb,
	CONSTRAINT "verse_text_verse_id_version_id_pk" PRIMARY KEY("verse_id","version_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "version" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"language" text NOT NULL,
	"full_name" text NOT NULL,
	"copyright" text NOT NULL,
	"license_type" text NOT NULL,
	"metadata" jsonb,
	CONSTRAINT "version_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"period_id" integer,
	"description" text,
	CONSTRAINT "event_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_place" (
	"event_id" integer NOT NULL,
	"place_id" integer NOT NULL,
	"role" text,
	CONSTRAINT "event_place_event_id_place_id_pk" PRIMARY KEY("event_id","place_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "map_layer" (
	"id" serial PRIMARY KEY NOT NULL,
	"period_id" integer NOT NULL,
	"type" text NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "period" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"start_year" integer NOT NULL,
	"end_year" integer NOT NULL,
	"description" text,
	CONSTRAINT "period_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "person" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	CONSTRAINT "person_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "place" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"canonical_name" text NOT NULL,
	"description" text,
	"modern_name" text,
	"modern_country" text,
	"geom" "geography",
	CONSTRAINT "place_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "place_alternate_name" (
	"id" serial PRIMARY KEY NOT NULL,
	"place_id" integer NOT NULL,
	"language" text NOT NULL,
	"name" text NOT NULL,
	"source" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "place_period_geometry" (
	"place_id" integer NOT NULL,
	"period_id" integer NOT NULL,
	"geom" "geography" NOT NULL,
	CONSTRAINT "place_period_geometry_place_id_period_id_pk" PRIMARY KEY("place_id","period_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verse_event" (
	"verse_id" integer NOT NULL,
	"event_id" integer NOT NULL,
	CONSTRAINT "verse_event_verse_id_event_id_pk" PRIMARY KEY("verse_id","event_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verse_location" (
	"verse_id" integer NOT NULL,
	"place_id" integer NOT NULL,
	"confidence" smallint NOT NULL,
	"source" text,
	CONSTRAINT "verse_location_verse_id_place_id_pk" PRIMARY KEY("verse_id","place_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" "citext" NOT NULL,
	"password_hash" text,
	"display_name" text,
	"locale" text DEFAULT 'es' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "app_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bookmark" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"verse_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "donation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"stripe_pi_id" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text NOT NULL,
	"recurring" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "donation_stripe_pi_id_unique" UNIQUE("stripe_pi_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "highlight" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"start_verse_id" integer NOT NULL,
	"end_verse_id" integer NOT NULL,
	"color" text NOT NULL,
	"label" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "note" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"start_verse_id" integer NOT NULL,
	"end_verse_id" integer NOT NULL,
	"body_md" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book_translation" ADD CONSTRAINT "book_translation_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book_translation" ADD CONSTRAINT "book_translation_version_id_version_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."version"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chapter" ADD CONSTRAINT "chapter_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "verse" ADD CONSTRAINT "verse_chapter_id_chapter_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapter"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "verse_text" ADD CONSTRAINT "verse_text_verse_id_verse_id_fk" FOREIGN KEY ("verse_id") REFERENCES "public"."verse"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "verse_text" ADD CONSTRAINT "verse_text_version_id_version_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."version"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event" ADD CONSTRAINT "event_period_id_period_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."period"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_place" ADD CONSTRAINT "event_place_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_place" ADD CONSTRAINT "event_place_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "map_layer" ADD CONSTRAINT "map_layer_period_id_period_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."period"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "place_alternate_name" ADD CONSTRAINT "place_alternate_name_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "place_period_geometry" ADD CONSTRAINT "place_period_geometry_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "place_period_geometry" ADD CONSTRAINT "place_period_geometry_period_id_period_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."period"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "verse_event" ADD CONSTRAINT "verse_event_verse_id_verse_id_fk" FOREIGN KEY ("verse_id") REFERENCES "public"."verse"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "verse_event" ADD CONSTRAINT "verse_event_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "verse_location" ADD CONSTRAINT "verse_location_verse_id_verse_id_fk" FOREIGN KEY ("verse_id") REFERENCES "public"."verse"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "verse_location" ADD CONSTRAINT "verse_location_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_verse_id_verse_id_fk" FOREIGN KEY ("verse_id") REFERENCES "public"."verse"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "donation" ADD CONSTRAINT "donation_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "highlight" ADD CONSTRAINT "highlight_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "highlight" ADD CONSTRAINT "highlight_start_verse_id_verse_id_fk" FOREIGN KEY ("start_verse_id") REFERENCES "public"."verse"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "highlight" ADD CONSTRAINT "highlight_end_verse_id_verse_id_fk" FOREIGN KEY ("end_verse_id") REFERENCES "public"."verse"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "note" ADD CONSTRAINT "note_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "note" ADD CONSTRAINT "note_start_verse_id_verse_id_fk" FOREIGN KEY ("start_verse_id") REFERENCES "public"."verse"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "note" ADD CONSTRAINT "note_end_verse_id_verse_id_fk" FOREIGN KEY ("end_verse_id") REFERENCES "public"."verse"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "book_order_idx" ON "book" USING btree ("order_index");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "chapter_book_number_idx" ON "chapter" USING btree ("book_id","number");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "verse_chapter_number_idx" ON "verse" USING btree ("chapter_id","number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "version_language_idx" ON "version" USING btree ("language");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "place_slug_idx" ON "place" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verse_location_verse_idx" ON "verse_location" USING btree ("verse_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verse_location_place_idx" ON "verse_location" USING btree ("place_id");