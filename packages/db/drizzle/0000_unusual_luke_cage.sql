CREATE TYPE "public"."user_status" AS ENUM('ACTIVE', 'INACTIVE', 'PENDING');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('ADMIN', 'ADVISOR', 'STUDENT');--> statement-breakpoint
CREATE TABLE "advisor" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"university_name" text NOT NULL,
	"course_major" text NOT NULL,
	"course_minor" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"user_id" text NOT NULL,
	"location" text,
	"grade_level" text,
	"academic_performance" text,
	"test_scores" text,
	"primary_academic_interests" jsonb,
	"application_stage" jsonb,
	"main_extracurriculars" jsonb,
	"target" jsonb
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"student_id" text NOT NULL,
	"advisor_id" text NOT NULL,
	"title" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"email" text NOT NULL,
	"name" text NOT NULL,
	"type" "user_type" DEFAULT 'STUDENT' NOT NULL,
	"status" "user_status" DEFAULT 'PENDING' NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "advisor_chat" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"user_id" text NOT NULL,
	"student_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "advisor_chat_message" (
	"id" text PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"role" text NOT NULL,
	"chat_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"tools" jsonb DEFAULT '[]'::jsonb
);
