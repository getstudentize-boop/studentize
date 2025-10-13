import { AuthContext } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";
import { deleteSessionById } from "@student/db";
import z from "zod";

export const DeleteSessionInputSchema = z.object({
  sessionId: z.string(),
});

export const deleteSession = async (
  ctx: AuthContext,
  data: z.infer<typeof DeleteSessionInputSchema>
) => {
  if (ctx.user.type !== "ADMIN") {
    throw new ORPCError("FORBIDDEN", {
      message: "You do not have permission to delete sessions.",
    });
  }

  await deleteSessionById({ sessionId: data.sessionId });

  return { success: true };
};
