import type { Metadata } from "next";
import { SettingsSection } from "@/components/admin/settings/settings-section";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = { title: "Tax Settings" };

const TAX_RATES = [
  { state: "California", rate: "7.25%" },
  { state: "Texas", rate: "6.25%" },
  { state: "New York", rate: "4.00%" },
  { state: "Florida", rate: "6.00%" },
  { state: "Washington", rate: "6.50%" },
  { state: "Oregon", rate: "0.00%" },
  { state: "Delaware", rate: "0.00%" },
];

export default function AdminTaxesSettingsPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <SettingsSection title="Automatic tax calculation" description="Calculate sales tax based on the customer's shipping address">
        <div className="flex items-center gap-2.5">
          <Switch id="auto-tax" defaultChecked />
          <Label htmlFor="auto-tax">Automatically calculate tax at checkout</Label>
        </div>
      </SettingsSection>

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">State tax rates</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Applied automatically based on shipping destination</p>
        </div>
        <div className="flex flex-col divide-y divide-border/60">
          {TAX_RATES.map((t) => (
            <div key={t.state} className="flex items-center justify-between px-5 py-2.5 text-sm">
              <span className="text-foreground">{t.state}</span>
              <span className="tabular-nums text-muted-foreground">{t.rate}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
