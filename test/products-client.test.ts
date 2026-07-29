import { describe, it, expect } from "vitest";
import { getPriceBounds } from "@/lib/products-client";
import type { Product } from "@/lib/types";

function product(price: number): Product {
  return {
    id: `p-${price}`,
    slug: `p-${price}`,
    title: "Test product",
    brandId: "b-1",
    price,
    currency: "USD",
    images: ["https://picsum.photos/seed/test/900/900"],
    review: { rating: 0, count: 0 },
    categorySlugPath: ["top", "child", "grandchild"],
    isNewArrival: false,
    isBestSeller: false,
    isTrending: false,
    isFlashSale: false,
    isDeal: false,
    freeShipping: false,
    stock: 10,
    description: "",
    features: [],
  };
}

describe("getPriceBounds", () => {
  it("returns a non-degenerate range for an empty product list", () => {
    // Regression: previously {min: 0, max: 0} — the price Slider that
    // consumes this errors when max isn't strictly greater than min, which
    // a real (unevenly populated) catalog hits for any empty category.
    const bounds = getPriceBounds([]);
    expect(bounds.max).toBeGreaterThan(bounds.min);
  });

  it("returns a non-degenerate range when every product shares the same price", () => {
    // Regression: a single-product category (or several products at an
    // identical price) floors/ceils to the same integer, e.g. $20.00 ->
    // {min: 20, max: 20}.
    const bounds = getPriceBounds([product(20), product(20)]);
    expect(bounds.max).toBeGreaterThan(bounds.min);
  });

  it("still returns the real spread for a normal, varied-price catalog", () => {
    const bounds = getPriceBounds([product(9.99), product(49.5), product(120)]);
    expect(bounds.min).toBe(9);
    expect(bounds.max).toBe(120);
  });
});
