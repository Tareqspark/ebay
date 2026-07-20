import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateProducts } from "./product-data.mjs";
import { slugify } from "./slugify.mjs";
import { createRng } from "./rng.mjs";
import {
  SUPPLIERS,
  FIRST_NAMES,
  LAST_NAMES,
  US_LOCATIONS,
  WAREHOUSES,
  CARRIERS,
  PAYMENT_METHODS,
  ADMIN_USERS,
  IMPORT_ERROR_REASONS,
  SYSTEM_COMPONENTS,
} from "./admin-source.mjs";
import { CJ_SHIPPING_LINES, CJ_DISPUTE_REASONS } from "./cj-source.mjs";

// Hybrid fulfillment split: share of the catalog that's dropshipped via CJ
// vs. wholesale-restocked into Baruashop's own warehouses (self).
const CJ_SHARE = 0.35;

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "app", "data", "admin");

const { rand, pick, pickN, randInt, chance } = createRng(90420137);
const NOW = new Date("2026-07-19T09:00:00-04:00").getTime(); // matches project "today"

const daysAgo = (n) => new Date(NOW - n * 86400000);
const hoursAgo = (n) => new Date(NOW - n * 3600000);
const iso = (d) => d.toISOString();
// Skewed toward recent: rand()^power biases small values (recent) more often.
const recentIso = (maxDays, power = 2) => iso(daysAgo(Math.floor(Math.pow(rand(), power) * maxDays)));
const money = (n) => Math.round(n * 100) / 100;

function tsString(v) {
  return JSON.stringify(v);
}
function writeModule(filename, banner, body) {
  mkdirSync(OUT_DIR, { recursive: true });
  const path = join(OUT_DIR, filename);
  writeFileSync(path, banner + body, "utf-8");
  return path;
}
const HEADER = (types, from = "@/lib/admin/types") => `// AUTO-GENERATED FILE. Do not edit directly.
// Source logic lives in scripts/generate-admin-data.mjs — run
// \`node scripts/generate-admin-data.mjs\` to regenerate.
import type { ${types} } from "${from}";

`;

// ---------------------------------------------------------------------------
// Products (shared with storefront generator, same seed => same catalog)
// ---------------------------------------------------------------------------
const PRODUCTS = generateProducts();

// ---------------------------------------------------------------------------
// Suppliers
// ---------------------------------------------------------------------------
const suppliers = SUPPLIERS.map((s) => {
  const id = slugify(s.name);
  const syncEveryHours = s.frequency === "hourly" ? 1 : s.frequency === "every-6-hours" ? 6 : 24;
  const status = chance(0.88) ? "active" : chance(0.5) ? "paused" : "disconnected";
  const lastSync = status === "disconnected" ? daysAgo(randInt(3, 14)) : hoursAgo(randInt(0, syncEveryHours));
  return {
    id,
    name: s.name,
    region: s.region,
    contactEmail: `partners@${id.replace(/-/g, "")}.com`,
    status,
    integration: s.integration,
    syncFrequency: s.frequency,
    productsSupplied: 0, // filled in below once product-meta is assigned
    avgFulfillmentDays: randInt(2, 9),
    lastSyncAt: iso(lastSync),
    nextSyncAt: iso(new Date(lastSync.getTime() + syncEveryHours * 3600000)),
    rating: Math.round((3.6 + rand() * 1.4) * 10) / 10,
  };
});
const supplierIds = suppliers.map((s) => s.id);

// ---------------------------------------------------------------------------
// Admin product metadata (cost/margin/supplier/visibility/status per SKU)
// ---------------------------------------------------------------------------
const cnShippingLineIds = CJ_SHIPPING_LINES.filter((l) => l.fromWarehouse === "CN").map((l) => l.id);
const usShippingLineIds = CJ_SHIPPING_LINES.filter((l) => l.fromWarehouse === "US").map((l) => l.id);
const shippingLineById = new Map(CJ_SHIPPING_LINES.map((l) => [l.id, l]));

const productMeta = PRODUCTS.map((p) => {
  const source = chance(CJ_SHARE) ? "cj" : "self";
  const status = chance(0.86) ? "active" : chance(0.6) ? "draft" : "archived";
  const visibility = status !== "active" ? "hidden" : chance(0.94) ? "visible" : "hidden";
  const importedAt = recentIso(180, 1.4);
  const lastUpdatedAt = recentIso(21, 1.6);

  if (source === "cj") {
    const marginFactor = 0.3 + rand() * 0.25; // CJ cost is ~30-55% of retail — dropshippers need more headroom to cover shipping fees
    const cost = money(p.price * marginFactor);
    const cjSourceWarehouse = chance(0.72) ? "CN" : "US";
    const cjShippingLineId = cjSourceWarehouse === "CN" ? pick(cnShippingLineIds) : pick(usShippingLineIds);
    const cjShippingFee = shippingLineById.get(cjShippingLineId).costPerOrder;
    const stockRoll = rand();
    return {
      productId: p.id,
      source,
      cost,
      status,
      visibility,
      needsReview: p.price - cost - cjShippingFee < p.price * 0.1 || chance(0.04),
      importedAt,
      lastUpdatedAt,
      cjProductId: `CJ${randInt(1000000, 9999999)}`,
      cjVariantId: `CJV${randInt(100000, 999999)}`,
      cjShippingFee,
      cjShippingLineId,
      cjSourceWarehouse,
      cjStockStatus: stockRoll < 0.9 ? "in_stock" : stockRoll < 0.97 ? "low_stock" : "out_of_stock",
    };
  }

  const marginFactor = 0.4 + rand() * 0.35; // cost is 40-75% of price
  const cost = money(p.price * marginFactor);
  return {
    productId: p.id,
    source,
    cost,
    supplierId: pick(supplierIds),
    status,
    visibility,
    needsReview: p.price - cost < p.price * 0.15 || chance(0.04),
    importedAt,
    lastUpdatedAt,
  };
});
const productMetaByProductId = new Map(productMeta.map((m) => [m.productId, m]));
for (const s of suppliers) {
  s.productsSupplied = productMeta.filter((m) => m.supplierId === s.id).length;
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------
const CUSTOMER_COUNT = 220;
const customers = Array.from({ length: CUSTOMER_COUNT }, (_, i) => {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const loc = pick(US_LOCATIONS);
  const createdAt = recentIso(540, 1.2);
  const status = chance(0.06) ? "vip" : chance(0.08) ? "at-risk" : chance(0.02) ? "blocked" : "active";
  return {
    id: `cus-${1000 + i}`,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${randInt(1, 98)}@${pick(["gmail.com", "yahoo.com", "outlook.com", "icloud.com"])}`,
    avatarSeed: `${first}-${last}-${i}`,
    city: loc.city,
    state: loc.state,
    country: "United States",
    status,
    createdAt,
    ordersCount: 0, // filled in after orders are generated
    lifetimeValue: 0,
    averageOrderValue: 0,
    lastOrderAt: null,
    tags: pickN(["newsletter", "repeat-buyer", "referral", "high-aov", "mobile-shopper"], randInt(0, 2)),
    notes: chance(0.18)
      ? [
          {
            id: `note-${i}-1`,
            author: pick(ADMIN_USERS.filter((a) => a !== "System")),
            text: pick([
              "Requested expedited shipping on last order — approved as one-time courtesy.",
              "Reached out about a damaged item; replacement sent, no return needed.",
              "Asked about bulk pricing for a corporate gifting order.",
              "Reported a coupon code issue at checkout — resolved, code re-issued.",
              "VIP customer — proactively flag any fulfillment delays.",
            ]),
            createdAt: recentIso(120, 1.5),
          },
        ]
      : [],
  };
});

// ---------------------------------------------------------------------------
// Orders (+ derived payments/disputes)
// ---------------------------------------------------------------------------
const ORDER_COUNT = 640;
const orders = [];
for (let i = 0; i < ORDER_COUNT; i += 1) {
  const customer = pick(customers);
  const placed = new Date(NOW - Math.pow(rand(), 2.2) * 60 * 86400000 - randInt(0, 14) * 3600000);
  const itemCount = randInt(1, 4);
  const items = Array.from({ length: itemCount }, () => {
    const p = pick(PRODUCTS);
    const meta = productMetaByProductId.get(p.id);
    return {
      productId: p.id,
      title: p.title,
      image: p.images[0],
      quantity: randInt(1, 3),
      price: p.price,
      source: meta.source,
    };
  });
  const hasSelfItems = items.some((it) => it.source === "self");
  const hasCjItems = items.some((it) => it.source === "cj");
  const daysSince = (NOW - placed.getTime()) / 86400000;

  const subtotal = money(items.reduce((sum, it) => sum + it.price * it.quantity, 0));
  const shipping = subtotal >= 50 ? 0 : money(4.99 + rand() * 4);
  const tax = money(subtotal * 0.0825);
  const total = money(subtotal + shipping + tax);

  const paymentRoll = rand();
  const paymentStatus =
    paymentRoll < 0.82 ? "paid" : paymentRoll < 0.89 ? "pending" : paymentRoll < 0.95 ? "refunded" : paymentRoll < 0.98 ? "partially_refunded" : "failed";
  const cancelled = paymentStatus === "failed";

  // Self-warehouse fulfillment track (only meaningful when the order has
  // self-sourced items).
  let fulfillmentStatus;
  if (cancelled) fulfillmentStatus = "cancelled";
  else if (hasSelfItems) {
    const fRoll = rand();
    if (daysSince < 1) fulfillmentStatus = fRoll < 0.7 ? "unfulfilled" : "processing";
    else if (daysSince < 3) fulfillmentStatus = fRoll < 0.15 ? "unfulfilled" : fRoll < 0.45 ? "processing" : "shipped";
    else fulfillmentStatus = fRoll < 0.05 ? "processing" : fRoll < 0.15 ? "shipped" : fRoll < 0.94 ? "delivered" : "cancelled";
  }
  const hasTracking = hasSelfItems && ["shipped", "delivered"].includes(fulfillmentStatus);

  // CJ fulfillment track (only meaningful when the order has CJ-sourced
  // items) — CJ timelines run longer than self-warehouse ones, so the
  // thresholds below are more generous than the self track above.
  let cjSyncStatus;
  if (!cancelled && hasCjItems) {
    if (daysSince < 1) cjSyncStatus = chance(0.4) ? "not_sent" : "queued";
    else if (daysSince < 3) cjSyncStatus = chance(0.3) ? "queued" : chance(0.86) ? "processing" : "shipped";
    else if (daysSince < 7) cjSyncStatus = chance(0.25) ? "processing" : "shipped";
    else cjSyncStatus = "shipped";
  }
  const cjShippingLineId = hasCjItems ? pick(CJ_SHIPPING_LINES.map((l) => l.id)) : undefined;

  // When an order has no self-sourced items at all, the CJ track is the only
  // fulfillment story — surface it through the same fulfillmentStatus field
  // the UI already renders, rather than leaving it blank.
  if (!cancelled && !hasSelfItems && hasCjItems) {
    fulfillmentStatus =
      cjSyncStatus === "shipped" ? (daysSince > 14 ? "delivered" : "shipped") : cjSyncStatus === "processing" ? "processing" : "unfulfilled";
  }

  const loc = pick(US_LOCATIONS);

  const order = {
    id: `BS-${100000 + i}`,
    customerId: customer.id,
    items,
    subtotal,
    shipping,
    tax,
    total,
    paymentStatus,
    fulfillmentStatus,
    trackingNumber: hasTracking ? `1Z${randInt(100000000, 999999999)}US` : undefined,
    carrier: hasTracking ? pick(CARRIERS) : undefined,
    supplierId: hasSelfItems ? pick(supplierIds) : undefined,
    placedAt: iso(placed),
    updatedAt: iso(new Date(Math.min(NOW, placed.getTime() + randInt(1, 72) * 3600000))),
    paymentMethod: pick(PAYMENT_METHODS),
    shippingAddress: {
      name: customer.name,
      line1: `${randInt(100, 9999)} ${pick(["Maple", "Oak", "Cedar", "Sunset", "Highland", "River", "Park", "Lincoln"])} ${pick(["St", "Ave", "Dr", "Ln", "Blvd"])}`,
      city: loc.city,
      state: loc.state,
      zip: String(randInt(10000, 99999)),
      country: "US",
    },
    cjSyncStatus,
    cjOrderId: cjSyncStatus && cjSyncStatus !== "not_sent" ? `CJO-${randInt(1000000, 9999999)}` : undefined,
    cjTrackingNumber: cjSyncStatus === "shipped" ? `CJP${randInt(1000000000, 9999999999)}` : undefined,
    cjShippingLineId,
  };
  orders.push(order);
}
orders.sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());

// roll up customer stats from orders
const ordersByCustomer = new Map();
for (const o of orders) {
  if (o.paymentStatus === "failed") continue;
  if (!ordersByCustomer.has(o.customerId)) ordersByCustomer.set(o.customerId, []);
  ordersByCustomer.get(o.customerId).push(o);
}
for (const c of customers) {
  const custOrders = ordersByCustomer.get(c.id) ?? [];
  c.ordersCount = custOrders.length;
  c.lifetimeValue = money(custOrders.reduce((sum, o) => sum + o.total, 0));
  c.averageOrderValue = custOrders.length ? money(c.lifetimeValue / custOrders.length) : 0;
  c.lastOrderAt = custOrders.length
    ? custOrders.reduce((latest, o) => (o.placedAt > latest ? o.placedAt : latest), custOrders[0].placedAt)
    : null;
}

// ---------------------------------------------------------------------------
// CJ after-sales disputes (lost/damaged/wrong-item claims filed with CJ)
// ---------------------------------------------------------------------------
const cjEligibleOrders = orders.filter(
  (o) => o.cjSyncStatus && o.cjSyncStatus !== "not_sent" && o.paymentStatus !== "failed"
);
const cjDisputes = pickN(cjEligibleOrders, Math.min(26, cjEligibleOrders.length)).map((order, i) => {
  const cjItem = order.items.find((it) => it.source === "cj") ?? order.items[0];
  const reason = pick(CJ_DISPUTE_REASONS);
  const statusRoll = rand();
  const status =
    statusRoll < 0.35 ? "open" : statusRoll < 0.55 ? "awaiting_cj" : statusRoll < 0.75 ? "resolved_reship" : statusRoll < 0.92 ? "resolved_refund" : "rejected";
  const requestedResolution =
    reason === "wrong_item" ? "reshipment" : reason === "lost_in_transit" || reason === "damaged" ? pick(["reshipment", "refund"]) : "refund";
  const createdAt = recentIso(20, 1.2);
  return {
    id: `cjd-${i + 1}`,
    orderId: order.id,
    productId: cjItem.productId,
    productTitle: cjItem.title,
    customerId: order.customerId,
    reason,
    status,
    requestedResolution,
    amount: money(cjItem.price * cjItem.quantity),
    createdAt,
    updatedAt: iso(new Date(Math.min(NOW, new Date(createdAt).getTime() + randInt(1, 96) * 3600000))),
  };
});

// Payments derived 1:1 from orders
const payments = orders.map((o, i) => {
  const status =
    o.paymentStatus === "paid"
      ? "succeeded"
      : o.paymentStatus === "partially_refunded"
        ? "succeeded"
        : o.paymentStatus;
  return {
    id: `pay-${200000 + i}`,
    orderId: o.id,
    customerId: o.customerId,
    amount: o.total,
    status,
    method: o.paymentMethod,
    processorFee: money(o.total * 0.029 + 0.3),
    createdAt: o.placedAt,
  };
});

// Disputes: small subset of succeeded payments
const disputeEligible = payments.filter((p) => p.status === "succeeded");
const disputes = pickN(disputeEligible, 16).map((p, i) => {
  const created = new Date(p.createdAt);
  const status = pick(["needs_response", "needs_response", "under_review", "won", "lost"]);
  return {
    id: `dp-${i + 1}`,
    orderId: p.orderId,
    customerId: p.customerId,
    reason: pick(["Product not received", "Product not as described", "Duplicate charge", "Fraudulent charge (unrecognized)", "Subscription cancelled"]),
    amount: p.amount,
    status,
    dueBy: iso(new Date(created.getTime() + 7 * 86400000 + 14 * 86400000)),
    createdAt: iso(new Date(created.getTime() + randInt(1, 10) * 86400000)),
  };
});

// Payouts: weekly settlement batches
const payouts = Array.from({ length: 10 }, (_, i) => {
  const periodEnd = daysAgo(i * 7);
  const periodStart = daysAgo(i * 7 + 7);
  const windowPayments = payments.filter((p) => {
    const t = new Date(p.createdAt).getTime();
    return p.status === "succeeded" && t >= periodStart.getTime() && t < periodEnd.getTime();
  });
  const amount = money(windowPayments.reduce((sum, p) => sum + p.amount - p.processorFee, 0));
  return {
    id: `po-${9000 + i}`,
    periodStart: iso(periodStart),
    periodEnd: iso(periodEnd),
    amount,
    status: i === 0 ? "in_transit" : "paid",
    arrivalDate: iso(new Date(periodEnd.getTime() + 2 * 86400000)),
    transactionCount: windowPayments.length,
  };
});

// ---------------------------------------------------------------------------
// Inventory (sample of the catalog — an operational slice, not the full 2.8k)
// ---------------------------------------------------------------------------
const inventorySample = pickN(PRODUCTS, 1500);
const inventory = inventorySample.map((p, i) => {
  const meta = productMetaByProductId.get(p.id);
  const sku = `SKU-${100001 + i}`;
  const base = { sku, productId: p.id, title: p.title, image: p.images[0], updatedAt: recentIso(10, 1.4) };

  if (meta.source === "cj") {
    // CJ holds this stock — Baruashop never reserves or receives it, so
    // "available" mirrors CJ's own reported stock status, and
    // reserved/incoming (Baruashop-DC concepts) are always zero.
    const available =
      meta.cjStockStatus === "out_of_stock" ? 0 : meta.cjStockStatus === "low_stock" ? randInt(1, 9) : randInt(10, 900);
    return {
      ...base,
      source: "cj",
      warehouse: `CJ Warehouse (${meta.cjSourceWarehouse})`,
      available,
      reserved: 0,
      incoming: 0,
      status: meta.cjStockStatus,
    };
  }

  const available = chance(0.06) ? 0 : chance(0.14) ? randInt(1, 9) : randInt(10, 480);
  const reserved = randInt(0, Math.min(12, available));
  const incoming = chance(0.3) ? randInt(20, 300) : 0;
  const status = available === 0 ? (incoming > 0 ? "backorder" : "out_of_stock") : available <= 9 ? "low_stock" : "in_stock";
  return {
    ...base,
    source: "self",
    warehouse: pick(WAREHOUSES),
    available,
    reserved,
    incoming,
    status,
    supplierId: meta.supplierId,
  };
});

// ---------------------------------------------------------------------------
// Supplier imports: queue, history, errors, field mappings, logs
// ---------------------------------------------------------------------------
const importQueue = pickN(supplierIds, 6).map((supplierId, i) => {
  const total = randInt(200, 4000);
  const status = i < 2 ? "running" : "queued";
  const processed = status === "running" ? randInt(Math.floor(total * 0.1), Math.floor(total * 0.9)) : 0;
  return {
    id: `job-q-${i + 1}`,
    supplierId,
    type: pick(["product_sync", "inventory_sync", "price_update"]),
    status,
    totalItems: total,
    processedItems: processed,
    failedItems: status === "running" ? randInt(0, Math.floor(processed * 0.02)) : 0,
    startedAt: status === "running" ? recentIso(0.3, 1) : null,
    completedAt: null,
  };
});

const importHistory = Array.from({ length: 90 }, (_, i) => {
  const supplierId = pick(supplierIds);
  const total = randInt(50, 5000);
  const failed = chance(0.22) ? randInt(1, Math.max(1, Math.floor(total * 0.08))) : 0;
  const status = failed > total * 0.05 && chance(0.4) ? "failed" : "completed";
  const started = daysAgo(Math.floor(Math.pow(rand(), 1.5) * 30));
  return {
    id: `job-h-${i + 1}`,
    supplierId,
    type: pick(["product_sync", "inventory_sync", "price_update"]),
    status,
    totalItems: total,
    processedItems: total - failed,
    failedItems: failed,
    startedAt: iso(started),
    completedAt: iso(new Date(started.getTime() + randInt(4, 90) * 60000)),
  };
}).sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

const failedJobs = importHistory.filter((j) => j.failedItems > 0);
const importErrors = [];
let errCounter = 1;
for (const job of failedJobs) {
  const errCount = Math.min(job.failedItems, randInt(1, 5));
  for (let i = 0; i < errCount; i += 1) {
    importErrors.push({
      id: `err-${errCounter}`,
      jobId: job.id,
      supplierId: job.supplierId,
      sku: `SKU-${randInt(100001, 101500)}`,
      reason: pick(IMPORT_ERROR_REASONS),
      occurredAt: job.completedAt,
      resolved: chance(0.35),
    });
    errCounter += 1;
  }
}

const SOURCE_FIELDS = ["product_title", "product_desc", "sale_price", "msrp", "stock_qty", "category_path", "primary_image", "gtin"];
const TARGET_FIELDS = ["title", "description", "price", "cost", "available", "categorySlugPath", "images[0]", "sku"];
const fieldMappings = suppliers.map((s) => ({
  supplierId: s.id,
  mappings: SOURCE_FIELDS.map((sourceField, i) => ({
    sourceField,
    targetField: TARGET_FIELDS[i],
    transform: [2, 3].includes(i) ? "currency_normalize" : i === 5 ? "category_ai_match" : undefined,
  })),
}));

const LOG_MESSAGES = {
  info: ["Sync started", "Sync completed successfully", "Connected to feed endpoint", "Applied price update batch", "Inventory levels reconciled"],
  warn: ["Feed response slower than expected (4.2s)", "12 SKUs missing secondary images", "Rate limit at 80% of quota", "Category mapping fallback used for 6 items"],
  error: ["Feed endpoint returned 503", "Authentication token expired", "Malformed payload for batch #44", "Connection timeout after 30s"],
};
const supplierLogs = Array.from({ length: 220 }, (_, i) => {
  const level = rand() < 0.75 ? "info" : rand() < 0.85 ? "warn" : "error";
  return {
    id: `log-${i + 1}`,
    supplierId: pick(supplierIds),
    level,
    message: pick(LOG_MESSAGES[level]),
    timestamp: recentIso(14, 1.3),
  };
}).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

// ---------------------------------------------------------------------------
// Activity feed + announcements
// ---------------------------------------------------------------------------
const activityTemplates = [
  () => ({ type: "order", message: `New order ${pick(orders).id} placed`, actor: "System" }),
  () => ({ type: "payment", message: `Payment captured for ${pick(orders).id}`, actor: "System" }),
  () => ({ type: "import", message: `${pick(suppliers).name} sync completed`, actor: "Supplier Sync" }),
  () => ({ type: "product", message: `Product visibility updated for ${pick(PRODUCTS).title}`, actor: pick(ADMIN_USERS.filter((a) => a !== "System")) }),
  () => ({ type: "customer", message: `${pick(customers).name} flagged as VIP`, actor: pick(ADMIN_USERS.filter((a) => a !== "System")) }),
  () => ({ type: "system", message: "Nightly analytics rollup completed", actor: "System" }),
];
const activity = Array.from({ length: 60 }, (_, i) => {
  const t = pick(activityTemplates)();
  return { id: `act-${i + 1}`, ...t, createdAt: recentIso(7, 1.6) };
}).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

const announcements = [
  {
    id: "ann-1",
    title: "Scheduled maintenance window",
    body: "Order processing will pause for approximately 15 minutes on Sunday, 2:00–2:15 AM ET while we upgrade the payment gateway.",
    level: "warning",
    createdAt: recentIso(2, 1),
  },
  {
    id: "ann-2",
    title: `New supplier onboarded: ${suppliers[suppliers.length - 1].name}`,
    body: "Product sync is live and the first catalog import has completed. Review imported items under Supplier → Import History.",
    level: "success",
    createdAt: recentIso(5, 1),
  },
  {
    id: "ann-3",
    title: "Payment processor fee schedule updated",
    body: "Effective next billing cycle, card processing fees change to 2.9% + $0.30 per transaction. Payout projections have been updated accordingly.",
    level: "info",
    createdAt: recentIso(9, 1),
  },
  {
    id: "ann-4",
    title: "New bulk-edit tool available in Products",
    body: "You can now update price, status, and visibility for up to 500 products at once from the Products table's bulk action bar.",
    level: "info",
    createdAt: recentIso(15, 1),
  },
  {
    id: "ann-5",
    title: "Elevated failed-import rate resolved",
    body: "An intermittent feed timeout affecting three suppliers was resolved. Failed items from the affected window have been automatically requeued.",
    level: "success",
    createdAt: recentIso(21, 1),
  },
];

// ---------------------------------------------------------------------------
// System health
// ---------------------------------------------------------------------------
const systemComponents = SYSTEM_COMPONENTS.map((c, i) => {
  const roll = rand();
  const status = roll < 0.94 ? "operational" : roll < 0.99 ? "degraded" : "outage";
  const latencyMs = Math.round(c.baseLatency * (status === "operational" ? 0.8 + rand() * 0.4 : status === "degraded" ? 1.8 + rand() : 3 + rand() * 2));
  return {
    id: `sys-${i + 1}`,
    name: c.name,
    status,
    latencyMs,
    uptimePercent: status === "operational" ? Math.round((99.85 + rand() * 0.15) * 100) / 100 : status === "degraded" ? Math.round((98.5 + rand()) * 100) / 100 : Math.round((95 + rand() * 2) * 100) / 100,
  };
});

// ---------------------------------------------------------------------------
// Emit .ts modules
// ---------------------------------------------------------------------------
function renderArray(name, type, items) {
  const body = items.map((item) => "  " + tsString(item).replace(/^\{/, "{ ").replace(/\}$/, " }")).join(",\n");
  return `export const ${name}: ${type}[] = [\n${body}\n];\n`;
}

writeModule("suppliers.ts", HEADER("Supplier"), renderArray("SUPPLIERS", "Supplier", suppliers));
writeModule("product-meta.ts", HEADER("AdminProductMeta"), renderArray("PRODUCT_META", "AdminProductMeta", productMeta));
writeModule("customers.ts", HEADER("Customer"), renderArray("CUSTOMERS", "Customer", customers));
writeModule(
  "orders.ts",
  HEADER("Order"),
  renderArray("ORDERS", "Order", orders)
);
writeModule(
  "payments.ts",
  HEADER("Payment, Payout, Dispute"),
  [
    renderArray("PAYMENTS", "Payment", payments),
    renderArray("DISPUTES", "Dispute", disputes),
    renderArray("PAYOUTS", "Payout", payouts),
  ].join("\n")
);
writeModule("inventory.ts", HEADER("InventoryRecord"), renderArray("INVENTORY", "InventoryRecord", inventory));
writeModule(
  "imports.ts",
  HEADER("ImportJob, ImportError, FieldMapping, SupplierLog"),
  [
    renderArray("IMPORT_QUEUE", "ImportJob", importQueue),
    renderArray("IMPORT_HISTORY", "ImportJob", importHistory),
    renderArray("IMPORT_ERRORS", "ImportError", importErrors),
    renderArray("FIELD_MAPPINGS", "FieldMapping", fieldMappings),
    renderArray("SUPPLIER_LOGS", "SupplierLog", supplierLogs),
  ].join("\n")
);
writeModule(
  "activity.ts",
  HEADER("ActivityEvent, Announcement"),
  [renderArray("ACTIVITY", "ActivityEvent", activity), renderArray("ANNOUNCEMENTS", "Announcement", announcements)].join("\n")
);
writeModule("system.ts", HEADER("SystemComponent"), renderArray("SYSTEM_COMPONENTS", "SystemComponent", systemComponents));
writeModule("cj-disputes.ts", HEADER("CjDispute", "@/lib/admin/cj-types"), renderArray("CJ_DISPUTES", "CjDispute", cjDisputes));

console.log("Generated admin data:");
console.log(`  Suppliers: ${suppliers.length}`);
console.log(`  Product metadata: ${productMeta.length}`);
console.log(`  Customers: ${customers.length}`);
console.log(`  Orders: ${orders.length}`);
console.log(`  Payments: ${payments.length}, Disputes: ${disputes.length}, Payouts: ${payouts.length}`);
console.log(`  Inventory records: ${inventory.length}`);
console.log(`  Import queue: ${importQueue.length}, history: ${importHistory.length}, errors: ${importErrors.length}`);
console.log(`  Supplier logs: ${supplierLogs.length}`);
console.log(`  Activity: ${activity.length}, Announcements: ${announcements.length}`);
console.log(`  System components: ${systemComponents.length}`);
const cjCount = productMeta.filter((m) => m.source === "cj").length;
console.log(`  Hybrid split: ${productMeta.length - cjCount} self / ${cjCount} cj (${Math.round((cjCount / productMeta.length) * 100)}% CJ)`);
console.log(`  CJ disputes: ${cjDisputes.length}`);
