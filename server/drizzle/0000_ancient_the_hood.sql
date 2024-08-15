CREATE TABLE IF NOT EXISTS "levels" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "levels_to_users" (
	"user_id" integer NOT NULL,
	"level_id" integer NOT NULL,
	CONSTRAINT "levels_to_users_user_id_level_id_pk" PRIMARY KEY("user_id","level_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" integer PRIMARY KEY NOT NULL,
	"username" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "levels_to_users" ADD CONSTRAINT "levels_to_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "levels_to_users" ADD CONSTRAINT "levels_to_users_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
