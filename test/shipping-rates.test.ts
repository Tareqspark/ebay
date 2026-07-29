import { describe, it, expect } from "vitest";
import { resolveShippingZone } from "@/lib/shipping-rates";

describe("resolveShippingZone", () => {
  it("maps Alaska and Hawaii to their own zone", () => {
    expect(resolveShippingZone("AK")).toBe("Alaska & Hawaii");
    expect(resolveShippingZone("HI")).toBe("Alaska & Hawaii");
  });

  it("maps US territories to their own zone", () => {
    for (const state of ["PR", "GU", "VI", "AS", "MP"]) {
      expect(resolveShippingZone(state)).toBe("US Territories");
    }
  });

  it("maps military APO/FPO codes to their own zone", () => {
    for (const state of ["AA", "AE", "AP"]) {
      expect(resolveShippingZone(state)).toBe("APO/FPO Military");
    }
  });

  it("falls back to Continental US for every other state", () => {
    expect(resolveShippingZone("CA")).toBe("Continental US");
    expect(resolveShippingZone("NY")).toBe("Continental US");
    expect(resolveShippingZone("TX")).toBe("Continental US");
  });

  it("is case-insensitive and trims whitespace", () => {
    expect(resolveShippingZone("ak")).toBe("Alaska & Hawaii");
    expect(resolveShippingZone(" hi ")).toBe("Alaska & Hawaii");
  });

  it("treats an unrecognized/empty value as Continental US rather than throwing", () => {
    expect(resolveShippingZone("")).toBe("Continental US");
    expect(resolveShippingZone("ZZ")).toBe("Continental US");
  });
});
