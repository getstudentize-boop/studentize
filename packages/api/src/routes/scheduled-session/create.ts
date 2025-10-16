import { GoogleMeetService } from "../../services/google-meet";
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

    const googleMeetService = new GoogleMeetService();

    console.log("Creating meeting...");
    const meeting = await googleMeetService.createSpace();

    console.log("Meeting created:", meeting);

    if (!meeting || !meeting.meetingCode) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create meeting",
      });
    }

    const title = `${advisor.name} x ${student.name}`;

    const data = await createScheduleSession({
      scheduledAt: input.scheduledAt,
      advisorUserId: input.advisorUserId,
      studentUserId: input.studentUserId,
      meetingLink: meeting.meetingCode,
      title,
    });

    return data;
  },
});
