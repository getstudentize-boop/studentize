import z from "zod";

import { getSignedUrl } from "../../utils/s3";

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
    // context: we need to add the file extension, in order for the file to be
    // indexed properly in autorag. Else it will throw an error "unsupported file type"
    `${data.studentUserId}/${data.sessionId}.${data.ext}`,
    {
      contentType: "text/plain",
    }
  );

  return { url };
};
