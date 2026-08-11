import type { Metadata } from "next";
import { CurrentBehaviour } from "@/components/admin/settings/current-behaviour";

export const metadata: Metadata = { title: "Payment Settings" };

/**
 * Previously a grid of toggles for Visa/PayPal/Shop Pay and a payout
 * frequency select, none of which were connected. Which methods a customer
 * sees is decided by Stripe's automatic_payment_methods against what's
 * enabled on the Stripe account, and payouts are scheduled in Stripe — so
 * those controls could never have belonged here.
 *
 * Only the key's prefix is read, never its value: enough to report whether
 * live charges are possible without putting a secret on screen.
 */
export default function AdminPaymentsSettingsPage() {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  const configured = key.length > 0;
  const live = key.startsWith("sk_live_");

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <CurrentBehaviour
        title="How payments are taken today"
        description="Read-only — card processing is configured in Stripe, not here."
        rows={[
          {
            label: "Payment provider",
            value: configured ? "Stripe" : "Not configured",
            state: configured ? "on" : "attention",
            detail: configured
              ? undefined
              : "STRIPE_SECRET_KEY is unset, so checkout shows a payment error instead of taking a card.",
          },
          {
            label: "Mode",
            value: !configured ? "—" : live ? "Live" : "Test",
            state: !configured ? "off" : live ? "on" : "attention",
            detail: live
              ? "Real cards are being charged."
              : configured
                ? "Test keys — no real money moves, and real cards will be declined."
                : undefined,
          },
          {
            label: "Accepted methods",
            value: "Set in Stripe",
            state: "on",
            detail:
              "Checkout uses automatic payment methods, so customers see whatever the Stripe account has enabled for their country.",
          },
          {
            label: "Payout schedule",
            value: "Set in Stripe",
            state: "on",
            detail: "Settlement to your bank is scheduled on the Stripe side.",
          },
          {
            label: "Refunds",
            value: "Owner only",
            state: "on",
            detail: "Issued from an order's page; restricted to the Owner role.",
          },
        ]}
        link={{ href: "https://dashboard.stripe.com", label: "Open the Stripe dashboard", external: true }}
      />
    </div>
  );
}
