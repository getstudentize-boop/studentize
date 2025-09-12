import {
  sessionCreateHandler,
  sessionListHandler,
  sessionGetTranscriptionUploadUrlHandler,
  sessionSummarizeTranscriptionHandler,
  sessionSummaryListHandler,
} from "./routes/session";

import {
  studentCreateHandler,
  studentListHandler,
  studentSearchHandler,
  studentGetOneHandler,
  studentUpdateHandler,
} from "./routes/student";

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

import { userDisplayHandler, userCurrentHandler } from "./routes/user";

export const router = {
  session: {
    list: sessionListHandler,
    create: sessionCreateHandler,
    transcriptionUploadUrl: sessionGetTranscriptionUploadUrlHandler,
    summarizeTranscription: sessionSummarizeTranscriptionHandler,
    summaryList: sessionSummaryListHandler,
  },
  student: {
    create: studentCreateHandler,
    list: studentListHandler,
    search: studentSearchHandler,
    getOne: studentGetOneHandler,
    update: studentUpdateHandler,
  },
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
  },
  chat: {
    student: chatStudentHandler,
    newId: chatNewIdHandler,
  },
};

export * from "./utils/workos";
