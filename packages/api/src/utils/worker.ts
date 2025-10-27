export const workerRequest = async (input: { endpoint: string; body: any }) => {
  const data = await fetch(`${process.env.VITE_WORKER_URL}${input.endpoint}`, {
    headers: {
      Authorization: `TOKEN ${process.env.ADMIN_TOKEN}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(input.body),
  });

  if (!data.ok) {
    throw new Error("Worker request failed");
  }

  return data.json();
};
