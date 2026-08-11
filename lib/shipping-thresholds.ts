import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { freeShippingRules } from "@/db/schema";
import { toCents, toDollars } from "@/lib/money";
import { DEFAULT_SHIPPING_RULE, type ShippingRule } from "@/lib/checkout-math";
import { COUNTRIES, isSupportedCountry } from "@/lib/countries";

/**
 * Resolves a destination country to its free-shipping rule.
 *
 * A country with no row inherits DEFAULT_SHIPPING_RULE, so this is additive:
 * until an admin sets something, every destination behaves exactly as it did
 * when the threshold was a hardcoded constant.
 */

export interface StoredShippingRule extends ShippingRule {
  country: string;
  /** False when no row exists — the values shown are the inherited default. */
  configured: boolean;
}

function toRule(row: typeof freeShippingRules.$inferSelect): ShippingRule {
  return {
    freeShippingEnabled: row.freeShippingEnabled,
    threshold: toDollars(row.thresholdCents),
    flatRate: toDollars(row.flatRateCents),
  };
}

/**
 * cache() dedupes within a render pass: checkout resolves the same country
 * for the base totals, the rate preview and the payment intent.
 */
export const getShippingRule = cache(async (country: string | null | undefined): Promise<ShippingRule> => {
  const code = (country ?? "").trim().toUpperCase();
  if (!code) return DEFAULT_SHIPPING_RULE;

  const [row] = await db.select().from(freeShippingRules).where(eq(freeShippingRules.country, code)).limit(1);
  return row ? toRule(row) : DEFAULT_SHIPPING_RULE;
});

/** Every country's effective rule, for the admin screen. Unconfigured ones report the inherited default. */
export async function getAllShippingRules(): Promise<Map<string, StoredShippingRule>> {
  const rows = await db.select().from(freeShippingRules);
  const byCountry = new Map<string, StoredShippingRule>();
  for (const row of rows) {
    // Skip codes that are no longer offered — a stale row shouldn't
    // resurrect a country that's been removed from the shipping list.
    if (!isSupportedCountry(row.country)) continue;
    byCountry.set(row.country, { country: row.country, configured: true, ...toRule(row) });
  }
  return byCountry;
}

export interface CountryRuleRow extends ShippingRule {
  code: string;
  name: string;
  /** False means the row is showing the inherited default, not a saved override. */
  configured: boolean;
}

/**
 * Every shippable country with its effective rule, in the order they appear
 * in lib/countries.ts. Countries without an override are included showing
 * the inherited default, so the admin screen lists the full destination
 * list rather than only the ones already customised.
 */
export async function getShippingRulesForAdmin(): Promise<CountryRuleRow[]> {
  const overrides = await getAllShippingRules();
  return COUNTRIES.map((c) => {
    const override = overrides.get(c.code);
    return {
      code: c.code,
      name: c.name,
      configured: override != null,
      freeShippingEnabled: override?.freeShippingEnabled ?? DEFAULT_SHIPPING_RULE.freeShippingEnabled,
      threshold: override?.threshold ?? DEFAULT_SHIPPING_RULE.threshold,
      flatRate: override?.flatRate ?? DEFAULT_SHIPPING_RULE.flatRate,
    };
  });
}

export async function upsertShippingRule(
  country: string,
  rule: ShippingRule
): Promise<void> {
  const code = country.trim().toUpperCase();
  const values = {
    country: code,
    freeShippingEnabled: rule.freeShippingEnabled,
    thresholdCents: toCents(rule.threshold),
    flatRateCents: toCents(rule.flatRate),
  };
  await db.insert(freeShippingRules).values(values).onDuplicateKeyUpdate({
    set: {
      freeShippingEnabled: values.freeShippingEnabled,
      thresholdCents: values.thresholdCents,
      flatRateCents: values.flatRateCents,
    },
  });
}

/** Drops the override so the country goes back to inheriting the default. */
export async function clearShippingRule(country: string): Promise<void> {
  await db.delete(freeShippingRules).where(eq(freeShippingRules.country, country.trim().toUpperCase()));
}
