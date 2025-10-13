import z from "zod";

import { createTranscriptionObjectKey, getSignedUrl } from "../../utils/s3";
import { getSessionById } from "@student/db";
import { ORPCError } from "@orpc/server";

export const TranscriptionUploadUrlInputSchema = z.object({
  sessionId: z.string(),
  ext: z.string(),
  studentUserId: z.string().optional(),
});

export const getTranscriptionUploadUrl = async (
  data: z.infer<typeof TranscriptionUploadUrlInputSchema>
) => {
  let studentUserId = data.studentUserId;

  if (!studentUserId) {
    const session = await getSessionById({ sessionId: data.sessionId });
    studentUserId = session?.studentUserId;
  }

  if (!studentUserId) {
    throw new ORPCError("BAD_REQUEST", { message: "Invalid sessionId" });
  }

  const url = await getSignedUrl(
    "transcription",
    createTranscriptionObjectKey({
      ...data,
      studentUserId,
    }),
    {
      contentType: "text/plain",
    }
  );

  return { url };
};
