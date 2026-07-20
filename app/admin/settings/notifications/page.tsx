import type { Metadata } from "next";
import { SettingsSection } from "@/components/admin/settings/settings-section";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = { title: "Notification Settings" };

const ADMIN_ALERTS = [
  { id: "new-order", label: "New order placed", enabled: true },
  { id: "low-stock", label: "Product low on inventory", enabled: true },
  { id: "failed-payment", label: "Payment failed", enabled: true },
  { id: "dispute", label: "New payment dispute", enabled: true },
  { id: "import-failed", label: "Supplier import failed", enabled: true },
  { id: "new-review", label: "New product review submitted", enabled: false },
];

const CUSTOMER_EMAILS = [
  { id: "order-confirmation", label: "Order confirmation", enabled: true },
  { id: "shipping-confirmation", label: "Shipping confirmation", enabled: true },
  { id: "delivery-confirmation", label: "Delivery confirmation", enabled: true },
  { id: "cart-reminder", label: "Abandoned cart reminder", enabled: true },
];

export default function AdminNotificationsSettingsPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <SettingsSection title="Admin alerts" description="What the team gets notified about in the notification center">
        <div className="flex flex-col gap-3">
          {ADMIN_ALERTS.map((a) => (
            <div key={a.id} className="flex items-center gap-2.5">
              <Switch id={a.id} defaultChecked={a.enabled} />
              <Label htmlFor={a.id}>{a.label}</Label>
            </div>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Customer emails" description="Automated transactional emails sent to customers">
        <div className="flex flex-col gap-3">
          {CUSTOMER_EMAILS.map((a) => (
            <div key={a.id} className="flex items-center gap-2.5">
              <Switch id={a.id} defaultChecked={a.enabled} />
              <Label htmlFor={a.id}>{a.label}</Label>
            </div>
          ))}
        </div>
      </SettingsSection>
    </div>
  );
}
