import { describe, it, expect } from "vitest";
import { isAllowedImageHost, IMAGE_HOSTS } from "@/lib/image-hosts";

/**
 * These decide whether an admin-pasted image URL is accepted. Getting the
 * wildcard wrong in the permissive direction lets through a host next/image
 * then throws on at render time, which breaks the admin categories screen
 * itself — so the boundary cases matter more than usual.
 */
describe("isAllowedImageHost", () => {
  it("accepts the exact hosts", () => {
    expect(isAllowedImageHost("picsum.photos")).toBe(true);
  });

  it("accepts exactly one wildcard label", () => {
    expect(isAllowedImageHost("cf.cjdropshipping.com")).toBe(true);
    expect(isAllowedImageHost("oss-cf.cjdropshipping.com")).toBe(true);
    expect(isAllowedImageHost("oss-us.aliyuncs.com")).toBe(true);
  });

  it("rejects deeper subdomains, matching remotePatterns' single-label rule", () => {
    expect(isAllowedImageHost("a.b.cjdropshipping.com")).toBe(false);
  });

  it("rejects the bare apex where a subdomain is required", () => {
    // "*.cjdropshipping.com" does not cover "cjdropshipping.com" itself.
    expect(isAllowedImageHost("cjdropshipping.com")).toBe(false);
    expect(isAllowedImageHost(".cjdropshipping.com")).toBe(false);
  });

  it("rejects a suffix that only looks like the allowed domain", () => {
    // The attack the endsWith() check has to survive.
    expect(isAllowedImageHost("evilcjdropshipping.com")).toBe(false);
    expect(isAllowedImageHost("cf.cjdropshipping.com.evil.com")).toBe(false);
    expect(isAllowedImageHost("notpicsum.photos")).toBe(false);
  });

  it("rejects unrelated hosts", () => {
    expect(isAllowedImageHost("evil.com")).toBe(false);
    expect(isAllowedImageHost("")).toBe(false);
  });

  it("keeps every configured pattern usable", () => {
    // Guards against a pattern being added that its own matcher rejects.
    for (const pattern of IMAGE_HOSTS) {
      const sample = pattern.startsWith("*.") ? `cdn${pattern.slice(1)}` : pattern;
      expect(isAllowedImageHost(sample)).toBe(true);
    }
  });
});
