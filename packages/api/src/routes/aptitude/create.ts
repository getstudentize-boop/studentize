import { z } from "zod";
import { createAptitudeSession, countStudentAptitudeTests } from "@student/db";
import type { AuthContext } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const CreateSessionInputSchema = z.object({});

export type CreateSessionInput = z.infer<typeof CreateSessionInputSchema>;

export const createSessionHandler = async (
  ctx: AuthContext,
  _input: CreateSessionInput
) => {
  if (!ctx.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "User not authenticated" });
  }

  if (ctx.user.type !== "STUDENT") {
    throw new ORPCError("FORBIDDEN", {
      message: "Only students can create aptitude tests",
    });
  }

  // Check limit
  const limitStatus = await countStudentAptitudeTests(ctx.user.id);
  if (!limitStatus.canCreateNew) {
    throw new ORPCError("FORBIDDEN", {
      message: `You've reached the maximum of ${limitStatus.maxAllowed} aptitude tests`,
    });
  }

  const session = await createAptitudeSession({
    studentUserId: ctx.user.id,
    status: "not_started",
    currentStep: 1,
  });

  return session;
};
