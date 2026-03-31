-- Essay indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "essay_student_user_id_idx" ON "essay" ("student_user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "essay_student_region_idx" ON "essay" ("student_user_id", "region");

-- US college indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "us_college_sat_idx" ON "us_colleges_rows" ("latest_admissions_sat_scores_average_overall");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "us_college_campus_setting_idx" ON "us_colleges_rows" ("campus_setting");

-- UK college indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "uk_college_size_of_city_idx" ON "uk_colleges_rows" ("Size_of_City");
