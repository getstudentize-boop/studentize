import { RPCLink } from "@orpc/client/fetch";
import { createORPCClient } from "@orpc/client";
import { RouterClient } from "@orpc/server";

import { router } from "@student/api";

import { env } from "node:process";

const link = new RPCLink({
  url: env.API_URL ?? "",
  headers: ({ context }) => {
    return {
      authorization: `Bearer ${context.accessToken}`,
    };
  },
});

export const client: RouterClient<typeof router> = createORPCClient(link);
