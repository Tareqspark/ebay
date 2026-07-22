import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SettingsSection } from "@/components/admin/settings/settings-section";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export const metadata: Metadata = { title: "Shipping Settings" };

export default function AdminShippingSettingsPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <SettingsSection title="Fulfillment defaults" description="Default handling time and packaging for new orders">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Default handling time (business days)</Label>
            <Input type="number" defaultValue="1" min="0" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Free shipping threshold</Label>
            <Input type="number" defaultValue="50" min="0" />
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Switch id="signature" />
          <Label htmlFor="signature">Require signature for orders over $500</Label>
        </div>
        <div className="flex items-center gap-2.5">
          <Switch id="auto-track" defaultChecked />
          <Label htmlFor="auto-track">Automatically email tracking numbers to customers</Label>
        </div>
      </SettingsSection>

      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        Zone-based rates and carrier connections live under{" "}
        <Link href="/admin/shipping" className="inline-flex items-center gap-1 font-medium text-foreground hover:underline">
          Shipping
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
        .
      </div>
    </div>
  );
}
