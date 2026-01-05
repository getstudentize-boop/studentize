import { getUserDisplay, UserDisplayInputSchema } from "./display";

import { privateRoute } from "../../utils/middleware";
import { getCurrentUser } from "./current";
import { getOneUser, GetOneUserInputSchema } from "./get-one";
import { getUserNameData, GetUserNameInputSchema } from "./get-name";

export const userDisplayHandler = privateRoute
  .input(UserDisplayInputSchema)
  .handler(async ({ input }) => {
    const result = await getUserDisplay(input);
    return result;
  });

export const userCurrentHandler = privateRoute.handler(async ({ context }) => {
  return getCurrentUser(context);
});

export const userGetOneHandler = privateRoute
  .input(GetOneUserInputSchema)
  .handler(async ({ input }) => {
    const result = await getOneUser(input);
    return result;
  });

export const userGetNameHandler = privateRoute
  .input(GetUserNameInputSchema)
  .handler(async ({ input }) => {
    const result = await getUserNameData(input);
    return result;
  });
