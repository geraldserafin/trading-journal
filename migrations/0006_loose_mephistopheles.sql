DO $$ BEGIN
 CREATE TYPE "public"."provider" AS ENUM('google', 'email');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "provider" "provider" DEFAULT 'email' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "provider_id" text;