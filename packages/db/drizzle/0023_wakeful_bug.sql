CREATE TYPE "public"."status_type" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
ALTER TABLE "student" ADD COLUMN "status" "status_type" DEFAULT 'ACTIVE';