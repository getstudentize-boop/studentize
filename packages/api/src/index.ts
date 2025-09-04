import { sessionCreateHandler, sessionListHandler } from "./routes/session";

import {
  studentCreateHandler,
  studentListHandler,
  studentSearchHandler,
} from "./routes/student";

import { advisorCreateHandler, advisorListHandler } from "./routes/advisor";

export const router = {
  session: {
    list: sessionListHandler,
    create: sessionCreateHandler,
  },
  student: {
    create: studentCreateHandler,
    list: studentListHandler,
    search: studentSearchHandler,
  },
  advisor: {
    create: advisorCreateHandler,
    list: advisorListHandler,
  },
};
