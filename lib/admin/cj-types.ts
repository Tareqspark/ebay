import type { CjStockStatus, CjWarehouse } from "@/lib/admin/types";

/**
 * A product in CJdropshipping's own catalog, not yet imported into Baruashop.
 * This is the browse/import source — see cj-catalog.ts for how it's loaded
 * (server-only, paginated; the full set is never shipped to the client).
 */
export interface CjCatalogItem {
  id: string;
  cjProductId: string;
  title: string;
  image: string;
  categorySlug: string;
  cost: number;
  suggestedRetail: number;
  variantCount: number;
  sourceWarehouse: CjWarehouse;
  shippingLineId: string;
  stockStatus: CjStockStatus;
  rating: number;
  imported: boolean;
}

export interface CjShippingLine {
  id: string;
  name: string;
  fromWarehouse: CjWarehouse;
  costPerOrder: number;
  estimatedDays: string;
}

export interface CjIntegrationSettings {
  connected: boolean;
  accountEmail: string;
  apiKeyMasked: string;
  walletBalance: number;
  autoPushOrders: boolean;
  defaultShippingLineId: string;
  syncFrequency: string;
  lastSyncAt: string;
}

export type CjDisputeReason = "lost_in_transit" | "damaged" | "wrong_item" | "not_as_described" | "defective";
export type CjDisputeStatus = "open" | "awaiting_cj" | "resolved_reship" | "resolved_refund" | "rejected";
export type CjDisputeResolution = "reshipment" | "refund";

export interface CjDispute {
  id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  customerId: string;
  reason: CjDisputeReason;
  status: CjDisputeStatus;
  requestedResolution: CjDisputeResolution;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export type CjSourcingRequestStatus = "submitted" | "sourcing" | "found" | "not_found";

export interface CjSourcingRequest {
  id: string;
  productName: string;
  referenceUrl?: string;
  notes: string;
  status: CjSourcingRequestStatus;
  submittedAt: string;
}
