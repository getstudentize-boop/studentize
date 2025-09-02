import { os } from "@orpc/server";

export const defaultMiddleware = os.middleware(async ({ next }) => {
  return next({
    context: {
      userId: "xxx",
    },
  });
});
