import { WorkOS } from "@workos-inc/node";

import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

export const WORKOS_SESSION_KEY = "wos-session";

export const workos = new WorkOS(process.env.WORKOS_API_KEY!, {
  clientId: process.env.WORKOS_CLIENT_ID!,
});

export const getAuth = async (sessionData: string) => {
  const session = await workos.userManagement.loadSealedSession({
    sessionData: sessionData,
    cookiePassword: process.env.WORKOS_COOKIE_PASSWORD!,
  });

  const response = await session.authenticate();

  return response;
};

export const getUserAuth = createServerFn({ method: "GET" }).handler(
  async () => {
    const cookie = getCookie(WORKOS_SESSION_KEY);

    if (cookie) {
      const response = await getAuth(cookie);

      if (response.authenticated) {
        const user = response.user;
        return { user };
      }
    }
  }
);
