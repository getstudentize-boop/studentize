import {
  sessionCreateHandler,
  sessionListHandler,
  sessionGetTranscriptionUploadUrlHandler,
  sessionSummarizeTranscriptionHandler,
  sessionSummaryListHandler,
  sessionSummarizeStudentOverviewHandler,
  sessionGetOneHandler,
  sessionUpdateHandler,
  sessionReadTranscriptionHandler,
  sessionDeleteHandler,
} from "./routes/session";

import { student } from "./routes/student";

import {
  advisorChatHistoryHandler,
  advisorCreateHandler,
  advisorListHandler,
  advisorSearchHandler,
  advisorGetOneHandler,
  advisorUpdateHandler,
  advisorChatMessagesHandler,
  advisorStudentAccessGetHandler,
  advisorStudentAccessUpdateHandler,
} from "./routes/advisor";

import { chatStudentHandler, chatNewIdHandler } from "./routes/chat";

import {
  userDisplayHandler,
  userCurrentHandler,
  userGetOneHandler,
} from "./routes/user";

export const router = {
  session: {
    list: sessionListHandler,
    create: sessionCreateHandler,
    transcriptionUploadUrl: sessionGetTranscriptionUploadUrlHandler,
    summarizeTranscription: sessionSummarizeTranscriptionHandler,
    summaryList: sessionSummaryListHandler,
    summarizeStudentOverview: sessionSummarizeStudentOverviewHandler,
    getOne: sessionGetOneHandler,
    update: sessionUpdateHandler,
    readTranscription: sessionReadTranscriptionHandler,
    delete: sessionDeleteHandler,
  },
  student,
  advisor: {
    create: advisorCreateHandler,
    list: advisorListHandler,
    search: advisorSearchHandler,
    getOne: advisorGetOneHandler,
    update: advisorUpdateHandler,
    chatHistory: advisorChatHistoryHandler,
    chatMessages: advisorChatMessagesHandler,
    studentAccess: {
      get: advisorStudentAccessGetHandler,
      update: advisorStudentAccessUpdateHandler,
    },
  },
  user: {
    display: userDisplayHandler,
    current: userCurrentHandler,
    getOne: userGetOneHandler,
  },
  chat: {
    student: chatStudentHandler,
    newId: chatNewIdHandler,
  },
};

export * from "./utils/workos";
