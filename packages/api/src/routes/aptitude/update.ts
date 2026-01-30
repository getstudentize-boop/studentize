import { z } from "zod";
import { updateAptitudeSession, getAptitudeSessionById } from "@student/db";
import type { AuthContext } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const UpdateInputSchema = z.object({
  sessionId: z.string(),
  status: z.enum(["not_started", "in_progress", "completed"]).optional(),
  currentStep: z.number().min(1).max(4).optional(),
  favoriteSubjects: z.array(z.string()).optional(),
  subjectComfortLevels: z.record(z.string(), z.number().min(1).max(5)).optional(),
  questionsResponses: z
    .object({
      questions: z.array(z.string()),
      answers: z.array(z.string()),
    })
    .optional(),
});

export type UpdateInput = z.infer<typeof UpdateInputSchema>;

export const updateHandler = async (ctx: AuthContext, input: UpdateInput) => {
  if (!ctx.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "User not authenticated" });
  }

  if (ctx.user.organization.role !== "STUDENT") {
    throw new ORPCError("FORBIDDEN", {
      message: "Only students can update aptitude tests",
    });
  }

  // Check session exists and belongs to user
  const existingSession = await getAptitudeSessionById({
    sessionId: input.sessionId,
    studentUserId: ctx.user.id,
  });

  if (!existingSession) {
    throw new ORPCError("NOT_FOUND", { message: "Session not found" });
  }

  // Don't allow updates to completed sessions (except for viewing)
  if (existingSession.status === "completed" && input.status !== "completed") {
    throw new ORPCError("FORBIDDEN", {
      message: "Cannot modify a completed aptitude test",
    });
  }

  const { sessionId, ...updateData } = input;

  const updated = await updateAptitudeSession({
    sessionId,
    studentUserId: ctx.user.id,
    ...updateData,
  });

  return updated;
};
