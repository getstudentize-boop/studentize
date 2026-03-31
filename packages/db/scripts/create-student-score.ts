import postgres from "postgres";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env") });

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  console.log("Creating student_score table...");

  await sql`
    CREATE TABLE IF NOT EXISTS "student_score" (
      "id" text PRIMARY KEY NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL,
      "student_user_id" text NOT NULL,
      "subject" text NOT NULL,
      "score" real NOT NULL,
      "max_score" real NOT NULL,
      "exam_date" timestamp NOT NULL,
      "notes" text
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS "student_score_student_user_id_idx" ON "student_score" ("student_user_id")`;
  await sql`CREATE INDEX IF NOT EXISTS "student_score_subject_idx" ON "student_score" ("student_user_id", "subject")`;

  console.log("Done! student_score table created successfully.");
  await sql.end();
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
