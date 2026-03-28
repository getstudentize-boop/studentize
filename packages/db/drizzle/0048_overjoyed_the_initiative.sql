ALTER TABLE "virtual_advisor_message" ALTER COLUMN "text" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "university_shortlist" ADD COLUMN IF NOT EXISTS "virtual_advisor_session_id" text;--> statement-breakpoint
ALTER TABLE "virtual_advisor_message" ADD COLUMN IF NOT EXISTS "metadata" jsonb;