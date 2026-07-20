export type ShippingRateStatus = "active" | "disabled";

export interface ShippingRate {
  id: string;
  zone: string;
  method: string;
  condition: string;
  rate: number;
  deliveryEstimate: string;
  status: ShippingRateStatus;
}

export interface Carrier {
  id: string;
  name: string;
  connected: boolean;
  servicesUsed: string[];
}

// Hand-curated shipping configuration — settings data, not bulk catalog data.
export const SHIPPING_RATES: ShippingRate[] = [
  { id: "rate-1", zone: "Continental US", method: "Standard Shipping", condition: "Orders under $50", rate: 5.99, deliveryEstimate: "4–6 business days", status: "active" },
  { id: "rate-2", zone: "Continental US", method: "Standard Shipping", condition: "Orders $50+", rate: 0, deliveryEstimate: "4–6 business days", status: "active" },
  { id: "rate-3", zone: "Continental US", method: "Expedited Shipping", condition: "All orders", rate: 14.99, deliveryEstimate: "2–3 business days", status: "active" },
  { id: "rate-4", zone: "Continental US", method: "Overnight Shipping", condition: "All orders", rate: 29.99, deliveryEstimate: "1 business day", status: "active" },
  { id: "rate-5", zone: "Alaska & Hawaii", method: "Standard Shipping", condition: "All orders", rate: 12.99, deliveryEstimate: "6–10 business days", status: "active" },
  { id: "rate-6", zone: "Alaska & Hawaii", method: "Expedited Shipping", condition: "All orders", rate: 24.99, deliveryEstimate: "3–5 business days", status: "active" },
  { id: "rate-7", zone: "US Territories", method: "Standard Shipping", condition: "All orders", rate: 16.99, deliveryEstimate: "8–12 business days", status: "active" },
  { id: "rate-8", zone: "APO/FPO Military", method: "Standard Shipping", condition: "All orders", rate: 9.99, deliveryEstimate: "Varies by destination", status: "disabled" },
];

export const CARRIERS: Carrier[] = [
  { id: "carrier-1", name: "USPS", connected: true, servicesUsed: ["Ground Advantage", "Priority Mail"] },
  { id: "carrier-2", name: "UPS", connected: true, servicesUsed: ["Ground", "2nd Day Air", "Next Day Air"] },
  { id: "carrier-3", name: "FedEx", connected: true, servicesUsed: ["Home Delivery", "Express Saver"] },
  { id: "carrier-4", name: "DHL Express", connected: false, servicesUsed: [] },
];
