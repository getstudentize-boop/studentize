import {
  WorkflowEntrypoint,
  WorkflowEvent,
  WorkflowStep,
} from "cloudflare:workers";

import { Env } from "../utils/env";
import { client } from "../utils/orpc";

export class AutoJoinSessionWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(
    event: WorkflowEvent<{ scheduledSessionId: string; accessToken: string }>,
    step: WorkflowStep
  ) {
    const { accessToken, scheduledSessionId } = event.payload;
    const options = { context: { accessToken } };

    const session = await client.admin.scheduledSessionTime(
      {
        scheduledSessionId,
      },
      options
    );

    if (session?.scheduledAt) {
      // substract 1 minute to allow bot to join a bit earlier
      const scheduledAt = new Date(
        new Date(session.scheduledAt).getTime() - 1 * 60 * 1000
      );

      await step.sleepUntil(
        `wait for scheduled session ${scheduledSessionId} to start`,
        scheduledAt
      );

      await client.admin.sendBotToMeeting(
        {
          scheduledSessionId,
        },
        options
      );
    }
  }
}
