import { onError, ORPCError, os } from "@orpc/server";
import { z } from "zod";

type Input = z.ZodType | Record<string, any>;

export const createAnalyticsRouteHelper = <
  I extends Input,
  O extends any = unknown,
>({
  execute,
  inputSchema,
}: {
  inputSchema?: I;
  execute: (data: {
    input: I extends z.ZodType ? z.infer<I> : I;
  }) => Promise<O> | O;
}) => {
  return (data: { input: I extends z.ZodType ? z.infer<I> : I }) =>
    execute({ input: data.input });
};

export const analyticsRoute = os
  .use(
    onError((err) => {
      console.error("Analytics route error:", err);
    }),
  )
  .use(
    os.middleware(({ context, next }) => {
      const { user } = context as { user?: { email?: string } };

      if (!user?.email?.endsWith("@studentize.com")) {
        throw new ORPCError("UNAUTHORIZED");
      }

      return next();
    }),
  );
