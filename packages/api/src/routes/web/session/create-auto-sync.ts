import { createRouteHelper } from "../../../utils/middleware";
import {
  updateSessionById,
  getScheduledSessionByCreatedSessionId,
  getUserName,
  getSessionById,
} from "@student/db";

import { ORPCError } from "@orpc/server";
import z from "zod";
import {
  createTemporaryTranscriptionObjectKey,
  createTranscriptionObjectKey,
  deleteFile,
  getSignedUrl,
  readFile,
  uploadTextFile,
} from "../../../utils/s3";
import { downloadReplayRoute } from "../admin/download-replay";
import { Resend } from "resend";

export const CreateAutoSyncInputSchema = z.object({
  sessionId: z.string(),
  studentUserId: z.string(),
  advisorUserId: z.string(),
  title: z.string().optional(),
});

export const createAutoSyncRoute = createRouteHelper({
  inputSchema: CreateAutoSyncInputSchema,
  execute: async ({ ctx, input }) => {
    if (!["OWNER", "ADMIN"].includes(ctx.user.organization.role)) {
      throw new ORPCError("UNAUTHORIZED");
    }

    const { sessionId, advisorUserId, studentUserId, title } = input;

    // Find the scheduled session linked to this session
    const scheduledSession = await getScheduledSessionByCreatedSessionId({
      sessionId,
    });

    await updateSessionById({
      sessionId,
      advisorUserId,
      studentUserId,
      ...(title && { title }),
      createdAt: scheduledSession?.scheduledAt,
    });

    const temporaryTranscriptionKey = createTemporaryTranscriptionObjectKey({
      sessionId,
      ext: "txt",
    });

    // read the temporary transcription
    const temporaryTranscription = await readFile({
      bucket: "transcription",
      key: temporaryTranscriptionKey,
    });

    if (!temporaryTranscription) {
      throw new ORPCError("NOT_FOUND", {
        message: "Temporary transcription not found",
      });
    }

    const transcriptionKey = createTranscriptionObjectKey({
      sessionId,
      ext: "txt",
      studentUserId,
    });

    const uploadUrl = await getSignedUrl("transcription", transcriptionKey, {
      type: "put",
    });

    await uploadTextFile({ uploadUrl, content: temporaryTranscription });

    await deleteFile({
      bucket: "transcription",
      key: temporaryTranscriptionKey,
    });

    await downloadReplayRoute({ input: { sessionId } });

    // send email to the student
    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    const fromName = process.env.RESEND_FROM_NAME;

    if (resendKey && fromEmail) {
      try {
        const resend = new Resend(resendKey);
        const from = fromName?.trim()
          ? `${fromName.trim()} <${fromEmail}>`
          : fromEmail;

        const [student, advisor, session] = await Promise.all([
          getUserName({ userId: studentUserId }),
          getUserName({ userId: advisorUserId }),
          getSessionById({ sessionId }),
        ]);

        const sessionTitle =
          input.title ||
          session?.title ||
          [student?.name, advisor?.name].filter(Boolean).join(" x ") ||
          "Your advising session";

        const sessionUrl = `${process.env.WEB_APP_URL ?? "https://studentize.com"}/student/sessions/${sessionId}`;

        if (student?.email) {
          await resend.emails.send({
            from,
            to: [student.email],
            subject: `Your session "${sessionTitle}" is ready to review`,
            text: [
              `Hi ${student.name ?? "there"},`,
              "",
              `Your advising session "${sessionTitle}" has been uploaded and is ready to review on Studentize.`,
              "",
              `View your session and rate it here: ${sessionUrl}`,
              "",
              "Log in to view the session summary, transcript, and leave a rating.",
              "",
              "Best,",
              "The Studentize Team",
            ].join("\n"),
            html: `
              <p>Hi ${student.name ?? "there"},</p>
              <p>Your advising session "<strong>${sessionTitle}</strong>" has been uploaded and is ready to review on Studentize.</p>
              <p><a href="${sessionUrl}" style="color: #2563eb; text-decoration: underline;">View your session and rate it</a></p>
              <p>Log in to view the session summary, transcript, and leave a rating to help us improve.</p>
              <p>Best,<br>The Studentize Team</p>
            `,
          });
        }
      } catch (err) {
        console.error("Failed to send session upload email", err);
      }
    }
  },
});
