import { createRouterClient } from "@orpc/server";
import { createORPCClient, onError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { getHeaders } from "@tanstack/react-start/server";
import { createIsomorphicFn } from "@tanstack/react-start";

import type { RouterClient } from "@orpc/server";

import { router } from "@student/api";

const getORPCClient = createIsomorphicFn()
  .server(() =>
    createRouterClient(router, {
      context: () => ({
        headers: getHeaders(),
      }),
    })
  )
  .client((): RouterClient<typeof router> => {
    const link = new RPCLink({
      url: `${window.location.origin}/api/rpc`,
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
