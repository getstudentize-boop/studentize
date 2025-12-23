import { createServerFileRoute } from "@tanstack/react-start/server";

import { db, schema } from "@student/db";

export async function fetchTokensFromAuthorizationCode(input: {
  code: string;
}) {
  const { code } = input;

  const params = {
    client_id: process.env.AUTO_CALENDAR_CLIENT_ID!,
    client_secret: process.env.AUTO_CALENDAR_CLIENT_SECRET!,
    redirect_uri: `${process.env.WEB_APP_URL}/api/google_oauth_callback`,
    grant_type: "authorization_code",
    code,
  };

  const url = new URL("https://oauth2.googleapis.com/token");
  const response = await fetch(url.toString(), {
    method: "POST",
    body: new URLSearchParams(params),
  });

  return await response.json();
}

// list calendar events

export const ServerRoute = createServerFileRoute(
  "/api/google_oauth_callback"
).methods({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    const state = url.searchParams.get("state");

    const { userId } = JSON.parse(state ?? "{}");

    if (!userId) {
      return new Response("No userId provided", { status: 400 });
    }

    if (!code) {
      return new Response("No code provided", { status: 400 });
    }

    const tokens = await fetchTokensFromAuthorizationCode({ code });

    const response = await fetch(
      "https://us-west-2.recall.ai/api/v2/calendars/",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          Authorization: process.env.RECALLAI_API_KEY!,
        },
        body: JSON.stringify({
          platform: "google_calendar",
          oauth_client_id: process.env.AUTO_CALENDAR_CLIENT_ID!,
          oauth_client_secret: process.env.AUTO_CALENDAR_CLIENT_SECRET!,
          oauth_refresh_token: tokens.refresh_token,
        }),
      }
    );

    const calendar = await response.json();

    await db.insert(schema.calendar).values({
      userId,
      calendarId: calendar.id,
    });

    return new Response("Tokens fetched", { status: 200 });
  },
});
