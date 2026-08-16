import "server-only";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { cjIntegrationSettings, cjShippingLines, productMeta, products } from "@/db/schema";
import { buildParcel, exceedsUspsLimits, toPoundsAndOunces, type ParcelItem } from "@/lib/shipping-parcel";
import { quoteUsps, isUspsConfigured, type UspsQuote } from "@/lib/usps";
import { toDollars } from "@/lib/money";
import { getShippingRateById } from "@/lib/shipping-rates";

/**
 * Prices a cart's shipping, splitting it the way it actually ships.
 *
 * Self-fulfilled items leave from Long Beach and are quoted live with USPS.
 * CJ items are dispatched by CJ from their own warehouse and cost whatever
 * their shipping line charges — quoting those with USPS would price a parcel
 * that never passes through our hands.
 *
 * A mixed cart is therefore two consignments with one combined price. The
 * customer is charged the sum and told it arrives in separate deliveries;
 * the split is already modelled downstream, where shipOrderItemsAction
 * creates a shipment per source with its own tracking.
 */

export interface CartLineForQuote {
  productId: string;
  quantity: number;
}

export interface CombinedShippingOption {
  /** `usps:<MAIL_CLASS>` — resolved by re-quoting, never trusted from the client. */
  id: string;
  method: string;
  carrierName: string;
  rate: number;
  deliveryEstimate: string;
}

export interface ShippingQuoteBreakdown {
  options: CombinedShippingOption[];
  /** Flat CJ cost included in every option above, surfaced so the UI can explain a mixed cart. */
  cjShippingCost: number;
  hasSelfItems: boolean;
  hasCjItems: boolean;
  /** Set when self items exist but can't be quoted — the caller falls back to the rate table. */
  unquotableReason?: string;
}

interface LineDetail {
  productId: string;
  quantity: number;
  source: "self" | "cj";
  weightOz: number;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  cjShippingLineId: string | null;
  cjShippingFeeCents: number | null;
}

async function loadLines(cart: CartLineForQuote[]): Promise<LineDetail[]> {
  if (cart.length === 0) return [];
  const ids = cart.map((c) => c.productId);
  const rows = await db
    .select({
      productId: products.id,
      weightOz: products.weightOz,
      lengthIn: products.lengthIn,
      widthIn: products.widthIn,
      heightIn: products.heightIn,
      source: productMeta.source,
      cjShippingLineId: productMeta.cjShippingLineId,
      cjShippingFeeCents: productMeta.cjShippingFeeCents,
    })
    .from(products)
    // Join on the row, not the id list — matching on inArray here would pair
    // every product with every meta row in the set.
    .leftJoin(productMeta, eq(productMeta.productId, products.id))
    .where(inArray(products.id, ids));

  const byId = new Map(rows.map((r) => [r.productId, r]));
  return cart
    .map((line) => {
      const row = byId.get(line.productId);
      if (!row) return null;
      return {
        productId: line.productId,
        quantity: line.quantity,
        source: (row.source ?? "self") as "self" | "cj",
        weightOz: Number(row.weightOz ?? 0),
        lengthIn: Number(row.lengthIn ?? 0),
        widthIn: Number(row.widthIn ?? 0),
        heightIn: Number(row.heightIn ?? 0),
        cjShippingLineId: row.cjShippingLineId,
        cjShippingFeeCents: row.cjShippingFeeCents,
      };
    })
    .filter((x): x is LineDetail => x !== null);
}

/**
 * What CJ charges to dispatch their part.
 *
 * Charged once per distinct shipping line rather than per item: CJ bills per
 * consignment, so three items travelling on the same line is one fee, not
 * three. A line with no configured cost falls back to whatever the product
 * recorded at import.
 */
async function cjCostFor(lines: LineDetail[]): Promise<number> {
  const cjLines = lines.filter((l) => l.source === "cj");
  if (cjLines.length === 0) return 0;

  const [allLines, settings] = await Promise.all([
    db.select().from(cjShippingLines),
    db.select({ defaultLineId: cjIntegrationSettings.defaultShippingLineId }).from(cjIntegrationSettings).limit(1),
  ]);
  const costById = new Map(allLines.map((r) => [r.id, toDollars(r.costPerOrderCents)]));

  /**
   * Falls back to the configured default line.
   *
   * Not one CJ product carries a shipping line — the importer never recorded
   * one, so every cj_shipping_line_id and cj_shipping_fee_cents is null.
   * Without a fallback, CJ's half of a mixed cart would be priced at zero and
   * we would absorb their dispatch fee on every order. The default line in CJ
   * settings exists precisely to answer "what does CJ charge when nothing
   * more specific is known".
   */
  const defaultLineId = settings[0]?.defaultLineId ?? null;
  const defaultCost = defaultLineId ? (costById.get(defaultLineId) ?? 0) : 0;

  const costFor = (line: LineDetail): number => {
    if (line.cjShippingLineId && costById.has(line.cjShippingLineId)) return costById.get(line.cjShippingLineId)!;
    if (line.cjShippingFeeCents != null) return toDollars(line.cjShippingFeeCents);
    return defaultCost;
  };

  // Once per distinct line, not per item: CJ bills per consignment, so three
  // items travelling together is one fee.
  let total = 0;
  const counted = new Set<string>();
  for (const line of cjLines) {
    const key = line.cjShippingLineId ?? (line.cjShippingFeeCents != null ? `fee:${line.productId}` : "default");
    if (counted.has(key)) continue;
    counted.add(key);
    total += costFor(line);
  }
  return Math.round(total * 100) / 100;
}

export async function quoteCartShipping(
  cart: CartLineForQuote[],
  destination: { zip: string; country: string }
): Promise<ShippingQuoteBreakdown> {
  const lines = await loadLines(cart);
  const selfLines = lines.filter((l) => l.source === "self");
  const cjLines = lines.filter((l) => l.source === "cj");
  const cjShippingCost = await cjCostFor(lines);

  const base: ShippingQuoteBreakdown = {
    options: [],
    cjShippingCost,
    hasSelfItems: selfLines.length > 0,
    hasCjItems: cjLines.length > 0,
  };

  // Nothing of ours to ship — CJ's fee is the whole cost, so there is no
  // USPS call to make and no quota to spend.
  if (selfLines.length === 0) return base;
  if (!isUspsConfigured()) return { ...base, unquotableReason: "USPS is not configured" };

  const parcelItems: ParcelItem[] = selfLines.map((l) => ({
    weightOz: l.weightOz,
    lengthIn: l.lengthIn,
    widthIn: l.widthIn,
    heightIn: l.heightIn,
    quantity: l.quantity,
  }));
  const parcel = buildParcel(parcelItems);

  // A product with no weight can't be priced. Saying so beats quoting a
  // number built on a zero and charging the difference ourselves.
  if (!parcel.measured || parcel.weightOz <= 0) {
    return { ...base, unquotableReason: "An item in this order has no shipping weight recorded" };
  }
  const overLimit = exceedsUspsLimits(parcel);
  if (overLimit) return { ...base, unquotableReason: overLimit };

  const { pounds, ounces } = toPoundsAndOunces(parcel.weightOz);
  const quotes: UspsQuote[] = await quoteUsps({
    weightLb: pounds + ounces / 16,
    lengthIn: Math.max(1, Math.ceil(parcel.lengthIn)),
    widthIn: Math.max(1, Math.ceil(parcel.widthIn)),
    heightIn: Math.max(1, Math.ceil(parcel.heightIn)),
    destinationZip: destination.zip,
    destinationCountry: destination.country,
    destinationPostalCode: destination.zip,
  });

  if (quotes.length === 0) return { ...base, unquotableReason: "USPS didn't return a rate for this address" };

  return {
    ...base,
    options: quotes.map((q) => ({
      id: `usps:${q.mailClass}`,
      method: q.label,
      carrierName: "USPS",
      // CJ's fee rides along in every option, so the figure shown is what
      // the whole order costs to deliver, not just our half of it.
      rate: Math.round((q.price + cjShippingCost) * 100) / 100,
      deliveryEstimate: q.estimate,
    })),
  };
}

/**
 * Re-prices one previously offered USPS option.
 *
 * Called at PaymentIntent creation and again at order creation, so the amount
 * charged is derived server-side from the cart and address rather than taken
 * from whatever the client submits — the same rule getShippingRateById
 * follows for table rates. The cache makes this near-free.
 */
export async function resolveUspsOption(
  optionId: string,
  cart: CartLineForQuote[],
  destination: { zip: string; country: string }
): Promise<CombinedShippingOption | null> {
  if (!optionId.startsWith("usps:")) return null;
  const quote = await quoteCartShipping(cart, destination);
  return quote.options.find((o) => o.id === optionId) ?? null;
}

export function isUspsOptionId(id: string | null | undefined): boolean {
  return Boolean(id?.startsWith("usps:"));
}

export interface ResolvedSelection {
  rate: number;
  method: string;
  carrierName?: string;
}

/**
 * Resolves whichever shipping option the customer picked, table or live.
 *
 * One entry point for all three places that must re-derive the charge
 * server-side — the rate preview, PaymentIntent creation and order creation.
 * A USPS option is re-quoted rather than trusted, exactly as a table rate is
 * re-read and re-validated, so a client cannot submit its own price. The
 * quote cache makes the repeat calls effectively free.
 */
export async function resolveShippingSelection(opts: {
  id: string;
  state: string;
  zip: string;
  country: string;
  subtotal: number;
  cart: CartLineForQuote[];
}): Promise<ResolvedSelection | null> {
  if (isUspsOptionId(opts.id)) {
    const option = await resolveUspsOption(opts.id, opts.cart, { zip: opts.zip, country: opts.country });
    return option ? { rate: option.rate, method: option.method, carrierName: option.carrierName } : null;
  }
  const row = await getShippingRateById(opts.id, opts.state, opts.subtotal, opts.country);
  return row ? { rate: row.rate, method: row.method, carrierName: row.carrierName } : null;
}
