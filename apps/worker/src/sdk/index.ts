const getWorkUrl = () => {
  // @ts-ignore
  const workUrl = import.meta.env.VITE_WORKER_URL!;
  if (!workUrl) {
    throw new Error("VITE_WORKER_URL is not set");
  }

  return { workUrl };
};

export const session = {
  triggerSummaryUpdate: async (
    authAccessToken: string,
    input: {
      sessionId: string;
    }
  ) => {
    await fetch(`${getWorkUrl().workUrl}/sessions/summary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authAccessToken}`,
      },
      body: JSON.stringify(input),
    });
  },
};
