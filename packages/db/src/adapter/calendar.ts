import { db, eq, schema } from "..";

export const deleteCalendarByUserId = async (input: { userId: string }) => {
  await db
    .delete(schema.calendar)
    .where(eq(schema.calendar.userId, input.userId));
};
