import type { Metadata } from "next";
import { CurrentBehaviour } from "@/components/admin/settings/current-behaviour";
import { activeMailTransport } from "@/lib/email";

export const metadata: Metadata = { title: "Email Settings" };

const TRANSPORT_LABEL = {
  "gmail-api": "Gmail API (HTTPS)",
  "gmail-smtp": "Gmail SMTP",
  sendgrid: "SendGrid",
  none: "Nothing configured",
} as const;

/**
 * The sender fields here were prefilled with "orders@cartebay.com", which is
 * not the address customers actually see. Showing what is really configured
 * means the page can't drift from what is really being sent.
 *
 * Only the from-address and whether a key is present are read; no API key or
 * password is ever touched.
 */
export default function AdminEmailSettingsPage() {
  const transport = activeMailTransport();
  const from = process.env.SENDGRID_FROM_EMAIL || process.env.GMAIL_USER || "";
  const gmailSmtpSet = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
  const sendgridSet = Boolean(process.env.SENDGRID_API_KEY);

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <CurrentBehaviour
        title="How email is sent today"
        description="Read-only — these come from the server environment, not the admin."
        rows={[
          {
            label: "Active transport",
            value: TRANSPORT_LABEL[transport],
            state: transport === "none" ? "attention" : transport === "gmail-smtp" ? "attention" : "on",
            detail:
              transport === "none"
                ? "Messages are logged to the server console instead of being delivered."
                : transport === "gmail-smtp"
                  ? "Gmail SMTP is selected, but this host blocks outbound SMTP — sends will time out. Add a SendGrid key, or clear the Gmail variables."
                  : undefined,
          },
          {
            label: "Sender address",
            value: from || "Not set",
            state: from ? "on" : "attention",
            detail:
              transport === "sendgrid"
                ? "Must be a verified Single Sender in SendGrid, or every send is rejected."
                : "What customers see in the From field, and where replies go.",
          },
          {
            label: "SendGrid key",
            value: sendgridSet ? "Set" : "Not set",
            state: sendgridSet ? "on" : "off",
            detail: sendgridSet ? "Delivered over HTTPS, which this host allows." : undefined,
          },
          {
            label: "Gmail SMTP credentials",
            value: gmailSmtpSet ? "Set" : "Not set",
            state: gmailSmtpSet ? "attention" : "off",
            detail: gmailSmtpSet
              ? "Unusable from this host. Kept only as a fallback for environments where SMTP ports are open."
              : undefined,
          },
          {
            label: "Templates",
            value: "In code",
            state: "on",
            detail: "lib/email-templates.ts — not editable from the admin.",
          },
        ]}
        footnote="Changing any of this means editing .env.local on the server and restarting. Verify with scripts/check-gmail-api.ts for Gmail, or by placing a test order for SendGrid."
      />
    </div>
  );
}
