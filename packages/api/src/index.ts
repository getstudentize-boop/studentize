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
} from "./routes/web/session";

import { student } from "./routes/web/student";
import { college } from "./routes/web/college";
import { shortlist } from "./routes/web/shortlist";
import { essay } from "./routes/web/essay";
import { task } from "./routes/web/task";
import { aptitude } from "./routes/web/aptitude";

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
} from "./routes/web/advisor";

import { chatStudentHandler, chatNewIdHandler } from "./routes/web/chat";

import {
  userDisplayHandler,
  userCurrentHandler,
  userGetOneHandler,
  userGetNameHandler,
  userListPendingHandler,
  userApproveHandler,
  userSwitchToStudentHandler,
} from "./routes/web/user";
import { scheduledSession } from "./routes/web/scheduled-session";
import { admin } from "./routes/web/admin";
import { session } from "./routes/web/session";
import { organization } from "./routes/web/organization";
import { virtualAdvisor } from "./routes/web/virtual-advisor";
import { consultationRequest } from "./routes/web/consultation-request";
import { score } from "./routes/web/score";
import {
  visitorChatHandler,
  visitorChatListHandler,
  visitorChatMessagesHandler,
} from "./routes/web/visitor-chat";

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
  college,
  shortlist,
  task,
  aptitude,
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
    listPending: userListPendingHandler,
    approve: userApproveHandler,
    switchToStudent: userSwitchToStudentHandler,
  },
  organization,
  chat: {
    student: chatStudentHandler,
    newId: chatNewIdHandler,
  },
  virtualAdvisor,
  score,
  consultationRequest,
  visitorChat: {
    chat: visitorChatHandler,
    list: visitorChatListHandler,
    messages: visitorChatMessagesHandler,
  },
};

export * from "./utils/workos";

export * from "./utils/google";

export { visitorChat } from "./routes/web/visitor-chat/chat";
