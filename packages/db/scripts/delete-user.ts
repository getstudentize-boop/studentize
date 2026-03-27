import { config } from "dotenv";
import { resolve } from "path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql, eq, or, inArray } from "drizzle-orm";
import * as schema from "../src/schema";

// Load environment variables
const envPath = resolve(__dirname, "../../../apps/web/.env");
config({ path: envPath });

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL not found");
  process.exit(1);
}

const client = postgres(process.env.DATABASE_URL, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});
const db = drizzle(client, { schema });

async function deleteUser() {
  const userEmail = process.argv[2];
  const dryRun = process.argv.includes("--dry-run");

  if (!userEmail) {
    console.error("Please provide the user's email as an argument");
    console.log("Usage: tsx scripts/delete-user.ts <user-email> [--dry-run]");
    console.log("Example: tsx scripts/delete-user.ts user@example.com");
    console.log("Example: tsx scripts/delete-user.ts user@example.com --dry-run");
    process.exit(1);
  }

  if (dryRun) {
    console.log("DRY RUN MODE - no data will be deleted\n");
  }

  console.log("Delete User Script");
  console.log("==================\n");

  // Test database connection
  console.log("Testing database connection...");
  await db.execute(sql`SELECT 1`);
  console.log("Database connected\n");

  // Find the user
  const [foundUser] = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.email, userEmail))
    .limit(1);

  if (!foundUser) {
    console.error(`User with email ${userEmail} not found`);
    process.exit(1);
  }

  const userId = foundUser.id;
  console.log(`Found user: ${foundUser.email} (ID: ${userId})`);
  console.log(`Name: ${foundUser.name || "(none)"}`);
  console.log(`Status: ${foundUser.status}\n`);

  // Check membership/role
  const memberships = await db
    .select()
    .from(schema.membership)
    .where(eq(schema.membership.userId, userId));

  if (memberships.length > 0) {
    console.log("Memberships:");
    for (const m of memberships) {
      console.log(`  - Org: ${m.organizationId}, Role: ${m.role}`);
    }
    console.log();
  }

  // Gather counts of related data
  const counts: Record<string, number> = {};

  // Advisor chat messages & tools (need chat IDs first)
  const advisorChats = await db
    .select({ id: schema.advisorChat.id })
    .from(schema.advisorChat)
    .where(
      or(
        eq(schema.advisorChat.userId, userId),
        eq(schema.advisorChat.studentId, userId)
      )
    );
  const chatIds = advisorChats.map((c) => c.id);
  counts["advisor_chat"] = chatIds.length;

  if (chatIds.length > 0) {
    const chatMessages = await db
      .select({ id: schema.advisorChatMessage.id })
      .from(schema.advisorChatMessage)
      .where(inArray(schema.advisorChatMessage.chatId, chatIds));
    const messageIds = chatMessages.map((m) => m.id);
    counts["advisor_chat_message"] = messageIds.length;

    if (messageIds.length > 0) {
      const [toolCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.advisorChatMessageTool)
        .where(inArray(schema.advisorChatMessageTool.messageId, messageIds));
      counts["advisor_chat_message_tool"] = Number(toolCount.count);
    }
  }

  // Student tasks
  const [taskCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.studentTask)
    .where(eq(schema.studentTask.studentUserId, userId));
  counts["student_task"] = Number(taskCount.count);

  // Essays
  const [essayCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.essay)
    .where(eq(schema.essay.studentUserId, userId));
  counts["essay"] = Number(essayCount.count);

  // University shortlist
  const [shortlistCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.universityShortlist)
    .where(eq(schema.universityShortlist.studentUserId, userId));
  counts["university_shortlist"] = Number(shortlistCount.count);

  // Aptitude test sessions
  const [aptitudeCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.aptitudeTestSession)
    .where(eq(schema.aptitudeTestSession.studentUserId, userId));
  counts["aptitude_test_session"] = Number(aptitudeCount.count);

  // Virtual advisor sessions (messages cascade)
  const [vaSessionCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.virtualAdvisorSession)
    .where(eq(schema.virtualAdvisorSession.studentUserId, userId));
  counts["virtual_advisor_session"] = Number(vaSessionCount.count);

  // Sessions
  const [sessionCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.session)
    .where(
      or(
        eq(schema.session.studentUserId, userId),
        eq(schema.session.advisorUserId, userId)
      )
    );
  counts["session"] = Number(sessionCount.count);

  // Scheduled sessions
  const [scheduledCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.scheduledSession)
    .where(
      or(
        eq(schema.scheduledSession.studentUserId, userId),
        eq(schema.scheduledSession.advisorUserId, userId)
      )
    );
  counts["scheduled_session"] = Number(scheduledCount.count);

  // Advisor student access
  const [accessCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.advisorStudentAccess)
    .where(
      or(
        eq(schema.advisorStudentAccess.advisorUserId, userId),
        eq(schema.advisorStudentAccess.studentUserId, userId)
      )
    );
  counts["advisor_student_access"] = Number(accessCount.count);

  // Calendar
  const [calendarCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.calendar)
    .where(eq(schema.calendar.userId, userId));
  counts["calendar"] = Number(calendarCount.count);

  // Student record
  const [studentCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.student)
    .where(eq(schema.student.userId, userId));
  counts["student"] = Number(studentCount.count);

  // Advisor record
  const [advisorCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.advisor)
    .where(eq(schema.advisor.userId, userId));
  counts["advisor"] = Number(advisorCount.count);

  counts["membership"] = memberships.length;

  // Print summary
  console.log("Records to delete:");
  for (const [table, count] of Object.entries(counts)) {
    if (count > 0) {
      console.log(`  ${table}: ${count}`);
    }
  }
  console.log();

  if (dryRun) {
    console.log("DRY RUN complete. No data was deleted.");
    return;
  }

  // === DELETION (order matters for foreign key constraints) ===

  console.log("Deleting user data...\n");

  // 1. Advisor chat message tools -> messages -> chats
  if (chatIds.length > 0) {
    const chatMessages = await db
      .select({ id: schema.advisorChatMessage.id })
      .from(schema.advisorChatMessage)
      .where(inArray(schema.advisorChatMessage.chatId, chatIds));
    const messageIds = chatMessages.map((m) => m.id);

    if (messageIds.length > 0) {
      await db
        .delete(schema.advisorChatMessageTool)
        .where(inArray(schema.advisorChatMessageTool.messageId, messageIds));
      console.log("  Deleted advisor_chat_message_tool records");
    }

    await db
      .delete(schema.advisorChatMessage)
      .where(inArray(schema.advisorChatMessage.chatId, chatIds));
    console.log("  Deleted advisor_chat_message records");

    await db
      .delete(schema.advisorChat)
      .where(
        or(
          eq(schema.advisorChat.userId, userId),
          eq(schema.advisorChat.studentId, userId)
        )
      );
    console.log("  Deleted advisor_chat records");
  }

  // 2. Student tasks
  await db
    .delete(schema.studentTask)
    .where(eq(schema.studentTask.studentUserId, userId));
  // Also clear assigned_by references
  await db
    .update(schema.studentTask)
    .set({ assignedByUserId: null })
    .where(eq(schema.studentTask.assignedByUserId, userId));
  console.log("  Deleted student_task records");

  // 3. Essays
  await db
    .delete(schema.essay)
    .where(eq(schema.essay.studentUserId, userId));
  console.log("  Deleted essay records");

  // 4. University shortlist
  await db
    .delete(schema.universityShortlist)
    .where(eq(schema.universityShortlist.studentUserId, userId));
  console.log("  Deleted university_shortlist records");

  // 5. Aptitude test sessions
  await db
    .delete(schema.aptitudeTestSession)
    .where(eq(schema.aptitudeTestSession.studentUserId, userId));
  console.log("  Deleted aptitude_test_session records");

  // 6. Virtual advisor sessions (messages cascade automatically)
  await db
    .delete(schema.virtualAdvisorSession)
    .where(eq(schema.virtualAdvisorSession.studentUserId, userId));
  console.log("  Deleted virtual_advisor_session records (+ cascaded messages)");

  // 7. Sessions
  await db
    .delete(schema.session)
    .where(
      or(
        eq(schema.session.studentUserId, userId),
        eq(schema.session.advisorUserId, userId)
      )
    );
  console.log("  Deleted session records");

  // 8. Scheduled sessions
  await db
    .delete(schema.scheduledSession)
    .where(
      or(
        eq(schema.scheduledSession.studentUserId, userId),
        eq(schema.scheduledSession.advisorUserId, userId)
      )
    );
  console.log("  Deleted scheduled_session records");

  // 9. Advisor student access
  await db
    .delete(schema.advisorStudentAccess)
    .where(
      or(
        eq(schema.advisorStudentAccess.advisorUserId, userId),
        eq(schema.advisorStudentAccess.studentUserId, userId)
      )
    );
  console.log("  Deleted advisor_student_access records");

  // 10. Calendar
  await db
    .delete(schema.calendar)
    .where(eq(schema.calendar.userId, userId));
  console.log("  Deleted calendar records");

  // 11. Student record
  await db
    .delete(schema.student)
    .where(eq(schema.student.userId, userId));
  console.log("  Deleted student record");

  // 12. Advisor record
  await db
    .delete(schema.advisor)
    .where(eq(schema.advisor.userId, userId));
  console.log("  Deleted advisor record");

  // 13. Memberships
  await db
    .delete(schema.membership)
    .where(eq(schema.membership.userId, userId));
  console.log("  Deleted membership records");

  // 14. User
  await db.delete(schema.user).where(eq(schema.user.id, userId));
  console.log("  Deleted user record");

  console.log("\n==================");
  console.log(`User ${userEmail} (${userId}) has been completely deleted.`);
}

deleteUser()
  .then(async () => {
    await client.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("\nError during deletion:", error);
    await client.end();
    process.exit(1);
  });
