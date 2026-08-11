import type { Metadata } from "next";
import { CurrentBehaviour } from "@/components/admin/settings/current-behaviour";
import { TAX_RATE } from "@/lib/checkout-math";

export const metadata: Metadata = { title: "Tax Settings" };

/**
 * This page used to list per-state rates (California 7.25%, Texas 6.25%, …)
 * under "Applied automatically based on shipping destination". None of that
 * was true: checkout charges one flat TAX_RATE on every US order regardless
 * of state. Of all the mocked settings that was the one worth correcting
 * first — an owner could have believed they were collecting compliant
 * per-state sales tax when they were not.
 */
export default function AdminTaxesSettingsPage() {
  const percent = `${(TAX_RATE * 100).toFixed(2)}%`;

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <CurrentBehaviour
        title="How tax is charged today"
        description="Read-only — tax isn't configurable from the admin yet."
        rows={[
          {
            label: "US orders",
            value: percent,
            state: "on",
            detail: "One flat rate on subtotal + shipping, the same in every state.",
          },
          {
            label: "International orders",
            value: "No tax",
            state: "on",
            detail:
              "US sales tax doesn't apply to exports. Buyers pay their own country's duty and VAT to the carrier on delivery.",
          },
          {
            label: "Per-state rates",
            value: "Not implemented",
            state: "attention",
            detail: "Destination state does not change the rate charged.",
          },
          {
            label: "Tax-exempt customers",
            value: "Not implemented",
            state: "off",
          },
        ]}
        footnote={
          <>
            The rate lives in <code className="font-mono text-[11px]">TAX_RATE</code> in{" "}
            <code className="font-mono text-[11px]">lib/checkout-math.ts</code>. A single flat rate is a real
            compliance limitation once you have nexus in more than one state — worth reviewing with an accountant
            before scaling US volume.
          </>
        }
      />
    </div>
  );
}
