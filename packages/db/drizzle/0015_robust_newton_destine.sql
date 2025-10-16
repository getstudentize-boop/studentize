CREATE TABLE "scheduled_session" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"done_at" timestamp,
	"deleted_at" timestamp,
	"scheduled_at" timestamp NOT NULL,
	"advisor_user_id" text NOT NULL,
	"student_user_id" text NOT NULL,
	"meeting_link" text NOT NULL
);
