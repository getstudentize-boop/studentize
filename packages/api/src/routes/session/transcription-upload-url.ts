import z from "zod";

import { createTranscriptionObjectKey, getSignedUrl } from "../../utils/s3";

export const TranscriptionUploadUrlInputSchema = z.object({
  sessionId: z.string(),
  ext: z.string(),
  studentUserId: z.string(),
});

export const getTranscriptionUploadUrl = async (
  data: z.infer<typeof TranscriptionUploadUrlInputSchema>
) => {
  const url = await getSignedUrl(
    "transcription",
    createTranscriptionObjectKey(data),
    {
      contentType: "text/plain",
    }
  );

  return { url };
};
