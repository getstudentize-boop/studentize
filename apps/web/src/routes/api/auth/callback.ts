import { createServerFileRoute, setCookie } from "@tanstack/react-start/server";

import { WORKOS_SESSION_KEY, cookieOpts, workos } from "@student/api";
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
      // In development, surface the error to the browser for easier debugging.
      if (process.env.NODE_ENV !== 'production') {
        const message = error?.message || String(error);
        const details = error?.response?.data || error?.stack || null;
        return new Response(
          JSON.stringify({ error: message, details }, null, 2),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return redirect({ to: "/" });
    }
  },
});
