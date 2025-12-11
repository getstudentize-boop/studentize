export const getCalendarList = async (input: { accessToken: string }) => {
  const { accessToken } = input;

  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/users/me/calendarList",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    console.log("response", response.status);
    throw new Error("Failed to fetch calendar list");
  }

  return response.json();
};
