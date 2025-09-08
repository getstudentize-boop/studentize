import { getUserDisplay, UserDisplayInputSchema } from "./display";

import { privateRoute } from "../../utils/middleware";

export const userDisplayHandler = privateRoute
  .input(UserDisplayInputSchema)
  .handler(async ({ input }) => {
    const result = await getUserDisplay(input);
    return result;
  });
