ALTER TABLE "sessions" ADD COLUMN "pending" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "two_factor_secret" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "two_factor_enabled" boolean DEFAULT true NOT NULL;