import { workerRequest } from "../utils/worker";

export class WorkerService {
  async triggerAutoJoinMeeting(input: { scheduledSessionId: string }) {
    return workerRequest({
      endpoint: "/sessions/auto-join",
      body: {
        scheduledSessionId: input.scheduledSessionId,
      },
    });
  }
}
