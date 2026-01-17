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
import {
  ReadSessionTranscriptionInputSchema,
  readSessionTranscription,
} from "./read-transcription";

import { deleteSession, DeleteSessionInputSchema } from "./delete";

export const sessionDeleteHandler = privateRoute
  .input(DeleteSessionInputSchema)
  .handler(async ({ context, input }) => {
    const result = await deleteSession(context, input);
    return result;
  });

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

export const sessionReadTranscriptionHandler = privateRoute
  .input(ReadSessionTranscriptionInputSchema)
  .handler(async ({ context, input }) => {
    const result = await readSessionTranscription(context, input);
    return result;
  });

import {
  getStudentSessionsRoute,
  GetStudentSessionsInputSchema,
} from "./student-sessions";

import {
  GetSessionOverviewInputSchema,
  getSessionOverviewRoute,
} from "./overview";
import { listAutoSyncSessionsRoute } from "./list-auto-sync";
import { GetOneAutoSyncSessionInputSchema } from "./get-one-auto-sync";
import { getOneAutoSyncSessionRoute } from "./get-one-auto-sync";

import { readTemporaryTranscription } from "./read-temporary-transcription";
import {
  CreateAutoSyncInputSchema,
  createAutoSyncRoute,
} from "./create-auto-sync";
import { ReplayUrlInputSchema, replayUrlRoute } from "./reply-url";
import {
  IsReplayDownloadedInputSchema,
  isReplayDownloadedRoute,
} from "./is-replay-downloaded";
import {
  RegenerateTranscriptionInputSchema,
  regenerateTranscription,
} from "./regenerate-transcription";

// todo: move all the handlers above to this format
export const session = {
  getStudentSessions: privateRoute
    .input(GetStudentSessionsInputSchema)
    .handler(getStudentSessionsRoute),
  overview: privateRoute
    .input(GetSessionOverviewInputSchema)
    .handler(getSessionOverviewRoute),
  listAutoSync: privateRoute.handler(listAutoSyncSessionsRoute),
  getOneAutoSync: privateRoute
    .input(GetOneAutoSyncSessionInputSchema)
    .handler(getOneAutoSyncSessionRoute),
  readTemporaryTranscription: privateRoute
    .input(ReadSessionTranscriptionInputSchema)
    .handler(readTemporaryTranscription),
  createAutoSync: privateRoute
    .input(CreateAutoSyncInputSchema)
    .handler(createAutoSyncRoute),
  replayUrl: privateRoute.input(ReplayUrlInputSchema).handler(replayUrlRoute),
  isReplayDownloaded: privateRoute
    .input(IsReplayDownloadedInputSchema)
    .handler(isReplayDownloadedRoute),
  regenerateTranscription: privateRoute
    .input(RegenerateTranscriptionInputSchema)
    .handler(async ({ context, input }) => {
      return regenerateTranscription(context, input);
    }),
};
