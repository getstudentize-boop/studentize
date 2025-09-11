ALTER TABLE "advisor_student_access" ADD COLUMN "advisor_user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "advisor_student_access" DROP COLUMN "advisor_id";