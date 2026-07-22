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
import { ApiKeysList } from "@/components/admin/settings/api-keys-list";
import { getApiKeys } from "@/lib/admin/api-keys";

export const metadata: Metadata = { title: "Security & API" };

export default async function AdminSecuritySettingsPage() {
  const apiKeys = await getApiKeys();
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <SettingsSection title="Account security" description="Protect admin access to your store">
        <div className="flex items-center gap-2.5">
          <Switch id="require-2fa" defaultChecked />
          <Label htmlFor="require-2fa">Require two-factor authentication for all team members</Label>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Session timeout</Label>
          <Select defaultValue="8h" items={{ "1h": "1 hour", "8h": "8 hours", "24h": "24 hours", "7d": "7 days" }}>
            <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 hour</SelectItem>
              <SelectItem value="8h">8 hours</SelectItem>
              <SelectItem value="24h">24 hours</SelectItem>
              <SelectItem value="7d">7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SettingsSection>

      <ApiKeysList initialKeys={apiKeys} />
    </div>
  );
}
