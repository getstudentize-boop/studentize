export const BOT_NAME = "Studentize Meeting Bot";

export const recallRequest = async (input: {
  endpoint: `/${string}`;
  body?: any;
}) => {
  const response = await fetch(
    `https://${process.env.RECALLAI_REGION}.recall.ai/api/v1${input.endpoint}`,
    {
      headers: {
        Authorization: `TOKEN ${process.env.RECALLAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      method: input.body ? "POST" : "GET",
      body: input.body ? JSON.stringify(input.body) : undefined,
    }
  );

  if (!response.ok) {
    throw new Error(`Recall API request failed: ${response.statusText}`);
  }

  return response.json();
};
