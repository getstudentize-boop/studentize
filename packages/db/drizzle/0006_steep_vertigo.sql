CREATE TABLE "advisor_student_access" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"advisor_id" text NOT NULL,
	"student_id" text NOT NULL
);
