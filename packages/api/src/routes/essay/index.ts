import { createEssayHandler, CreateEssayInputSchema } from "./create";
import { getEssayHandler, GetEssayInputSchema } from "./get";
import { listEssaysHandler, ListEssaysInputSchema } from "./list";
import { updateEssayHandler, UpdateEssayInputSchema } from "./update";
import { deleteEssayHandler, DeleteEssayInputSchema } from "./delete";

import { privateRoute } from "../../utils/middleware";

const createHandler = privateRoute
  .input(CreateEssayInputSchema)
  .handler(async ({ context, input }) => {
    const result = await createEssayHandler(context, input);
    return result;
  });

const getHandler = privateRoute
  .input(GetEssayInputSchema)
  .handler(async ({ context, input }) => {
    const result = await getEssayHandler(context, input);
    return result;
  });

const listHandler = privateRoute
  .input(ListEssaysInputSchema)
  .handler(async ({ context, input }) => {
    const result = await listEssaysHandler(context, input);
    return result;
  });

const updateHandler = privateRoute
  .input(UpdateEssayInputSchema)
  .handler(async ({ context, input }) => {
    const result = await updateEssayHandler(context, input);
    return result;
  });

const deleteHandler = privateRoute
  .input(DeleteEssayInputSchema)
  .handler(async ({ context, input }) => {
    const result = await deleteEssayHandler(context, input);
    return result;
  });

export const essay = {
  create: createHandler,
  get: getHandler,
  list: listHandler,
  update: updateHandler,
  delete: deleteHandler,
};
