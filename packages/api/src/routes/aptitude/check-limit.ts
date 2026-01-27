import { z } from "zod";
import { countStudentAptitudeTests } from "@student/db";
import type { AuthContext } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const CheckLimitInputSchema = z.object({});

export type CheckLimitInput = z.infer<typeof CheckLimitInputSchema>;

export const checkLimitHandler = async (
  ctx: AuthContext,
  _input: CheckLimitInput
) => {
  if (!ctx.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "User not authenticated" });
  }

  if (ctx.user.type !== "STUDENT") {
    throw new ORPCError("FORBIDDEN", {
      message: "Only students can check aptitude test limits",
    });
  }

  const limitStatus = await countStudentAptitudeTests(ctx.user.id);

  return limitStatus;
};
