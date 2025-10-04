import { ORPCError } from "@orpc/server";
import { getSessionById } from "@student/db";
import z from "zod";

export const GetOneInputSchema = z.object({
  sessionId: z.string(),
});

export const getOne = async (data: z.infer<typeof GetOneInputSchema>) => {
  const session = await getSessionById({ sessionId: data.sessionId });

  if (!session) {
    throw new ORPCError("BAD_REQUEST", { message: "Session not found." });
  }

  return session;
};
