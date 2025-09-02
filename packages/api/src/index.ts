import { sessionListHandler } from "./routes/session";

export const router = {
  session: {
    list: sessionListHandler,
  },
};
