import {
  WorkflowEntrypoint,
  WorkflowEvent,
  WorkflowStep,
} from "cloudflare:workers";

import { Env } from "../utils/env";
import { client } from "../utils/orpc";

export class SummarizeSessionWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(
    event: WorkflowEvent<{ sessionId: string; accessToken: string }>,
    step: WorkflowStep
  ) {
    const sessionId = event.payload.sessionId;

    await step.do("Summarize transcription", async () => {
      try {
        const result = await client.session.summarizeTranscription(
          {
            sessionId,
          },
          { context: { accessToken: event.payload.accessToken } }
        );

        return result;
      } catch (error) {
        console.error("Error summarizing transcription:", error);
        throw error;
      }
    });
  }
}
