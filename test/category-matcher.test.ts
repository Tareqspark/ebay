import { describe, it, expect } from "vitest";
import { cleanTitle, headNouns, matchProductToLeaf, type LeafOption } from "@/lib/category-matcher";

/**
 * Every case below is a real product from production, filed where the old
 * matcher put it. The audit flagged 66% of 11,807 products; these are the
 * shapes that caused it.
 */
function leaf(topSlug: string, topName: string, childName: string, leafName: string): LeafOption {
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return {
    id: `${topSlug}/${slug(childName)}/${slug(leafName)}`,
    leafName,
    childName,
    topName,
    topSlug,
    slugPath: [topSlug, slug(childName), slug(leafName)],
  };
}

// A slice of the real tree, including the wrong destinations the old matcher chose.
const TREE: LeafOption[] = [
  leaf("womens-clothing", "Women's Clothing", "Intimates & Sleepwear", "Slips"),
  leaf("womens-clothing", "Women's Clothing", "Swimwear", "Swimsuits"),
  leaf("womens-clothing", "Women's Clothing", "Dresses", "Casual Dresses"),
  leaf("home-and-kitchen", "Home & Kitchen", "Home Décor", "Doormats"),
  leaf("computers-and-tablets", "Computers & Tablets", "Computer Components", "Solid-State Drives"),
  leaf("computers-and-tablets", "Computers & Tablets", "Laptops", "Laptop Sleeves & Bags"),
  leaf("collectibles-and-fine-art", "Collectibles & Fine Art", "Fine Art", "Art Prints"),
  leaf("shoes", "Shoes", "Women's Shoes", "Flats"),
  leaf("mens-clothing", "Men's Clothing", "Accessories", "Hats & Caps"),
  leaf("mens-clothing", "Men's Clothing", "Outerwear", "Coats"),
  leaf("pet-supplies", "Pet Supplies", "Dog Supplies", "Dog Clothing & Shoes"),
  leaf("pet-supplies", "Pet Supplies", "Dog Supplies", "Dog Beds"),
  leaf("pet-supplies", "Pet Supplies", "Cat Supplies", "Cat Clothing"),
  leaf("baby-and-wedding-registry-essentials", "Baby & Wedding Registry", "Registry Building Blocks", "Universal Registry Items"),
  leaf("automotive-and-powersports", "Automotive & Powersports", "Motorcycle & Powersports", "Motorcycle Luggage"),
  leaf("arts-crafts-and-sewing", "Arts, Crafts & Sewing", "Sewing", "Fabric"),
  leaf("bedding-and-bath", "Bedding & Bath", "Bedding", "Pillowcases"),
];

describe("cleanTitle", () => {
  it("drops CJ's variant suffix", () => {
    expect(cleanTitle("Cycling Kit - Constellations - Shorts-M")).toBe("Cycling Kit");
    expect(cleanTitle("Folding tent doghouse - Deep apricot-34x34x40cm")).toBe("Folding tent doghouse");
    expect(cleanTitle("Mesh Adjustable Newsboy Beret Ivy Flat Cap")).toBe("Mesh Adjustable Newsboy Beret Ivy Flat Cap");
  });
});

describe("headNouns", () => {
  it("finds what the product is, not how it's described", () => {
    expect(headNouns("Non-slip Waffle-textured Quick-drying Doormat")[0]).toBe("doormat");
    expect(headNouns("Mesh Adjustable Newsboy Beret Ivy Flat Cap")[0]).toBe("cap");
    expect(headNouns("Leaf Print Lace Split Bikini Ladies Swimsuit")[0]).toBe("swimsuit");
  });

  it("ignores what a product is FOR", () => {
    // The old matcher read "Dogs" as the subject. It's a shoe.
    expect(headNouns("Springautumn Universal Shoes For Small Dogs")[0]).toBe("shoes");
  });
});

describe("the six live mis-filings this was written to fix", () => {
  const cases: [string, string, string][] = [
    ["Non-slip Waffle-textured Quick-drying Doormat", "Doormats", "was Women's > Slips"],
    ["New Muslim Conservative Middle Eastern Solid-color Long-sleeve Dress", "Casual Dresses", "was Solid-State Drives"],
    ["Leaf Print Lace Split Bikini Ladies Swimsuit", "Swimsuits", "was Fine Art > Art Prints"],
    ["Mesh Adjustable Newsboy Beret Ivy Flat Cap", "Hats & Caps", "was Shoes > Flats"],
    ["Springautumn Universal Shoes For Small Dogs", "Dog Clothing & Shoes", "was Wedding Registry Items"],
    ["OSAH motorcycle waterproof rear bag", "Motorcycle Luggage", "was Laptop Sleeves & Bags"],
  ];

  it.each(cases)("%s -> %s (%s)", (title, expected) => {
    const result = matchProductToLeaf(title, TREE);
    expect(result.leaf?.leafName).toBe(expected);
  });
});

describe("department gates", () => {
  it("sends anything mentioning a dog to Pet Supplies", () => {
    const r = matchProductToLeaf("Pet Dog Blanket Super Soft Flannel Bed", TREE);
    expect(r.leaf?.topSlug).toBe("pet-supplies");
  });

  it("keeps a cat sweater out of the fabric aisle", () => {
    // Was: Arts, Crafts & Sewing > Sewing > Fabric, on the word "Fabric".
    const r = matchProductToLeaf("Pure Cotton Knitted Soft Fabric Hairless Cat Sweater", TREE);
    expect(r.leaf?.topSlug).toBe("pet-supplies");
  });

  it("won't put a women's item in Men's Clothing", () => {
    const r = matchProductToLeaf("Women's Elegant One Button Suit Coat", TREE);
    expect(r.leaf?.topSlug).not.toBe("mens-clothing");
  });

  it("still allows genuine men's items into Men's Clothing", () => {
    const r = matchProductToLeaf("Mens Winter Thick Wool Coat", TREE);
    expect(r.leaf?.leafName).toBe("Coats");
  });
});

describe("refusing to guess", () => {
  it("returns nothing when only an adjective is shared", () => {
    // "Solid" must not reach Solid-State Drives on its own.
    const r = matchProductToLeaf("Solid Premium Quality Widget Thing", TREE);
    expect(r.leaf).toBeNull();
  });

  it("returns nothing rather than forcing an unrelated leaf", () => {
    const r = matchProductToLeaf("Stainless Steel Garlic Press Crusher", TREE);
    expect(r.leaf).toBeNull();
    expect(r.confidence).toBeLessThan(0.5);
  });

  it("reports why it declined", () => {
    const r = matchProductToLeaf("Stainless Steel Garlic Press Crusher", TREE);
    expect(r.reason).toMatch(/no confident category/);
  });
});

describe("matches it should still make", () => {
  it("keeps a pillowcase in bedding, not sewing fabric", () => {
    // Was: Arts, Crafts & Sewing > Sewing > Fabric.
    const r = matchProductToLeaf("Linen Pillowcase Home Fabric Geometric Abstract", TREE);
    expect(r.leaf?.leafName).toBe("Pillowcases");
  });

  it("puts a real dog bed in Dog Beds", () => {
    expect(matchProductToLeaf("Small Dog Teddy Sofa Bed", TREE).leaf?.leafName).toBe("Dog Beds");
  });

  it("reports confidence and reasoning for a good match", () => {
    const r = matchProductToLeaf("Non-slip Waffle-textured Quick-drying Doormat", TREE);
    expect(r.confidence).toBeGreaterThan(0.5);
    expect(r.reason).toContain("doormat");
  });
});
