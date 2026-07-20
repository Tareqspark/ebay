import type { Metadata } from "next";
import { SettingsSection } from "@/components/admin/settings/settings-section";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const metadata: Metadata = { title: "Payment Settings" };

const METHODS = [
  { id: "visa", label: "Visa", enabled: true },
  { id: "mastercard", label: "Mastercard", enabled: true },
  { id: "amex", label: "American Express", enabled: true },
  { id: "discover", label: "Discover", enabled: true },
  { id: "paypal", label: "PayPal", enabled: true },
  { id: "shop-pay", label: "Shop Pay Installments", enabled: false },
];

export default function AdminPaymentsSettingsPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <SettingsSection title="Accepted payment methods" description="Choose which payment methods customers can use at checkout">
        <div className="grid grid-cols-2 gap-3">
          {METHODS.map((m) => (
            <div key={m.id} className="flex items-center gap-2.5">
              <Switch id={m.id} defaultChecked={m.enabled} />
              <Label htmlFor={m.id}>{m.label}</Label>
            </div>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Payout schedule" description="How often settled funds are deposited to your bank account">
        <div className="flex flex-col gap-1.5">
          <Label>Payout frequency</Label>
          <Select defaultValue="weekly" items={{ daily: "Daily", weekly: "Weekly", monthly: "Monthly" }}>
            <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SettingsSection>
    </div>
  );
}
