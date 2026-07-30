import "server-only";
import { eq, and, asc } from "drizzle-orm";
import { db } from "@/db";
import { inventory as inventoryTable } from "@/db/schema";

/** Same thresholds scripts/generate-admin-data.mjs used to seed inventory status, kept in sync so real decrements read the same way the mock data did. */
export function computeInventoryStatus(available: number, incoming: number): "in_stock" | "low_stock" | "out_of_stock" | "backorder" {
  if (available === 0) return incoming > 0 ? "backorder" : "out_of_stock";
  return available <= 9 ? "low_stock" : "in_stock";
}

/**
 * Available stock for a self-fulfilled product, or null when it isn't
 * tracked here (CJ-sourced/dropshipped, or no inventory row at all) — same
 * "source === 'self'" signal decrementInventoryForProduct already uses.
 * null means "not subject to a stock check", not "zero available".
 */
export async function getAvailableStock(productId: string): Promise<number | null> {
  const [row] = await db
    .select({ available: inventoryTable.available })
    .from(inventoryTable)
    .where(and(eq(inventoryTable.productId, productId), eq(inventoryTable.source, "self")))
    .orderBy(asc(inventoryTable.sku))
    .limit(1);
  return row ? row.available : null;
}

/**
 * Decrements on-hand inventory for a self-fulfilled order line. Only
 * "self"-sourced items hold real Cartebay-owned stock (CJ-sourced items
 * are dropshipped — CJ holds that inventory, not us — see CLAUDE.md /
 * PRODUCT.md's hybrid sourcing model), so callers should only invoke this
 * for lineItems with source === "self". Picks the first matching SKU row
 * (by sku, for determinism) when a product has inventory split across
 * multiple warehouses — good enough for single-warehouse-per-product SKUs,
 * which is the common case in the seeded catalog.
 */
export async function decrementInventoryForProduct(productId: string, quantity: number): Promise<void> {
  const [row] = await db
    .select()
    .from(inventoryTable)
    .where(and(eq(inventoryTable.productId, productId), eq(inventoryTable.source, "self")))
    .orderBy(asc(inventoryTable.sku))
    .limit(1);
  if (!row) return;

  const nextAvailable = Math.max(0, row.available - quantity);
  await db
    .update(inventoryTable)
    .set({ available: nextAvailable, status: computeInventoryStatus(nextAvailable, row.incoming) })
    .where(eq(inventoryTable.sku, row.sku));
}
