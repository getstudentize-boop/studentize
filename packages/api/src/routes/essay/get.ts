import { z } from "zod";
import { getEssayById } from "@student/db";
import type { AuthContext } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const GetEssayInputSchema = z.object({
  essayId: z.string(),
});

export type GetEssayInput = z.infer<typeof GetEssayInputSchema>;

export const getEssayHandler = async (ctx: AuthContext, input: GetEssayInput) => {
  if (!ctx.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "User not authenticated" });
  }

  if (ctx.user.organization.role !== "STUDENT") {
    throw new ORPCError("FORBIDDEN", {
      message: "Only students can view their essays",
    });
  }

  const essay = await getEssayById({
    essayId: input.essayId,
    studentUserId: ctx.user.id,
  });

  if (!essay) {
    throw new ORPCError("NOT_FOUND", { message: "Essay not found" });
  }

  return essay;
};
