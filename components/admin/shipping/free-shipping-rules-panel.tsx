"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Panel } from "@/components/admin/shared/panel";
import { saveShippingRuleAction, resetShippingRuleAction } from "@/lib/admin/shipping-threshold-actions";
import type { CountryRuleRow } from "@/lib/shipping-thresholds";

/**
 * Per-country free-shipping rules.
 *
 * Every shippable country is listed, including the ones still inheriting the
 * default — the job here is usually "stop giving free international
 * shipping", which means finding destinations nobody has looked at yet.
 */
export function FreeShippingRulesPanel({ rules }: { rules: CountryRuleRow[] }) {
  const [query, setQuery] = useState("");
  const [customOnly, setCustomOnly] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rules.filter(
      (r) =>
        (!q || r.name.toLowerCase().includes(q) || r.code.toLowerCase() === q) &&
        (!customOnly || r.configured)
    );
  }, [rules, query, customOnly]);

  const customCount = rules.filter((r) => r.configured).length;

  return (
    <Panel
      title="Free shipping by country"
      description={`${customCount} of ${rules.length} destinations have their own rule — the rest inherit the default. A matching zone rate at checkout still overrides these.`}
      bodyClassName="p-0"
    >
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search countries..."
            autoComplete="off"
            suppressHydrationWarning
            className="h-8 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <Button
          size="sm"
          variant={customOnly ? "default" : "outline"}
          aria-pressed={customOnly}
          onClick={() => setCustomOnly((c) => !c)}
        >
          Customised only
        </Button>
      </div>

      <div className="grid grid-cols-[1fr_120px_130px_130px_150px] gap-2 border-b border-border px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span>Destination</span>
        <span>Free shipping</span>
        <span className="text-right">Free over</span>
        <span className="text-right">Otherwise</span>
        <span></span>
      </div>

      {visible.length === 0 && (
        <p className="px-3 py-8 text-center text-sm text-muted-foreground">No destinations match.</p>
      )}
      {visible.map((rule) => (
        <RuleRow key={rule.code} rule={rule} />
      ))}
    </Panel>
  );
}

function RuleRow({ rule }: { rule: CountryRuleRow }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(rule.freeShippingEnabled);
  const [threshold, setThreshold] = useState(String(rule.threshold));
  const [flatRate, setFlatRate] = useState(String(rule.flatRate));
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();

  const thresholdNum = Number.parseFloat(threshold);
  const flatRateNum = Number.parseFloat(flatRate);
  const valid =
    Number.isFinite(flatRateNum) && flatRateNum >= 0 && (!enabled || (Number.isFinite(thresholdNum) && thresholdNum >= 0));

  const dirty =
    enabled !== rule.freeShippingEnabled ||
    thresholdNum !== rule.threshold ||
    flatRateNum !== rule.flatRate;

  async function save() {
    if (!valid) return;
    setSaving(true);
    try {
      const result = await saveShippingRuleAction(rule.code, {
        freeShippingEnabled: enabled,
        // A disabled rule still stores a threshold so switching it back on
        // doesn't lose the number the admin had chosen.
        threshold: Number.isFinite(thresholdNum) ? thresholdNum : rule.threshold,
        flatRate: flatRateNum,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`${rule.name} updated`);
      startTransition(() => router.refresh());
    } catch {
      toast.error("Couldn't save — please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    setSaving(true);
    try {
      const result = await resetShippingRuleAction(rule.code);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`${rule.name} back to the default`);
      startTransition(() => router.refresh());
    } catch {
      toast.error("Couldn't reset — please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-[1fr_120px_130px_130px_150px] items-center gap-2 border-b border-border/60 px-3 py-2 text-sm last:border-0 hover:bg-muted/40">
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-foreground">{rule.name}</span>
        {rule.configured ? (
          <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
            Custom
          </span>
        ) : (
          <span className="shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">Default</span>
        )}
      </div>

      <Switch
        checked={enabled}
        onCheckedChange={setEnabled}
        aria-label={`Free shipping to ${rule.name}`}
      />

      <Input
        type="number"
        step="0.01"
        min="0"
        value={threshold}
        disabled={!enabled}
        onChange={(e) => setThreshold(e.target.value)}
        aria-label={`Free shipping threshold for ${rule.name}`}
        className="h-8 text-right tabular-nums"
      />

      <Input
        type="number"
        step="0.01"
        min="0"
        value={flatRate}
        onChange={(e) => setFlatRate(e.target.value)}
        aria-label={`Flat shipping rate for ${rule.name}`}
        className="h-8 text-right tabular-nums"
      />

      <div className="flex items-center justify-end gap-1">
        <Button size="sm" disabled={!dirty || !valid || saving} onClick={save}>
          {saving ? "Saving..." : "Save"}
        </Button>
        {rule.configured && (
          <Button
            size="icon-sm"
            variant="ghost"
            disabled={saving}
            onClick={reset}
            title={`Reset ${rule.name} to the default`}
            aria-label={`Reset ${rule.name} to the default`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
