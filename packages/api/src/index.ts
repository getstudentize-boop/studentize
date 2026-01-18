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
import { grades } from "./routes/grades";
import { college } from "./routes/college";
import { shortlist } from "./routes/shortlist";
import { essay } from "./routes/essay";

import {
  advisorCreateHandler,
  advisorListHandler,
  advisorSearchHandler,
  advisorGetOneHandler,
  advisorUpdateHandler,
  advisorChatMessagesHandler,
  advisorStudentAccessGetHandler,
  advisorStudentAccessUpdateHandler,
  advisor,
} from "./routes/advisor";

import { chatStudentHandler, chatNewIdHandler } from "./routes/chat";

import {
  userDisplayHandler,
  userCurrentHandler,
  userGetOneHandler,
  userGetNameHandler,
} from "./routes/user";
import { scheduledSession } from "./routes/scheduled-session";
import { admin } from "./routes/admin";
import { session } from "./routes/session";

export const router = {
  admin,
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
    ...session,
  },
  scheduledSession,
  student,
  essay,
  grades,
  college,
  shortlist,
  advisor: {
    ...advisor,
    create: advisorCreateHandler,
    list: advisorListHandler,
    search: advisorSearchHandler,
    getOne: advisorGetOneHandler,
    update: advisorUpdateHandler,
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
    getName: userGetNameHandler,
  },
  chat: {
    student: chatStudentHandler,
    newId: chatNewIdHandler,
  },
};

export * from "./utils/workos";

export * from "./utils/google";
