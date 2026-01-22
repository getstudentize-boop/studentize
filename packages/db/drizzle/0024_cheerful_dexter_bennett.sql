DO $$ BEGIN CREATE TYPE "public"."shortlist_category" AS ENUM('reach', 'target', 'safety'); EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."shortlist_source" AS ENUM('ai', 'manual'); EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."curriculum_type" AS ENUM('US_HIGH_SCHOOL', 'IB', 'A_LEVELS', 'CBSE', 'ICSE', 'AP', 'OTHER'); EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."subject_category" AS ENUM('MATHEMATICS', 'SCIENCE', 'ENGLISH', 'SOCIAL_STUDIES', 'LANGUAGE', 'ARTS', 'PHYSICAL_EDUCATION', 'COMPUTER_SCIENCE', 'BUSINESS', 'OTHER'); EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."term_type" AS ENUM('SEMESTER_1', 'SEMESTER_2', 'TRIMESTER_1', 'TRIMESTER_2', 'TRIMESTER_3', 'QUARTER_1', 'QUARTER_2', 'QUARTER_3', 'QUARTER_4', 'YEAR'); EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
CREATE TABLE "uk_colleges_rows" (
	"id" text PRIMARY KEY NOT NULL,
	"University Name" text NOT NULL,
	"Location" text,
	"Tuition Fees" text,
	"Exams Accepted" text,
	"Scholarships" text,
	"image_url" text,
	"address" text,
	"phone" text,
	"international_email" text,
	"year_of_establishment" text,
	"total_foreign_students" text,
	"number_of_campuses" text,
	"on_campus_accommodation" text,
	"off_campus_accommodation" text,
	"Size_of_City" text,
	"Academic_Requirements" text,
	"student_composition" text,
	"historic_ranking" jsonb,
	"About" text,
	"website" text,
	"student_life_info" text,
	"Population_of_City" text
);
EXCEPTION WHEN duplicate_table THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
CREATE TABLE "us_colleges_rows" (
	"id" text PRIMARY KEY NOT NULL,
	"school_name" text NOT NULL,
	"school_city" text,
	"school_state" text,
	"latest_admissions_admission_rate_overall" numeric,
	"latest_cost_tuition_out_of_state" text,
	"latest_admissions_sat_scores_average_overall" integer,
	"latest_student_size" text,
	"image_url" text,
	"address" text,
	"phone" text,
	"international_email" text,
	"year_of_establishment" text,
	"total_foreign_students" text,
	"no_of_campus" text,
	"overall_graduation_rate" text,
	"ug_race_json" jsonb,
	"ug_student_residence_json" jsonb,
	"ug_age_distribution_json" jsonb,
	"graduation_rate" text,
	"post_grad_earnings" text,
	"median_family_income" text,
	"retention_rate" numeric,
	"share_first_generation" numeric,
	"plus_loan_debt_median" integer,
	"pell_grant_rate" numeric,
	"federal_loan_rate" numeric,
	"avg_family_income" text,
	"act_score_midpoint" text,
	"total_enrollment" text,
	"undergraduate_enrollment" text,
	"graduate_enrollment" integer,
	"female_share" numeric,
	"male_share" numeric,
	"median_debt" text,
	"website" text,
	"virtual_tour" text,
	"campus_setting" text,
	"services_data" jsonb,
	"admissions_factors" jsonb,
	"application_deadlines" jsonb,
	"application_requirements" jsonb,
	"alias" text,
	"about_section" text,
	"essay_prompts" jsonb,
	"math_sat_range" text,
	"reading_sat_range" text,
	"sat_acceptance_chances" jsonb,
	"greek_life" text,
	"environment" text,
	"political_and_social_climate" text,
	"cost_of_living" text,
	"safety_and_crime" text,
	"health_and_wellbeing" text,
	"gym_and_health" text,
	"us_news_national_ranking" text
);
EXCEPTION WHEN duplicate_table THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
CREATE TABLE "university_shortlist" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"student_user_id" text NOT NULL,
	"college_id" text NOT NULL,
	"country" text NOT NULL,
	"category" "shortlist_category",
	"source" "shortlist_source" DEFAULT 'manual' NOT NULL,
	"notes" text
);
EXCEPTION WHEN duplicate_table THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
CREATE TABLE "essay" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"student_user_id" text NOT NULL,
	"title" text NOT NULL,
	"prompt" text,
	"content" jsonb
);
EXCEPTION WHEN duplicate_table THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
CREATE TABLE "academic_year" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"student_id" text NOT NULL,
	"year" integer NOT NULL,
	"curriculum" "curriculum_type" NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"is_active" text DEFAULT 'true'
);
EXCEPTION WHEN duplicate_table THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
CREATE TABLE "course" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"student_id" text NOT NULL,
	"academic_year_id" text NOT NULL,
	"name" text NOT NULL,
	"code" text,
	"category" "subject_category" NOT NULL,
	"level" text,
	"credits" real,
	"teacher" text,
	"description" text
);
EXCEPTION WHEN duplicate_table THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
CREATE TABLE "gpa_record" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"student_id" text NOT NULL,
	"academic_year_id" text,
	"term" "term_type",
	"unweighted_gpa" real,
	"weighted_gpa" real,
	"total_credits" real,
	"is_cumulative" text DEFAULT 'false'
);
EXCEPTION WHEN duplicate_table THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
CREATE TABLE "grade" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"course_id" text NOT NULL,
	"term" "term_type" NOT NULL,
	"assessment_name" text,
	"assessment_type" text,
	"score" real,
	"max_score" real,
	"percentage" real,
	"letter_grade" text,
	"grade_points" real,
	"weight" real DEFAULT 1,
	"date" timestamp,
	"notes" text
);
EXCEPTION WHEN duplicate_table THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
CREATE TABLE "grade_scale" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"curriculum" "curriculum_type" NOT NULL,
	"letter_grade" text NOT NULL,
	"min_percentage" real NOT NULL,
	"max_percentage" real NOT NULL,
	"grade_points" real NOT NULL,
	"description" text
);
EXCEPTION WHEN duplicate_table THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
CREATE TABLE "term_grade" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"course_id" text NOT NULL,
	"term" "term_type" NOT NULL,
	"percentage" real,
	"letter_grade" text,
	"grade_points" real,
	"is_finalized" text DEFAULT 'false'
);
EXCEPTION WHEN duplicate_table THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
CREATE INDEX "uk_college_name_idx" ON "uk_colleges_rows" USING btree ("University Name");
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
CREATE INDEX "uk_college_location_idx" ON "uk_colleges_rows" USING btree ("Location");
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
CREATE INDEX "us_college_name_idx" ON "us_colleges_rows" USING btree ("school_name");
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
CREATE INDEX "us_college_state_idx" ON "us_colleges_rows" USING btree ("school_state");
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
CREATE INDEX "us_college_city_idx" ON "us_colleges_rows" USING btree ("school_city");
EXCEPTION WHEN duplicate_object THEN null;
END $$;