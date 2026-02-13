import { onError, ORPCError, os } from "@orpc/server";
import { findOrCreateUser } from "@student/db";

export type Context = {
  user?: Awaited<ReturnType<typeof findOrCreateUser>> | null;
  accessToken?: string;
  organizationId: string;
  userVerificationPayload?: any;
  signupAsAdvisor?: boolean;
};

export type AuthContext = {
  user: NonNullable<Context["user"]>;
  organizationId: string;
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
    const { user, organizationId, signupAsAdvisor } = context as any;

    if (!user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    // impersonate user if set
    const userEmail = process.env.IMPERSONATE_USER_EMAIL ?? user?.email;
    const u = userEmail
      ? await findOrCreateUser({
          email: userEmail,
          organizationId,
          role: signupAsAdvisor ? "ADVISOR" : "STUDENT",
        })
      : null;

    return next({
      context: { user: u, organizationId } as AuthContext,
    });
  })
);
