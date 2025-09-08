import { getUserDisplay, UserDisplayInputSchema } from "./display";

import { privateRoute } from "../../utils/middleware";
import { getCurrentUser } from "./current";

export const userDisplayHandler = privateRoute
  .input(UserDisplayInputSchema)
  .handler(async ({ input }) => {
    const result = await getUserDisplay(input);
    return result;
  });

export const userCurrentHandler = privateRoute.handler(async ({ context }) => {
  return getCurrentUser(context);
});
