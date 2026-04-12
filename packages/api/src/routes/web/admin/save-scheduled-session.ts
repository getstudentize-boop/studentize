import {
  createSession,
  getScheduledSessionByBotId,
  updateScheduledSessionDoneAt,
  updateSessionSummary,
  getUserName,
} from "@student/db";
import { createAdminRouteHelper } from "../../../utils/middleware";
import z from "zod";
import { MeetingBotService } from "../../../services/meeting-bot";
import {
  createTemporaryTranscriptionObjectKey,
  createTranscriptionObjectKey,
  getSignedUrl,
  uploadTextFile,
} from "../../../utils/s3";

import { summarizeTranscript } from "@student/ai/services";

import { format as _format } from "date-fns";
import { downloadReplayRoute } from "./download-replay";
import { Resend } from "resend";

export const SaveScheduledSessionInputSchema = z.object({
  botId: z.string(),
});

export const saveScheduledSession = createAdminRouteHelper({
  inputSchema: SaveScheduledSessionInputSchema,
  execute: async ({ input }) => {
    const scheduledSession = await getScheduledSessionByBotId({
      botId: input.botId,
    });

    // If no scheduled session is found for this botId, it may have been
    // incorrectly attached by Recall. Just return without processing.
    if (!scheduledSession) {
      console.error(
        `No scheduled session found for botId: ${input.botId}. Skipping.`,
      );
      return { skipped: true };
    }

    const meetingBotService = new MeetingBotService();

    const response = await meetingBotService.getMeetingInformation({
      botId: input.botId,
    });

    const doneStatusChange = response.status_changes.find(
      (c) => c.code === "done",
    );

    if (!doneStatusChange) {
      throw new Error("Meeting is not done yet");
    }

    const transcriptionData = await meetingBotService.getMeetingTranscription({
      information: response,
    });

    // first create the session
    const newSession = await createSession({
      studentUserId: scheduledSession.studentUserId,
      advisorUserId: scheduledSession.advisorUserId,
      title: `${scheduledSession.title} (${_format(new Date(), "MMM do, yyyy")})`,
      createdAt: scheduledSession.scheduledAt,
    });

    const transcriptText = transcriptionData
      .map((entry) => {
        const minutes = Math.floor(
          entry.words[0].start_timestamp.relative / 60,
        );
        const seconds = Math.floor(
          entry.words[0].start_timestamp.relative % 60,
        );
        const timestamp = `${minutes}:${seconds.toString().padStart(2, "0")}`;

        const content = entry.words.map((word) => word.text).join(" ");
        return `${timestamp} - ${entry.participant.name}\n${content}`;
      })
      .join("\n\n");

    const isGoogleSynced = scheduledSession.googleEventId !== null;

    const isTemporaryUpload = isGoogleSynced || !scheduledSession.studentUserId;

    const upload = await getSignedUrl(
      "transcription",
      isTemporaryUpload
        ? createTemporaryTranscriptionObjectKey({
            ext: "txt",
            sessionId: newSession.id,
          })
        : createTranscriptionObjectKey({
            ext: "txt",
            studentUserId: scheduledSession.studentUserId!,
            sessionId: newSession.id,
          }),
      { type: "put" },
    );

    await uploadTextFile({ uploadUrl: upload, content: transcriptText });

    await updateScheduledSessionDoneAt({
      scheduledSessionId: scheduledSession.id,
      doneAt: new Date(doneStatusChange.created_at),
      createdSessionId: newSession.id,
    });

    // summarize content of the session
    const summary = await summarizeTranscript(transcriptText);
    await updateSessionSummary({
      sessionId: newSession.id,
      summary,
    });

    if (!isTemporaryUpload) {
      await downloadReplayRoute({
        input: { sessionId: newSession.id },
      });

      // Send rating email to the student
      const resendKey = process.env.RESEND_API_KEY;
      const fromEmail = process.env.RESEND_FROM_EMAIL;
      const fromName = process.env.RESEND_FROM_NAME;

      if (resendKey && fromEmail && scheduledSession.studentUserId) {
        try {
          const resend = new Resend(resendKey);
          const from = fromName?.trim()
            ? `${fromName.trim()} <${fromEmail}>`
            : fromEmail;

          const [student, advisor] = await Promise.all([
            getUserName({ userId: scheduledSession.studentUserId }),
            getUserName({ userId: scheduledSession.advisorUserId ?? "" }),
          ]);

          const sessionTitle =
            scheduledSession.title ||
            [student?.name, advisor?.name].filter(Boolean).join(" x ") ||
            "Your advising session";

          const sessionUrl = `${process.env.WEB_APP_URL ?? "https://studentize.com"}/student/sessions/${newSession.id}`;

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
          console.error("Failed to send session rating email", err);
        }
      }
    }

    return {
      sessionId: newSession.id,
    };
  },
});
