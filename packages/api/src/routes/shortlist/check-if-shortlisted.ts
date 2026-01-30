import { z } from "zod";
import { checkIfInShortlist } from "@student/db";
import type { AuthContext } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const CheckIfShortlistedInputSchema = z.object({
  collegeId: z.string(),
  country: z.enum(["us", "uk"]),
});

export type CheckIfShortlistedInput = z.infer<
  typeof CheckIfShortlistedInputSchema
>;

export const checkIfShortlisted = async (
  ctx: AuthContext,
  input: CheckIfShortlistedInput
) => {
  if (!ctx.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "User not authenticated" });
  }

  if (ctx.user.organization.role !== "STUDENT") {
    return { isShortlisted: false };
  }

  const isShortlisted = await checkIfInShortlist({
    studentUserId: ctx.user.id,
    collegeId: input.collegeId,
    country: input.country,
  });

  return { isShortlisted };
};
