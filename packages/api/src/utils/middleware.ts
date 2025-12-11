import { onError, ORPCError, os } from "@orpc/server";
import { findOrCreateUser } from "@student/db";

export type Context = {
  user?: Awaited<ReturnType<typeof findOrCreateUser>> | null;
  accessToken?: string;
  userVerificationPayload?: any;
};

export type AuthContext = {
  user: NonNullable<Context["user"]>;
};

import { z } from "zod";
import { getCalendarList } from "./google";

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

export const createAdminRouteHelper = <
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

export const serverRoute = os.$context<Context>().use(
  onError((err) => {
    console.error("Error in route:", err);
  })
);

export const adminRoute = serverRoute.use(
  os.middleware(({ context, next }) => {
    const { accessToken } = context as Context;

    const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

    if (accessToken !== ADMIN_TOKEN) {
      throw new ORPCError("FORBIDDEN", { message: "Admin access required" });
    }

    return next();
  })
);

export const privateRoute = serverRoute.use(
  os.middleware(async ({ context, next }) => {
    const { user, accessToken } = context as any;

    const data = await getCalendarList({ accessToken });

    console.log("data", data);

    if (!user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    const userEmail = user?.email;
    const u = userEmail ? await findOrCreateUser({ email: userEmail }) : null;

    return next({
      context: { user: u } as AuthContext,
    });
  })
);
