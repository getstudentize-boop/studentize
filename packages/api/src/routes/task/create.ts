import { z } from "zod";
import { createTask } from "@student/db";
import type { AuthContext } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const CreateTaskInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  category: z.enum([
    "profile_building",
    "essay_writing",
    "university_research",
    "exams",
    "sat_act",
    "other",
  ]),
  customCategory: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>;

export const createTaskHandler = async (
  ctx: AuthContext,
  input: CreateTaskInput
) => {
  if (!ctx.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "User not authenticated" });
  }

  if (ctx.user.type !== "STUDENT") {
    throw new ORPCError("FORBIDDEN", {
      message: "Only students can create tasks",
    });
  }

  const task = await createTask({
    studentUserId: ctx.user.id,
    assignedByUserId: ctx.user.id, // self-assigned
    title: input.title,
    description: input.description || null,
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
    status: input.status,
    priority: input.priority,
    category: input.category,
    customCategory: input.customCategory || null,
  });

  return task;
};
