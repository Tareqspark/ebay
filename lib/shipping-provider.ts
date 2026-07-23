/**
 * Label generation is mocked at the external-API boundary — there's no
 * live USPS/UPS/FedEx account to call, same as the CJdropshipping push
 * (lib/admin/order-actions.ts's pushOrderToCjAction) being real everywhere
 * except the actual third-party call. What's real: the rate this tracking
 * number is generated for came from the admin-configured shipping_rates
 * table (lib/shipping-rates.ts), not a hardcoded carrier — this only fakes
 * the part that requires credentials nobody has yet.
 */
function randomDigits(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) out += Math.floor(Math.random() * 10);
  return out;
}

function randomAlphanumeric(length: number): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < length; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

/** Carrier-appropriate tracking number *format* — length/prefix match the real carrier's scheme, the digits themselves are not real. */
export function generateTrackingNumber(carrierName?: string): string {
  switch (carrierName) {
    case "UPS":
      return `1Z${randomAlphanumeric(6)}${randomDigits(10)}`;
    case "FedEx":
      return randomDigits(12);
    case "DHL Express":
      return randomDigits(10);
    case "USPS":
    default:
      return `9400${randomDigits(18)}`;
  }
}
