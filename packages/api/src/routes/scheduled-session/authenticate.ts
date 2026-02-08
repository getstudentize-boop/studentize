import { ORPCError } from "@orpc/server";
import { createRouteHelper } from "../../utils/middleware";

// https://docs.recall.ai/reference/calendar_authenticate_create
export const getAuthToken = async () => {
  const response = await fetch(
    "https://us-west-2.recall.ai/api/v1/calendar/authenticate/",
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: process.env.RECALLAI_API_KEY!,
      },
      body: JSON.stringify({ user_id: "fa1ca6c1-4aa6-4842-9181-cec59259f516" }),
    }
  );

  const data = await response.json();

  // The response might have 'token' or 'recall_calendar_auth_token' field
  const token = data.token || data.recall_calendar_auth_token;
  if (!token) {
    throw new Error(
      `Recall.ai API did not return a token. Response: ${JSON.stringify(data)}`
    );
  }
  return token;
};

export const Oauth = async (input: { userId: string }) => {
  const { userId } = input;

  const url = new URL(`https://accounts.google.com/o/oauth2/v2/auth`);

  const authToken = await getAuthToken();

  url.searchParams.set(
    "scope",
    "https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/userinfo.email"
  );
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", process.env.AUTO_CALENDAR_CLIENT_ID!);

  const redirectUri = `${process.env.WEB_APP_URL}/api/google_oauth_callback`;
  url.searchParams.set("redirect_uri", redirectUri);

  const state = JSON.stringify({
    recall_calendar_auth_token: authToken,
    google_oauth_redirect_url: redirectUri,
    success_url: `${process.env.WEB_APP_URL}/api/google-calendar/success`,
    error_url: `${process.env.WEB_APP_URL}/api/google-calendar/error`,
    userId,
  });

  // URLSearchParams.set() automatically URL-encodes the value, so no need for encodeURIComponent
  url.searchParams.set("state", state);

  return url.toString();
};

export const authenticateGoogleRoute = createRouteHelper({
  execute: async ({ ctx }) => {
    if (!["OWNER", "ADMIN"].includes(ctx.user.organization.role)) {
      throw new ORPCError("FORBIDDEN", { message: "Access denied" });
    }

    return Oauth({ userId: ctx.user.id });
  },
});
