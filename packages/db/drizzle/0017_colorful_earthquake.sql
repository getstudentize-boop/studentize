ALTER TABLE "scheduled_session" RENAME COLUMN "meeting_link" TO "meeting_code";--> statement-breakpoint
ALTER TABLE "scheduled_session" ADD COLUMN "bot_id" text;