import { os } from "@orpc/server";

import { getUserDisplay, UserDisplayInputSchema } from "./display";

import { defaultMiddleware } from "../../utils/middleware";

export const userDisplayHandler = os
  .use(defaultMiddleware)
  .input(UserDisplayInputSchema)
  .handler(async ({ input }) => {
    const result = await getUserDisplay(input);
    return result;
  });
