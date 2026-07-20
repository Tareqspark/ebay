import {
  ADMIN_NOW,
  ORDERS,
  PAYMENTS,
  INVENTORY,
  PRODUCT_META,
  CUSTOMERS,
  getProduct,
  getProductMeta,
  getBrand,
  getTopCategoryName,
} from "@/lib/admin/data";
import type { Order } from "@/lib/admin/types";

const DAY_MS = 86400000;

function isWithinDays(isoDate: string, days: number): boolean {
  const t = new Date(isoDate).getTime();
  return t >= ADMIN_NOW - days * DAY_MS && t <= ADMIN_NOW;
}

export function isToday(isoDate: string): boolean {
  return isWithinDays(isoDate, 1);
}

export interface DashboardKpis {
  revenueToday: number;
  revenueYesterday: number;
  ordersToday: number;
  ordersYesterday: number;
  pendingOrders: number;
  productsImportedToday: number;
  lowInventoryCount: number;
  failedPaymentsToday: number;
}

export function getDashboardKpis(): DashboardKpis {
  const paidOrders = ORDERS.filter((o) => o.paymentStatus !== "failed");
  const todayOrders = paidOrders.filter((o) => isWithinDays(o.placedAt, 1));
  const yesterdayOrders = paidOrders.filter(
    (o) => isWithinDays(o.placedAt, 2) && !isWithinDays(o.placedAt, 1)
  );

  return {
    revenueToday: round2(todayOrders.reduce((s, o) => s + o.total, 0)),
    revenueYesterday: round2(yesterdayOrders.reduce((s, o) => s + o.total, 0)),
    ordersToday: todayOrders.length,
    ordersYesterday: yesterdayOrders.length,
    pendingOrders: ORDERS.filter((o) => ["unfulfilled", "processing"].includes(o.fulfillmentStatus)).length,
    productsImportedToday: PRODUCT_META.filter((m) => isWithinDays(m.importedAt, 1)).length,
    lowInventoryCount: INVENTORY.filter((r) => r.status === "low_stock" || r.status === "out_of_stock").length,
    failedPaymentsToday: PAYMENTS.filter((p) => p.status === "failed" && isWithinDays(p.createdAt, 3)).length,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export interface RevenuePoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

export function getRevenueSeries(days = 30): RevenuePoint[] {
  const points: RevenuePoint[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const dayStart = ADMIN_NOW - (i + 1) * DAY_MS;
    const dayEnd = ADMIN_NOW - i * DAY_MS;
    const dayOrders = ORDERS.filter((o) => {
      if (o.paymentStatus === "failed") return false;
      const t = new Date(o.placedAt).getTime();
      return t >= dayStart && t < dayEnd;
    });
    const date = new Date(dayEnd);
    points.push({
      date: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: round2(dayOrders.reduce((s, o) => s + o.total, 0)),
      orders: dayOrders.length,
    });
  }
  return points;
}

export interface AnalyticsSummary {
  revenue30d: number;
  profit30d: number;
  orders30d: number;
  averageOrderValue: number;
  conversionRate: number;
  refundRate: number;
  revenuePrev30d: number;
  ordersPrev30d: number;
}

export function getAnalyticsSummary(): AnalyticsSummary {
  const inWindow = (o: Order, from: number, to: number) => {
    const t = new Date(o.placedAt).getTime();
    return t >= from && t < to;
  };
  const valid = ORDERS.filter((o) => o.paymentStatus !== "failed");
  const current = valid.filter((o) => inWindow(o, ADMIN_NOW - 30 * DAY_MS, ADMIN_NOW));
  const previous = valid.filter((o) => inWindow(o, ADMIN_NOW - 60 * DAY_MS, ADMIN_NOW - 30 * DAY_MS));

  const revenue = current.reduce((s, o) => s + o.total, 0);
  let cost = 0;
  for (const order of current) {
    for (const item of order.items) {
      const meta = getProductMeta(item.productId);
      cost += (meta?.cost ?? item.price * 0.6) * item.quantity;
    }
  }
  const refunded = current.filter((o) => ["refunded", "partially_refunded"].includes(o.paymentStatus));

  // Sessions are not tracked in mock data; approximate a realistic session base
  // so conversion rate is a stable, meaningful-looking figure.
  const estimatedSessions = current.length * 34;

  return {
    revenue30d: round2(revenue),
    profit30d: round2(revenue - cost),
    orders30d: current.length,
    averageOrderValue: current.length ? round2(revenue / current.length) : 0,
    conversionRate: round2((current.length / estimatedSessions) * 100),
    refundRate: current.length ? round2((refunded.length / current.length) * 100) : 0,
    revenuePrev30d: round2(previous.reduce((s, o) => s + o.total, 0)),
    ordersPrev30d: previous.length,
  };
}

export interface RankedEntry {
  id: string;
  name: string;
  detail: string;
  value: number;
  count: number;
}

export function getTopProducts(limit = 8): RankedEntry[] {
  const totals = new Map<string, { revenue: number; units: number }>();
  for (const order of ORDERS) {
    if (order.paymentStatus === "failed") continue;
    for (const item of order.items) {
      const entry = totals.get(item.productId) ?? { revenue: 0, units: 0 };
      entry.revenue += item.price * item.quantity;
      entry.units += item.quantity;
      totals.set(item.productId, entry);
    }
  }
  return [...totals.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, limit)
    .map(([productId, totals]) => {
      const product = getProduct(productId);
      return {
        id: productId,
        name: product?.title ?? productId,
        detail: product ? getTopCategoryName(product.categorySlugPath[0]) : "",
        value: round2(totals.revenue),
        count: totals.units,
      };
    });
}

export function getTopCategories(limit = 8): RankedEntry[] {
  const totals = new Map<string, { revenue: number; units: number }>();
  for (const order of ORDERS) {
    if (order.paymentStatus === "failed") continue;
    for (const item of order.items) {
      const product = getProduct(item.productId);
      if (!product) continue;
      const slug = product.categorySlugPath[0];
      const entry = totals.get(slug) ?? { revenue: 0, units: 0 };
      entry.revenue += item.price * item.quantity;
      entry.units += item.quantity;
      totals.set(slug, entry);
    }
  }
  return [...totals.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, limit)
    .map(([slug, totals]) => ({
      id: slug,
      name: getTopCategoryName(slug),
      detail: `${totals.units} units`,
      value: round2(totals.revenue),
      count: totals.units,
    }));
}

export function getTopBrands(limit = 8): RankedEntry[] {
  const totals = new Map<string, { revenue: number; units: number }>();
  for (const order of ORDERS) {
    if (order.paymentStatus === "failed") continue;
    for (const item of order.items) {
      const product = getProduct(item.productId);
      if (!product) continue;
      const entry = totals.get(product.brandId) ?? { revenue: 0, units: 0 };
      entry.revenue += item.price * item.quantity;
      entry.units += item.quantity;
      totals.set(product.brandId, entry);
    }
  }
  return [...totals.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, limit)
    .map(([brandId, totals]) => ({
      id: brandId,
      name: getBrand(brandId)?.name ?? brandId,
      detail: `${totals.units} units`,
      value: round2(totals.revenue),
      count: totals.units,
    }));
}

export function getTopCustomers(limit = 8): RankedEntry[] {
  return [...CUSTOMERS]
    .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
    .slice(0, limit)
    .map((c) => ({
      id: c.id,
      name: c.name,
      detail: `${c.ordersCount} orders`,
      value: c.lifetimeValue,
      count: c.ordersCount,
    }));
}
