import "server-only";
import { cache } from "react";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  products as productsTable,
  brands as brandsTable,
  categories as categoriesTable,
  suppliers as suppliersTable,
  productMeta as productMetaTable,
  users as usersTable,
  customerNotes as customerNotesTable,
  orders as ordersTable,
  orderItems as orderItemsTable,
  payments as paymentsTable,
  disputes as disputesTable,
  payouts as payoutsTable,
  inventory as inventoryTable,
  importJobs as importJobsTable,
  importErrors as importErrorsTable,
  fieldMappings as fieldMappingsTable,
  supplierLogs as supplierLogsTable,
  activityEvents as activityEventsTable,
  announcements as announcementsTable,
  systemComponents as systemComponentsTable,
  cjDisputes as cjDisputesTable,
  cjShippingLines as cjShippingLinesTable,
  cjIntegrationSettings as cjIntegrationSettingsTable,
  cjSourcingRequests as cjSourcingRequestsTable,
} from "@/db/schema";
import { toCents, toDollars } from "@/lib/money";
import type { Product, Brand } from "@/lib/types";
import type {
  AdminProductMeta,
  Customer,
  Supplier,
  Order,
  OrderAddress,
  Payment,
  Dispute,
  Payout,
  InventoryRecord,
  ImportJob,
  ImportError,
  FieldMapping,
  SupplierLog,
  ActivityEvent,
  Announcement,
  SystemComponent,
} from "@/lib/admin/types";
import type { CjDispute, CjShippingLine, CjIntegrationSettings, CjSourcingRequest } from "@/lib/admin/cj-types";
import type { Category } from "@/lib/category-utils";
import { resolveCategoryIcon } from "@/lib/category-icons";

import { CJ_BRAND_NAME } from "@/lib/admin/constants";

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export const getProducts = cache(async (): Promise<Product[]> => {
  const [rows, brands] = await Promise.all([db.select().from(productsTable), getBrands()]);
  const brandNameById = new Map(brands.map((b) => [b.id, b.name]));
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    brandId: row.brandId,
    brandName: brandNameById.get(row.brandId) ?? row.brandId,
    price: toDollars(row.priceCents),
    originalPrice: row.originalPriceCents != null ? toDollars(row.originalPriceCents) : undefined,
    currency: "USD",
    images: row.images,
    review: { rating: Number(row.ratingValue), count: row.ratingCount },
    categorySlugPath: row.categorySlugPath,
    isNewArrival: row.isNewArrival,
    isBestSeller: row.isBestSeller,
    isTrending: row.isTrending,
    isFlashSale: row.isFlashSale,
    isDeal: row.isDeal,
    flashSaleEndsAt: row.flashSaleEndsAt ? row.flashSaleEndsAt.toISOString() : undefined,
    freeShipping: row.freeShipping,
    stock: row.stock,
    description: row.description,
    features: row.features,
  }));
});

export const getBrands = cache(async (): Promise<Brand[]> => {
  const rows = await db.select().from(brandsTable);
  return rows.map((r) => ({ id: r.id, name: r.name, slug: r.slug, categorySlugs: r.categorySlugs }));
});

export const getAdminCategories = cache(async (): Promise<Category[]> => {
  const rows = await db.select().from(categoriesTable).orderBy(categoriesTable.sortOrder);
  const grandchildrenByParent = new Map<string, { id: string; name: string; slug: string }[]>();
  const childrenByParent = new Map<string, { id: string; name: string; slug: string; children: { id: string; name: string; slug: string }[] }[]>();
  const tops: Category[] = [];

  for (const row of rows) {
    if (row.level === "grandchild") {
      const list = grandchildrenByParent.get(row.parentId!) ?? [];
      list.push({ id: row.id, name: row.name, slug: row.slug });
      grandchildrenByParent.set(row.parentId!, list);
    }
  }
  for (const row of rows) {
    if (row.level === "child") {
      const list = childrenByParent.get(row.parentId!) ?? [];
      list.push({ id: row.id, name: row.name, slug: row.slug, children: grandchildrenByParent.get(row.id) ?? [] });
      childrenByParent.set(row.parentId!, list);
    }
  }
  for (const row of rows) {
    if (row.level === "top") {
      tops.push({
        id: row.id,
        name: row.name,
        slug: row.slug,
        icon: resolveCategoryIcon(row.iconName),
        image: row.image ?? "",
        description: row.description ?? "",
        featured: row.featured ?? false,
        children: childrenByParent.get(row.id) ?? [],
      });
    }
  }
  return tops;
});

export const getSuppliers = cache(async (): Promise<Supplier[]> => {
  const rows = await db.select().from(suppliersTable);
  return rows.map((s) => ({
    id: s.id,
    name: s.name,
    region: s.region,
    contactEmail: s.contactEmail,
    status: s.status,
    integration: s.integration,
    syncFrequency: s.syncFrequency,
    productsSupplied: s.productsSupplied,
    avgFulfillmentDays: Number(s.avgFulfillmentDays),
    lastSyncAt: s.lastSyncAt.toISOString(),
    nextSyncAt: s.nextSyncAt.toISOString(),
    rating: Number(s.rating),
  }));
});

export const getProductMetaList = cache(async (): Promise<AdminProductMeta[]> => {
  const rows = await db.select().from(productMetaTable);
  return rows.map((m) => ({
    productId: m.productId,
    source: m.source,
    cost: toDollars(m.costCents),
    supplierId: m.supplierId ?? undefined,
    status: m.status,
    visibility: m.visibility,
    needsReview: m.needsReview,
    importedAt: m.importedAt.toISOString(),
    lastUpdatedAt: m.lastUpdatedAt.toISOString(),
    cjProductId: m.cjProductId ?? undefined,
    cjVariantId: m.cjVariantId ?? undefined,
    cjShippingFee: m.cjShippingFeeCents != null ? toDollars(m.cjShippingFeeCents) : undefined,
    cjShippingLineId: m.cjShippingLineId ?? undefined,
    cjSourceWarehouse: m.cjSourceWarehouse ?? undefined,
    cjStockStatus: m.cjStockStatus ?? undefined,
  }));
});

export async function getProduct(id: string): Promise<Product | undefined> {
  const all = await getProducts();
  return all.find((p) => p.id === id);
}
export async function getBrand(id: string): Promise<Brand | undefined> {
  const all = await getBrands();
  return all.find((b) => b.id === id);
}
export async function getProductMeta(productId: string): Promise<AdminProductMeta | undefined> {
  const all = await getProductMetaList();
  return all.find((m) => m.productId === productId);
}
export async function getSupplier(id: string | undefined): Promise<Supplier | undefined> {
  if (!id) return undefined;
  const all = await getSuppliers();
  return all.find((s) => s.id === id);
}
export async function getTopCategoryName(slug: string): Promise<string> {
  const cats = await getAdminCategories();
  return cats.find((c) => c.slug === slug)?.name ?? slug;
}

export interface AdminProductRow {
  product: Product;
  meta: AdminProductMeta;
  brandName: string;
  supplierName: string;
  categoryName: string;
  margin: number;
  marginPercent: number;
}

export const getAdminProductRows = cache(async (): Promise<AdminProductRow[]> => {
  const [products, metaList, suppliers, categories] = await Promise.all([
    getProducts(),
    getProductMetaList(),
    getSuppliers(),
    getAdminCategories(),
  ]);
  const metaByProductId = new Map(metaList.map((m) => [m.productId, m]));
  const supplierById = new Map(suppliers.map((s) => [s.id, s]));
  const categoryNameBySlug = new Map(categories.map((c) => [c.slug, c.name]));

  return products.map((product) => {
    const meta = metaByProductId.get(product.id)!;
    const totalCost = meta.cost + (meta.source === "cj" ? meta.cjShippingFee ?? 0 : 0);
    const margin = Math.round((product.price - totalCost) * 100) / 100;
    const supplierName = meta.source === "cj" ? CJ_BRAND_NAME : supplierById.get(meta.supplierId ?? "")?.name ?? "—";
    return {
      product,
      meta,
      brandName: product.brandName ?? product.brandId,
      supplierName,
      categoryName: categoryNameBySlug.get(product.categorySlugPath[0]) ?? product.categorySlugPath[0],
      margin,
      marginPercent: Math.round((margin / product.price) * 1000) / 10,
    };
  });
});

/** Lean variant for the client-side products table — see the original comment this preserves from before the DB migration. */
export async function getAdminProductTableRows(): Promise<AdminProductRow[]> {
  const rows = await getAdminProductRows();
  return rows.map((row) => ({
    ...row,
    product: { ...row.product, images: [row.product.images[0]], features: [] },
  }));
}

// ---------------------------------------------------------------------------
// Customers — every `users` row (real signed-up accounts and the seeded
// historical set) is a Customer. Order stats are computed live from real
// orders, not stored, so they can never drift.
// ---------------------------------------------------------------------------

export const getCustomers = cache(async (): Promise<Customer[]> => {
  const [users, notes, orderStats] = await Promise.all([
    db.select().from(usersTable),
    db.select().from(customerNotesTable),
    db
      .select({
        userId: ordersTable.userId,
        count: sql<number>`count(*)`,
        total: sql<number>`sum(${ordersTable.totalCents})`,
        lastOrderAt: sql<string>`max(${ordersTable.placedAt})`,
      })
      .from(ordersTable)
      .groupBy(ordersTable.userId),
  ]);

  const notesByUser = new Map<string, typeof notes>();
  for (const n of notes) {
    const list = notesByUser.get(n.userId) ?? [];
    list.push(n);
    notesByUser.set(n.userId, list);
  }
  const statsByUser = new Map(orderStats.map((s) => [s.userId, s]));

  return users.map((u) => {
    const stats = statsByUser.get(u.id);
    const ordersCount = Number(stats?.count ?? 0);
    const lifetimeValue = stats ? toDollars(Number(stats.total)) : 0;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      avatarSeed: u.name.replace(/\s+/g, "-"),
      city: u.city ?? "",
      state: u.state ?? "",
      country: u.country ?? "",
      status: u.status,
      createdAt: u.createdAt.toISOString(),
      ordersCount,
      lifetimeValue,
      averageOrderValue: ordersCount > 0 ? Math.round((lifetimeValue / ordersCount) * 100) / 100 : 0,
      lastOrderAt: stats?.lastOrderAt ? new Date(stats.lastOrderAt).toISOString() : null,
      tags: u.tags,
      notes: (notesByUser.get(u.id) ?? []).map((n) => ({ id: n.id, author: n.author, text: n.text, createdAt: n.createdAt.toISOString() })),
    };
  });
});

export async function getCustomer(id: string): Promise<Customer | undefined> {
  const all = await getCustomers();
  return all.find((c) => c.id === id);
}

// ---------------------------------------------------------------------------
// Orders — denormalized with customerName/supplierName/cjShippingLineName so
// client-rendered table columns never need their own DB lookups (they can't:
// column cell renderers run inside "use client" components).
// ---------------------------------------------------------------------------

export interface AdminOrderRow extends Order {
  customerName: string;
  customerEmail: string;
  supplierName?: string;
  cjShippingLineName?: string;
}

export const getOrders = cache(async (): Promise<AdminOrderRow[]> => {
  const [orderRows, itemRows, customers, suppliers, shippingLines] = await Promise.all([
    db.select().from(ordersTable).orderBy(desc(ordersTable.placedAt)),
    db.select().from(orderItemsTable),
    getCustomers(),
    getSuppliers(),
    getCjShippingLines(),
  ]);

  const itemsByOrder = new Map<string, typeof itemRows>();
  for (const item of itemRows) {
    const list = itemsByOrder.get(item.orderId) ?? [];
    list.push(item);
    itemsByOrder.set(item.orderId, list);
  }
  const customerById = new Map(customers.map((c) => [c.id, c]));
  const supplierById = new Map(suppliers.map((s) => [s.id, s]));
  const lineById = new Map(shippingLines.map((l) => [l.id, l]));

  return orderRows.map((row) => {
    const cjLine = row.cjShippingLineId ? lineById.get(row.cjShippingLineId) : undefined;
    return {
      id: row.id,
      customerId: row.userId,
      customerName: customerById.get(row.userId)?.name ?? row.userId,
      customerEmail: customerById.get(row.userId)?.email ?? "",
      items: (itemsByOrder.get(row.id) ?? []).map((i) => ({
        productId: i.productId,
        title: i.title,
        image: i.image,
        quantity: i.quantity,
        price: toDollars(i.priceCents),
        source: i.source,
      })),
      subtotal: toDollars(row.subtotalCents),
      shipping: toDollars(row.shippingCents),
      tax: toDollars(row.taxCents),
      total: toDollars(row.totalCents),
      discount: row.discountCents ? toDollars(row.discountCents) : undefined,
      promoCode: row.promoCode ?? undefined,
      paymentStatus: row.paymentStatus,
      fulfillmentStatus: row.fulfillmentStatus,
      trackingNumber: row.trackingNumber ?? undefined,
      carrier: row.carrier ?? undefined,
      supplierId: row.supplierId ?? undefined,
      supplierName: row.supplierId ? supplierById.get(row.supplierId)?.name : undefined,
      placedAt: row.placedAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      paymentMethod: row.paymentMethod,
      shippingAddress: row.shippingAddress as OrderAddress,
      cjSyncStatus: row.cjSyncStatus ?? undefined,
      cjOrderId: row.cjOrderId ?? undefined,
      cjTrackingNumber: row.cjTrackingNumber ?? undefined,
      cjShippingLineId: row.cjShippingLineId ?? undefined,
      cjShippingLineName: cjLine ? `${cjLine.name} (${cjLine.estimatedDays})` : undefined,
    };
  });
});

export async function getOrdersForCustomer(customerId: string): Promise<AdminOrderRow[]> {
  const all = await getOrders();
  return all.filter((o) => o.customerId === customerId);
}

// ---------------------------------------------------------------------------
// Payments, disputes, payouts
// ---------------------------------------------------------------------------

export interface AdminPaymentRow extends Payment {
  customerName: string;
}
export interface AdminDisputeRow extends Dispute {
  customerName: string;
}

export const getPayments = cache(async (): Promise<AdminPaymentRow[]> => {
  const [rows, customers] = await Promise.all([db.select().from(paymentsTable), getCustomers()]);
  const customerById = new Map(customers.map((c) => [c.id, c]));
  return rows.map((p) => ({
    id: p.id,
    orderId: p.orderId,
    customerId: p.customerId,
    customerName: customerById.get(p.customerId)?.name ?? p.customerId,
    amount: toDollars(p.amountCents),
    status: p.status,
    method: p.method,
    processorFee: toDollars(p.processorFeeCents),
    createdAt: p.createdAt.toISOString(),
  }));
});

export const getDisputes = cache(async (): Promise<AdminDisputeRow[]> => {
  const [rows, customers] = await Promise.all([db.select().from(disputesTable), getCustomers()]);
  const customerById = new Map(customers.map((c) => [c.id, c]));
  return rows.map((d) => ({
    id: d.id,
    orderId: d.orderId,
    customerId: d.customerId,
    customerName: customerById.get(d.customerId)?.name ?? d.customerId,
    reason: d.reason,
    amount: toDollars(d.amountCents),
    status: d.status,
    dueBy: d.dueBy.toISOString(),
    createdAt: d.createdAt.toISOString(),
  }));
});

export const getPayouts = cache(async (): Promise<Payout[]> => {
  const rows = await db.select().from(payoutsTable);
  return rows.map((p) => ({
    id: p.id,
    periodStart: p.periodStart.toISOString(),
    periodEnd: p.periodEnd.toISOString(),
    amount: toDollars(p.amountCents),
    status: p.status,
    arrivalDate: p.arrivalDate.toISOString(),
    transactionCount: p.transactionCount,
  }));
});

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

export interface AdminInventoryRow extends InventoryRecord {
  supplierName?: string;
}

export const getInventory = cache(async (): Promise<AdminInventoryRow[]> => {
  const [rows, products, suppliers] = await Promise.all([db.select().from(inventoryTable), getProducts(), getSuppliers()]);
  const productById = new Map(products.map((p) => [p.id, p]));
  const supplierById = new Map(suppliers.map((s) => [s.id, s]));

  return rows.map((r) => {
    const product = productById.get(r.productId);
    return {
      sku: r.sku,
      productId: r.productId,
      title: product?.title ?? r.productId,
      image: product?.images[0] ?? "",
      source: r.source,
      warehouse: r.warehouse,
      available: r.available,
      reserved: r.reserved,
      incoming: r.incoming,
      status: r.status,
      supplierId: r.supplierId ?? undefined,
      supplierName: r.source === "cj" ? CJ_BRAND_NAME : r.supplierId ? supplierById.get(r.supplierId)?.name : undefined,
      updatedAt: r.updatedAt.toISOString(),
    };
  });
});

// ---------------------------------------------------------------------------
// Supplier sync / import pipeline
// ---------------------------------------------------------------------------

export interface AdminImportJobRow extends ImportJob {
  supplierName: string;
}
export interface AdminImportErrorRow extends ImportError {
  supplierName: string;
}
export interface AdminSupplierLogRow extends SupplierLog {
  supplierName: string;
}

export const getImportQueue = cache(async (): Promise<AdminImportJobRow[]> => {
  const [rows, suppliers] = await Promise.all([
    db.select().from(importJobsTable).where(sql`status in ('queued','running')`),
    getSuppliers(),
  ]);
  const supplierById = new Map(suppliers.map((s) => [s.id, s]));
  return rows.map((j) => toImportJob(j, supplierById));
});
export const getImportHistory = cache(async (): Promise<AdminImportJobRow[]> => {
  const [rows, suppliers] = await Promise.all([
    db.select().from(importJobsTable).where(sql`status in ('completed','failed')`),
    getSuppliers(),
  ]);
  const supplierById = new Map(suppliers.map((s) => [s.id, s]));
  return rows.map((j) => toImportJob(j, supplierById));
});
function toImportJob(j: typeof importJobsTable.$inferSelect, supplierById: Map<string, Supplier>): AdminImportJobRow {
  return {
    id: j.id,
    supplierId: j.supplierId,
    supplierName: supplierById.get(j.supplierId)?.name ?? j.supplierId,
    type: j.type,
    status: j.status,
    totalItems: j.totalItems,
    processedItems: j.processedItems,
    failedItems: j.failedItems,
    startedAt: j.startedAt ? j.startedAt.toISOString() : null,
    completedAt: j.completedAt ? j.completedAt.toISOString() : null,
  };
}

export const getImportErrors = cache(async (): Promise<AdminImportErrorRow[]> => {
  const [rows, suppliers] = await Promise.all([db.select().from(importErrorsTable), getSuppliers()]);
  const supplierById = new Map(suppliers.map((s) => [s.id, s]));
  return rows.map((e) => ({
    id: e.id,
    jobId: e.jobId,
    supplierId: e.supplierId,
    supplierName: supplierById.get(e.supplierId)?.name ?? e.supplierId,
    sku: e.sku,
    reason: e.reason,
    occurredAt: e.occurredAt ? e.occurredAt.toISOString() : null,
    resolved: e.resolved,
  }));
});

export const getFieldMappings = cache(async (): Promise<FieldMapping[]> => {
  const rows = await db.select().from(fieldMappingsTable);
  return rows.map((f) => ({ supplierId: f.supplierId, mappings: f.mappings }));
});

export const getSupplierLogs = cache(async (): Promise<AdminSupplierLogRow[]> => {
  const [rows, suppliers] = await Promise.all([
    db.select().from(supplierLogsTable).orderBy(desc(supplierLogsTable.timestamp)),
    getSuppliers(),
  ]);
  const supplierById = new Map(suppliers.map((s) => [s.id, s]));
  return rows.map((l) => ({
    id: l.id,
    supplierId: l.supplierId,
    supplierName: supplierById.get(l.supplierId)?.name ?? l.supplierId,
    level: l.level,
    message: l.message,
    timestamp: l.timestamp.toISOString(),
  }));
});

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export const getActivity = cache(async (): Promise<ActivityEvent[]> => {
  const rows = await db.select().from(activityEventsTable).orderBy(desc(activityEventsTable.createdAt));
  return rows.map((a) => ({ id: a.id, type: a.type, message: a.message, actor: a.actor, createdAt: a.createdAt.toISOString() }));
});

export const getAnnouncements = cache(async (): Promise<Announcement[]> => {
  const rows = await db.select().from(announcementsTable).orderBy(desc(announcementsTable.createdAt));
  return rows.map((a) => ({ id: a.id, title: a.title, body: a.body, level: a.level, createdAt: a.createdAt.toISOString() }));
});

export const getSystemComponents = cache(async (): Promise<SystemComponent[]> => {
  const rows = await db.select().from(systemComponentsTable);
  return rows.map((s) => ({ id: s.id, name: s.name, status: s.status, latencyMs: s.latencyMs, uptimePercent: Number(s.uptimePercent) }));
});

// ---------------------------------------------------------------------------
// CJdropshipping reference data
// ---------------------------------------------------------------------------

export const getCjShippingLines = cache(async (): Promise<CjShippingLine[]> => {
  const rows = await db.select().from(cjShippingLinesTable);
  return rows.map((l) => ({ id: l.id, name: l.name, fromWarehouse: l.fromWarehouse, costPerOrder: toDollars(l.costPerOrderCents), estimatedDays: l.estimatedDays }));
});

export async function getCjShippingLine(id: string | undefined): Promise<CjShippingLine | undefined> {
  if (!id) return undefined;
  const all = await getCjShippingLines();
  return all.find((l) => l.id === id);
}

export const getCjIntegrationSettings = cache(async (): Promise<CjIntegrationSettings> => {
  const [row] = await db.select().from(cjIntegrationSettingsTable).where(eq(cjIntegrationSettingsTable.id, "default")).limit(1);
  return {
    connected: row?.connected ?? false,
    accountEmail: row?.accountEmail ?? "",
    apiKeyMasked: row?.apiKeyMasked ?? "",
    walletBalance: row ? toDollars(row.walletBalanceCents) : 0,
    autoPushOrders: row?.autoPushOrders ?? false,
    defaultShippingLineId: row?.defaultShippingLineId ?? "",
    syncFrequency: row?.syncFrequency ?? "hourly",
    lastSyncAt: row?.lastSyncAt ? row.lastSyncAt.toISOString() : new Date().toISOString(),
  };
});

export const getCjSourcingRequests = cache(async (): Promise<CjSourcingRequest[]> => {
  const rows = await db.select().from(cjSourcingRequestsTable).orderBy(desc(cjSourcingRequestsTable.submittedAt));
  return rows.map((r) => ({ id: r.id, productName: r.productName, referenceUrl: r.referenceUrl ?? undefined, notes: r.notes, status: r.status, submittedAt: r.submittedAt.toISOString() }));
});

export interface AdminCjDisputeRow extends CjDispute {
  customerName: string;
}

export const getCjDisputes = cache(async (): Promise<AdminCjDisputeRow[]> => {
  const [rows, customers] = await Promise.all([db.select().from(cjDisputesTable).orderBy(desc(cjDisputesTable.createdAt)), getCustomers()]);
  const customerById = new Map(customers.map((c) => [c.id, c]));
  return rows.map((d) => ({
    id: d.id,
    orderId: d.orderId,
    productId: d.productId,
    productTitle: d.productTitle,
    customerId: d.customerId,
    customerName: customerById.get(d.customerId)?.name ?? d.customerId,
    reason: d.reason,
    status: d.status,
    requestedResolution: d.requestedResolution,
    amount: toDollars(d.amountCents),
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }));
});

export { toCents, toDollars };
