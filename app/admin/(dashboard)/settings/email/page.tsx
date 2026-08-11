import type { Metadata } from "next";
import { CurrentBehaviour } from "@/components/admin/settings/current-behaviour";

export const metadata: Metadata = { title: "Email Settings" };

/**
 * The sender fields here were prefilled with "orders@cartebay.com", which
 * is not the address customers actually see — that comes from
 * SENDGRID_FROM_EMAIL. Showing the configured value instead means the page
 * can't drift from what's really being sent.
 *
 * Only the from-address and whether a key is present are read; the API key
 * itself is never touched.
 */
export default function AdminEmailSettingsPage() {
  const sendgridConfigured = (process.env.SENDGRID_API_KEY ?? "").length > 0;
  const from = process.env.SENDGRID_FROM_EMAIL ?? "";

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <CurrentBehaviour
        title="How email is sent today"
        description="Read-only — these come from the server environment, not the admin."
        rows={[
          {
            label: "Delivery",
            value: sendgridConfigured ? "SendGrid" : "Console only",
            state: sendgridConfigured ? "on" : "attention",
            detail: sendgridConfigured
              ? undefined
              : "SENDGRID_API_KEY is unset, so messages are logged on the server instead of delivered. Checkout still completes.",
          },
          {
            label: "Sender address",
            value: from || "Not set",
            state: from ? "on" : "attention",
            detail: "What customers see in the From field, and where their replies go.",
          },
          {
            label: "Templates",
            value: "In code",
            state: "on",
            detail: "lib/email-templates.ts — not editable from the admin.",
          },
          {
            label: "Email footer",
            value: "In template",
            state: "on",
            detail: "Part of the order confirmation template rather than a separate setting.",
          },
        ]}
        footnote="Changing the sender means updating SENDGRID_FROM_EMAIL in the server's .env.local and restarting — and the new address has to be a verified sender in SendGrid, or delivery silently fails."
      />
    </div>
  );
}
