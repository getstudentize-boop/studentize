import { listSessions, ListSessionInputSchema } from "./list";
import { createSession, CreateSessionInputSchema } from "./create";
import {
  getTranscriptionUploadUrl,
  TranscriptionUploadUrlInputSchema,
} from "./transcription-upload-url";

import { privateRoute } from "../../utils/middleware";
import {
  summarizeTranscription,
  SummarizeTranscriptionInputSchema,
} from "./summarize-transcription";

import {
  sessionSummaryList,
  SessionSummaryListInputSchema,
} from "./summary-list";
import {
  summarizeStudentOverview,
  SummarizeStudentOverviewInputSchema,
} from "./summarize-student-overview";

import { getOne, GetOneInputSchema } from "./get-one";
import { updateSession, UpdateSessionInputSchema } from "./update";

export const sessionGetOneHandler = privateRoute
  .input(GetOneInputSchema)
  .handler(async ({ input }) => {
    const session = await getOne({ sessionId: input.sessionId });
    return session;
  });

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

export const sessionSummarizeTranscriptionHandler = privateRoute
  .input(SummarizeTranscriptionInputSchema)
  .handler(async ({ context, input }) => {
    const result = await summarizeTranscription(context, input);
    return result;
  });

export const sessionSummaryListHandler = privateRoute
  .input(SessionSummaryListInputSchema)
  .handler(async ({ context, input }) => {
    const result = await sessionSummaryList(context, input);
    return result;
  });

export const sessionSummarizeStudentOverviewHandler = privateRoute
  .input(SummarizeStudentOverviewInputSchema)
  .handler(async ({ context, input }) => {
    const result = await summarizeStudentOverview(context, input);
    return result;
  });

export const sessionUpdateHandler = privateRoute
  .input(UpdateSessionInputSchema)
  .handler(async ({ input }) => {
    const result = await updateSession(input);
    return result;
  });
