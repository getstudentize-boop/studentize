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
  advisorCreateHandler,
  advisorListHandler,
  advisorSearchHandler,
} from "./routes/advisor";

import { chatStudentHandler } from "./routes/chat";

import { userDisplayHandler } from "./routes/user";

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
  },
  user: {
    display: userDisplayHandler,
  },
  chat: {
    student: chatStudentHandler,
  },
};
