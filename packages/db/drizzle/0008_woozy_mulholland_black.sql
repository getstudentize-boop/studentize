ALTER TABLE "advisor_student_access" ADD COLUMN "student_user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "advisor_student_access" DROP COLUMN "student_id";