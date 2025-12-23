CREATE TABLE "calendar" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"user_id" text NOT NULL,
	"calendar_id" text NOT NULL
);
