import { SpacesServiceClient } from "@google-apps/meet";
import { authenticate } from "@google-cloud/local-auth";

import path from "node:path";

const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

export class GoogleMeetService {
  async createSpace() {
    // The scope for creating a new meeting space.
    const scopes = ["https://www.googleapis.com/auth/meetings.space.created"];

    const authClient = await authenticate({
      keyfilePath: CREDENTIALS_PATH,
      scopes,
    });

    // @ts-ignore
    const meetClient = new SpacesServiceClient({ authClient });
    const [response] = await meetClient.createSpace({});

    return response;
  }
}
