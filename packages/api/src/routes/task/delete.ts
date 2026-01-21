import { z } from "zod";
import { deleteTask } from "@student/db";
import type { AuthContext } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const DeleteTaskInputSchema = z.object({
  taskId: z.string(),
});

export type DeleteTaskInput = z.infer<typeof DeleteTaskInputSchema>;

export const deleteTaskHandler = async (
  ctx: AuthContext,
  input: DeleteTaskInput
) => {
  if (!ctx.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "User not authenticated" });
  }

  if (ctx.user.type !== "STUDENT") {
    throw new ORPCError("FORBIDDEN", {
      message: "Only students can delete tasks",
    });
  }

  const result = await deleteTask({
    taskId: input.taskId,
    studentUserId: ctx.user.id,
  });

  return result;
};
