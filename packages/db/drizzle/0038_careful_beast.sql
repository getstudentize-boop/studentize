CREATE TABLE "advisor_inquiry" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL
);
