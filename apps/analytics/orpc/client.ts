import { createRouterClient } from "@orpc/server";
import { createORPCClient, onError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { createIsomorphicFn } from "@tanstack/react-start";

import type { RouterClient, InferRouterOutputs } from "@orpc/server";

import { analyticsRouter } from "@student/api/analytics";
import { createClient } from "@workos-inc/authkit-js";

export type RouterOutputs = InferRouterOutputs<typeof analyticsRouter>;

const getORPCClient = createIsomorphicFn()
  .server(() =>
    createRouterClient(analyticsRouter, {
      context: async () => ({
        headers: getRequestHeaders(),
      }),
      interceptors: [
        onError((error) => {
          console.error("Analytics ORPC Error:", error);
        }),
      ],
    }),
  )
  .client((): RouterClient<typeof analyticsRouter> => {
    const link = new RPCLink({
      url: `${window.location.origin}/api/rpc`,
      headers: async () => {
        console.log("WORKOS_CLIENT_ID", import.meta.env.VITE_WORKOS_CLIENT_ID!);
        const workos = await createClient(
          import.meta.env.VITE_WORKOS_CLIENT_ID!,
          { devMode: true },
        );

        const data = await workos.getAccessToken();

        return {
          Authorization: `Bearer ${data}`,
          Hostname: window.location.hostname,
        };
      },
      interceptors: [
        onError((error) => {
          console.error("Analytics ORPC Error:", error);
        }),
      ],
    });
    return createORPCClient(link);
  });

export const client: RouterClient<typeof analyticsRouter> = getORPCClient();

export const orpc = createTanstackQueryUtils(client);
