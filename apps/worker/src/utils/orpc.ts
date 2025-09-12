import { RPCLink } from "@orpc/client/fetch";
import { createORPCClient } from "@orpc/client";
import { RouterClient } from "@orpc/server";

import { router } from "@student/api";

const link = new RPCLink({
  url: "https://localhost:3000/api/rpc",
  headers: () => {
    return {
      authorization: `Bearer`,
    };
  },
});

export const client: RouterClient<typeof router> = createORPCClient(link);
