import "server-only";
import nodemailer from "nodemailer";
import { sendEmail as sendViaSendGrid } from "@/lib/sendgrid";
import { isGmailApiConfigured, sendViaGmailApi } from "@/lib/gmail-api";

/**
 * Single entry point for outbound mail, picking a transport at call time:
 *
 *   1. Gmail REST API over HTTPS, when the OAuth trio and GMAIL_USER are set
 *   2. Gmail SMTP, when GMAIL_USER and GMAIL_APP_PASSWORD are set
 *   3. SendGrid, via lib/sendgrid.ts, when SENDGRID_API_KEY is set
 *   4. Console log, so checkout still completes in dev with none of them
 *
 * The API comes first because SMTP is unusable on hosts that block its
 * ports — which is every DigitalOcean droplet by default, including this
 * one. SMTP is kept below it because it is the simpler setup and works fine
 * anywhere the ports are open, including local development.
 *
 * lib/sendgrid.ts is deliberately left untouched and still owns the last two
 * steps — clearing the Gmail variables switches everything back to it with
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

/** True when either Gmail transport is configured — lets callers report what's live without exposing credentials. */
export function isGmailConfigured(): boolean {
  return isGmailApiConfigured() || Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

/** Which transport a send would use right now, for the admin Email settings screen. */
export function activeMailTransport(): "gmail-api" | "gmail-smtp" | "sendgrid" | "none" {
  if (isGmailApiConfigured()) return "gmail-api";
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) return "gmail-smtp";
  if (process.env.SENDGRID_API_KEY) return "sendgrid";
  return "none";
}

/** The address customer-facing mail is sent from and support mail is delivered to. */
export function mailFrom(): string {
  return process.env.GMAIL_USER || process.env.SENDGRID_FROM_EMAIL || "orders@cartebay.com";
}

/**
 * True for failures where the message provably never left this process — the
 * socket never opened. Anything else (a rejection mid-conversation, an auth
 * refusal after DATA) is ambiguous and must not be retried elsewhere, or a
 * customer could receive two receipts.
 */
function isConnectionFailure(err: unknown): boolean {
  const code = (err as { code?: string })?.code;
  const command = (err as { command?: string })?.command;
  return (
    command === "CONN" ||
    ["ETIMEDOUT", "ECONNREFUSED", "ECONNRESET", "EHOSTUNREACH", "ENOTFOUND", "EDNS"].includes(code ?? "")
  );
}

export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<void> {
  if (isGmailApiConfigured()) {
    await sendViaGmailApi({ to, subject, html });
    return;
  }

  const gmail = gmailTransport();
  if (!gmail) {
    await sendViaSendGrid({ to, subject, html });
    return;
  }

  try {
    await gmail.sendMail({
      // Gmail rewrites From to the authenticated account unless the address is
      // a verified "Send mail as" alias, so the display name is what actually
      // differentiates this from a personal message in the inbox.
      from: `"Cartebay" <${mailFrom()}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    /**
     * Gmail SMTP is configured but unreachable — hand off to SendGrid.
     *
     * Without this, adding SENDGRID_API_KEY to a server that still has the
     * Gmail variables set changes nothing: Gmail wins the priority above,
     * times out, and throws before SendGrid is ever consulted. Someone
     * configuring a working transport would watch it make no difference and
     * have no way to see why.
     *
     * Restricted to connection failures on purpose. Those mean the socket
     * never opened, so re-sending cannot duplicate a message that already
     * went out.
     */
    if (isConnectionFailure(err) && process.env.SENDGRID_API_KEY) {
      console.warn(`[email] Gmail SMTP unreachable (${(err as Error).message}) — falling back to SendGrid`);
      await sendViaSendGrid({ to, subject, html });
      return;
    }
    throw err;
  }
}
