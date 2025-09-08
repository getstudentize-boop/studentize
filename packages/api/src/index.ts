import {
  sessionCreateHandler,
  sessionListHandler,
  sessionGetTranscriptionUploadUrlHandler,
} from "./routes/session";

import {
  studentCreateHandler,
  studentListHandler,
  studentSearchHandler,
} from "./routes/student";

import {
  advisorChatHistoryHandler,
  advisorCreateHandler,
  advisorListHandler,
  advisorSearchHandler,
  advisorChatMessagesHandler,
} from "./routes/advisor";

import { chatStudentHandler, chatNewIdHandler } from "./routes/chat";

import { userDisplayHandler, userCurrentHandler } from "./routes/user";

export const router = {
  session: {
    list: sessionListHandler,
    create: sessionCreateHandler,
    transcriptionUploadUrl: sessionGetTranscriptionUploadUrlHandler,
  },
  student: {
    create: studentCreateHandler,
    list: studentListHandler,
    search: studentSearchHandler,
  },
  advisor: {
    create: advisorCreateHandler,
    list: advisorListHandler,
    search: advisorSearchHandler,
    chatHistory: advisorChatHistoryHandler,
    chatMessages: advisorChatMessagesHandler,
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
