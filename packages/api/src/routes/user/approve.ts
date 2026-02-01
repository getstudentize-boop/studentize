import { z } from "zod";
import { ORPCError } from "@orpc/server";
import {
  updateUserStatus,
  updateMembershipRole,
  createBaseAdvisor,
  createBaseStudent,
  db,
  schema,
  eq,
} from "@student/db";
import { AuthContext } from "../../utils/middleware";

export const ApprovePendingUserInputSchema = z.object({
  userId: z.string(),
  role: z.enum(["ADVISOR", "STUDENT"]),
  universityName: z.string().min(2).optional(),
  courseMajor: z.string().min(2).optional(),
  courseMinor: z.string().optional(),
});

export const approvePendingUser = async (
  ctx: AuthContext,
  data: z.infer<typeof ApprovePendingUserInputSchema>
) => {
  const isAdmin = ["OWNER", "ADMIN"].includes(ctx.user.organization.role);

  if (!isAdmin) {
    throw new ORPCError("FORBIDDEN", {
      message: "Admin access required",
    });
  }

  // Validate advisor-specific fields if role is ADVISOR
  if (data.role === "ADVISOR") {
    if (!data.universityName || !data.courseMajor) {
      throw new ORPCError("BAD_REQUEST", {
        message: "University name and course major are required for advisors",
      });
    }
  }

  // Update user status to ACTIVE
  await updateUserStatus(data.userId, "ACTIVE");

  // Update membership role
  await updateMembershipRole(data.userId, ctx.organizationId, data.role);

  // Create advisor or student record
  if (data.role === "ADVISOR") {
    // Check if advisor record already exists
    const existingAdvisor = await db.query.advisor.findFirst({
      where: (advisor, { eq }) => eq(advisor.userId, data.userId),
    });

    if (!existingAdvisor) {
      await createBaseAdvisor({
        userId: data.userId,
        universityName: data.universityName!,
        courseMajor: data.courseMajor!,
        courseMinor: data.courseMinor,
      });
    }
  } else {
    // Check if student record already exists
    const existingStudent = await db.query.student.findFirst({
      where: (student, { eq }) => eq(student.userId, data.userId),
    });

    if (!existingStudent) {
      await createBaseStudent({ userId: data.userId });
    }
  }

  return { success: true };
};
