import { useAuth } from "@workos-inc/authkit-react";
import { session as workerSession } from "@student/worker/sdk";

export const useSessionSummary = () => {
  const user = useAuth();

  const startSessionSummaryGeneration = async ({
    sessionId,
  }: {
    sessionId: string;
  }) => {
    const accessToken = await user.getAccessToken();
    await workerSession.triggerSummaryUpdate(accessToken, {
      sessionId: sessionId,
    });
  };

  return { startSessionSummaryGeneration };
};
