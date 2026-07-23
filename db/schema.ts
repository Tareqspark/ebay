import {
  mysqlTable,
  varchar,
  int,
  decimal,
  boolean,
  timestamp,
  text,
  json,
  mysqlEnum,
  index,
  unique,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// All money columns are integer cents — see PRODUCT.md's Database conventions.
// All primary keys are ULIDs (varchar(26)) generated in application code.

export const customerStatus = ["active", "vip", "at-risk", "blocked"] as const;

export const users = mysqlTable("users", {
  id: varchar("id", { length: 26 }).primaryKey(),
  name: varchar("name", { length: 191 }).notNull(),
  email: varchar("email", { length: 191 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  // Admin-facing customer fields — populated by seed data / admin edits,
  // not collected at signup.
  status: mysqlEnum("status", customerStatus).notNull().default("active"),
  city: varchar("city", { length: 120 }),
  state: varchar("state", { length: 60 }),
  country: varchar("country", { length: 60 }),
  tags: json("tags").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const customerNotes = mysqlTable(
  "customer_notes",
  {
    id: varchar("id", { length: 26 }).primaryKey(),
    userId: varchar("user_id", { length: 26 }).notNull(),
    author: varchar("author", { length: 191 }).notNull(),
    text: text("text").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("customer_notes_user_id_idx").on(table.userId)]
);

export const addresses = mysqlTable(
  "addresses",
  {
    id: varchar("id", { length: 26 }).primaryKey(),
    userId: varchar("user_id", { length: 26 }).notNull(),
    name: varchar("name", { length: 191 }).notNull(),
    line1: varchar("line1", { length: 191 }).notNull(),
    line2: varchar("line2", { length: 191 }),
    city: varchar("city", { length: 120 }).notNull(),
    state: varchar("state", { length: 60 }).notNull(),
    zip: varchar("zip", { length: 20 }).notNull(),
    country: varchar("country", { length: 60 }).notNull().default("US"),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("addresses_user_id_idx").on(table.userId)]
);

export const carts = mysqlTable(
  "carts",
  {
    id: varchar("id", { length: 26 }).primaryKey(),
    userId: varchar("user_id", { length: 26 }),
    guestId: varchar("guest_id", { length: 26 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("carts_user_id_idx").on(table.userId),
    index("carts_guest_id_idx").on(table.guestId),
  ]
);

export const cartItems = mysqlTable(
  "cart_items",
  {
    id: varchar("id", { length: 26 }).primaryKey(),
    cartId: varchar("cart_id", { length: 26 }).notNull(),
    productId: varchar("product_id", { length: 191 }).notNull(),
    quantity: int("quantity").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("cart_items_cart_id_idx").on(table.cartId)]
);

export const orderPaymentStatus = ["paid", "pending", "refunded", "partially_refunded", "failed"] as const;
export const orderFulfillmentStatus = ["unfulfilled", "processing", "shipped", "delivered", "cancelled"] as const;

export const orders = mysqlTable(
  "orders",
  {
    id: varchar("id", { length: 26 }).primaryKey(),
    orderNumber: varchar("order_number", { length: 32 }).notNull().unique(),
    userId: varchar("user_id", { length: 26 }).notNull(),
    paymentStatus: mysqlEnum("payment_status", orderPaymentStatus).notNull().default("pending"),
    fulfillmentStatus: mysqlEnum("fulfillment_status", orderFulfillmentStatus).notNull().default("unfulfilled"),
    subtotalCents: int("subtotal_cents").notNull(),
    shippingCents: int("shipping_cents").notNull().default(0),
    taxCents: int("tax_cents").notNull(),
    totalCents: int("total_cents").notNull(),
    // Promo code applied at checkout, if any — snapshot the code string
    // rather than a live FK so the order keeps showing what was actually
    // used even if the code is later edited or deleted (same convention as
    // order_items snapshotting product title/image/price below).
    promoCode: varchar("promo_code", { length: 60 }),
    discountCents: int("discount_cents").notNull().default(0),
    paymentMethod: varchar("payment_method", { length: 60 }).notNull().default("card"),
    stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 191 }),
    // Fulfillment tracking — set by admin ops after the order is placed, not
    // at checkout time. Self-fulfillment fields vs. CJ fields are two
    // parallel tracks on one order, mirroring the pre-existing admin Order
    // model (a mixed order can have both).
    trackingNumber: varchar("tracking_number", { length: 191 }),
    carrier: varchar("carrier", { length: 191 }),
    supplierId: varchar("supplier_id", { length: 191 }),
    cjSyncStatus: mysqlEnum("cj_sync_status", ["not_sent", "queued", "processing", "shipped"]),
    cjOrderId: varchar("cj_order_id", { length: 191 }),
    cjTrackingNumber: varchar("cj_tracking_number", { length: 191 }),
    cjShippingLineId: varchar("cj_shipping_line_id", { length: 191 }),
    shippingAddress: json("shipping_address").notNull().$type<{
      name: string;
      line1: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    }>(),
    placedAt: timestamp("placed_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [index("orders_user_id_idx").on(table.userId)]
);

export const orderItems = mysqlTable(
  "order_items",
  {
    id: varchar("id", { length: 26 }).primaryKey(),
    orderId: varchar("order_id", { length: 26 }).notNull(),
    productId: varchar("product_id", { length: 191 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    image: text("image").notNull(),
    quantity: int("quantity").notNull(),
    priceCents: int("price_cents").notNull(),
    source: mysqlEnum("source", ["self", "cj"]).notNull().default("self"),
  },
  (table) => [index("order_items_order_id_idx").on(table.orderId)]
);

/**
 * Browsing-behavior signal for personalization — an append-only view log,
 * signed-in users only (guests get the static fallback in
 * lib/personalization.ts same as before). Deliberately not deduped at
 * write time (every page load is one row); read-side queries just cap how
 * many recent rows they look at, matching activity_events' same
 * unbounded-log-but-bounded-read shape elsewhere in this schema.
 */
export const productViews = mysqlTable(
  "product_views",
  {
    id: varchar("id", { length: 26 }).primaryKey(),
    userId: varchar("user_id", { length: 26 }).notNull(),
    productId: varchar("product_id", { length: 191 }).notNull(),
    categorySlug: varchar("category_slug", { length: 191 }).notNull(),
    viewedAt: timestamp("viewed_at").notNull().defaultNow(),
  },
  (table) => [index("product_views_user_id_idx").on(table.userId), index("product_views_viewed_at_idx").on(table.viewedAt)]
);

export const reviews = mysqlTable(
  "reviews",
  {
    id: varchar("id", { length: 26 }).primaryKey(),
    productId: varchar("product_id", { length: 191 }).notNull(),
    userId: varchar("user_id", { length: 26 }).notNull(),
    rating: int("rating").notNull(),
    title: varchar("title", { length: 191 }).notNull(),
    body: text("body").notNull(),
    status: mysqlEnum("status", ["pending", "approved", "rejected"]).notNull().default("approved"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("reviews_product_id_idx").on(table.productId)]
);

// ---------------------------------------------------------------------------
// Catalog & taxonomy — Phase 3 (Operations Console) full migration.
// IDs are the same human-readable strings the generators already produced
// (e.g. "p-sharpie-pens"), not ULIDs, so every existing reference
// (order_items.productId, cart_items.productId, reviews.productId) keeps
// resolving unchanged.
// ---------------------------------------------------------------------------

export const categoryLevel = ["top", "child", "grandchild"] as const;

export const categories = mysqlTable(
  "categories",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    parentId: varchar("parent_id", { length: 191 }),
    level: mysqlEnum("level", categoryLevel).notNull(),
    name: varchar("name", { length: 191 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull(),
    // Top-level only: Category.icon can't be stored (LucideIcon is a
    // component, not data) — store the icon's export name and resolve it
    // back to the component via lib/category-icons.ts. See CLAUDE.md.
    iconName: varchar("icon_name", { length: 60 }),
    image: text("image"),
    description: text("description"),
    featured: boolean("featured"),
    sortOrder: int("sort_order").notNull().default(0),
  },
  (table) => [index("categories_parent_id_idx").on(table.parentId), index("categories_slug_idx").on(table.slug)]
);

export const brands = mysqlTable("brands", {
  id: varchar("id", { length: 191 }).primaryKey(),
  name: varchar("name", { length: 191 }).notNull(),
  slug: varchar("slug", { length: 191 }).notNull(),
  categorySlugs: json("category_slugs").$type<string[]>().notNull().default([]),
});

export const products = mysqlTable(
  "products",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    slug: varchar("slug", { length: 191 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    brandId: varchar("brand_id", { length: 191 }).notNull(),
    priceCents: int("price_cents").notNull(),
    originalPriceCents: int("original_price_cents"),
    currency: varchar("currency", { length: 10 }).notNull().default("USD"),
    images: json("images").$type<string[]>().notNull(),
    ratingValue: decimal("rating_value", { precision: 2, scale: 1 }).notNull().default("0"),
    ratingCount: int("rating_count").notNull().default(0),
    categoryId: varchar("category_id", { length: 191 }).notNull(),
    categorySlugPath: json("category_slug_path").$type<string[]>().notNull(),
    isNewArrival: boolean("is_new_arrival").notNull().default(false),
    isBestSeller: boolean("is_best_seller").notNull().default(false),
    isTrending: boolean("is_trending").notNull().default(false),
    isFlashSale: boolean("is_flash_sale").notNull().default(false),
    isDeal: boolean("is_deal").notNull().default(false),
    flashSaleEndsAt: timestamp("flash_sale_ends_at"),
    freeShipping: boolean("free_shipping").notNull().default(false),
    stock: int("stock").notNull().default(0),
    description: text("description").notNull(),
    features: json("features").$type<string[]>().notNull().default([]),
  },
  (table) => [
    index("products_slug_idx").on(table.slug),
    index("products_brand_id_idx").on(table.brandId),
    index("products_category_id_idx").on(table.categoryId),
  ]
);

export const productStatus = ["active", "draft", "archived"] as const;
export const productVisibility = ["visible", "hidden"] as const;
export const cjWarehouse = ["CN", "US"] as const;
export const cjStockStatus = ["in_stock", "low_stock", "out_of_stock"] as const;

export const productMeta = mysqlTable("product_meta", {
  productId: varchar("product_id", { length: 191 }).primaryKey(),
  source: mysqlEnum("source", ["self", "cj"]).notNull().default("self"),
  costCents: int("cost_cents").notNull(),
  supplierId: varchar("supplier_id", { length: 191 }),
  status: mysqlEnum("status", productStatus).notNull().default("active"),
  visibility: mysqlEnum("visibility", productVisibility).notNull().default("visible"),
  needsReview: boolean("needs_review").notNull().default(false),
  importedAt: timestamp("imported_at").notNull().defaultNow(),
  lastUpdatedAt: timestamp("last_updated_at").notNull().defaultNow().onUpdateNow(),
  cjProductId: varchar("cj_product_id", { length: 191 }),
  cjVariantId: varchar("cj_variant_id", { length: 191 }),
  cjShippingFeeCents: int("cj_shipping_fee_cents"),
  cjShippingLineId: varchar("cj_shipping_line_id", { length: 191 }),
  cjSourceWarehouse: mysqlEnum("cj_source_warehouse", cjWarehouse),
  cjStockStatus: mysqlEnum("cj_stock_status", cjStockStatus),
});

export const inventoryStatus = ["in_stock", "low_stock", "out_of_stock", "backorder"] as const;

export const inventory = mysqlTable(
  "inventory",
  {
    sku: varchar("sku", { length: 60 }).primaryKey(),
    productId: varchar("product_id", { length: 191 }).notNull(),
    source: mysqlEnum("source", ["self", "cj"]).notNull().default("self"),
    warehouse: varchar("warehouse", { length: 191 }).notNull(),
    available: int("available").notNull().default(0),
    reserved: int("reserved").notNull().default(0),
    incoming: int("incoming").notNull().default(0),
    status: mysqlEnum("status", inventoryStatus).notNull().default("in_stock"),
    supplierId: varchar("supplier_id", { length: 191 }),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [index("inventory_product_id_idx").on(table.productId)]
);

export const supplierStatus = ["active", "paused", "disconnected"] as const;

export const suppliers = mysqlTable("suppliers", {
  id: varchar("id", { length: 191 }).primaryKey(),
  name: varchar("name", { length: 191 }).notNull(),
  region: varchar("region", { length: 191 }).notNull(),
  contactEmail: varchar("contact_email", { length: 191 }).notNull(),
  status: mysqlEnum("status", supplierStatus).notNull().default("active"),
  integration: varchar("integration", { length: 191 }).notNull(),
  syncFrequency: varchar("sync_frequency", { length: 60 }).notNull(),
  productsSupplied: int("products_supplied").notNull().default(0),
  avgFulfillmentDays: decimal("avg_fulfillment_days", { precision: 4, scale: 1 }).notNull().default("0"),
  lastSyncAt: timestamp("last_sync_at").notNull().defaultNow(),
  nextSyncAt: timestamp("next_sync_at").notNull().defaultNow(),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull().default("0"),
});

// ---------------------------------------------------------------------------
// Payments & disputes (generic — CJ-specific disputes are a separate table
// below, since they carry a different shape: reshipment vs. refund, etc.)
// ---------------------------------------------------------------------------

export const disputeStatus = ["needs_response", "under_review", "won", "lost"] as const;

export const disputes = mysqlTable("disputes", {
  id: varchar("id", { length: 191 }).primaryKey(),
  orderId: varchar("order_id", { length: 191 }).notNull(),
  customerId: varchar("customer_id", { length: 26 }).notNull(),
  reason: varchar("reason", { length: 255 }).notNull(),
  amountCents: int("amount_cents").notNull(),
  status: mysqlEnum("status", disputeStatus).notNull().default("needs_response"),
  dueBy: timestamp("due_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const transactionStatus = ["succeeded", "pending", "refunded", "failed"] as const;

export const payments = mysqlTable("payments", {
  id: varchar("id", { length: 191 }).primaryKey(),
  orderId: varchar("order_id", { length: 191 }).notNull(),
  customerId: varchar("customer_id", { length: 26 }).notNull(),
  amountCents: int("amount_cents").notNull(),
  status: mysqlEnum("status", transactionStatus).notNull().default("succeeded"),
  method: varchar("method", { length: 191 }).notNull(),
  processorFeeCents: int("processor_fee_cents").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const payoutStatus = ["paid", "in_transit", "scheduled"] as const;

export const payouts = mysqlTable("payouts", {
  id: varchar("id", { length: 191 }).primaryKey(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  amountCents: int("amount_cents").notNull(),
  status: mysqlEnum("status", payoutStatus).notNull().default("scheduled"),
  arrivalDate: timestamp("arrival_date").notNull(),
  transactionCount: int("transaction_count").notNull().default(0),
});

// ---------------------------------------------------------------------------
// Supplier sync / import pipeline
// ---------------------------------------------------------------------------

export const importJobType = ["product_sync", "inventory_sync", "price_update"] as const;
export const importJobStatus = ["queued", "running", "completed", "failed"] as const;

export const importJobs = mysqlTable("import_jobs", {
  id: varchar("id", { length: 191 }).primaryKey(),
  supplierId: varchar("supplier_id", { length: 191 }).notNull(),
  type: mysqlEnum("type", importJobType).notNull(),
  status: mysqlEnum("status", importJobStatus).notNull().default("queued"),
  totalItems: int("total_items").notNull().default(0),
  processedItems: int("processed_items").notNull().default(0),
  failedItems: int("failed_items").notNull().default(0),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

export const importErrors = mysqlTable("import_errors", {
  id: varchar("id", { length: 191 }).primaryKey(),
  jobId: varchar("job_id", { length: 191 }).notNull(),
  supplierId: varchar("supplier_id", { length: 191 }).notNull(),
  sku: varchar("sku", { length: 191 }).notNull(),
  reason: text("reason").notNull(),
  occurredAt: timestamp("occurred_at"),
  resolved: boolean("resolved").notNull().default(false),
});

export const fieldMappings = mysqlTable("field_mappings", {
  supplierId: varchar("supplier_id", { length: 191 }).primaryKey(),
  mappings: json("mappings").$type<{ sourceField: string; targetField: string; transform?: string }[]>().notNull(),
});

export const logLevel = ["info", "warn", "error"] as const;

export const supplierLogs = mysqlTable("supplier_logs", {
  id: varchar("id", { length: 191 }).primaryKey(),
  supplierId: varchar("supplier_id", { length: 191 }).notNull(),
  level: mysqlEnum("level", logLevel).notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Dashboard: activity, announcements, system health
// ---------------------------------------------------------------------------

export const activityType = ["order", "payment", "import", "product", "customer", "system"] as const;

export const activityEvents = mysqlTable("activity_events", {
  id: varchar("id", { length: 191 }).primaryKey(),
  type: mysqlEnum("type", activityType).notNull(),
  message: text("message").notNull(),
  actor: varchar("actor", { length: 191 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const announcementLevel = ["info", "success", "warning"] as const;

export const announcements = mysqlTable("announcements", {
  id: varchar("id", { length: 191 }).primaryKey(),
  title: varchar("title", { length: 191 }).notNull(),
  body: text("body").notNull(),
  level: mysqlEnum("level", announcementLevel).notNull().default("info"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const componentStatus = ["operational", "degraded", "outage"] as const;

export const systemComponents = mysqlTable("system_components", {
  id: varchar("id", { length: 191 }).primaryKey(),
  name: varchar("name", { length: 191 }).notNull(),
  status: mysqlEnum("status", componentStatus).notNull().default("operational"),
  latencyMs: int("latency_ms").notNull().default(0),
  uptimePercent: decimal("uptime_percent", { precision: 5, scale: 2 }).notNull().default("100.00"),
});

// ---------------------------------------------------------------------------
// CJdropshipping reference data (shipping lines, settings, sourcing
// requests, after-sales disputes). The 50,000-item CJ catalog snapshot
// itself stays a server-only JSON file, not a table — see CLAUDE.md; that
// migration is Phase 5.1 (real-time API sync), not this one.
// ---------------------------------------------------------------------------

export const cjShippingLines = mysqlTable("cj_shipping_lines", {
  id: varchar("id", { length: 191 }).primaryKey(),
  name: varchar("name", { length: 191 }).notNull(),
  fromWarehouse: mysqlEnum("from_warehouse", cjWarehouse).notNull(),
  costPerOrderCents: int("cost_per_order_cents").notNull(),
  estimatedDays: varchar("estimated_days", { length: 60 }).notNull(),
});

export const cjIntegrationSettings = mysqlTable("cj_integration_settings", {
  id: varchar("id", { length: 20 }).primaryKey().default("default"),
  connected: boolean("connected").notNull().default(false),
  accountEmail: varchar("account_email", { length: 191 }).notNull(),
  apiKeyMasked: varchar("api_key_masked", { length: 191 }).notNull(),
  walletBalanceCents: int("wallet_balance_cents").notNull().default(0),
  autoPushOrders: boolean("auto_push_orders").notNull().default(false),
  defaultShippingLineId: varchar("default_shipping_line_id", { length: 191 }),
  syncFrequency: varchar("sync_frequency", { length: 60 }).notNull().default("hourly"),
  lastSyncAt: timestamp("last_sync_at").notNull().defaultNow(),
});

export const cjSourcingRequestStatus = ["submitted", "sourcing", "found", "not_found"] as const;

export const cjSourcingRequests = mysqlTable("cj_sourcing_requests", {
  id: varchar("id", { length: 191 }).primaryKey(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  referenceUrl: text("reference_url"),
  notes: text("notes").notNull(),
  status: mysqlEnum("status", cjSourcingRequestStatus).notNull().default("submitted"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

export const cjDisputeReason = ["lost_in_transit", "damaged", "wrong_item", "not_as_described", "defective"] as const;
export const cjDisputeStatus = ["open", "awaiting_cj", "resolved_reship", "resolved_refund", "rejected"] as const;
export const cjDisputeResolution = ["reshipment", "refund"] as const;

export const cjDisputes = mysqlTable("cj_disputes", {
  id: varchar("id", { length: 191 }).primaryKey(),
  orderId: varchar("order_id", { length: 191 }).notNull(),
  productId: varchar("product_id", { length: 191 }).notNull(),
  productTitle: varchar("product_title", { length: 255 }).notNull(),
  customerId: varchar("customer_id", { length: 26 }).notNull(),
  reason: mysqlEnum("reason", cjDisputeReason).notNull(),
  status: mysqlEnum("status", cjDisputeStatus).notNull().default("open"),
  requestedResolution: mysqlEnum("requested_resolution", cjDisputeResolution).notNull(),
  amountCents: int("amount_cents").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// ---------------------------------------------------------------------------
// Merchandising: collections, marketing campaigns, content
// ---------------------------------------------------------------------------

export const collectionType = ["manual", "automated"] as const;
export const collectionStatus = ["active", "draft"] as const;

export const collections = mysqlTable("collections", {
  id: varchar("id", { length: 191 }).primaryKey(),
  name: varchar("name", { length: 191 }).notNull(),
  type: mysqlEnum("type", collectionType).notNull().default("manual"),
  ruleDescription: text("rule_description"),
  status: mysqlEnum("status", collectionStatus).notNull().default("draft"),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  imageSeed: varchar("image_seed", { length: 191 }).notNull(),
});

export const campaignType = ["discount", "email", "banner"] as const;
export const campaignStatus = ["active", "scheduled", "ended", "draft"] as const;

export const campaigns = mysqlTable("campaigns", {
  id: varchar("id", { length: 191 }).primaryKey(),
  name: varchar("name", { length: 191 }).notNull(),
  type: mysqlEnum("type", campaignType).notNull(),
  status: mysqlEnum("status", campaignStatus).notNull().default("draft"),
  channel: varchar("channel", { length: 191 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  code: varchar("code", { length: 60 }),
  redemptions: int("redemptions").notNull().default(0),
  revenueAttributedCents: int("revenue_attributed_cents").notNull().default(0),
});

// ---------------------------------------------------------------------------
// Promo codes — real checkout-time discount engine (separate from the
// campaigns table above, which only tracks marketing attribution and has no
// redemption logic behind its optional `code` field).
// ---------------------------------------------------------------------------

export const promoDiscountType = ["percent", "fixed", "free_shipping"] as const;
export const promoCodeStatus = ["active", "disabled"] as const;

export const promoCodes = mysqlTable(
  "promo_codes",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    code: varchar("code", { length: 60 }).notNull().unique(),
    discountType: mysqlEnum("discount_type", promoDiscountType).notNull(),
    // Exactly one of these is set, matching discountType — enforced in
    // lib/admin/promo-actions.ts, not at the schema level.
    discountPercent: int("discount_percent"),
    discountAmountCents: int("discount_amount_cents"),
    // Null = unlimited total redemptions. A single-use code is just
    // usageLimit = 1 — the code is retired once usageCount reaches it.
    // Independent of this, every code can only ever be redeemed once per
    // customer regardless of usageLimit — enforced by the unique index on
    // promo_redemptions below, not a per-code setting.
    usageLimit: int("usage_limit"),
    // Null/0 = no minimum — the code applies to any order.
    minOrderAmountCents: int("min_order_amount_cents"),
    status: mysqlEnum("status", promoCodeStatus).notNull().default("active"),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),
    usageCount: int("usage_count").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("promo_codes_code_idx").on(table.code)]
);

export const promoRedemptions = mysqlTable(
  "promo_redemptions",
  {
    id: varchar("id", { length: 191 }).primaryKey(),
    promoCodeId: varchar("promo_code_id", { length: 191 }).notNull(),
    code: varchar("code", { length: 60 }).notNull(),
    userId: varchar("user_id", { length: 26 }).notNull(),
    orderId: varchar("order_id", { length: 26 }).notNull(),
    discountCents: int("discount_cents").notNull(),
    redeemedAt: timestamp("redeemed_at").notNull().defaultNow(),
  },
  (table) => [
    index("promo_redemptions_promo_code_id_idx").on(table.promoCodeId),
    index("promo_redemptions_user_id_idx").on(table.userId),
    // Hard backstop for "a customer can't use a code more than once" —
    // enforced at the DB level, not just in application code.
    unique("promo_redemptions_code_user_unique").on(table.promoCodeId, table.userId),
  ]
);

export const contentType = ["page", "banner", "hero_slide"] as const;
export const contentStatus = ["published", "draft"] as const;

export const contentItems = mysqlTable("content_items", {
  id: varchar("id", { length: 191 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  type: mysqlEnum("type", contentType).notNull(),
  location: varchar("location", { length: 191 }).notNull(),
  status: mysqlEnum("status", contentStatus).notNull().default("draft"),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// ---------------------------------------------------------------------------
// Shipping configuration
// ---------------------------------------------------------------------------

export const shippingRateStatus = ["active", "disabled"] as const;

export const shippingRates = mysqlTable("shipping_rates", {
  id: varchar("id", { length: 191 }).primaryKey(),
  zone: varchar("zone", { length: 191 }).notNull(),
  method: varchar("method", { length: 191 }).notNull(),
  condition: varchar("condition", { length: 191 }).notNull(),
  rateCents: int("rate_cents").notNull(),
  deliveryEstimate: varchar("delivery_estimate", { length: 191 }).notNull(),
  status: mysqlEnum("status", shippingRateStatus).notNull().default("active"),
});

export const carriers = mysqlTable("carriers", {
  id: varchar("id", { length: 191 }).primaryKey(),
  name: varchar("name", { length: 191 }).notNull(),
  connected: boolean("connected").notNull().default(false),
  servicesUsed: json("services_used").$type<string[]>().notNull().default([]),
});

// ---------------------------------------------------------------------------
// Staff accounts (Phase 5.3 wires real role-gated auth against this table;
// the table itself ships now so Phase 3's Team screen is real data).
// ---------------------------------------------------------------------------

export const adminRole = ["Owner", "Admin", "Merchandiser", "Support", "Catalog Manager"] as const;
export const adminUserStatus = ["active", "invited", "disabled"] as const;

export const adminUsers = mysqlTable("admin_users", {
  id: varchar("id", { length: 191 }).primaryKey(),
  name: varchar("name", { length: 191 }).notNull(),
  email: varchar("email", { length: 191 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: mysqlEnum("role", adminRole).notNull().default("Support"),
  status: mysqlEnum("admin_user_status", adminUserStatus).notNull().default("active"),
  lastActiveAt: timestamp("last_active_at").notNull().defaultNow(),
});

export const apiKeys = mysqlTable("api_keys", {
  id: varchar("id", { length: 191 }).primaryKey(),
  name: varchar("name", { length: 191 }).notNull(),
  prefix: varchar("prefix", { length: 60 }).notNull(),
  scopes: json("scopes").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
});

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders),
  reviews: many(reviews),
}));

export const cartsRelations = relations(carts, ({ many }) => ({
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
}));

export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  user: one(users, { fields: [orders.userId], references: [users.id] }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}));
