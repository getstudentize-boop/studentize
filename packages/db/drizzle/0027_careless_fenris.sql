DO $$ BEGIN CREATE TYPE "public"."task_category" AS ENUM('profile_building', 'essay_writing', 'university_research', 'exams', 'sat_act', 'other'); EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high'); EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."task_status" AS ENUM('pending', 'in_progress', 'completed'); EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
CREATE TABLE "student_task" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"student_user_id" text NOT NULL,
	"assigned_by_user_id" text,
	"title" text NOT NULL,
	"description" text,
	"due_date" timestamp,
	"status" "task_status" DEFAULT 'pending' NOT NULL,
	"priority" "task_priority" DEFAULT 'medium' NOT NULL,
	"category" "task_category" NOT NULL,
	"custom_category" text,
	"completed_at" timestamp
);
EXCEPTION WHEN duplicate_table THEN null;
END $$;