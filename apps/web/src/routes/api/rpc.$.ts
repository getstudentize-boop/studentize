import { RPCHandler } from "@orpc/server/fetch";
import { createServerFileRoute } from "@tanstack/react-start/server";

import { router } from "@student/api";
import { getUserAuth } from "@/utils/workos";

const handler = new RPCHandler(router);

async function handle({ request }: { request: Request }) {
  const authResponse = await getUserAuth();

  const { response } = await handler.handle(request, {
    prefix: "/api/rpc",
    context: { user: authResponse?.user as any },
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
