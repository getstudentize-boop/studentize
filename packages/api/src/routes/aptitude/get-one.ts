import { z } from "zod";
import { getAptitudeSessionById } from "@student/db";
import type { AuthContext } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const GetOneInputSchema = z.object({
  sessionId: z.string(),
});

export type GetOneInput = z.infer<typeof GetOneInputSchema>;

export const getOneHandler = async (ctx: AuthContext, input: GetOneInput) => {
  if (!ctx.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "User not authenticated" });
  }

  if (ctx.user.type !== "STUDENT") {
    throw new ORPCError("FORBIDDEN", {
      message: "Only students can access aptitude tests",
    });
  }

  const session = await getAptitudeSessionById({
    sessionId: input.sessionId,
    studentUserId: ctx.user.id,
  });

  if (!session) {
    throw new ORPCError("NOT_FOUND", { message: "Session not found" });
  }

  return session;
};
