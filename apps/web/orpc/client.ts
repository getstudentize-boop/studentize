import { createRouterClient } from "@orpc/server";
import { createORPCClient, onError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { getHeaders } from "@tanstack/react-start/server";
import { createIsomorphicFn } from "@tanstack/react-start";

import type { RouterClient, InferRouterOutputs } from "@orpc/server";

import { router } from "@student/api";
import { createClient } from "@workos-inc/authkit-js";

export type RouterOutputs = InferRouterOutputs<typeof router>;

const getORPCClient = createIsomorphicFn()
  .server(() =>
    createRouterClient(router, {
      context: async () => ({
        headers: getHeaders(),
      }),
      interceptors: [
        onError((error) => {
          // Log the error
          console.error("ORPC Error:", error);
        }),
      ],
    })
  )
  .client((): RouterClient<typeof router> => {
    const link = new RPCLink({
      url: `${window.location.origin}/api/rpc`,
      headers: async () => {
        const workos = await createClient(
          import.meta.env.VITE_WORKOS_CLIENT_ID!
        );
        const data = await workos.getAccessToken();

        return {
          Authorization: `Bearer ${data}`,
        };
      },
      interceptors: [
        onError((error) => {
          // Log the error
          console.error("ORPC Error:", error);
        }),
      ],
    });
    return createORPCClient(link);
  });

export const client: RouterClient<typeof router> = getORPCClient();

export const orpc = createTanstackQueryUtils(client);
