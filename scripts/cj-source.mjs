// Reference data for CJdropshipping integration mocks.

export const CJ_SHIPPING_LINES = [
  { id: "cjpacket-ordinary", name: "CJPacket Ordinary", fromWarehouse: "CN", costPerOrder: 3.5, estimatedDays: "12-20 days" },
  { id: "cjpacket-express", name: "CJPacket Express", fromWarehouse: "CN", costPerOrder: 7.9, estimatedDays: "7-12 days" },
  { id: "yunexpress", name: "YunExpress", fromWarehouse: "CN", costPerOrder: 5.2, estimatedDays: "10-16 days" },
  { id: "usps-us-warehouse", name: "USPS (US Warehouse)", fromWarehouse: "US", costPerOrder: 4.6, estimatedDays: "3-6 days" },
  { id: "ups-us-warehouse", name: "UPS Ground (US Warehouse)", fromWarehouse: "US", costPerOrder: 8.3, estimatedDays: "2-5 days" },
];

export const CJ_INTEGRATION_SETTINGS = {
  connected: true,
  accountEmail: "sourcing@baruashop.com",
  apiKeyMasked: "cj_live_7f2a••••••••••••",
  walletBalance: 18420.5,
  autoPushOrders: true,
  defaultShippingLineId: "cjpacket-express",
  syncFrequency: "hourly",
  lastSyncAt: "2026-07-20T08:00:00Z",
};

export const CJ_DISPUTE_REASONS = ["lost_in_transit", "damaged", "wrong_item", "not_as_described", "defective"];

export const CJ_TITLE_MODIFIERS = [
  "Wholesale", "Bulk", "Trendy", "New Arrival", "Best Selling", "Fashion", "Classic",
  "Portable", "Mini", "Multifunction", "Custom", "Wholesale Price", "Hot Sale", "2026 New",
];

export const CJ_SOURCING_REQUESTS = [
  { id: "src-1", productName: "Collapsible silicone travel bottles, 6-pack", referenceUrl: "https://cjdropshipping.com/search?q=travel-bottles", notes: "Need leak-proof caps, TSA-compliant sizes.", status: "found", submittedAt: "2026-07-10T09:00:00Z" },
  { id: "src-2", productName: "Magnetic phone mount for treadmills", notes: "Customer requests keep coming in for this — not in catalog yet.", status: "sourcing", submittedAt: "2026-07-16T14:00:00Z" },
  { id: "src-3", productName: "Ceramic pour-over coffee dripper set", referenceUrl: "https://cjdropshipping.com/search?q=pour-over-dripper", notes: "Looking for a supplier with < 15 day CN shipping.", status: "submitted", submittedAt: "2026-07-19T11:00:00Z" },
  { id: "src-4", productName: "Weighted blanket, bamboo cover, queen size", notes: "Previous supplier discontinued this SKU.", status: "not_found", submittedAt: "2026-07-05T09:00:00Z" },
];
