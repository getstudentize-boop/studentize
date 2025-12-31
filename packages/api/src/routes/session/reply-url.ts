import z from "zod";
import { createRouteHelper } from "../../utils/middleware";
import { createReplayObjectKey, getSignedUrl } from "../../utils/s3";
import { getSessionById } from "@student/db";
import { ORPCError } from "@orpc/server";

export const ReplayUrlInputSchema = z.object({
  sessionId: z.string(),
});

export const replayUrlRoute = createRouteHelper({
  inputSchema: ReplayUrlInputSchema,
  execute: async ({ input }) => {
    // const session = await getSessionById({ sessionId: input.sessionId });

    // if (!session || !session.studentUserId) {
    //   throw new ORPCError("NOT_FOUND", { message: "Session not found" });
    // }

    const url = getSignedUrl(
      "session-replay",
      "replay/test/jara6loj615q3xlkfpchevcs",
      // createReplayObjectKey({
      //   sessionId: input.sessionId,
      //   studentUserId: session.studentUserId,
      // }),
      {
        type: "get",
      }
    );

    return url;
  },
});
