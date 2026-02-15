CREATE TABLE "virtual_advisor_message" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"session_id" text NOT NULL,
	"role" text NOT NULL,
	"text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "virtual_advisor_session" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"student_user_id" text NOT NULL,
	"advisor_slug" text NOT NULL,
	"title" text,
	"ended_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "virtual_advisor_message" ADD CONSTRAINT "virtual_advisor_message_session_id_virtual_advisor_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."virtual_advisor_session"("id") ON DELETE cascade ON UPDATE no action;