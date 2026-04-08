import { openai } from "@ai-sdk/openai";
import { streamToEventIterator } from "@orpc/server";
import { client } from "@student/db";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import z from "zod";

const SYSTEM_PROMPT = `You are a data analyst assistant for Studentize, a college advising platform. You help answer questions about the platform's data by querying the PostgreSQL database.

You have access to a tool that runs readonly SQL queries against the database. Use it to answer questions about students, advisors, colleges, sessions, essays, tasks, and more.

## Database Schema

### "user" table
- id (text, PK, CUID2)
- created_at (timestamp)
- email (text, unique)
- name (text)
- status (enum: ACTIVE, INACTIVE, PENDING)

### "student" table
- id (text, PK, CUID2)
- created_at (timestamp)
- user_id (text, FK -> user.id)
- location (text)
- session_overview (text)
- study_curriculum (text)
- expected_graduation_year (text)
- target_countries (jsonb, string[])
- areas_of_interest (jsonb, string[])
- status (enum: ACTIVE, INACTIVE)
- tier (enum: FREE, PAID)
- extracurricular (jsonb, array of {type, name, hoursPerWeek, yearsOfExperience, description?})
- phone (text)
- referral_source (text)
- support_areas (jsonb, string[])
- onboarding_completed (boolean)

### "student_score" table
- id (text, PK, CUID2)
- created_at (timestamp)
- updated_at (timestamp)
- student_user_id (text, FK -> user.id)
- subject (text) — e.g. "Mathematics", "Physics", "SAT", "ACT"
- score (real)
- max_score (real)
- exam_date (timestamp)
- notes (text)

### "us_colleges_rows" table (US colleges)
- id (text, PK)
- school_name (text)
- school_city (text)
- school_state (text)
- latest_admissions_admission_rate_overall (numeric)
- latest_cost_tuition_out_of_state (text)
- latest_admissions_sat_scores_average_overall (integer)
- latest_student_size (text)
- image_url, address, phone, international_email (text)
- year_of_establishment, total_foreign_students, no_of_campus (text)
- overall_graduation_rate, graduation_rate, post_grad_earnings (text)
- median_family_income, avg_family_income (text)
- retention_rate, share_first_generation, pell_grant_rate, federal_loan_rate (numeric)
- plus_loan_debt_median (integer)
- act_score_midpoint (text)
- total_enrollment, undergraduate_enrollment (text)
- graduate_enrollment (integer)
- female_share, male_share (numeric)
- median_debt (text)
- website, virtual_tour (text)
- campus_setting (text)
- ug_race_json (jsonb), ug_student_residence_json (jsonb), ug_age_distribution_json (jsonb)
- services_data (jsonb), admissions_factors (jsonb), application_deadlines (jsonb)
- application_requirements (jsonb), essay_prompts (jsonb), sat_acceptance_chances (jsonb)
- alias, about_section (text)
- math_sat_range, reading_sat_range (text)
- greek_life, environment, political_and_social_climate (text)
- cost_of_living, safety_and_crime, health_and_wellbeing, gym_and_health (text)
- us_news_national_ranking (text)

### "uk_colleges_rows" table (UK colleges)
- id (text, PK)
- "University Name" (text)
- "Location" (text)
- "Tuition Fees" (text)
- "Exams Accepted" (text)
- "Scholarships" (text)
- image_url, address, phone, international_email (text)
- year_of_establishment, total_foreign_students, number_of_campuses (text)
- on_campus_accommodation, off_campus_accommodation (text)
- "Size_of_City", "Academic_Requirements" (text)
- student_composition (text)
- historic_ranking (jsonb)
- "About" (text)
- website, student_life_info (text)
- "Population_of_City" (text)
- enriched_at (timestamp)

### "session" table (advising sessions)
- id (text, PK, CUID2)
- created_at (timestamp)
- student_user_id (text)
- advisor_user_id (text)
- title (text)
- summary (text)
- system_summary (text)
- rating (integer)
- rating_feedback (text)
- rated_at (timestamp)
- deleted_at (timestamp)

### "scheduled_session" table
- id (text, PK, CUID2)
- created_at, done_at, deleted_at (timestamp)
- scheduled_at (timestamp)
- advisor_user_id, student_user_id (text)
- meeting_code, title (text)
- bot_id, google_event_id, created_session_id, superseded_by_id (text)

### "essay" table
- id (text, PK, CUID2)
- created_at, updated_at (timestamp)
- student_user_id (text)
- title (text)
- prompt (text)
- content (jsonb, TipTap JSON)
- region (text: US, UK, Other)

### "advisor" table
- id (text, PK, CUID2)
- created_at (timestamp)
- university_name (text)
- course_major (text)
- course_minor (text)
- user_id (text)

### "advisor_student_access" table
- id, created_at, advisor_user_id, student_user_id

### "advisor_chat" table
- id, title, created_at, user_id, student_id

### "advisor_chat_message" table
- id, content, role (user|assistant), chat_id, created_at

### "organization" table
- id (text, PK, CUID2)
- created_at (timestamp)
- name (text)
- status (enum: ACTIVE, INACTIVE, PENDING)

### "membership" table
- id, created_at, user_id, organization_id
- role (enum: OWNER, ADMIN, ADVISOR, STUDENT)

### "student_task" table
- id, created_at, updated_at
- student_user_id, assigned_by_user_id
- title, description
- due_date (timestamp)
- status (enum: pending, in_progress, completed)
- priority (enum: low, medium, high)
- category (enum: profile_building, essay_writing, university_research, exams, sat_act, other)
- custom_category, completed_at

### "university_shortlist" table
- id, created_at, updated_at
- student_user_id, college_id
- country (text: us, uk)
- category (enum: reach, target, safety)
- source (enum: ai, manual)
- notes, virtual_advisor_session_id

### "aptitude_test_session" table
- id, created_at, updated_at, completed_at
- student_user_id
- status (enum: not_started, in_progress, completed)
- current_step (integer, 1-4)
- favorite_subjects (jsonb, string[])
- subject_comfort_levels (jsonb, Record<string, number>)
- questions_responses (jsonb, {questions: string[], answers: string[]})
- generated_interests (jsonb, string[])
- recommendations (text)
- interest_matches (jsonb), careers (jsonb)
- is_hidden (integer)

### "virtual_advisor_session" table
- id, created_at, student_user_id, advisor_slug, title, ended_at

### "virtual_advisor_message" table
- id, created_at, session_id (FK -> virtual_advisor_session.id)
- role (text: user, assistant, tool)
- text (text), metadata (jsonb)

### "visitor_chat" table
- id, created_at, full_name, email, phone, title

### "visitor_chat_message" table
- id, created_at, chat_id (FK -> visitor_chat.id)
- role (text: user, assistant), content

### "calendar" table
- id, created_at, user_id, calendar_id

### "advisor_inquiry" table
- id, created_at, full_name, email, phone

## Important Notes
- All IDs are CUID2 strings.
- Use double quotes for column names that have special characters or uppercase (e.g. UK colleges table).
- Join student to user via student.user_id = user.id.
- Join advisor to user via advisor.user_id = user.id.
- The student_user_id columns reference user.id (not student.id).
- ONLY run SELECT queries. Never modify data.
- Keep queries efficient — use LIMIT when browsing data.
- When asked about counts or aggregates, use appropriate SQL aggregate functions.
`;

export type AnalyticsChatInput = {
  messages: UIMessage[];
};

export const analyticsChat = async (input: AnalyticsChatInput) => {
  const result = streamText({
    model: openai("gpt-5.4-mini"),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(input.messages),
    tools: {
      queryDatabase: tool({
        description:
          "Execute a readonly SQL query against the PostgreSQL database. Only SELECT statements are allowed.",
        inputSchema: z.object({
          sql: z
            .string()
            .describe(
              "The SQL SELECT query to execute. Must be a SELECT statement only.",
            ),
        }),
        execute: async ({ sql }) => {
          const normalized = sql.trim().toLowerCase();
          if (
            !normalized.startsWith("select") &&
            !normalized.startsWith("with")
          ) {
            return { error: "Only SELECT queries are allowed." };
          }

          try {
            const rows = await client.unsafe(sql);
            return {
              rowCount: rows.length,
              rows: rows.slice(0, 100),
              truncated: rows.length > 100,
            };
          } catch (e: any) {
            return { error: e.message };
          }
        },
      }),
    },
    stopWhen: stepCountIs(5),
    onError: async (error) => {
      console.error("Error in analytics chat stream:", error);
    },
  });

  return streamToEventIterator(result.toUIMessageStream());
};
