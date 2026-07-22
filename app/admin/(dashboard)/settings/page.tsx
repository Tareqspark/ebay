import type { Metadata } from "next";
import { SettingsSection } from "@/components/admin/settings/settings-section";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const metadata: Metadata = { title: "Store Settings" };

export default function AdminStoreSettingsPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <SettingsSection title="Store details" description="Basic information about your store">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Store name" defaultValue="Baruashop" />
          <Field label="Support email" defaultValue="support@baruashop.com" type="email" />
          <Field label="Support phone" defaultValue="+1 (800) 555-0142" />
          <Field label="Storefront URL" defaultValue="https://baruashop.com" disabled />
        </div>
      </SettingsSection>

      <SettingsSection title="Regional settings" description="Currency, timezone, and units">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Currency</Label>
            <Select defaultValue="usd" items={{ usd: "USD — US Dollar", cad: "CAD — Canadian Dollar" }}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD — US Dollar</SelectItem>
                <SelectItem value="cad">CAD — Canadian Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Timezone</Label>
            <Select
              defaultValue="et"
              items={{ et: "Eastern Time (ET)", ct: "Central Time (CT)", mt: "Mountain Time (MT)", pt: "Pacific Time (PT)" }}
            >
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="et">Eastern Time (ET)</SelectItem>
                <SelectItem value="ct">Central Time (CT)</SelectItem>
                <SelectItem value="mt">Mountain Time (MT)</SelectItem>
                <SelectItem value="pt">Pacific Time (PT)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Business address" description="Used on invoices and shipping labels">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Address line 1" defaultValue="500 Market Street" className="col-span-2" />
          <Field label="City" defaultValue="Wilmington" />
          <Field label="State" defaultValue="DE" />
          <Field label="ZIP code" defaultValue="19801" />
          <Field label="Country" defaultValue="United States" disabled />
        </div>
      </SettingsSection>
    </div>
  );
}

function Field({
  label,
  defaultValue,
  type = "text",
  disabled,
  className,
}: {
  label: string;
  defaultValue: string;
  type?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <Label>{label}</Label>
      <Input defaultValue={defaultValue} type={type} disabled={disabled} />
    </div>
  );
}
