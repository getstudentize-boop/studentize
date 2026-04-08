import { createFileRoute } from "@tanstack/react-router";
import { RPCHandler } from "@orpc/server/fetch";
import { analyticsRouter } from "@student/api/analytics";
import { getUserAuth } from "@student/api";

const rpcHandler = new RPCHandler(analyticsRouter);

async function handle({ request }: { request: Request }) {
  const [_, accessToken] =
    request.headers.get("Authorization")?.split(" ") ?? [];

  const authResponse =
    accessToken === process.env.ADMIN_TOKEN
      ? null
      : await getUserAuth(accessToken);

  const { userData, userAccessToken } = authResponse ?? ({} as any);

  const { response } = await rpcHandler.handle(request, {
    prefix: "/api/rpc",
    context: {
      user: userData as any,
      accessToken: userAccessToken ?? accessToken,
    },
  });

  return response ?? new Response("Not Found", { status: 404 });
}

export const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
      PUT: handle,
      PATCH: handle,
      DELETE: handle,
      HEAD: handle,
    },
  },
});
