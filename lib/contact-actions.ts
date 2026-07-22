"use server";

import { z } from "zod";
import { sendEmail } from "@/lib/sendgrid";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  topic: z.string().trim().min(1, "Please choose a topic"),
  message: z.string().trim().min(10, "Tell us a bit more — at least 10 characters"),
});

export interface ContactFormState {
  error?: string;
  success?: boolean;
}

const SUPPORT_INBOX = process.env.SENDGRID_FROM_EMAIL || "support@baruashop.com";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export async function sendContactMessageAction(_prev: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    topic: formData.get("topic"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again" };
  }

  const { name, email, topic, message } = parsed.data;

  await sendEmail({
    to: SUPPORT_INBOX,
    subject: `[Contact form] ${topic} — ${name}`,
    html: `
      <p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
      <p><strong>Topic:</strong> ${escapeHtml(topic)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
    `,
  });

  return { success: true };
}
