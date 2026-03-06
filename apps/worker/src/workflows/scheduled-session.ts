import {
  WorkflowEntrypoint,
  WorkflowEvent,
  WorkflowStep,
} from "cloudflare:workers";
import { Resend } from "resend";

import { Env } from "../utils/env";
import { client } from "../utils/orpc";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const MINUTE_IN_MS = 60 * 1000;

type SessionParticipant = {
  email: string | null;
  name: string | null;
};

type ScheduledSessionReminder = {
  advisor: SessionParticipant | null;
  meetingCode: string;
  scheduledAt: Date | string;
  student: SessionParticipant | null;
  title: string;
};

type ReminderRecipient = SessionParticipant & {
  email: string;
  role: "advisor" | "student";
};

export class AutoJoinSessionWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(
    event: WorkflowEvent<{ scheduledSessionId: string; accessToken: string }>,
    step: WorkflowStep,
  ) {
    const { accessToken, scheduledSessionId } = event.payload;
    const options = { context: { accessToken } };

    const session = await client.admin.scheduledSessionTime(
      {
        scheduledSessionId,
      },
      options,
    );

    if (!session?.scheduledAt) {
      return;
    }

    const scheduledAt = new Date(session.scheduledAt);

    if (Number.isNaN(scheduledAt.getTime())) {
      console.error(
        `Invalid scheduled session time for scheduled session ${scheduledSessionId}`,
      );
      return;
    }

    const reminderAt = new Date(scheduledAt.getTime() - DAY_IN_MS);
    const botJoinAt = new Date(scheduledAt.getTime() - MINUTE_IN_MS);

    if (scheduledAt.getTime() > Date.now() && hasReminderRecipients(session)) {
      if (reminderAt.getTime() > Date.now()) {
        await step.sleepUntil(
          `wait to send reminder for scheduled session ${scheduledSessionId}`,
          reminderAt,
        );
      }

      await step.do(
        `send reminder emails for scheduled session ${scheduledSessionId}`,
        async () => {
          return sendReminderEmails({
            env: this.env,
            scheduledSessionId,
            session,
          });
        },
      );
    }

    if (botJoinAt.getTime() > Date.now()) {
      await step.sleepUntil(
        `wait for scheduled session ${scheduledSessionId} to start`,
        botJoinAt,
      );
    }

    await step.do(`send bot to scheduled session ${scheduledSessionId}`, async () =>
      client.admin.sendBotToMeeting(
        {
          scheduledSessionId,
        },
        options,
      ),
    );
  }
}

function hasReminderRecipients(session: ScheduledSessionReminder) {
  return getReminderRecipients(session).length > 0;
}

function getReminderRecipients(
  session: ScheduledSessionReminder,
): ReminderRecipient[] {
  const recipients = new Map<string, ReminderRecipient>();

  const participants: Array<ReminderRecipient | null> = [
    session.student?.email
      ? {
          role: "student",
          email: session.student.email,
          name: session.student.name ?? null,
        }
      : null,
    session.advisor?.email
      ? {
          role: "advisor",
          email: session.advisor.email,
          name: session.advisor.name ?? null,
        }
      : null,
  ];

  for (const participant of participants) {
    if (!participant) {
      continue;
    }

    recipients.set(participant.email, participant);
  }

  return [...recipients.values()];
}

async function sendReminderEmails(input: {
  env: Env;
  scheduledSessionId: string;
  session: ScheduledSessionReminder;
}) {
  const { env, scheduledSessionId, session } = input;

  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
    console.warn(
      `Skipping reminder emails for scheduled session ${scheduledSessionId}: missing Resend configuration`,
    );
    return {
      skipped: true,
      reason: "missing Resend configuration",
    };
  }

  const recipients = getReminderRecipients(session);

  if (recipients.length === 0) {
    return {
      skipped: true,
      reason: "no recipients",
    };
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const from = formatFromAddress(env.RESEND_FROM_EMAIL, env.RESEND_FROM_NAME);
  const scheduledAt = new Date(session.scheduledAt);
  const meetingUrl = `https://meet.google.com/${session.meetingCode}`;
  const sent: Array<{ email: string; id: string }> = [];
  const failed: Array<{ email: string; error: string }> = [];

  for (const recipient of recipients) {
    try {
      const response = await resend.emails.send({
        from,
        subject: `Reminder: ${session.title}`,
        text: buildReminderText({
          meetingUrl,
          recipient,
          scheduledAt,
          session,
        }),
        to: recipient.email,
      });

      if (response.error) {
        failed.push({
          email: recipient.email,
          error: response.error.message,
        });
        continue;
      }

      sent.push({
        email: recipient.email,
        id: response.data.id,
      });
    } catch (error) {
      failed.push({
        email: recipient.email,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  if (failed.length > 0) {
    console.error("Failed to send one or more scheduled session reminders", {
      failed,
      scheduledSessionId,
    });
  }

  return {
    failed,
    sent,
  };
}

function buildReminderText(input: {
  meetingUrl: string;
  recipient: ReminderRecipient;
  scheduledAt: Date;
  session: ScheduledSessionReminder;
}) {
  const { meetingUrl, recipient, scheduledAt, session } = input;
  const recipientName = recipient.name?.trim() || "there";
  const counterpart =
    recipient.role === "student"
      ? formatParticipant(session.advisor, "your advisor")
      : formatParticipant(session.student, "your student");

  return [
    `Hi ${recipientName},`,
    "",
    `This is a reminder that your Studentize session "${session.title}" with ${counterpart} is scheduled for ${formatScheduledAt(scheduledAt)}.`,
    "",
    `Join link: ${meetingUrl}`,
    `Student: ${formatParticipant(session.student, "Unassigned student")}`,
    `Advisor: ${formatParticipant(session.advisor, "Unassigned advisor")}`,
    "",
    "Please plan to join a few minutes early.",
    "",
    "Studentize",
  ].join("\n");
}

function formatParticipant(
  participant: SessionParticipant | null,
  fallback: string,
) {
  return participant?.name?.trim() || participant?.email || fallback;
}

function formatScheduledAt(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "long",
    timeZoneName: "short",
    weekday: "long",
    year: "numeric",
  }).format(date);
}

function formatFromAddress(email: string, name?: string) {
  return name?.trim() ? `${name.trim()} <${email}>` : email;
}
