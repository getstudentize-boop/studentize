import { AuthContext } from "@/utils/middleware";
import { ORPCError } from "@orpc/server";
import { getAdvisorStudentList, getFullStudentList } from "@student/db";
import { z } from "zod";

export const ListStudentsInputSchema = z.object({
  advisorUserId: z.string().optional(),
});

export const listStudents = async (
  ctx: AuthContext,
  input: z.infer<typeof ListStudentsInputSchema>
) => {
  const isAdmin = ctx.user.type === "ADMIN";

  if (isAdmin) {
    const students = await getFullStudentList();
    return students;
  } else if (input.advisorUserId) {
    const students = await getAdvisorStudentList({
      advisorUserId: input.advisorUserId,
    });

    return students;
  }

  throw new ORPCError("FORBIDDEN", {
    message: "You do not have access to this resource",
  });
};
