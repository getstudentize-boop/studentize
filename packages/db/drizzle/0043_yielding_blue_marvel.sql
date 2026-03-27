CREATE INDEX "academic_year_student_id_idx" ON "academic_year" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "course_student_id_idx" ON "course" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "course_academic_year_id_idx" ON "course" USING btree ("academic_year_id");--> statement-breakpoint
CREATE INDEX "grade_course_id_idx" ON "grade" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "standardized_test_student_id_idx" ON "standardized_test" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "term_grade_course_id_idx" ON "term_grade" USING btree ("course_id");