import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { SettingsSection } from "@/components/admin/settings/settings-section";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = { title: "SEO & Domains" };

const DOMAINS = [
  { domain: "baruashop.com", primary: true },
  { domain: "www.baruashop.com", primary: false },
  { domain: "shop.baruashop.com", primary: false },
];

export default function AdminSeoSettingsPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <SettingsSection title="Default meta tags" description="Used on pages that don't set their own">
        <div className="flex flex-col gap-1.5">
          <Label>Meta title</Label>
          <Input defaultValue="Baruashop — Shop Electronics, Home, Fashion & More" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Meta description</Label>
          <Textarea
            defaultValue="Baruashop is a premium online store for electronics, home goods, fashion, and thousands more categories — all in one place."
            rows={3}
          />
        </div>
      </SettingsSection>

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Domains</h2>
        </div>
        <div className="flex flex-col divide-y divide-border/60">
          {DOMAINS.map((d) => (
            <div key={d.domain} className="flex items-center justify-between px-5 py-2.5 text-sm">
              <span className="font-mono text-foreground">{d.domain}</span>
              {d.primary ? (
                <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Primary
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Redirects to primary</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
