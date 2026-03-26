CREATE TYPE "public"."course_category_type" AS ENUM('MATHEMATICS', 'SCIENCE', 'ENGLISH', 'SOCIAL_STUDIES', 'LANGUAGE', 'ARTS', 'PHYSICAL_EDUCATION', 'COMPUTER_SCIENCE', 'BUSINESS', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."curriculum_type" AS ENUM('US_HIGH_SCHOOL', 'AP', 'IB', 'A_LEVELS', 'GCSE', 'MYP', 'ICSE', 'CBSE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."standardized_test_type" AS ENUM('SAT', 'ACT', 'PSAT', 'AP_EXAM', 'IB_EXAM', 'IELTS', 'TOEFL', 'DUOLINGO', 'SAT_SUBJECT', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."term_type" AS ENUM('SEMESTER_1', 'SEMESTER_2', 'TRIMESTER_1', 'TRIMESTER_2', 'TRIMESTER_3', 'QUARTER_1', 'QUARTER_2', 'QUARTER_3', 'QUARTER_4', 'YEAR');--> statement-breakpoint
CREATE TABLE "academic_year" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"student_id" text NOT NULL,
	"name" text NOT NULL,
	"year" integer NOT NULL,
	"curriculum" "curriculum_type" NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"is_active" text DEFAULT 'false'
);
--> statement-breakpoint
CREATE TABLE "course" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"student_id" text NOT NULL,
	"academic_year_id" text NOT NULL,
	"name" text NOT NULL,
	"code" text,
	"category" "course_category_type" NOT NULL,
	"level" text,
	"credits" numeric(4, 2),
	"teacher" text,
	"description" text,
	"target_grade" text
);
--> statement-breakpoint
CREATE TABLE "grade" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"course_id" text NOT NULL,
	"term" "term_type" NOT NULL,
	"assessment_name" text,
	"assessment_type" text,
	"score" numeric(10, 2) NOT NULL,
	"max_score" numeric(10, 2) NOT NULL,
	"percentage" numeric(5, 2),
	"letter_grade" text,
	"grade_points" numeric(3, 2),
	"weight" numeric(5, 2) DEFAULT '1',
	"date" timestamp,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "standardized_test" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"student_id" text NOT NULL,
	"testType" "standardized_test_type" NOT NULL,
	"test_date" timestamp NOT NULL,
	"total_score" integer,
	"section_scores" jsonb,
	"percentile" integer,
	"target_score" integer,
	"is_official" text DEFAULT 'true',
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "term_grade" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"course_id" text NOT NULL,
	"term" "term_type" NOT NULL,
	"percentage" numeric(5, 2),
	"letter_grade" text,
	"grade_points" numeric(3, 2),
	"is_projected" text DEFAULT 'false',
	"notes" text
);
