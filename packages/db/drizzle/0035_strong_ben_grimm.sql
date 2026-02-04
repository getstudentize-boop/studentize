ALTER TABLE "student" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "student" ADD COLUMN "referral_source" text;--> statement-breakpoint
ALTER TABLE "student" ADD COLUMN "support_areas" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "student" ADD COLUMN "onboarding_completed" boolean DEFAULT false NOT NULL;