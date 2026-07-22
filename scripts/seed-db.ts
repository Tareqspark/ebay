/**
 * One-time seed: migrates every generated mock dataset (catalog, taxonomy,
 * and all admin entities) into the real MySQL database. Run with:
 *   npx tsx scripts/seed-db.ts
 *
 * Safe to re-run: each block clears its own table(s) first (DELETE, not
 * DROP — keeps the schema, just resets the seeded rows) so this can be
 * re-run after regenerating the source *.mjs data without leaving stale
 * duplicate rows behind.
 */
import { hash } from "bcryptjs";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../db/schema";

// Own connection, not db/index.ts — that file imports "server-only", which
// throws outside the Next.js runtime this plain Node/tsx script runs in.
const pool = mysql.createPool({ uri: process.env.DATABASE_URL, connectionLimit: 5 });
const db = drizzle(pool, { schema, mode: "default" });
import { newId } from "../lib/id";
import { toCents } from "../lib/money";

import { CATEGORIES } from "../app/data/categories";
import { BRANDS } from "../app/data/brands";
import { PRODUCTS } from "../app/data/products";
import { SUPPLIERS } from "../app/data/admin/suppliers";
import { PRODUCT_META } from "../app/data/admin/product-meta";
import { CUSTOMERS } from "../app/data/admin/customers";
import { ORDERS } from "../app/data/admin/orders";
import { PAYMENTS, DISPUTES, PAYOUTS } from "../app/data/admin/payments";
import { INVENTORY } from "../app/data/admin/inventory";
import { IMPORT_QUEUE, IMPORT_HISTORY, IMPORT_ERRORS, FIELD_MAPPINGS, SUPPLIER_LOGS } from "../app/data/admin/imports";
import { ACTIVITY, ANNOUNCEMENTS } from "../app/data/admin/activity";
import { SYSTEM_COMPONENTS } from "../app/data/admin/system";
import { CJ_DISPUTES } from "../app/data/admin/cj-disputes";
import { CJ_SHIPPING_LINES, CJ_INTEGRATION_SETTINGS, CJ_SOURCING_REQUESTS } from "../lib/admin/cj";
import { CATEGORY_ICONS } from "../lib/category-icons";
import {
  CAMPAIGNS,
  CONTENT_ITEMS,
  COLLECTIONS,
  SHIPPING_RATES,
  CARRIERS,
  ADMIN_TEAM,
  API_KEYS,
} from "./seed-admin-extras";

const ICON_TO_NAME = new Map(Object.entries(CATEGORY_ICONS).map(([name, icon]) => [icon, name]));

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

async function bulkInsert<T extends Record<string, unknown>>(table: Parameters<typeof db.insert>[0], rows: T[], label: string) {
  if (rows.length === 0) return;
  for (const batch of chunk(rows, 500)) {
    await db.insert(table).values(batch as never);
  }
  console.log(`  ${label}: ${rows.length} rows`);
}

async function main() {
  console.log("Seeding Baruashop database...\n");

  // -------------------------------------------------------------------
  // Taxonomy + catalog
  // -------------------------------------------------------------------
  console.log("Categories, brands, products:");
  await db.delete(schema.categories);
  const categoryRows: (typeof schema.categories.$inferInsert)[] = [];
  const leafIdBySlugPath = new Map<string, string>();
  let sortOrder = 0;
  for (const top of CATEGORIES) {
    categoryRows.push({
      id: top.id,
      parentId: null,
      level: "top",
      name: top.name,
      slug: top.slug,
      iconName: ICON_TO_NAME.get(top.icon) ?? null,
      image: top.image,
      description: top.description,
      featured: top.featured,
      sortOrder: sortOrder++,
    });
    for (const child of top.children) {
      categoryRows.push({
        id: child.id,
        parentId: top.id,
        level: "child",
        name: child.name,
        slug: child.slug,
        sortOrder: sortOrder++,
      });
      for (const gc of child.children) {
        categoryRows.push({
          id: gc.id,
          parentId: child.id,
          level: "grandchild",
          name: gc.name,
          slug: gc.slug,
          sortOrder: sortOrder++,
        });
        leafIdBySlugPath.set(`${top.slug}/${child.slug}/${gc.slug}`, gc.id);
      }
    }
  }
  await bulkInsert(schema.categories, categoryRows, "categories");

  await db.delete(schema.brands);
  await bulkInsert(
    schema.brands,
    BRANDS.map((b) => ({ id: b.id, name: b.name, slug: b.slug, categorySlugs: b.categorySlugs })),
    "brands"
  );

  await db.delete(schema.products);
  await bulkInsert(
    schema.products,
    PRODUCTS.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      brandId: p.brandId,
      priceCents: toCents(p.price),
      originalPriceCents: p.originalPrice ? toCents(p.originalPrice) : null,
      currency: p.currency,
      images: p.images,
      ratingValue: p.review.rating.toFixed(1),
      ratingCount: p.review.count,
      categoryId: leafIdBySlugPath.get(p.categorySlugPath.join("/")) ?? p.categorySlugPath[2],
      categorySlugPath: p.categorySlugPath,
      isNewArrival: p.isNewArrival,
      isBestSeller: p.isBestSeller,
      isTrending: p.isTrending,
      isFlashSale: p.isFlashSale,
      isDeal: p.isDeal,
      flashSaleEndsAt: p.flashSaleEndsAt ? new Date(p.flashSaleEndsAt) : null,
      freeShipping: p.freeShipping,
      stock: p.stock,
      description: p.description,
      features: p.features,
    })),
    "products"
  );

  await db.delete(schema.productMeta);
  await bulkInsert(
    schema.productMeta,
    PRODUCT_META.map((m) => ({
      productId: m.productId,
      source: m.source,
      costCents: toCents(m.cost),
      supplierId: m.supplierId ?? null,
      status: m.status,
      visibility: m.visibility,
      needsReview: m.needsReview,
      importedAt: new Date(m.importedAt),
      lastUpdatedAt: new Date(m.lastUpdatedAt),
      cjProductId: m.cjProductId ?? null,
      cjVariantId: m.cjVariantId ?? null,
      cjShippingFeeCents: m.cjShippingFee != null ? toCents(m.cjShippingFee) : null,
      cjShippingLineId: m.cjShippingLineId ?? null,
      cjSourceWarehouse: m.cjSourceWarehouse ?? null,
      cjStockStatus: m.cjStockStatus ?? null,
    })),
    "product_meta"
  );

  await db.delete(schema.inventory);
  await bulkInsert(
    schema.inventory,
    INVENTORY.map((i) => ({
      sku: i.sku,
      productId: i.productId,
      source: i.source,
      warehouse: i.warehouse,
      available: i.available,
      reserved: i.reserved,
      incoming: i.incoming,
      status: i.status,
      supplierId: i.supplierId ?? null,
      updatedAt: new Date(i.updatedAt),
    })),
    "inventory"
  );

  await db.delete(schema.suppliers);
  await bulkInsert(
    schema.suppliers,
    SUPPLIERS.map((s) => ({
      id: s.id,
      name: s.name,
      region: s.region,
      contactEmail: s.contactEmail,
      status: s.status,
      integration: s.integration,
      syncFrequency: s.syncFrequency,
      productsSupplied: s.productsSupplied,
      avgFulfillmentDays: s.avgFulfillmentDays.toFixed(1),
      lastSyncAt: new Date(s.lastSyncAt),
      nextSyncAt: new Date(s.nextSyncAt),
      rating: s.rating.toFixed(1),
    })),
    "suppliers"
  );

  // -------------------------------------------------------------------
  // Customers (as real users) — shared seed password so every historical
  // customer is a usable dev-login account. NOT for production use.
  // -------------------------------------------------------------------
  console.log("\nCustomers -> users:");
  const seedPasswordHash = await hash("baruashop-dev-2026", 10);
  await db.delete(schema.customerNotes);
  await db.delete(schema.users).where(sql`id LIKE 'cus-%'`);
  await bulkInsert(
    schema.users,
    CUSTOMERS.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      passwordHash: seedPasswordHash,
      status: c.status,
      city: c.city,
      state: c.state,
      country: c.country,
      tags: c.tags,
      createdAt: new Date(c.createdAt),
    })),
    "users (from mock customers)"
  );
  const notes = CUSTOMERS.flatMap((c) =>
    c.notes.map((n) => ({ id: n.id, userId: c.id, author: n.author, text: n.text, createdAt: new Date(n.createdAt) }))
  );
  await bulkInsert(schema.customerNotes, notes, "customer_notes");

  // -------------------------------------------------------------------
  // Orders (mock history) — reuses the same `orders`/`order_items` tables
  // Phase 2's checkout writes to. Internal `id` is a fresh ULID per the
  // Phase 2 convention; `orderNumber` keeps the original "BS-xxxxxx" so
  // payments/disputes/cj_disputes (which reference orders by that number)
  // can be remapped to the new internal id below.
  // -------------------------------------------------------------------
  console.log("\nOrders:");
  await db.delete(schema.orderItems);
  await db.delete(schema.orders).where(sql`order_number LIKE 'BS-%'`);
  const orderIdByNumber = new Map<string, string>();
  const orderRows: (typeof schema.orders.$inferInsert)[] = [];
  const orderItemRows: (typeof schema.orderItems.$inferInsert)[] = [];
  for (const o of ORDERS) {
    const id = newId();
    orderIdByNumber.set(o.id, id);
    orderRows.push({
      id,
      orderNumber: o.id,
      userId: o.customerId,
      paymentStatus: o.paymentStatus,
      fulfillmentStatus: o.fulfillmentStatus,
      subtotalCents: toCents(o.subtotal),
      shippingCents: toCents(o.shipping),
      taxCents: toCents(o.tax),
      totalCents: toCents(o.total),
      paymentMethod: o.paymentMethod,
      trackingNumber: o.trackingNumber ?? null,
      carrier: o.carrier ?? null,
      supplierId: o.supplierId ?? null,
      cjSyncStatus: o.cjSyncStatus ?? null,
      cjOrderId: o.cjOrderId ?? null,
      cjTrackingNumber: o.cjTrackingNumber ?? null,
      cjShippingLineId: o.cjShippingLineId ?? null,
      shippingAddress: o.shippingAddress,
      placedAt: new Date(o.placedAt),
      updatedAt: new Date(o.updatedAt),
    });
    for (const item of o.items) {
      orderItemRows.push({
        id: newId(),
        orderId: id,
        productId: item.productId,
        title: item.title,
        image: item.image,
        quantity: item.quantity,
        priceCents: toCents(item.price),
        source: item.source,
      });
    }
  }
  await bulkInsert(schema.orders, orderRows, "orders");
  await bulkInsert(schema.orderItems, orderItemRows, "order_items");

  // -------------------------------------------------------------------
  // Payments, disputes, payouts, CJ disputes
  // -------------------------------------------------------------------
  console.log("\nPayments & disputes:");
  await db.delete(schema.payments);
  await bulkInsert(
    schema.payments,
    PAYMENTS.map((p) => ({
      id: p.id,
      orderId: orderIdByNumber.get(p.orderId) ?? p.orderId,
      customerId: p.customerId,
      amountCents: toCents(p.amount),
      status: p.status,
      method: p.method,
      processorFeeCents: toCents(p.processorFee),
      createdAt: new Date(p.createdAt),
    })),
    "payments"
  );

  await db.delete(schema.disputes);
  await bulkInsert(
    schema.disputes,
    DISPUTES.map((d) => ({
      id: d.id,
      orderId: orderIdByNumber.get(d.orderId) ?? d.orderId,
      customerId: d.customerId,
      reason: d.reason,
      amountCents: toCents(d.amount),
      status: d.status,
      dueBy: new Date(d.dueBy),
      createdAt: new Date(d.createdAt),
    })),
    "disputes"
  );

  await db.delete(schema.payouts);
  await bulkInsert(
    schema.payouts,
    PAYOUTS.map((p) => ({
      id: p.id,
      periodStart: new Date(p.periodStart),
      periodEnd: new Date(p.periodEnd),
      amountCents: toCents(p.amount),
      status: p.status,
      arrivalDate: new Date(p.arrivalDate),
      transactionCount: p.transactionCount,
    })),
    "payouts"
  );

  await db.delete(schema.cjDisputes);
  await bulkInsert(
    schema.cjDisputes,
    CJ_DISPUTES.map((d) => ({
      id: d.id,
      orderId: orderIdByNumber.get(d.orderId) ?? d.orderId,
      productId: d.productId,
      productTitle: d.productTitle,
      customerId: d.customerId,
      reason: d.reason,
      status: d.status,
      requestedResolution: d.requestedResolution,
      amountCents: toCents(d.amount),
      createdAt: new Date(d.createdAt),
      updatedAt: new Date(d.updatedAt),
    })),
    "cj_disputes"
  );

  // -------------------------------------------------------------------
  // Supplier sync / imports
  // -------------------------------------------------------------------
  console.log("\nImport pipeline:");
  await db.delete(schema.importJobs);
  await bulkInsert(
    schema.importJobs,
    [...IMPORT_QUEUE, ...IMPORT_HISTORY].map((j) => ({
      id: j.id,
      supplierId: j.supplierId,
      type: j.type,
      status: j.status,
      totalItems: j.totalItems,
      processedItems: j.processedItems,
      failedItems: j.failedItems,
      startedAt: j.startedAt ? new Date(j.startedAt) : null,
      completedAt: j.completedAt ? new Date(j.completedAt) : null,
    })),
    "import_jobs"
  );

  await db.delete(schema.importErrors);
  await bulkInsert(
    schema.importErrors,
    IMPORT_ERRORS.map((e) => ({
      id: e.id,
      jobId: e.jobId,
      supplierId: e.supplierId,
      sku: e.sku,
      reason: e.reason,
      occurredAt: e.occurredAt ? new Date(e.occurredAt) : null,
      resolved: e.resolved,
    })),
    "import_errors"
  );

  await db.delete(schema.fieldMappings);
  await bulkInsert(
    schema.fieldMappings,
    FIELD_MAPPINGS.map((f) => ({ supplierId: f.supplierId, mappings: f.mappings })),
    "field_mappings"
  );

  await db.delete(schema.supplierLogs);
  await bulkInsert(
    schema.supplierLogs,
    SUPPLIER_LOGS.map((l) => ({ id: l.id, supplierId: l.supplierId, level: l.level, message: l.message, timestamp: new Date(l.timestamp) })),
    "supplier_logs"
  );

  // -------------------------------------------------------------------
  // Dashboard: activity, announcements, system health
  // -------------------------------------------------------------------
  console.log("\nDashboard data:");
  await db.delete(schema.activityEvents);
  await bulkInsert(
    schema.activityEvents,
    ACTIVITY.map((a) => ({ id: a.id, type: a.type, message: a.message, actor: a.actor, createdAt: new Date(a.createdAt) })),
    "activity_events"
  );

  await db.delete(schema.announcements);
  await bulkInsert(
    schema.announcements,
    ANNOUNCEMENTS.map((a) => ({ id: a.id, title: a.title, body: a.body, level: a.level, createdAt: new Date(a.createdAt) })),
    "announcements"
  );

  await db.delete(schema.systemComponents);
  await bulkInsert(
    schema.systemComponents,
    SYSTEM_COMPONENTS.map((s) => ({ id: s.id, name: s.name, status: s.status, latencyMs: s.latencyMs, uptimePercent: s.uptimePercent.toFixed(2) })),
    "system_components"
  );

  // -------------------------------------------------------------------
  // CJ reference data
  // -------------------------------------------------------------------
  console.log("\nCJ reference data:");
  await db.delete(schema.cjShippingLines);
  await bulkInsert(
    schema.cjShippingLines,
    CJ_SHIPPING_LINES.map((l) => ({ id: l.id, name: l.name, fromWarehouse: l.fromWarehouse, costPerOrderCents: toCents(l.costPerOrder), estimatedDays: l.estimatedDays })),
    "cj_shipping_lines"
  );

  await db.delete(schema.cjIntegrationSettings);
  await db.insert(schema.cjIntegrationSettings).values({
    id: "default",
    connected: CJ_INTEGRATION_SETTINGS.connected,
    accountEmail: CJ_INTEGRATION_SETTINGS.accountEmail,
    apiKeyMasked: CJ_INTEGRATION_SETTINGS.apiKeyMasked,
    walletBalanceCents: toCents(CJ_INTEGRATION_SETTINGS.walletBalance),
    autoPushOrders: CJ_INTEGRATION_SETTINGS.autoPushOrders,
    defaultShippingLineId: CJ_INTEGRATION_SETTINGS.defaultShippingLineId,
    syncFrequency: CJ_INTEGRATION_SETTINGS.syncFrequency,
    lastSyncAt: new Date(CJ_INTEGRATION_SETTINGS.lastSyncAt),
  });
  console.log("  cj_integration_settings: 1 row");

  await db.delete(schema.cjSourcingRequests);
  await bulkInsert(
    schema.cjSourcingRequests,
    CJ_SOURCING_REQUESTS.map((r) => ({ id: r.id, productName: r.productName, referenceUrl: r.referenceUrl ?? null, notes: r.notes, status: r.status, submittedAt: new Date(r.submittedAt) })),
    "cj_sourcing_requests"
  );

  // -------------------------------------------------------------------
  // Merchandising: collections, campaigns, content
  // -------------------------------------------------------------------
  console.log("\nMerchandising:");
  await db.delete(schema.collections);
  await bulkInsert(
    schema.collections,
    COLLECTIONS.map((c) => ({ id: c.id, name: c.name, type: c.type, ruleDescription: c.ruleDescription ?? null, status: c.status, updatedAt: new Date(c.updatedAt), imageSeed: c.imageSeed })),
    "collections"
  );

  await db.delete(schema.campaigns);
  await bulkInsert(
    schema.campaigns,
    CAMPAIGNS.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      status: c.status,
      channel: c.channel,
      startDate: new Date(c.startDate),
      endDate: c.endDate ? new Date(c.endDate) : null,
      code: c.code ?? null,
      redemptions: c.redemptions,
      revenueAttributedCents: toCents(c.revenueAttributed),
    })),
    "campaigns"
  );

  await db.delete(schema.contentItems);
  await bulkInsert(
    schema.contentItems,
    CONTENT_ITEMS.map((c) => ({ id: c.id, title: c.title, type: c.type, location: c.location, status: c.status, updatedAt: new Date(c.updatedAt) })),
    "content_items"
  );

  // -------------------------------------------------------------------
  // Shipping
  // -------------------------------------------------------------------
  console.log("\nShipping:");
  await db.delete(schema.shippingRates);
  await bulkInsert(
    schema.shippingRates,
    SHIPPING_RATES.map((r) => ({ id: r.id, zone: r.zone, method: r.method, condition: r.condition, rateCents: toCents(r.rate), deliveryEstimate: r.deliveryEstimate, status: r.status })),
    "shipping_rates"
  );

  await db.delete(schema.carriers);
  await bulkInsert(
    schema.carriers,
    CARRIERS.map((c) => ({ id: c.id, name: c.name, connected: c.connected, servicesUsed: c.servicesUsed })),
    "carriers"
  );

  // -------------------------------------------------------------------
  // Staff accounts + API keys — same shared seed password as customers.
  // -------------------------------------------------------------------
  console.log("\nStaff:");
  await db.delete(schema.adminUsers);
  await bulkInsert(
    schema.adminUsers,
    ADMIN_TEAM.map((a) => ({ id: a.id, name: a.name, email: a.email, passwordHash: seedPasswordHash, role: a.role, status: a.status, lastActiveAt: new Date(a.lastActiveAt) })),
    "admin_users"
  );

  await db.delete(schema.apiKeys);
  await bulkInsert(
    schema.apiKeys,
    API_KEYS.map((k) => ({ id: k.id, name: k.name, prefix: k.prefix, scopes: k.scopes, createdAt: new Date(k.createdAt), lastUsedAt: k.lastUsedAt ? new Date(k.lastUsedAt) : null })),
    "api_keys"
  );

  console.log("\nDone.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
