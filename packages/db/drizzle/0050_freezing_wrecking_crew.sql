CREATE TABLE "student_score" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"student_user_id" text NOT NULL,
	"subject" text NOT NULL,
	"score" real NOT NULL,
	"max_score" real NOT NULL,
	"exam_date" timestamp NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE INDEX "student_score_student_user_id_idx" ON "student_score" USING btree ("student_user_id");--> statement-breakpoint
CREATE INDEX "student_score_subject_idx" ON "student_score" USING btree ("student_user_id","subject");