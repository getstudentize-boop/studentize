CREATE INDEX "uk_college_size_of_city_idx" ON "uk_colleges_rows" USING btree ("Size_of_City");--> statement-breakpoint
CREATE INDEX "us_college_sat_idx" ON "us_colleges_rows" USING btree ("latest_admissions_sat_scores_average_overall");--> statement-breakpoint
CREATE INDEX "us_college_campus_setting_idx" ON "us_colleges_rows" USING btree ("campus_setting");--> statement-breakpoint
CREATE INDEX "essay_student_user_id_idx" ON "essay" USING btree ("student_user_id");--> statement-breakpoint
CREATE INDEX "essay_student_region_idx" ON "essay" USING btree ("student_user_id","region");