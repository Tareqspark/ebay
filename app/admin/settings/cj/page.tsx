import type { Metadata } from "next";
import { KpiCard } from "@/components/admin/shared/kpi-card";
import { SettingsSection } from "@/components/admin/settings/settings-section";
import { CjSourcingRequests } from "@/components/admin/settings/cj-sourcing-requests";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTime, formatMoney } from "@/lib/admin/format";
import { CJ_INTEGRATION_SETTINGS, CJ_SHIPPING_LINES, CJ_SOURCING_REQUESTS } from "@/lib/admin/data";

export const metadata: Metadata = { title: "CJdropshipping Settings" };

const shippingLineItems = Object.fromEntries(CJ_SHIPPING_LINES.map((l) => [l.id, `${l.name} (${l.estimatedDays})`]));
const syncFrequencyItems = { "15min": "Every 15 minutes", hourly: "Hourly", "6h": "Every 6 hours", daily: "Daily" };

export default function AdminCjSettingsPage() {
  const settings = CJ_INTEGRATION_SETTINGS;

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Wallet balance" value={formatMoney(settings.walletBalance)} />
        <KpiCard label="Auto-push orders" value={settings.autoPushOrders ? "On" : "Off"} />
        <KpiCard label="Sync frequency" value={syncFrequencyItems[settings.syncFrequency as keyof typeof syncFrequencyItems] ?? settings.syncFrequency} />
        <KpiCard label="Sourcing requests" value={String(CJ_SOURCING_REQUESTS.length)} />
      </div>

      <SettingsSection title="Connection" description="Your linked CJdropshipping account">
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2.5">
          <div>
            <p className="text-sm font-medium text-foreground">{settings.accountEmail}</p>
            <p className="text-xs text-muted-foreground">API key {settings.apiKeyMasked}</p>
          </div>
          <StatusBadge status={settings.connected ? "connected" : "disconnected"} />
        </div>
        <p className="text-xs text-muted-foreground">Last synced {formatDateTime(settings.lastSyncAt)}</p>
      </SettingsSection>

      <SettingsSection title="Fulfillment defaults" description="How orders with CJ-sourced items are pushed and shipped">
        <div className="flex items-center gap-2.5">
          <Switch id="auto-push" defaultChecked={settings.autoPushOrders} />
          <Label htmlFor="auto-push">Automatically push paid orders to CJ</Label>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Default shipping line</Label>
          <Select defaultValue={settings.defaultShippingLineId} items={shippingLineItems}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CJ_SHIPPING_LINES.map((line) => (
                <SelectItem key={line.id} value={line.id}>
                  {line.name} ({line.estimatedDays})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Sync frequency</Label>
          <Select defaultValue={settings.syncFrequency} items={syncFrequencyItems}>
            <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="15min">Every 15 minutes</SelectItem>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="6h">Every 6 hours</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SettingsSection>

      <SettingsSection title="Shipping lines" description="Available CJ shipping lines and their per-order cost">
        <div className="flex flex-col divide-y divide-border">
          {CJ_SHIPPING_LINES.map((line) => (
            <div key={line.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <p className="font-medium text-foreground">{line.name}</p>
                <p className="text-xs text-muted-foreground">
                  From {line.fromWarehouse === "CN" ? "China" : "United States"} warehouse · {line.estimatedDays}
                </p>
              </div>
              <span className="tabular-nums text-muted-foreground">{formatMoney(line.costPerOrder)}/order</span>
            </div>
          ))}
        </div>
      </SettingsSection>

      <CjSourcingRequests initialRequests={CJ_SOURCING_REQUESTS} />
    </div>
  );
}
