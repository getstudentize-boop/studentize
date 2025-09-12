import { workos } from "@/utils/workos";
import { createServerFileRoute, setCookie } from "@tanstack/react-start/server";

import { WORKOS_SESSION_KEY, cookieOpts } from "@/utils/workos";
import { redirect } from "@tanstack/react-router";

export const ServerRoute = createServerFileRoute("/api/auth/callback").methods({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return new Response("No code provided", { status: 400 });
    }

    try {
      const response = await workos.userManagement.authenticateWithCode({
        clientId: process.env.VITE_WORKOS_CLIENT_ID!,
        code,
        session: {
          sealSession: true,
          cookiePassword: process.env.WORKOS_COOKIE_PASSWORD!,
        },
      });

      const { sealedSession } = response;
      if (!sealedSession) {
        return new Response("No session returned", { status: 400 });
      }

      setCookie(WORKOS_SESSION_KEY, sealedSession, cookieOpts);

      return redirect({ to: "/guru" });
    } catch (error: any) {
      console.error("Error during authentication:", error);
      return redirect({ to: "/" });
    }
  },
});
