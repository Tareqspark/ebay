import type { Metadata } from "next";
import { CurrentBehaviour } from "@/components/admin/settings/current-behaviour";

export const metadata: Metadata = { title: "Notification Settings" };

/**
 * The switches here previously showed shipping confirmation, delivery
 * confirmation and abandoned-cart reminders all enabled. None of those
 * emails exist — lib/email-templates.ts has exactly one customer template,
 * the order confirmation. Someone reading this page would have assumed
 * customers were being kept informed after purchase when nothing was sent.
 */
export default function AdminNotificationsSettingsPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <CurrentBehaviour
        title="Emails customers receive"
        description="Read-only — these aren't switchable yet."
        rows={[
          {
            label: "Order confirmation",
            value: "Sent",
            state: "on",
            detail: "Sent once payment succeeds, and re-sendable from the order's page.",
          },
          {
            label: "Shipping confirmation",
            value: "Not sent",
            state: "attention",
            detail:
              "The template is written but held back until a real carrier is wired, so tracking numbers aren't invented.",
          },
          { label: "Delivery confirmation", value: "Not built", state: "off" },
          { label: "Abandoned cart reminder", value: "Not built", state: "off" },
        ]}
        footnote="Until shipping confirmations are live, a customer only hears from the store at purchase — worth knowing when judging support volume."
      />

      <CurrentBehaviour
        title="Alerts the team receives"
        description="Read-only — what actually reaches an Owner's inbox."
        rows={[
          {
            label: "Server errors",
            value: "Emailed to Owners",
            state: "on",
            detail: "Raised from the error log, rate-limited so one broken page can't flood the inbox.",
          },
          { label: "New order placed", value: "No email", state: "off", detail: "Visible in Orders." },
          { label: "Low stock", value: "No email", state: "off", detail: "Visible in Inventory." },
          { label: "Payment dispute", value: "No email", state: "off", detail: "Visible in Disputes." },
        ]}
      />
    </div>
  );
}
