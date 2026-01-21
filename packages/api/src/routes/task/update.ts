import { z } from "zod";
import { updateTask } from "@student/db";
import type { AuthContext } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const UpdateTaskInputSchema = z.object({
  taskId: z.string(),
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  category: z
    .enum([
      "profile_building",
      "essay_writing",
      "university_research",
      "exams",
      "sat_act",
      "other",
    ])
    .optional(),
  customCategory: z.string().nullable().optional(),
});

export type UpdateTaskInput = z.infer<typeof UpdateTaskInputSchema>;

export const updateTaskHandler = async (
  ctx: AuthContext,
  input: UpdateTaskInput
) => {
  if (!ctx.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "User not authenticated" });
  }

  if (ctx.user.type !== "STUDENT") {
    throw new ORPCError("FORBIDDEN", {
      message: "Only students can update tasks",
    });
  }

  const { taskId, dueDate, ...rest } = input;

  // Set completedAt when status changes to completed
  let completedAt: Date | null | undefined = undefined;
  if (input.status === "completed") {
    completedAt = new Date();
  } else if (input.status && input.status !== "completed") {
    completedAt = null;
  }

  const task = await updateTask({
    taskId,
    studentUserId: ctx.user.id,
    ...rest,
    dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
    completedAt,
  });

  if (!task) {
    throw new ORPCError("NOT_FOUND", { message: "Task not found" });
  }

  return task;
};
