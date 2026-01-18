DROP TABLE "academic_year" CASCADE;--> statement-breakpoint
DROP TABLE "course" CASCADE;--> statement-breakpoint
DROP TABLE "gpa_record" CASCADE;--> statement-breakpoint
DROP TABLE "grade" CASCADE;--> statement-breakpoint
DROP TABLE "grade_scale" CASCADE;--> statement-breakpoint
DROP TABLE "term_grade" CASCADE;--> statement-breakpoint
ALTER TABLE "student" ADD COLUMN "grades" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
DROP TYPE "public"."curriculum_type";--> statement-breakpoint
DROP TYPE "public"."subject_category";--> statement-breakpoint
DROP TYPE "public"."term_type";