import { os } from "@orpc/server";

import { createAdvisor, CreateAdvisorInputSchema } from "./create";
import { listAdvisors } from "./lists";

import { defaultMiddleware } from "../../utils/middleware";

export const advisorCreateHandler = os
  .use(defaultMiddleware)
  .input(CreateAdvisorInputSchema)
  .handler(async ({ input }) => {
    const result = await createAdvisor(input);
    return result;
  });

export const advisorListHandler = os
  .use(defaultMiddleware)
  .handler(async () => {
    const advisors = await listAdvisors();
    return advisors;
  });
