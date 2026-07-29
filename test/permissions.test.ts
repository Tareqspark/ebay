import { describe, it, expect } from "vitest";
import { permissionForPathname, ADMIN_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from "@/lib/admin/permission-constants";

describe("permissionForPathname", () => {
  it("maps every top-level nav section to its permission key", () => {
    expect(permissionForPathname("/admin/analytics")).toBe("analytics");
    expect(permissionForPathname("/admin/orders")).toBe("orders");
    expect(permissionForPathname("/admin/products")).toBe("products");
    expect(permissionForPathname("/admin/returns")).toBe("returns");
    expect(permissionForPathname("/admin/inventory")).toBe("inventory");
    expect(permissionForPathname("/admin/categories")).toBe("categories");
    expect(permissionForPathname("/admin/collections")).toBe("collections");
    expect(permissionForPathname("/admin/bundles")).toBe("bundles");
    expect(permissionForPathname("/admin/customers")).toBe("customers");
    expect(permissionForPathname("/admin/reviews")).toBe("reviews");
    expect(permissionForPathname("/admin/marketing")).toBe("marketing");
    expect(permissionForPathname("/admin/promo-codes")).toBe("promo-codes");
    expect(permissionForPathname("/admin/supplier")).toBe("supplier");
    expect(permissionForPathname("/admin/payments")).toBe("payments");
    expect(permissionForPathname("/admin/shipping")).toBe("shipping");
    expect(permissionForPathname("/admin/content")).toBe("content");
    expect(permissionForPathname("/admin/cj")).toBe("cj");
    expect(permissionForPathname("/admin/settings")).toBe("settings");
  });

  it("resolves nested paths by their first segment", () => {
    expect(permissionForPathname("/admin/settings/users")).toBe("settings");
    expect(permissionForPathname("/admin/settings/errors")).toBe("settings");
    expect(permissionForPathname("/admin/cj/catalog")).toBe("cj");
    expect(permissionForPathname("/admin/cj/after-sales")).toBe("cj");
    expect(permissionForPathname("/admin/supplier/queue")).toBe("supplier");
  });

  it("treats the dashboard root as ungated (null), the universal landing page", () => {
    expect(permissionForPathname("/admin")).toBeNull();
    expect(permissionForPathname("/admin/")).toBeNull();
  });

  it("treats an unrecognized path as ungated (fail-open) rather than gated by a wrong key", () => {
    expect(permissionForPathname("/admin/some-future-section")).toBeNull();
  });

  it("gates analytics like any other section", () => {
    expect(permissionForPathname("/admin/analytics")).toBe("analytics");
  });
});

describe("DEFAULT_ROLE_PERMISSIONS", () => {
  it("only grants permissions that exist in ADMIN_PERMISSIONS", () => {
    for (const permissions of Object.values(DEFAULT_ROLE_PERMISSIONS)) {
      for (const permission of permissions) {
        expect(ADMIN_PERMISSIONS).toContain(permission);
      }
    }
  });

  it("Admin has every permission (second-in-command, full default access)", () => {
    expect(DEFAULT_ROLE_PERMISSIONS.Admin.sort()).toEqual([...ADMIN_PERMISSIONS].sort());
  });

  it("never grants 'settings' by default to a non-Admin role", () => {
    // Settings governs staff accounts and the permission system itself —
    // Merchandiser/Support/Catalog Manager should never start with it.
    expect(DEFAULT_ROLE_PERMISSIONS.Merchandiser).not.toContain("settings");
    expect(DEFAULT_ROLE_PERMISSIONS.Support).not.toContain("settings");
    expect(DEFAULT_ROLE_PERMISSIONS["Catalog Manager"]).not.toContain("settings");
  });
});
