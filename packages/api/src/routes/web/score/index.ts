import { privateRoute } from "../../../utils/middleware";
import { CreateScoreInputSchema, createScoreRoute } from "./create";
import { ListScoresInputSchema, listScoresRoute } from "./list";
import { UpdateScoreInputSchema, updateScoreRoute } from "./update";
import { DeleteScoreInputSchema, deleteScoreRoute } from "./delete";

export const score = {
  create: privateRoute
    .input(CreateScoreInputSchema)
    .handler(createScoreRoute),
  list: privateRoute
    .input(ListScoresInputSchema)
    .handler(listScoresRoute),
  update: privateRoute
    .input(UpdateScoreInputSchema)
    .handler(updateScoreRoute),
  delete: privateRoute
    .input(DeleteScoreInputSchema)
    .handler(deleteScoreRoute),
};
