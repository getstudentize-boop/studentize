import { z } from "zod";
import { db, eq, schema, desc } from "@student/db";
import type { Context } from "../../utils/middleware";

export const GetMySessionsInputSchema = z.object({});

export type GetMySessionsInput = z.infer<typeof GetMySessionsInputSchema>;

export const getMySessions = async (context: Context, _input: GetMySessionsInput) => {
  if (!context.user) {
    throw new Error("User not authenticated");
  }

  // Fetch sessions for this student using their user ID directly
  const sessions = await db
    .select()
    .from(schema.session)
    .where(eq(schema.session.studentUserId, context.user.id))
    .orderBy(desc(schema.session.createdAt));

  return sessions;
};
