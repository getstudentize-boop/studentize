import { os } from "@orpc/server";

import { listSessions, ListSessionInputSchema } from "./list";
import { createSession, CreateSessionInputSchema } from "./create";

import { defaultMiddleware } from "../../utils/middleware";

export const sessionListHandler = os
  .use(defaultMiddleware)
  .input(ListSessionInputSchema)
  .handler(async ({ input }) => {
    const result = await listSessions(input);
    return result;
  });

export const sessionCreateHandler = os
  .use(defaultMiddleware)
  .input(CreateSessionInputSchema)
  .handler(async ({ input }) => {
    const session = await createSession(input);
    return session;
  });
