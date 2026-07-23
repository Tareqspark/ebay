import "server-only";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { bundles as bundlesTable, bundleItems as bundleItemsTable } from "@/db/schema";
import { toDollars } from "@/lib/money";

export type BundleDiscountType = (typeof bundlesTable.$inferSelect)["discountType"];
export type BundleStatus = (typeof bundlesTable.$inferSelect)["status"];

export interface Bundle {
  id: string;
  name: string;
  description?: string;
  discountType: BundleDiscountType;
  discountPercent?: number;
  discountAmount?: number;
  status: BundleStatus;
  productIds: string[];
  createdAt: string;
}

export const getBundles = async (): Promise<Bundle[]> => {
  const [bundleRows, itemRows] = await Promise.all([db.select().from(bundlesTable), db.select().from(bundleItemsTable)]);
  const productIdsByBundle = new Map<string, string[]>();
  for (const item of itemRows) {
    const list = productIdsByBundle.get(item.bundleId) ?? [];
    list.push(item.productId);
    productIdsByBundle.set(item.bundleId, list);
  }
  return bundleRows.map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description ?? undefined,
    discountType: b.discountType,
    discountPercent: b.discountPercent ?? undefined,
    discountAmount: b.discountAmountCents != null ? toDollars(b.discountAmountCents) : undefined,
    status: b.status,
    productIds: productIdsByBundle.get(b.id) ?? [],
    createdAt: b.createdAt.toISOString(),
  }));
};

/** Active bundles a given product belongs to — powers the "Buy it with" section on the product page. */
export async function getActiveBundlesForProduct(productId: string): Promise<Bundle[]> {
  const memberRows = await db.select({ bundleId: bundleItemsTable.bundleId }).from(bundleItemsTable).where(eq(bundleItemsTable.productId, productId));
  const bundleIds = [...new Set(memberRows.map((r) => r.bundleId))];
  if (bundleIds.length === 0) return [];

  const bundleRows = await db.select().from(bundlesTable).where(inArray(bundlesTable.id, bundleIds));
  const activeIds = bundleRows.filter((b) => b.status === "active").map((b) => b.id);
  if (activeIds.length === 0) return [];

  const all = await getBundles();
  return all.filter((b) => activeIds.includes(b.id));
}

export interface BundleAdjustment {
  subtotal: number;
  bundleDiscount: number;
  appliedBundles: { id: string; name: string; discount: number }[];
}

/**
 * Checked against every active bundle: if every one of a bundle's member
 * products is present in the cart (quantity >= 1 each), its discount
 * applies once. Deliberately simple — no "how many complete sets"
 * multiplication, no cross-bundle conflict resolution for a product that's
 * in two satisfied bundles at once. Both lib/cart.ts's buildSummary() and
 * lib/checkout.ts's createOrderFromPaymentIntent() call this so the
 * discounted subtotal a shopper sees in their cart is exactly what they're
 * charged.
 */
export async function computeBundleAdjustedSubtotal(
  items: { productId: string; quantity: number; price: number }[]
): Promise<BundleAdjustment> {
  const rawSubtotal = Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;
  if (items.length === 0) return { subtotal: rawSubtotal, bundleDiscount: 0, appliedBundles: [] };

  const cartProductIds = new Set(items.map((i) => i.productId));
  const priceByProduct = new Map(items.map((i) => [i.productId, i.price]));

  const allBundles = await getBundles();
  const appliedBundles: { id: string; name: string; discount: number }[] = [];
  let bundleDiscount = 0;

  for (const bundle of allBundles) {
    if (bundle.status !== "active" || bundle.productIds.length < 2) continue;
    const satisfied = bundle.productIds.every((id) => cartProductIds.has(id));
    if (!satisfied) continue;

    const bundleValue = bundle.productIds.reduce((sum, id) => sum + (priceByProduct.get(id) ?? 0), 0);
    let discount = 0;
    if (bundle.discountType === "percent" && bundle.discountPercent) {
      discount = Math.round(bundleValue * (bundle.discountPercent / 100) * 100) / 100;
    } else if (bundle.discountType === "fixed" && bundle.discountAmount) {
      discount = Math.min(bundleValue, bundle.discountAmount);
    }
    if (discount > 0) {
      bundleDiscount = Math.round((bundleDiscount + discount) * 100) / 100;
      appliedBundles.push({ id: bundle.id, name: bundle.name, discount });
    }
  }

  bundleDiscount = Math.min(bundleDiscount, rawSubtotal);
  const subtotal = Math.round((rawSubtotal - bundleDiscount) * 100) / 100;
  return { subtotal, bundleDiscount, appliedBundles };
}
