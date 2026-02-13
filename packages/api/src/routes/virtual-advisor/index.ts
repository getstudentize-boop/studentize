import { privateRoute } from "../../utils/middleware";
import { createTokenRoute } from "./create-token";

export const virtualAdvisor = {
  createToken: privateRoute.handler(createTokenRoute),
};
