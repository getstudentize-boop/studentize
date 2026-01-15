import { z } from "zod";
import { db, eq, schema } from "@student/db";
import type { Context } from "../../utils/middleware";

export const GetMyAdvisorInputSchema = z.object({});

export type GetMyAdvisorInput = z.infer<typeof GetMyAdvisorInputSchema>;

export const getMyAdvisor = async (context: Context, _input: GetMyAdvisorInput) => {
  if (!context.user) {
    throw new Error("User not authenticated");
  }

  try {
    // Find the advisor assigned to this student
    const [advisorAccess] = await db
      .select({
        id: schema.advisor.id,
        userId: schema.advisor.userId,
        universityName: schema.advisor.universityName,
        courseMajor: schema.advisor.courseMajor,
        courseMinor: schema.advisor.courseMinor,
        advisorName: schema.user.name,
        advisorEmail: schema.user.email,
      })
      .from(schema.advisorStudentAccess)
      .innerJoin(
        schema.advisor,
        eq(schema.advisorStudentAccess.advisorUserId, schema.advisor.userId)
      )
      .innerJoin(
        schema.user,
        eq(schema.advisor.userId, schema.user.id)
      )
      .where(eq(schema.advisorStudentAccess.studentUserId, context.user.id));

    return advisorAccess || null;
  } catch (error) {
    console.error("Error fetching advisor:", error);
    return null;
  }
};
