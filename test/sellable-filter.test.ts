import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Guards the fix for archived products being live and purchasable.
 *
 * These assert on the source rather than the database because the queries
 * need a live MySQL instance, and the failure being guarded against is a
 * query that silently forgets the filter — exactly the kind of omission a
 * source-level check catches and a happy-path test does not.
 */
const src = readFileSync(join(process.cwd(), "lib/products.ts"), "utf8");
const cart = readFileSync(join(process.cwd(), "lib/cart.ts"), "utf8");

describe("storefront sellable filter", () => {
  it("defines the guard against product_meta visibility and status", () => {
    expect(src).toMatch(/const sellable = sql`exists \(/);
    expect(src).toMatch(/productMetaTable\.visibility.*=.*'visible'/s);
    expect(src).toMatch(/productMetaTable\.status.*=.*'active'/s);
  });

  it("applies it to the root query that feeds search, related and recommended", () => {
    expect(src).toMatch(/db\.select\(\)\.from\(productsTable\)\.where\(sellable\)/);
  });

  it("applies it to the product detail lookup", () => {
    expect(src).toMatch(/eq\(productsTable\.slug, slug\), sellable/);
  });

  it("applies it to every homepage rail", () => {
    for (const flag of [
      "isDeal",
      "isFlashSale",
      "isTrending",
      "isNewArrival",
      "isBestSeller",
      "isFeaturedDeal",
      "isWeeklyTopDeal",
    ]) {
      expect(src, `${flag} rail must filter`).toContain(
        `and(eq(productsTable.${flag}, true), sellable)`
      );
    }
  });

  it("applies it to category browsing, so rows, count and facets agree", () => {
    const fn = src.slice(src.indexOf("function categoryPathConditions"));
    expect(fn.slice(0, fn.indexOf("\n}"))).toContain("sellable");
  });

  it("leaves getProductsByIds unfiltered for cart, checkout and admin", () => {
    const fn = src.slice(src.indexOf("export async function getProductsByIds"));
    expect(fn.slice(0, fn.indexOf("\n}"))).not.toContain("sellable");
  });

  it("keeps an empty collection rule meaning 'nothing', not 'everything'", () => {
    // The guard must not count as a criterion, or a rule-less automated
    // collection would match the entire catalogue.
    expect(src).toContain("conditions.length > 0 ? [...conditions, sellable] : []");
  });

  it("refuses to add a non-sellable product to a cart", () => {
    expect(cart).toContain("isProductSellable");
    const fn = cart.slice(cart.indexOf("export async function addToCart"));
    const body = fn.slice(0, fn.indexOf("\n}"));
    expect(body).toMatch(/if \(!\(await isProductSellable\(productId\)\)\)/);
  });
});
