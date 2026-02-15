import { privateRoute } from "../../utils/middleware";
import { createTokenRoute } from "./create-token";
import { saveSessionRoute, SaveSessionInputSchema } from "./save-session";
import { getSessionRoute, GetSessionInputSchema } from "./get-session";
import { listSessionsRoute } from "./list-sessions";
import { endSessionRoute, EndSessionInputSchema } from "./end-session";

export const virtualAdvisor = {
  createToken: privateRoute.handler(createTokenRoute),
  saveSession: privateRoute
    .input(SaveSessionInputSchema)
    .handler(saveSessionRoute),
  getSession: privateRoute
    .input(GetSessionInputSchema)
    .handler(getSessionRoute),
  listSessions: privateRoute.handler(listSessionsRoute),
  endSession: privateRoute
    .input(EndSessionInputSchema)
    .handler(endSessionRoute),
};
