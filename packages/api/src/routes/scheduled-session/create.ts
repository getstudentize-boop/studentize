import { createRouteHelper } from "../../utils/middleware";
import { ORPCError } from "@orpc/server";
import { createScheduleSession, getUserById } from "@student/db";
import z from "zod";

export const CreateScheduleSessionInputSchema = z.object({
  scheduledAt: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    })
    .transform((date) => new Date(date)),
  advisorUserId: z.string(),
  studentUserId: z.string(),
  meetingLink: z.string(),
});

export const createScheduleSessionRoute = createRouteHelper({
  inputSchema: CreateScheduleSessionInputSchema,
  execute: async ({ input, ctx }) => {
    if (ctx.user.type !== "ADMIN") {
      throw new ORPCError("UNAUTHORIZED");
    }

    const [advisor, student] = await Promise.all([
      getUserById({ userId: input.advisorUserId }),
      getUserById({ userId: input.studentUserId }),
    ]);

    if (!advisor || !student) {
      throw new ORPCError("BAD_REQUEST", { message: "User not found" });
    }

    const title = `${advisor.name} x ${student.name}`;

    const data = await createScheduleSession({
      scheduledAt: input.scheduledAt,
      advisorUserId: input.advisorUserId,
      studentUserId: input.studentUserId,
      meetingLink: input.meetingLink,
      title,
    });

    return data;
  },
});
