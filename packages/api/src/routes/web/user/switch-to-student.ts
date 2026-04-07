import { updateMembershipRole, createBaseStudent } from "@student/db";
import { AuthContext } from "../../../utils/middleware";
import { db, eq, schema } from "@student/db";

export const switchToStudent = async (ctx: AuthContext) => {
  const { user, organizationId } = ctx;

  // Update membership role to STUDENT
  await updateMembershipRole(user.id, organizationId, "STUDENT");

  // Delete the advisor record if one exists
  await db
    .delete(schema.advisor)
    .where(eq(schema.advisor.userId, user.id));

  // Ensure a student record exists for this user
  const existingStudent = await db.query.student.findFirst({
    where: (student, { eq }) => eq(student.userId, user.id),
  });

  if (!existingStudent) {
    await createBaseStudent({ userId: user.id });
  }

  return { success: true };
};
