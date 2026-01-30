import { z } from "zod";
import { listEssaysByStudent } from "@student/db";
import type { AuthContext } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";

export const ListEssaysInputSchema = z.object({});

export type ListEssaysInput = z.infer<typeof ListEssaysInputSchema>;

export const listEssaysHandler = async (
  ctx: AuthContext,
  _input: ListEssaysInput
) => {
  if (!ctx.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "User not authenticated" });
  }

  if (ctx.user.organization.role !== "STUDENT") {
    throw new ORPCError("FORBIDDEN", {
      message: "Only students can list their essays",
    });
  }

  const essays = await listEssaysByStudent(ctx.user.id);

  return essays;
};
