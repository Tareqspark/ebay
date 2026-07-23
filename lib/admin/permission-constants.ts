// Pure data, no "server-only" and no DB/auth imports — safe to import from
// a "use client" component (components/admin/settings/permissions-matrix.tsx)
// and from plain Node scripts (scripts/seed-db.ts), unlike lib/admin/permissions.ts.
import { adminPermission } from "@/db/schema";
import type { AdminRole } from "@/lib/admin/team";

export const ADMIN_PERMISSIONS = adminPermission;
export type AdminPermission = (typeof adminPermission)[number];
export type NonOwnerRole = Exclude<AdminRole, "Owner">;

export const PERMISSION_LABELS: Record<AdminPermission, string> = {
  analytics: "Analytics",
  orders: "Orders",
  products: "Products",
  returns: "Returns",
  inventory: "Inventory",
  categories: "Categories",
  collections: "Collections",
  bundles: "Bundles",
  customers: "Customers",
  reviews: "Reviews",
  marketing: "Marketing",
  "promo-codes": "Promo Codes",
  supplier: "Supplier",
  payments: "Payments",
  shipping: "Shipping",
  content: "Content",
  cj: "CJdropshipping",
  settings: "Settings",
};

/**
 * Sensible starting grants per role, seeded once (see scripts/seed-db.ts)
 * and freely editable afterward from Settings → Users & Permissions. Owner
 * is deliberately absent — it always has full access, hardcoded in
 * lib/admin/permissions.ts, rather than governed by a table an Owner could
 * accidentally empty.
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<NonOwnerRole, AdminPermission[]> = {
  Admin: [...ADMIN_PERMISSIONS],
  Merchandiser: ["analytics", "orders", "products", "categories", "collections", "bundles", "marketing", "promo-codes", "reviews", "customers", "content", "cj"],
  "Catalog Manager": ["products", "categories", "collections", "bundles", "inventory", "supplier", "cj", "content"],
  Support: ["orders", "returns", "customers", "reviews", "payments", "shipping"],
};

const PATH_SEGMENT_TO_PERMISSION: Record<string, AdminPermission> = {
  analytics: "analytics",
  orders: "orders",
  products: "products",
  returns: "returns",
  inventory: "inventory",
  categories: "categories",
  collections: "collections",
  bundles: "bundles",
  customers: "customers",
  reviews: "reviews",
  marketing: "marketing",
  "promo-codes": "promo-codes",
  supplier: "supplier",
  payments: "payments",
  shipping: "shipping",
  content: "content",
  cj: "cj",
  settings: "settings",
};

/**
 * Maps an /admin/* pathname to the permission that gates it, derived from
 * lib/admin/nav.ts's top-level sections. Returns null for the dashboard
 * root and for any path outside the known sections — both fail OPEN
 * (rendered normally): the dashboard is the universal landing page every
 * signed-in staff member needs, and an unmapped path isn't a section this
 * system tracks (safer to under-gate a stray route than to lock everyone
 * out of it by typo).
 */
export function permissionForPathname(pathname: string): AdminPermission | null {
  const rest = pathname.replace(/^\/admin\/?/, "");
  const segment = rest.split("/")[0];
  return PATH_SEGMENT_TO_PERMISSION[segment] ?? null;
}
