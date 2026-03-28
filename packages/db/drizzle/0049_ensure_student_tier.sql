DO $$ BEGIN
	CREATE TYPE "public"."tier_type" AS ENUM('FREE', 'PAID');
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
ALTER TABLE "student" ADD COLUMN IF NOT EXISTS "tier" "tier_type" DEFAULT 'FREE' NOT NULL;
