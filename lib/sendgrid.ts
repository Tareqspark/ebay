import "server-only";
import sgMail from "@sendgrid/mail";

let configured = false;

function ensureConfigured(): boolean {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) return false;
  if (!configured) {
    sgMail.setApiKey(key);
    configured = true;
  }
  return true;
}

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends via SendGrid when SENDGRID_API_KEY is set; otherwise logs to the
 * server console so the order-confirmation flow still completes in dev
 * without a SendGrid account.
 */
export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<void> {
  if (!ensureConfigured()) {
    console.log(`[email:not-configured] Would send "${subject}" to ${to}`);
    return;
  }
  await sgMail.send({
    to,
    from: process.env.SENDGRID_FROM_EMAIL || "orders@baruashop.com",
    subject,
    html,
  });
}
