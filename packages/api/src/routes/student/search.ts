import z from "zod";

import { searchStudentsByAdmin, searchStudentsByAdvisor } from "@student/db";
import { AuthContext } from "@/utils/middleware";
import { ORPCError } from "@orpc/server";

export const SearchStudentsInputSchema = z.object({
  query: z.string(),
});

export const searchStudents = async (
  ctx: AuthContext,
  input: z.infer<typeof SearchStudentsInputSchema>
) => {
  if (ctx.user.type === "STUDENT") {
    throw new ORPCError("FORBIDDEN");
  }

  const students =
    ctx.user.type === "ADMIN"
      ? await searchStudentsByAdmin({ query: input.query })
      : await searchStudentsByAdvisor({
          advisorUserId: ctx.user.id,
          query: input.query,
        });

  return students;
};
