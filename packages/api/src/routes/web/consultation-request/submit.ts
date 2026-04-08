import { Resend } from "resend";
import { z } from "zod";

import { createAdvisorInquiry } from "@student/db";
import { serverRoute } from "../../../utils/middleware";

export const SubmitConsultationRequestInputSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
});

function formatFromAddress(email: string, name?: string) {
  return name?.trim() ? `${name.trim()} <${email}>` : email;
}

export const submitConsultationRequestHandler = serverRoute
  .input(SubmitConsultationRequestInputSchema)
  .handler(async ({ input }) => {
    const inquiry = await createAdvisorInquiry({
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
    });

    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    const fromName = process.env.RESEND_FROM_NAME;
    const to = process.env.CONSULTATION_NOTIFICATION_EMAIL;

    if (resendKey && fromEmail && to) {
      try {
        const resend = new Resend(resendKey);
        const from = formatFromAddress(fromEmail, fromName);

        await resend.emails.send({
          from,
          to: [to],
          subject: `New consultation request: ${input.fullName}`,
          text: [
            "A new consultation request was submitted.",
            "",
            `Name: ${input.fullName}`,
            `Email: ${input.email}`,
            `Phone: ${input.phone}`,
          ].join("\n"),
        });
      } catch (err) {
        console.error("Failed to send consultation notification email", err);
        // Don't fail the request – we've saved to DB
      }
    }

    return { id: inquiry.id };
  });
