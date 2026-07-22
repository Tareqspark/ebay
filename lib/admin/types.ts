export type SupplierStatus = "active" | "paused" | "disconnected";

export interface Supplier {
  id: string;
  name: string;
  region: string;
  contactEmail: string;
  status: SupplierStatus;
  integration: string;
  syncFrequency: string;
  productsSupplied: number;
  avgFulfillmentDays: number;
  lastSyncAt: string;
  nextSyncAt: string;
  rating: number;
}

export type ProductStatus = "active" | "draft" | "archived";
export type ProductVisibility = "visible" | "hidden";

/**
 * Hybrid fulfillment sourcing: "self" products are wholesale-restocked into
 * Baruashop's own warehouses (existing Supplier model). "cj" products are
 * dropshipped through CJdropshipping — Baruashop never holds this stock;
 * CJ ships direct to the customer per order. See CLAUDE.md / PRODUCT.md.
 */
export type ProductSource = "self" | "cj";
export type CjWarehouse = "CN" | "US";
export type CjStockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface AdminProductMeta {
  productId: string;
  source: ProductSource;
  cost: number;
  /** Self-sourced only — which of the wholesale Suppliers restocks this SKU. */
  supplierId?: string;
  status: ProductStatus;
  visibility: ProductVisibility;
  needsReview: boolean;
  importedAt: string;
  lastUpdatedAt: string;
  // CJ-sourced only:
  cjProductId?: string;
  cjVariantId?: string;
  /** Per-order shipping fee CJ charges for the selected line — not part of `cost`, since it varies by line/destination and must be added separately when computing true margin. */
  cjShippingFee?: number;
  cjShippingLineId?: string;
  cjSourceWarehouse?: CjWarehouse;
  cjStockStatus?: CjStockStatus;
}

export type CustomerStatus = "active" | "vip" | "at-risk" | "blocked";

export interface CustomerNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatarSeed: string;
  city: string;
  state: string;
  country: string;
  status: CustomerStatus;
  createdAt: string;
  ordersCount: number;
  lifetimeValue: number;
  averageOrderValue: number;
  lastOrderAt: string | null;
  tags: string[];
  notes: CustomerNote[];
}

export type PaymentStatus = "paid" | "pending" | "refunded" | "partially_refunded" | "failed";
export type FulfillmentStatus = "unfulfilled" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  productId: string;
  title: string;
  image: string;
  quantity: number;
  price: number;
  source: ProductSource;
}

export type CjSyncStatus = "not_sent" | "queued" | "processing" | "shipped";

export interface OrderAddress {
  name: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  discount?: number;
  promoCode?: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  trackingNumber?: string;
  carrier?: string;
  /** Self-fulfillment supplier — present when the order has any self-sourced items. */
  supplierId?: string;
  placedAt: string;
  updatedAt: string;
  paymentMethod: string;
  shippingAddress: OrderAddress;
  // CJ fulfillment — present when the order has any CJ-sourced items. A mixed
  // order therefore has two parallel fulfillment tracks: the fields above for
  // its self-sourced items, these for its CJ-sourced items.
  cjSyncStatus?: CjSyncStatus;
  cjOrderId?: string;
  cjTrackingNumber?: string;
  cjShippingLineId?: string;
}

export type TransactionStatus = "succeeded" | "pending" | "refunded" | "failed";

export interface Payment {
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  status: TransactionStatus;
  method: string;
  processorFee: number;
  createdAt: string;
}

export type DisputeStatus = "needs_response" | "under_review" | "won" | "lost";

export interface Dispute {
  id: string;
  orderId: string;
  customerId: string;
  reason: string;
  amount: number;
  status: DisputeStatus;
  dueBy: string;
  createdAt: string;
}

export type PayoutStatus = "paid" | "in_transit" | "scheduled";

export interface Payout {
  id: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  status: PayoutStatus;
  arrivalDate: string;
  transactionCount: number;
}

export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock" | "backorder";

export interface InventoryRecord {
  sku: string;
  productId: string;
  title: string;
  image: string;
  source: ProductSource;
  /** Self: a Baruashop DC. CJ: the CJ warehouse the item ships from ("CJ Warehouse (US)" / "CJ Warehouse (CN)"). */
  warehouse: string;
  available: number;
  /** Always 0 for CJ items — Baruashop never reserves CJ-held stock. */
  reserved: number;
  /** Self: units inbound to a Baruashop DC. Not applicable to CJ (always 0). */
  incoming: number;
  status: InventoryStatus;
  supplierId?: string;
  updatedAt: string;
}

export type ImportJobStatus = "queued" | "running" | "completed" | "failed";
export type ImportJobType = "product_sync" | "inventory_sync" | "price_update";

export interface ImportJob {
  id: string;
  supplierId: string;
  type: ImportJobType;
  status: ImportJobStatus;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  startedAt: string | null;
  completedAt: string | null;
}

export interface ImportError {
  id: string;
  jobId: string;
  supplierId: string;
  sku: string;
  reason: string;
  occurredAt: string | null;
  resolved: boolean;
}

export interface FieldMappingEntry {
  sourceField: string;
  targetField: string;
  transform?: string;
}

export interface FieldMapping {
  supplierId: string;
  mappings: FieldMappingEntry[];
}

export type LogLevel = "info" | "warn" | "error";

export interface SupplierLog {
  id: string;
  supplierId: string;
  level: LogLevel;
  message: string;
  timestamp: string;
}

export type ActivityType = "order" | "payment" | "import" | "product" | "customer" | "system";

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  message: string;
  actor: string;
  createdAt: string;
}

export type AnnouncementLevel = "info" | "success" | "warning";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  level: AnnouncementLevel;
  createdAt: string;
}

export type ComponentStatus = "operational" | "degraded" | "outage";

export interface SystemComponent {
  id: string;
  name: string;
  status: ComponentStatus;
  latencyMs: number;
  uptimePercent: number;
}
