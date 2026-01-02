import {
  getScheduledSessionByCreatedSessionId,
  getSessionById,
} from "@student/db";
import { createRouteHelper } from "../../utils/middleware";
import { createReplayObjectKey, objectExists } from "../../utils/s3";

import { z } from "zod";
import { ORPCError } from "@orpc/server";

export const IsReplayDownloadedInputSchema = z.object({
  sessionId: z.string(),
});

export const isReplayDownloadedRoute = createRouteHelper({
  inputSchema: IsReplayDownloadedInputSchema,
  execute: async ({ input }) => {
    const session = await getSessionById({ sessionId: input.sessionId });
    const scheduledSession = await getScheduledSessionByCreatedSessionId({
      sessionId: input.sessionId,
    });

    if (!session?.studentUserId) {
      throw new ORPCError("BAD_REQUEST");
    }

    const exists = await objectExists({
      bucket: "session-replay",
      key: createReplayObjectKey({
        sessionId: input.sessionId,
        studentUserId: session?.studentUserId,
      }),
    });

    return { isDownloaded: exists, isBotAttached: !!scheduledSession?.botId };
  },
});
