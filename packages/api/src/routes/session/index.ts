import { os } from "@orpc/server";

import { sessionList } from "./list";

import { defaultMiddleware } from "../../utils/middleware";

export const sessionListHandler = os
  .use(defaultMiddleware)
  .handler(async ({}) => {
    const result = await sessionList();
    return result;
  });
