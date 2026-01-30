CREATE TYPE "public"."organization_status" AS ENUM('ACTIVE', 'INACTIVE', 'PENDING');--> statement-breakpoint
ALTER TABLE "organization" DROP CONSTRAINT "organization_slug_unique";--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "status" "organization_status" DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "slug";