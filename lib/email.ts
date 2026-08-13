import "server-only";
import nodemailer from "nodemailer";
import { sendEmail as sendViaSendGrid } from "@/lib/sendgrid";

/**
 * Single entry point for outbound mail, picking a transport at call time:
 *
 *   1. Gmail SMTP, when GMAIL_USER and GMAIL_APP_PASSWORD are set
 *   2. SendGrid, via lib/sendgrid.ts, when SENDGRID_API_KEY is set
 *   3. Console log, so checkout still completes in dev with neither
 *
 * lib/sendgrid.ts is deliberately left untouched and still owns steps 2 and
 * 3 — clearing the two Gmail variables switches everything back to it with
 * no code change.
 */

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

let transporter: nodemailer.Transporter | null = null;

function gmailTransport(): nodemailer.Transporter | null {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        // Google rejects the account password over SMTP; this is a 16-character
        // App Password, which Gmail accepts with the spaces stripped.
        pass: pass.replace(/\s+/g, ""),
      },
      // Nodemailer's defaults wait around two minutes before giving up, and
      // this runs while a customer is sitting on the checkout success page.
      // When a host blocks outbound SMTP the connection doesn't fail — it
      // hangs, so an explicit budget is the difference between a ten-second
      // delay and an apparently frozen checkout.
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }
  return transporter;
}

/** True when Gmail SMTP is configured — lets callers report which transport is live without exposing credentials. */
export function isGmailConfigured(): boolean {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

/** The address customer-facing mail is sent from and support mail is delivered to. */
export function mailFrom(): string {
  return process.env.GMAIL_USER || process.env.SENDGRID_FROM_EMAIL || "orders@cartebay.com";
}

export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<void> {
  const gmail = gmailTransport();
  if (!gmail) {
    await sendViaSendGrid({ to, subject, html });
    return;
  }

  await gmail.sendMail({
    // Gmail rewrites From to the authenticated account unless the address is
    // a verified "Send mail as" alias, so the display name is what actually
    // differentiates this from a personal message in the inbox.
    from: `"Cartebay" <${mailFrom()}>`,
    to,
    subject,
    html,
  });
}
