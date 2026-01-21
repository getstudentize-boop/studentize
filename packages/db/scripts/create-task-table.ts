import "dotenv/config";
import { Client } from "pg";

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  try {
    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'student_task'
      );
    `);

    if (tableCheck.rows[0].exists) {
      console.log("student_task table already exists");
      return;
    }

    // Create enums if they don't exist
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "task_status" AS ENUM('pending', 'in_progress', 'completed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "task_priority" AS ENUM('low', 'medium', 'high');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "task_category" AS ENUM('profile_building', 'essay_writing', 'university_research', 'exams', 'sat_act', 'other');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create the student_task table
    await client.query(`
      CREATE TABLE "student_task" (
        "id" text PRIMARY KEY NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now() NOT NULL,
        "student_user_id" text NOT NULL,
        "assigned_by_user_id" text,
        "title" text NOT NULL,
        "description" text,
        "due_date" timestamp,
        "status" "task_status" DEFAULT 'pending' NOT NULL,
        "priority" "task_priority" DEFAULT 'medium' NOT NULL,
        "category" "task_category" NOT NULL,
        "custom_category" text,
        "completed_at" timestamp
      );
    `);

    // Create index
    await client.query(`
      CREATE INDEX "student_task_student_user_id_idx" ON "student_task" ("student_user_id");
    `);

    console.log("student_task table created successfully!");
  } catch (error) {
    console.error("Error:", error);
    throw error;
  } finally {
    await client.end();
  }
}

main();
