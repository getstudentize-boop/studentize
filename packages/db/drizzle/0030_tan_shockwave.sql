CREATE TYPE "public"."aptitude_test_status" AS ENUM('not_started', 'in_progress', 'completed');--> statement-breakpoint
CREATE TABLE "aptitude_test_session" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"student_user_id" text NOT NULL,
	"status" "aptitude_test_status" DEFAULT 'not_started' NOT NULL,
	"current_step" integer DEFAULT 1 NOT NULL,
	"favorite_subjects" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"subject_comfort_levels" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"questions_responses" jsonb DEFAULT '{"questions":[],"answers":[]}'::jsonb NOT NULL,
	"generated_interests" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"recommendations" text,
	"interest_matches" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"careers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_hidden" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX "aptitude_test_session_student_user_id_idx" ON "aptitude_test_session" USING btree ("student_user_id");