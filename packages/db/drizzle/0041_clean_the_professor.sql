ALTER TABLE "virtual_advisor_message" ALTER COLUMN "text" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "virtual_advisor_message" ADD COLUMN "metadata" jsonb;