"use server";

import { headers } from "next/headers";
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

// In-memory sliding-window limit: a given IP can submit at most 5 messages
// per 10 minutes. Good enough to blunt a scripted spam/flood burst against
// this unauthenticated form without needing an external store — resets on
// deploy, which is an acceptable tradeoff for this low-stakes endpoint.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const submissionsByIp = new Map<string, number[]>();

async function isRateLimited(): Promise<boolean> {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "unknown";
  const now = Date.now();
  const recent = (submissionsByIp.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    submissionsByIp.set(ip, recent);
    return true;
  }
  recent.push(now);
  submissionsByIp.set(ip, recent);
  return false;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export async function sendContactMessageAction(_prev: ContactFormState, formData: FormData): Promise<ContactFormState> {
  if (await isRateLimited()) {
    return { error: "Too many messages sent recently. Please try again in a few minutes." };
  }

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
