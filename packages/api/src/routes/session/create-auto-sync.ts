import { createRouteHelper } from "../../utils/middleware";
import {
  updateSessionById,
  getScheduledSessionByCreatedSessionId,
} from "@student/db";

import { ORPCError } from "@orpc/server";
import z from "zod";
import {
  createTemporaryTranscriptionObjectKey,
  createTranscriptionObjectKey,
  deleteFile,
  getSignedUrl,
  readFile,
  uploadTextFile,
} from "../../utils/s3";
import { downloadReplayRoute } from "../admin/download-replay";

export const CreateAutoSyncInputSchema = z.object({
  sessionId: z.string(),
  studentUserId: z.string(),
  advisorUserId: z.string(),
});

export const createAutoSyncRoute = createRouteHelper({
  inputSchema: CreateAutoSyncInputSchema,
  execute: async ({ ctx, input }) => {
    if (!["OWNER", "ADMIN"].includes(ctx.user.organization.role)) {
      throw new ORPCError("UNAUTHORIZED");
    }

    const { sessionId, advisorUserId, studentUserId } = input;

    // Find the scheduled session linked to this session
    const scheduledSession = await getScheduledSessionByCreatedSessionId({
      sessionId,
    });

    await updateSessionById({
      sessionId,
      advisorUserId,
      studentUserId,
      createdAt: scheduledSession?.scheduledAt,
    });

    const temporaryTranscriptionKey = createTemporaryTranscriptionObjectKey({
      sessionId,
      ext: "txt",
    });

    // read the temporary transcription
    const temporaryTranscription = await readFile({
      bucket: "transcription",
      key: temporaryTranscriptionKey,
    });

    if (!temporaryTranscription) {
      throw new ORPCError("NOT_FOUND", {
        message: "Temporary transcription not found",
      });
    }

    const transcriptionKey = createTranscriptionObjectKey({
      sessionId,
      ext: "txt",
      studentUserId,
    });

    const uploadUrl = await getSignedUrl("transcription", transcriptionKey, {
      type: "put",
    });

    await uploadTextFile({ uploadUrl, content: temporaryTranscription });

    await deleteFile({
      bucket: "transcription",
      key: temporaryTranscriptionKey,
    });

    await downloadReplayRoute({ input: { sessionId } });
  },
});
