import { RPCHandler } from "@orpc/server/fetch";
import { createServerFileRoute } from "@tanstack/react-start/server";

import { router, getUserAuth } from "@student/api";

const handler = new RPCHandler(router);

async function handle({ request }: { request: Request }) {
  const [_, accessToken] =
    request.headers.get("Authorization")?.split(" ") ?? [];

  const authResponse =
    accessToken === process.env.ADMIN_TOKEN
      ? null
      : await getUserAuth(accessToken);

  const { response } = await handler.handle(request, {
    prefix: "/api/rpc",
    context: { user: authResponse as any, accessToken: accessToken },
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
