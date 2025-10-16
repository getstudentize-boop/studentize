import { onError, ORPCError, os } from "@orpc/server";
import { findOrCreateUser } from "@student/db";

export type Context = {
  user?: Awaited<ReturnType<typeof findOrCreateUser>> | null;
};

export type AuthContext = {
  user: NonNullable<Context["user"]>;
};

import { z } from "zod";

type Input = z.ZodType | Record<string, any>;

export const createRouteHelper = <I extends Input, O extends any = unknown>({
  execute,
  inputSchema,
}: {
  inputSchema?: I;
  execute: (data: {
    ctx: AuthContext;
    input: I extends z.ZodType ? z.infer<I> : I;
  }) => Promise<O> | O;
}) => {
  return (data: {
    input: I extends z.ZodType ? z.infer<I> : I;
    context: AuthContext;
  }) => execute({ ctx: data.context, input: data.input });
};

export const defaultMiddleware = os.middleware(
  async ({ next, context, path }) => {
    const { user } = context as any;
    const userEmail = user?.email;

    const u = userEmail ? await findOrCreateUser({ email: userEmail }) : null;

    return await next({
      context: {
        user: u,
      },
    });
  }
);

export const serverRoute = os
  .$context<Context>()
  .use(defaultMiddleware)
  .use(
    onError((err) => {
      console.error("Error in route:", err);
    })
  );

export const privateRoute = serverRoute.use(
  os.middleware(({ context, next, path }) => {
    const data = context as Context;

    if (!data.user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    return next({
      context: data as AuthContext,
    });
  })
);
