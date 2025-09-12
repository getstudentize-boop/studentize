import { workos } from "@/utils/workos";
import { redirect } from "@tanstack/react-router";
import { createServerFileRoute } from "@tanstack/react-start/server";

export const ServerRoute = createServerFileRoute("/api/auth/login").methods({
  GET: () => {
    const authorizationUrl = workos.userManagement.getAuthorizationUrl({
      provider: "authkit",
      redirectUri: `${process.env.WEB_APP_URL}/api/auth/callback`,
      clientId: process.env.VITE_WORKOS_CLIENT_ID!,
    });

    throw redirect({ href: authorizationUrl });
  },
});
