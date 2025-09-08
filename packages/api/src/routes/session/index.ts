import { listSessions, ListSessionInputSchema } from "./list";
import { createSession, CreateSessionInputSchema } from "./create";
import {
  getTranscriptionUploadUrl,
  TranscriptionUploadUrlInputSchema,
} from "./transcription-upload-url";

import { privateRoute } from "../../utils/middleware";

export const sessionListHandler = privateRoute
  .input(ListSessionInputSchema)
  .handler(async ({ input }) => {
    const result = await listSessions(input);
    return result;
  });

export const sessionCreateHandler = privateRoute
  .input(CreateSessionInputSchema)
  .handler(async ({ input }) => {
    const session = await createSession(input);
    return session;
  });

export const sessionGetTranscriptionUploadUrlHandler = privateRoute
  .input(TranscriptionUploadUrlInputSchema)
  .handler(async ({ input }) => {
    const result = await getTranscriptionUploadUrl(input);
    return result;
  });
