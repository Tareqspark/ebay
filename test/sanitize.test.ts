import { describe, it, expect } from "vitest";
import { checkPlainText, neutralizeCsvCell } from "@/lib/sanitize";

describe("checkPlainText", () => {
  it("allows ordinary text", () => {
    expect(checkPlainText("Wireless Mouse", "Name")).toBeNull();
    expect(checkPlainText("Great product, 5 stars!", "Body")).toBeNull();
  });

  it("rejects the stored-XSS breakout sequence", () => {
    // The actual exploit found during QA: a value containing this sequence
    // breaks out of Next.js's inline RSC hydration <script> tag.
    const error = checkPlainText('</script><img src=x onerror=alert(1)>', "Name");
    expect(error).not.toBeNull();
  });

  it("rejects a bare < or >", () => {
    expect(checkPlainText("5 < 10", "Note")).not.toBeNull();
    expect(checkPlainText("value > threshold", "Note")).not.toBeNull();
  });

  it("includes the field label in the error message", () => {
    expect(checkPlainText("<b>hi</b>", "Category name")).toContain("Category name");
  });
});

describe("neutralizeCsvCell", () => {
  it("leaves ordinary text untouched", () => {
    expect(neutralizeCsvCell("Wireless Mouse")).toBe("Wireless Mouse");
    expect(neutralizeCsvCell("100")).toBe("100");
  });

  it("prefixes a leading = with a tab (the formula-injection exploit)", () => {
    const malicious = "=cmd|'/c calc'!A1";
    const result = neutralizeCsvCell(malicious);
    expect(result).toBe(`\t${malicious}`);
    expect(result.startsWith("=")).toBe(false);
  });

  it("prefixes +, -, and @ leading characters too", () => {
    expect(neutralizeCsvCell("+1+1")).toBe("\t+1+1");
    expect(neutralizeCsvCell("-1+1")).toBe("\t-1+1");
    expect(neutralizeCsvCell("@SUM(A1:A2)")).toBe("\t@SUM(A1:A2)");
  });

  it("doesn't touch a = that isn't the leading character", () => {
    expect(neutralizeCsvCell("Price=$10")).toBe("Price=$10");
  });
});
