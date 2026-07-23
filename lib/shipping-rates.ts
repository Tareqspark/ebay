import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { shippingRates, carriers } from "@/db/schema";
import { toCents } from "@/lib/money";

// Matches the zone names already configured in the admin Shipping screen's
// shipping_rates table (zone is free text there, but these are the values
// seeded/used in practice) — real US state → carrier-zone mapping, not a
// placeholder.
const STATE_ZONES: Record<string, string> = {
  AK: "Alaska & Hawaii",
  HI: "Alaska & Hawaii",
  PR: "US Territories",
  GU: "US Territories",
  VI: "US Territories",
  AS: "US Territories",
  MP: "US Territories",
  AA: "APO/FPO Military",
  AE: "APO/FPO Military",
  AP: "APO/FPO Military",
};

export function resolveShippingZone(state: string): string {
  return STATE_ZONES[state.trim().toUpperCase()] ?? "Continental US";
}

export interface AvailableShippingRate {
  id: string;
  method: string;
  carrierName?: string;
  rate: number;
  deliveryEstimate: string;
}

/**
 * Real rate shopping against the admin-configured shipping_rates table —
 * every eligible (zone + order-value-threshold matched) active rate for
 * this destination, cheapest first, not a single hardcoded flat number.
 * Only the underlying carrier API call (an actual USPS/UPS/FedEx account)
 * is out of reach without real credentials — the rate table, matching
 * logic, and selection are all real.
 */
export async function getAvailableShippingRates(state: string, subtotal: number): Promise<AvailableShippingRate[]> {
  const zone = resolveShippingZone(state);
  const subtotalCents = toCents(subtotal);

  const [rateRows, carrierRows] = await Promise.all([
    db.select().from(shippingRates).where(and(eq(shippingRates.zone, zone), eq(shippingRates.status, "active"))),
    db.select().from(carriers),
  ]);
  const carrierById = new Map(carrierRows.map((c) => [c.id, c.name]));

  return rateRows
    .filter(
      (r) =>
        (r.minSubtotalCents == null || subtotalCents >= r.minSubtotalCents) &&
        (r.maxSubtotalCents == null || subtotalCents <= r.maxSubtotalCents)
    )
    .map((r) => ({
      id: r.id,
      method: r.method,
      carrierName: r.carrierId ? carrierById.get(r.carrierId) : undefined,
      rate: r.rateCents / 100,
      deliveryEstimate: r.deliveryEstimate,
    }))
    .sort((a, b) => a.rate - b.rate);
}

export interface ResolvedShippingRate {
  id: string;
  zone: string;
  method: string;
  carrierName?: string;
  rate: number;
}

/**
 * Re-derived fresh at PaymentIntent-creation and order-creation time —
 * never trusted from the client. Requires the destination state and order
 * subtotal so a rate ID alone can't be replayed for a zone or order value
 * it was never actually offered for — a rate that's active but doesn't
 * match this specific destination/subtotal is treated as not found, same
 * as one that's disabled or deleted.
 */
export async function getShippingRateById(id: string, state: string, subtotal: number): Promise<ResolvedShippingRate | null> {
  const [row] = await db.select().from(shippingRates).where(eq(shippingRates.id, id)).limit(1);
  if (!row || row.status !== "active") return null;
  if (row.zone !== resolveShippingZone(state)) return null;

  const subtotalCents = toCents(subtotal);
  if (row.minSubtotalCents != null && subtotalCents < row.minSubtotalCents) return null;
  if (row.maxSubtotalCents != null && subtotalCents > row.maxSubtotalCents) return null;

  let carrierName: string | undefined;
  if (row.carrierId) {
    const [carrier] = await db.select({ name: carriers.name }).from(carriers).where(eq(carriers.id, row.carrierId)).limit(1);
    carrierName = carrier?.name;
  }

  return { id: row.id, zone: row.zone, method: row.method, carrierName, rate: row.rateCents / 100 };
}
