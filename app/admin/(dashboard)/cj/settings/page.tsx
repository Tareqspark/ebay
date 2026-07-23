import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { KpiCard } from "@/components/admin/shared/kpi-card";
import { CjTabs } from "@/components/admin/cj/cj-tabs";
import { SettingsSection } from "@/components/admin/settings/settings-section";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { CjFulfillmentSettingsForm } from "@/components/admin/cj/cj-fulfillment-settings-form";
import { formatDateTime, formatMoney } from "@/lib/admin/format";
import { getCjIntegrationSettings, getCjShippingLines, getCjSourcingRequests } from "@/lib/admin/data";
import { isCjConfigured } from "@/lib/cj-provider";

export const metadata: Metadata = { title: "CJdropshipping Settings" };

const syncFrequencyItems = { "15min": "Every 15 minutes", hourly: "Hourly", "6h": "Every 6 hours", daily: "Daily" };

export default async function AdminCjSettingsPage() {
  const [settings, cjShippingLines, cjSourcingRequests] = await Promise.all([
    getCjIntegrationSettings(),
    getCjShippingLines(),
    getCjSourcingRequests(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="CJdropshipping" description="Account connection, wallet, and fulfillment defaults" />
      <CjTabs />

      <div className="grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Wallet balance" value={formatMoney(settings.walletBalance)} />
        <KpiCard label="Auto-push orders" value={settings.autoPushOrders ? "On" : "Off"} />
        <KpiCard
          label="Sync frequency"
          value={syncFrequencyItems[settings.syncFrequency as keyof typeof syncFrequencyItems] ?? settings.syncFrequency}
        />
        <KpiCard label="Sourcing requests" value={String(cjSourcingRequests.length)} />
      </div>

      <div className="flex max-w-2xl flex-col gap-4">
        <SettingsSection title="Connection" description="Your linked CJdropshipping account">
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">{settings.accountEmail}</p>
              <p className="text-xs text-muted-foreground">API key {settings.apiKeyMasked}</p>
            </div>
            <StatusBadge status={settings.connected ? "connected" : "disconnected"} />
          </div>
          <p className="text-xs text-muted-foreground">Last synced {formatDateTime(settings.lastSyncAt)}</p>
          {!isCjConfigured() && (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
              No live CJ API connection configured (CJ_API_KEY unset) — push-to-CJ and dispute submission still write
              real local records, but the actual CJ-side API call is simulated. Set CJ_API_KEY once a real
              CJdropshipping developer account exists.
            </p>
          )}
        </SettingsSection>

        <SettingsSection title="Fulfillment defaults" description="How orders with CJ-sourced items are pushed and shipped">
          <CjFulfillmentSettingsForm
            autoPushOrders={settings.autoPushOrders}
            defaultShippingLineId={settings.defaultShippingLineId}
            syncFrequency={settings.syncFrequency}
            shippingLines={cjShippingLines}
          />
        </SettingsSection>

        <SettingsSection title="Shipping lines" description="Available CJ shipping lines and their per-order cost">
          <div className="flex flex-col divide-y divide-border">
            {cjShippingLines.map((line) => (
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
      </div>
    </div>
  );
}
