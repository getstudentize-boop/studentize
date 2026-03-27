CREATE TYPE "public"."tier_type" AS ENUM('FREE', 'PAID');--> statement-breakpoint
ALTER TABLE "student" ADD COLUMN "tier" "tier_type" DEFAULT 'FREE' NOT NULL;