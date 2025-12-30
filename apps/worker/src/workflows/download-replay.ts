import {
  WorkflowEntrypoint,
  WorkflowEvent,
  WorkflowStep,
} from "cloudflare:workers";

import { Env } from "../utils/env";
import { client } from "../utils/orpc";

export class DownloadReplayWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(
    event: WorkflowEvent<{ sessionId: string; accessToken: string }>,
    step: WorkflowStep
  ) {
    const { accessToken, sessionId } = event.payload;
    const options = { context: { accessToken } };

    await step.do("download replay", async () => {
      const result = await client.admin.downloadReplay(
        {
          sessionId,
        },
        options
      );

      return result;
    });
  }
}
