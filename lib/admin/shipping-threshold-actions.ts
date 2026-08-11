"use server";

import { revalidatePath } from "next/cache";
import { getAdminActorName } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { requirePermission } from "@/lib/admin/permissions";
import { getCountry, isSupportedCountry } from "@/lib/countries";
import { clearShippingRule, upsertShippingRule } from "@/lib/shipping-thresholds";

export interface ShippingRuleResult {
  error?: string;
}

export interface ShippingRuleInput {
  freeShippingEnabled: boolean;
  threshold: number;
  flatRate: number;
}

// A threshold beyond this is almost certainly a typo (a stray extra digit),
// and one that silently disables free shipping is worse than a rejection.
const MAX_AMOUNT = 100_000;

function revalidateShippingViews() {
  revalidatePath("/admin/shipping");
  // The top bar's free-shipping strip is rendered from this on every page.
  revalidatePath("/", "layout");
}

function validate(input: ShippingRuleInput): string | null {
  for (const [label, value] of [
    ["Threshold", input.threshold],
    ["Flat rate", input.flatRate],
  ] as const) {
    if (!Number.isFinite(value)) return `${label} must be a number`;
    if (value < 0) return `${label} can't be negative`;
    if (value > MAX_AMOUNT) return `${label} looks too high — check the amount`;
    // Money is stored in integer cents; a third decimal would be rounded
    // away silently and the saved figure wouldn't match what was typed.
    if (Math.round(value * 100) !== Number((value * 100).toFixed(0))) {
      return `${label} can only have two decimal places`;
    }
  }
  return null;
}

export async function saveShippingRuleAction(
  country: string,
  input: ShippingRuleInput
): Promise<ShippingRuleResult> {
  const guard = await requirePermission("shipping");
  if (guard) return guard;

  const code = country.trim().toUpperCase();
  if (!isSupportedCountry(code)) return { error: "That isn't a country we ship to" };

  const invalid = validate(input);
  if (invalid) return { error: invalid };

  await upsertShippingRule(code, input);

  const name = getCountry(code).name;
  const summary = input.freeShippingEnabled
    ? `free over $${input.threshold}, otherwise $${input.flatRate}`
    : `no free shipping, flat $${input.flatRate}`;
  await logActivity("product", `Shipping rule for ${name} set to ${summary}`, await getAdminActorName());

  revalidateShippingViews();
  return {};
}

/** Removes the override so the country inherits the site-wide default again. */
export async function resetShippingRuleAction(country: string): Promise<ShippingRuleResult> {
  const guard = await requirePermission("shipping");
  if (guard) return guard;

  const code = country.trim().toUpperCase();
  if (!isSupportedCountry(code)) return { error: "That isn't a country we ship to" };

  await clearShippingRule(code);
  await logActivity(
    "product",
    `Shipping rule for ${getCountry(code).name} reset to the default`,
    await getAdminActorName()
  );

  revalidateShippingViews();
  return {};
}
