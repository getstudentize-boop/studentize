import { sessionListHandler } from "./routes/session";

import { studentCreateHandler, studentListHandler } from "./routes/student";

export const router = {
  session: {
    list: sessionListHandler,
  },
  student: {
    create: studentCreateHandler,
    list: studentListHandler,
  },
};
