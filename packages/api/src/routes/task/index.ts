import { createTaskHandler, CreateTaskInputSchema } from "./create";
import { listTasksHandler, ListTasksInputSchema } from "./list";
import { updateTaskHandler, UpdateTaskInputSchema } from "./update";
import { deleteTaskHandler, DeleteTaskInputSchema } from "./delete";

import { privateRoute } from "../../utils/middleware";

const createHandler = privateRoute
  .input(CreateTaskInputSchema)
  .handler(async ({ context, input }) => {
    const result = await createTaskHandler(context, input);
    return result;
  });

const listHandler = privateRoute
  .input(ListTasksInputSchema)
  .handler(async ({ context, input }) => {
    const result = await listTasksHandler(context, input);
    return result;
  });

const updateHandler = privateRoute
  .input(UpdateTaskInputSchema)
  .handler(async ({ context, input }) => {
    const result = await updateTaskHandler(context, input);
    return result;
  });

const deleteHandler = privateRoute
  .input(DeleteTaskInputSchema)
  .handler(async ({ context, input }) => {
    const result = await deleteTaskHandler(context, input);
    return result;
  });

export const task = {
  create: createHandler,
  list: listHandler,
  update: updateHandler,
  delete: deleteHandler,
};
