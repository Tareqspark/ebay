import { describe, it, expect } from "vitest";
import { parseExplorerParams } from "@/lib/products-client";

/**
 * These values arrive from the query string and end up as LIMIT/OFFSET and
 * comparison operands in SQL, so the parser is the trust boundary — anything
 * it lets through, the database executes.
 */
describe("parseExplorerParams", () => {
  it("returns everything undefined for an empty query", () => {
    expect(parseExplorerParams({})).toEqual({
      brandIds: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      sort: undefined,
      page: undefined,
    });
  });

  it("reads a full query", () => {
    const p = parseExplorerParams({
      brands: "b1,b2",
      min: "10",
      max: "250",
      rating: "4",
      sort: "price-asc",
      page: "3",
    });
    expect(p.brandIds).toEqual(["b1", "b2"]);
    expect(p.minPrice).toBe(10);
    expect(p.maxPrice).toBe(250);
    expect(p.minRating).toBe(4);
    expect(p.sort).toBe("price-asc");
    expect(p.page).toBe(3);
  });

  it("rejects a sort key that is not one of ours", () => {
    // Reaches an ORDER BY, so an arbitrary string must never survive.
    expect(parseExplorerParams({ sort: "price-asc; DROP TABLE products" }).sort).toBeUndefined();
    expect(parseExplorerParams({ sort: "cheapest" }).sort).toBeUndefined();
  });

  it("ignores non-numeric numbers rather than passing NaN to SQL", () => {
    const p = parseExplorerParams({ min: "abc", max: "", rating: "x", page: "one" });
    expect(p.minPrice).toBeUndefined();
    expect(p.maxPrice).toBeUndefined();
    expect(p.minRating).toBeUndefined();
    expect(p.page).toBeUndefined();
  });

  it("caps page so a huge OFFSET cannot be requested", () => {
    expect(parseExplorerParams({ page: "999999999" }).page).toBe(10_000);
  });

  it("floors a fractional page and rejects page zero or negative", () => {
    expect(parseExplorerParams({ page: "2.9" }).page).toBe(2);
    expect(parseExplorerParams({ page: "0" }).page).toBeUndefined();
    expect(parseExplorerParams({ page: "-5" }).page).toBeUndefined();
  });

  it("keeps rating inside 1..5", () => {
    expect(parseExplorerParams({ rating: "0" }).minRating).toBeUndefined();
    expect(parseExplorerParams({ rating: "6" }).minRating).toBeUndefined();
    expect(parseExplorerParams({ rating: "5" }).minRating).toBe(5);
  });

  it("caps the brand list so the IN clause cannot be grown without limit", () => {
    const many = Array.from({ length: 200 }, (_, i) => `b${i}`).join(",");
    expect(parseExplorerParams({ brands: many }).brandIds).toHaveLength(50);
  });

  it("drops empty segments from a sloppy brand list", () => {
    expect(parseExplorerParams({ brands: ",,b1,,b2," }).brandIds).toEqual(["b1", "b2"]);
  });

  it("takes the first value when a param is repeated", () => {
    // ?page=2&page=99 arrives as an array; the larger one must not win.
    expect(parseExplorerParams({ page: ["2", "99"] }).page).toBe(2);
    expect(parseExplorerParams({ sort: ["rating", "newest"] }).sort).toBe("rating");
  });
});
