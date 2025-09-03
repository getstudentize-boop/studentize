import { sessionListHandler } from "./routes/session";

import { userCreateStudentHandler } from "./routes/user";

export const router = {
  session: {
    list: sessionListHandler,
  },
  user: {
    createStudent: userCreateStudentHandler,
  },
};
