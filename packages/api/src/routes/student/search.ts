import z from "zod";

import { searchStudentsByAdmin, searchStudentsByAdvisor } from "@student/db";
import { AuthContext } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const SearchStudentsInputSchema = z.object({
  query: z.string(),
});

export const searchStudents = async (
  ctx: AuthContext,
  input: z.infer<typeof SearchStudentsInputSchema>
) => {
  if (ctx.user.organization.role === "STUDENT") {
    throw new ORPCError("FORBIDDEN");
  }

  const students = ["OWNER", "ADMIN"].includes(ctx.user.organization.role)
    ? await searchStudentsByAdmin({
        query: input.query,
        organizationId: ctx.organizationId,
      })
    : await searchStudentsByAdvisor({
        advisorUserId: ctx.user.id,
        query: input.query,
      });

  return students;
};
