ALTER TABLE "student" ADD COLUMN "study_curriculum" text;--> statement-breakpoint
ALTER TABLE "student" ADD COLUMN "expected_graduation_year" text;--> statement-breakpoint
ALTER TABLE "student" ADD COLUMN "target_countries" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "student" ADD COLUMN "areas_of_interest" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "student" ADD COLUMN "extracurricular" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "student" DROP COLUMN "grade_level";--> statement-breakpoint
ALTER TABLE "student" DROP COLUMN "academic_performance";--> statement-breakpoint
ALTER TABLE "student" DROP COLUMN "test_scores";--> statement-breakpoint
ALTER TABLE "student" DROP COLUMN "primary_academic_interests";--> statement-breakpoint
ALTER TABLE "student" DROP COLUMN "application_stage";--> statement-breakpoint
ALTER TABLE "student" DROP COLUMN "main_extracurriculars";--> statement-breakpoint
ALTER TABLE "student" DROP COLUMN "target";