import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { isRateLimited, recordAttempt } from "@/lib/rate-limit";
import type { ErrorLogSource } from "@/lib/error-log";

// One alert email per label per window — the same label firing repeatedly
// (a flaky provider, a bad deploy) would otherwise flood the Owner's inbox
// with one email per occurrence instead of one per incident.
const ALERT_WINDOW_MS = 30 * 60 * 1000;

// The error message/label/URL are interpolated into an HTML email body —
// they can originate from a thrown Error anywhere in the app, including
// paths that echo back attacker-influenced input, so they're escaped the
// same as any other untrusted value going into HTML (see lib/sanitize.ts's
// checkPlainText for the equivalent guard on admin-entered free text).
function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * Best-effort — called from logError() after the DB write succeeds, never
 * awaited in a way that could mask the original error. Degrades exactly
 * like every other SendGrid call site (lib/sendgrid.ts logs to the console
 * instead of sending when SENDGRID_API_KEY is unset), so this is fully
 * wired and verifiable in dev without a real SendGrid account.
 */
export async function maybeSendErrorAlert(input: { source: ErrorLogSource; label: string; message: string; url?: string | null }): Promise<void> {
  const key = `error-alert:${input.label}`;
  if (isRateLimited(key, 1, ALERT_WINDOW_MS)) return;
  recordAttempt(key, ALERT_WINDOW_MS);

  try {
    const owners = await db.select({ email: adminUsers.email }).from(adminUsers).where(eq(adminUsers.role, "Owner"));
    if (owners.length === 0) return;

    const subject = `[Cartebay] Error: ${input.label}`;
    const html = `
      <p><strong>Source:</strong> ${escapeHtml(input.source)}</p>
      <p><strong>Label:</strong> ${escapeHtml(input.label)}</p>
      <p><strong>Message:</strong> ${escapeHtml(input.message)}</p>
      ${input.url ? `<p><strong>URL:</strong> ${escapeHtml(input.url)}</p>` : ""}
      <p>View it in <a href="${process.env.AUTH_URL ?? ""}/admin/settings/errors">Settings → Error Logs</a>.</p>
    `;

    await Promise.all(owners.map((owner) => sendEmail({ to: owner.email, subject, html })));
  } catch (err) {
    // A failure here must never surface as the caller's error — logError()
    // already has the real error handled; this is a secondary notification.
    console.error("[alerts] failed to send error alert", err);
  }
}
