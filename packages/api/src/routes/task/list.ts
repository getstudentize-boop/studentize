import { z } from "zod";
import { getStudentTasks } from "@student/db";
import type { AuthContext } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const ListTasksInputSchema = z.object({});

export type ListTasksInput = z.infer<typeof ListTasksInputSchema>;

export const listTasksHandler = async (
  ctx: AuthContext,
  _input: ListTasksInput
) => {
  if (!ctx.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "User not authenticated" });
  }

  if (ctx.user.organization.role !== "STUDENT") {
    throw new ORPCError("FORBIDDEN", {
      message: "Only students can view tasks",
    });
  }

  const tasks = await getStudentTasks(ctx.user.id);

  return tasks;
};
