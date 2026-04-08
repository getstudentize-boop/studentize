import { getSessionById, updateSessionRating } from "@student/db";
import { ORPCError } from "@orpc/server";
import z from "zod";

import { AuthContext } from "../../../utils/middleware";

export const RateSessionInputSchema = z.object({
  sessionId: z.string(),
  rating: z.number().int().min(1).max(5),
  ratingFeedback: z.string().trim().max(1000).optional(),
});

export const rateSession = async (
  ctx: AuthContext,
  input: z.infer<typeof RateSessionInputSchema>
) => {
  const session = await getSessionById({ sessionId: input.sessionId });

  if (!session?.studentUserId) {
    throw new ORPCError("NOT_FOUND", { message: "Session not found" });
  }

  if (ctx.user.organization.role !== "STUDENT") {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Only students can rate sessions",
    });
  }

  if (ctx.user.id !== session.studentUserId) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "You can only rate your own sessions",
    });
  }

  await updateSessionRating({
    sessionId: input.sessionId,
    rating: input.rating,
    ratingFeedback: input.ratingFeedback?.length ? input.ratingFeedback : null,
  });

  return { success: true };
};
