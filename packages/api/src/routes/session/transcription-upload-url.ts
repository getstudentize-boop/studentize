import z from "zod";

import { getSignedUrl } from "../../utils/s3";

export const TranscriptionUploadUrlInputSchema = z.object({
  sessionId: z.string(),
});

export const getTranscriptionUploadUrl = async (
  data: z.infer<typeof TranscriptionUploadUrlInputSchema>
) => {
  const url = await getSignedUrl("transcription", data.sessionId);
  return { url };
};
