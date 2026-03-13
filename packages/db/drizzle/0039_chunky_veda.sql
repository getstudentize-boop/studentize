CREATE TABLE "visitor_chat" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"title" text
);
--> statement-breakpoint
CREATE TABLE "visitor_chat_message" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"chat_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "visitor_chat_message" ADD CONSTRAINT "visitor_chat_message_chat_id_visitor_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."visitor_chat"("id") ON DELETE cascade ON UPDATE no action;