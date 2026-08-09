import { describe, it, expect } from "vitest";
import { buildParcel, toPoundsAndOunces, exceedsUspsLimits, PACKAGING_WEIGHT_OZ } from "@/lib/shipping-parcel";

const item = (o: Partial<Parameters<typeof buildParcel>[0][number]> = {}) => ({
  weightOz: 8, lengthIn: 10, widthIn: 6, heightIn: 2, quantity: 1, ...item0(o),
});
function item0<T>(o: T): T { return o; }

describe("buildParcel", () => {
  it("adds the packaging allowance to item weight", () => {
    const p = buildParcel([item()]);
    expect(p.weightOz).toBe(8 + PACKAGING_WEIGHT_OZ);
  });

  it("multiplies weight by quantity", () => {
    expect(buildParcel([item({ quantity: 3 })]).weightOz).toBe(24 + PACKAGING_WEIGHT_OZ);
  });

  it("stacks height but keeps the largest footprint, rather than summing every dimension", () => {
    // Two identical flat items: the box gets taller, not wider — summing all
    // three dimensions would price a shoebox as a wardrobe.
    const p = buildParcel([item({ quantity: 2 })]);
    expect(p.lengthIn).toBe(10);
    expect(p.widthIn).toBe(6);
    expect(p.heightIn).toBe(4);
  });

  it("takes the largest footprint across mixed items", () => {
    const p = buildParcel([item(), item({ lengthIn: 20, widthIn: 3, heightIn: 1 })]);
    expect(p.lengthIn).toBe(20);
    expect(p.widthIn).toBe(6);
    expect(p.heightIn).toBe(3);
  });

  it("orients each item so its smallest side is the stacking height", () => {
    // A tall thin item laid flat is 2in high, not 12in.
    const p = buildParcel([item({ lengthIn: 2, widthIn: 4, heightIn: 12 })]);
    expect(p.heightIn).toBe(2);
    expect(p.lengthIn).toBe(12);
  });

  it("flags the parcel as unmeasured when an item has no weight", () => {
    expect(buildParcel([item({ weightOz: 0 })]).measured).toBe(false);
    expect(buildParcel([item()]).measured).toBe(true);
  });

  it("returns an empty, unmeasured parcel for no items", () => {
    expect(buildParcel([])).toMatchObject({ weightOz: 0, measured: false });
  });

  it("rounds weight up, since USPS bills by the whole ounce", () => {
    expect(buildParcel([item({ weightOz: 3.2 })]).weightOz).toBe(6);
  });
});

describe("toPoundsAndOunces", () => {
  it.each([
    [0, 0, 0],
    [15, 0, 15],
    [16, 1, 0],
    [40, 2, 8],
  ])("converts %i oz to %i lb %i oz", (oz, lb, rem) => {
    expect(toPoundsAndOunces(oz)).toEqual({ pounds: lb, ounces: rem });
  });
});

describe("exceedsUspsLimits", () => {
  it("accepts an ordinary parcel", () => {
    expect(exceedsUspsLimits(buildParcel([item()]))).toBeNull();
  });

  it("rejects anything over 70 lb", () => {
    expect(exceedsUspsLimits(buildParcel([item({ weightOz: 1200 })]))).toMatch(/70 lb/);
  });

  it("rejects on length plus girth, not length alone", () => {
    // 40 + 2*(26+20) = 132in, past the limit despite no single side being large.
    const p = buildParcel([item({ lengthIn: 40, widthIn: 26, heightIn: 20 })]);
    expect(exceedsUspsLimits(p)).toMatch(/girth/);
  });

  it("allows a parcel sitting exactly on the 130in limit", () => {
    // 40 + 2*(25+20) = 130. USPS permits 130, so the boundary must not be
    // off by one against the customer.
    const p = buildParcel([item({ lengthIn: 40, widthIn: 25, heightIn: 20 })]);
    expect(exceedsUspsLimits(p)).toBeNull();
  });
});
