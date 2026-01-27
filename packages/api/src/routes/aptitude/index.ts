import { createSessionHandler, CreateSessionInputSchema } from "./create";
import { getOneHandler, GetOneInputSchema } from "./get-one";
import { listHandler, ListInputSchema } from "./list";
import { updateHandler, UpdateInputSchema } from "./update";
import { checkLimitHandler, CheckLimitInputSchema } from "./check-limit";
import {
  generateRecommendationsHandler,
  GenerateRecommendationsInputSchema,
} from "./generate-recommendations";

import { privateRoute } from "../../utils/middleware";

const createHandler = privateRoute
  .input(CreateSessionInputSchema)
  .handler(async ({ context, input }) => {
    const result = await createSessionHandler(context, input);
    return result;
  });

const getHandler = privateRoute
  .input(GetOneInputSchema)
  .handler(async ({ context, input }) => {
    const result = await getOneHandler(context, input);
    return result;
  });

const listSessionsHandler = privateRoute
  .input(ListInputSchema)
  .handler(async ({ context, input }) => {
    const result = await listHandler(context, input);
    return result;
  });

const updateSessionHandler = privateRoute
  .input(UpdateInputSchema)
  .handler(async ({ context, input }) => {
    const result = await updateHandler(context, input);
    return result;
  });

const checkLimitSessionHandler = privateRoute
  .input(CheckLimitInputSchema)
  .handler(async ({ context, input }) => {
    const result = await checkLimitHandler(context, input);
    return result;
  });

const generateHandler = privateRoute
  .input(GenerateRecommendationsInputSchema)
  .handler(async ({ context, input }) => {
    const result = await generateRecommendationsHandler(context, input);
    return result;
  });

export const aptitude = {
  create: createHandler,
  getOne: getHandler,
  list: listSessionsHandler,
  update: updateSessionHandler,
  checkLimit: checkLimitSessionHandler,
  generateRecommendations: generateHandler,
};
