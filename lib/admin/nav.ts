import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Boxes,
  Container,
  CreditCard,
  FileText,
  FolderTree,
  Gift,
  Home,
  Layers,
  Megaphone,
  Package,
  RotateCcw,
  Settings,
  ShoppingCart,
  Star,
  Ticket,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  children?: AdminNavItem[];
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: Home },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Commerce",
    items: [
      {
        label: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
        children: [
          { label: "All Orders", href: "/admin/orders" },
          { label: "Pending", href: "/admin/orders?status=pending" },
          { label: "Shipped", href: "/admin/orders?status=shipped" },
          { label: "Cancelled", href: "/admin/orders?status=cancelled" },
        ],
      },
      {
        label: "Products",
        href: "/admin/products",
        icon: Package,
        children: [
          { label: "All Products", href: "/admin/products" },
          { label: "Needs Review", href: "/admin/products?filter=needs-review" },
          { label: "Drafts", href: "/admin/products?status=draft" },
          { label: "Archived", href: "/admin/products?status=archived" },
        ],
      },
      { label: "Returns", href: "/admin/returns", icon: RotateCcw },
      { label: "Inventory", href: "/admin/inventory", icon: Warehouse },
      { label: "Categories", href: "/admin/categories", icon: FolderTree },
      { label: "Collections", href: "/admin/collections", icon: Layers },
      { label: "Bundles", href: "/admin/bundles", icon: Gift },
    ],
  },
  {
    label: "Audience",
    items: [
      { label: "Customers", href: "/admin/customers", icon: Users },
      { label: "Reviews", href: "/admin/reviews", icon: Star },
      { label: "Marketing", href: "/admin/marketing", icon: Megaphone },
      { label: "Promo Codes", href: "/admin/promo-codes", icon: Ticket },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Supplier",
        href: "/admin/supplier",
        icon: Boxes,
        children: [
          { label: "Overview", href: "/admin/supplier" },
          { label: "Import Queue", href: "/admin/supplier/queue" },
          { label: "Import History", href: "/admin/supplier/history" },
          { label: "Failed Imports", href: "/admin/supplier/failed" },
          { label: "Field Mapping", href: "/admin/supplier/mapping" },
          { label: "Logs", href: "/admin/supplier/logs" },
        ],
      },
      { label: "Payments", href: "/admin/payments", icon: CreditCard },
      { label: "Shipping", href: "/admin/shipping", icon: Truck },
      { label: "Content", href: "/admin/content", icon: FileText },
    ],
  },
  {
    label: "Sourcing",
    items: [
      {
        label: "CJdropshipping",
        href: "/admin/cj",
        icon: Container,
        children: [
          { label: "Overview", href: "/admin/cj" },
          { label: "Catalog", href: "/admin/cj/catalog" },
          { label: "Orders", href: "/admin/cj/orders" },
          { label: "After-Sales", href: "/admin/cj/after-sales" },
          { label: "Sourcing Requests", href: "/admin/cj/sourcing" },
          { label: "Settings", href: "/admin/cj/settings" },
        ],
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
        children: [
          { label: "Store", href: "/admin/settings" },
          { label: "Users & Permissions", href: "/admin/settings/users" },
          { label: "Taxes", href: "/admin/settings/taxes" },
          { label: "Shipping", href: "/admin/settings/shipping" },
          { label: "Payments", href: "/admin/settings/payments" },
          { label: "Notifications", href: "/admin/settings/notifications" },
          { label: "Email", href: "/admin/settings/email" },
          { label: "SEO & Domains", href: "/admin/settings/seo" },
          { label: "Security & API", href: "/admin/settings/security" },
          { label: "Logs", href: "/admin/settings/logs" },
          { label: "Error Logs", href: "/admin/settings/errors" },
        ],
      },
    ],
  },
];

export interface BreadcrumbEntry {
  label: string;
  href: string;
}

/**
 * Walks the nav tree to find the entry matching `pathname` (exact match on
 * the path portion, ignoring query strings) and returns [group, ...ancestors, match].
 */
export function getBreadcrumbTrail(pathname: string): BreadcrumbEntry[] {
  for (const group of ADMIN_NAV) {
    for (const item of group.items) {
      const itemPath = item.href.split("?")[0];
      if (itemPath === pathname) {
        return [{ label: group.label, href: item.href }, { label: item.label, href: item.href }];
      }
      for (const child of item.children ?? []) {
        const childPath = child.href.split("?")[0];
        if (childPath === pathname) {
          return [
            { label: group.label, href: item.href },
            { label: item.label, href: item.href },
            { label: child.label, href: child.href },
          ];
        }
      }
    }
  }
  return [{ label: "Admin", href: "/admin" }];
}

/** Flat list of every nav destination, used by breadcrumbs and command palette. */
export function flattenNav(): { label: string; href: string; group: string }[] {
  const out: { label: string; href: string; group: string }[] = [];
  for (const group of ADMIN_NAV) {
    for (const item of group.items) {
      out.push({ label: item.label, href: item.href, group: group.label });
      for (const child of item.children ?? []) {
        out.push({ label: `${item.label} — ${child.label}`, href: child.href, group: group.label });
      }
    }
  }
  return out;
}
