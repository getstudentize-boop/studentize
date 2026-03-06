ALTER TABLE "session" ADD COLUMN "rating" integer;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "rating_feedback" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "rated_at" timestamp;