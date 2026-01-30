import { WorkerService } from "../../services/worker";
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
  meetingCode: z.string(),
});

export const createScheduleSessionRoute = createRouteHelper({
  inputSchema: CreateScheduleSessionInputSchema,
  execute: async ({ input, ctx }) => {
    if (!["OWNER", "ADMIN"].includes(ctx.user.organization.role)) {
      throw new ORPCError("UNAUTHORIZED");
    }

    const [advisor, student] = await Promise.all([
      getUserById({ userId: input.advisorUserId }),
      getUserById({ userId: input.studentUserId }),
    ]);

    if (!advisor || !student) {
      throw new ORPCError("BAD_REQUEST", { message: "User not found" });
    }

    const workerService = new WorkerService();

    const title = `${advisor.name} x ${student.name}`;

    // get code from the link if a link is provided
    const meetingCode = input.meetingCode.split("/").pop();

    if (!meetingCode) {
      throw new ORPCError("BAD_REQUEST", { message: "Invalid meeting code" });
    }

    const data = await createScheduleSession({
      scheduledAt: input.scheduledAt,
      advisorUserId: input.advisorUserId,
      studentUserId: input.studentUserId,
      meetingCode,
      title,
    });

    await workerService.triggerAutoJoinMeeting({
      scheduledSessionId: data.scheduledSessionId,
    });

    return data;
  },
});
