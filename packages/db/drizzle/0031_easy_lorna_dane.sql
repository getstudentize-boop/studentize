CREATE TYPE "public"."membership_role" AS ENUM('OWNER', 'ADMIN', 'MEMBER');--> statement-breakpoint
CREATE TABLE "membership" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"user_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"role" "membership_role" DEFAULT 'MEMBER' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
