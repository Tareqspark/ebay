import type { Metadata } from "next";
import { CurrentBehaviour } from "@/components/admin/settings/current-behaviour";

export const metadata: Metadata = { title: "Store Settings" };

/**
 * Store name, contact details, currency, timezone and the business address
 * were all editable fields that saved nothing. The business address one
 * mattered most — it was labelled "Used on invoices and shipping labels",
 * so editing it looked like it would change what a customer receives.
 */
export default function AdminStoreSettingsPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <CurrentBehaviour
        title="Store details"
        description="Read-only — set in code, not the admin."
        rows={[
          { label: "Store name", value: "Cartebay", state: "on", detail: "Site metadata, header and footer." },
          { label: "Storefront", value: "cartebay.com", state: "on" },
          {
            label: "Support contact",
            value: "(562) 273-3989",
            state: "on",
            detail: "Shown on the About and Press pages.",
          },
          {
            label: "Currency",
            value: "USD",
            state: "on",
            detail: "Prices, Stripe charges and every stored amount are US dollars throughout.",
          },
        ]}
        footnote="Currency isn't a display preference — changing it would mean re-pricing the catalogue and reconfiguring Stripe, so it isn't offered as a setting."
      />

      <CurrentBehaviour
        title="Business address"
        description="Read-only — not yet used automatically."
        rows={[
          { label: "Address", value: "1310 Pine Ave #D", state: "on" },
          { label: "City / State / ZIP", value: "Long Beach, CA 90813", state: "on" },
          {
            label: "On shipping labels",
            value: "Not automatic",
            state: "attention",
            detail: "The return address is whatever gets entered when a label is bought, until a carrier is wired.",
          },
        ]}
      />
    </div>
  );
}
