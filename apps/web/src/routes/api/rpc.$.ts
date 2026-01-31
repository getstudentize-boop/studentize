import { RPCHandler } from "@orpc/server/fetch";
import { createServerFileRoute } from "@tanstack/react-start/server";

import { router, getUserAuth } from "@student/api";

const handler = new RPCHandler(router);

const organizationToHostMap = {
  localhost:
    process.env.LOCALHOST_ORGANIZATION_ID ?? "ujx3v67lc1tis9i32t3mea7b",
  "app.studentize.com": "ujx3v67lc1tis9i32t3mea7b",
};

async function handle({ request }: { request: Request }) {
  const [_, accessToken] =
    request.headers.get("Authorization")?.split(" ") ?? [];

  const hostname = request.headers.get("Hostname");

  const authResponse =
    accessToken === process.env.ADMIN_TOKEN
      ? null
      : await getUserAuth(accessToken);

  const { userData, userAccessToken } = authResponse ?? ({} as any);

  const organizationId =
    organizationToHostMap[hostname as keyof typeof organizationToHostMap] ??
    null;

  const { response } = await handler.handle(request, {
    prefix: "/api/rpc",
    context: {
      user: userData as any,
      accessToken: userAccessToken ?? accessToken,
      organizationId,
    },
  });

  return response ?? new Response("Not Found", { status: 404 });
}

export const ServerRoute = createServerFileRoute("/api/rpc/$").methods({
  HEAD: handle,
  GET: handle,
  POST: handle,
  PUT: handle,
  PATCH: handle,
  DELETE: handle,
});
