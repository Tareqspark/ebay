/**
 * Turns the items in a shipment into the single parcel a carrier actually
 * prices. USPS quotes a box, not a basket, so the line items have to be
 * reduced to one weight and one set of dimensions before any rate call.
 *
 * Pure arithmetic with no database or network imports, so it is unit-tested
 * directly and can be called from either the rate step or label purchase.
 */

export interface ParcelItem {
  weightOz: number;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  quantity: number;
}

export interface Parcel {
  weightOz: number;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  /** False when any item lacked a weight — the caller must not present a quote built on it as a price. */
  measured: boolean;
}

/** Padded mailer allowance, so a quote isn't short by the weight of the box itself. */
export const PACKAGING_WEIGHT_OZ = 2;

/**
 * Weight adds up; dimensions do not. Stacking items along their smallest
 * side is the closest simple model to how goods are actually boxed: the
 * footprint is the largest length and width in the shipment, and only the
 * height grows. Summing all three would price a shoebox as a wardrobe.
 */
export function buildParcel(items: ParcelItem[]): Parcel {
  if (items.length === 0) {
    return { weightOz: 0, lengthIn: 0, widthIn: 0, heightIn: 0, measured: false };
  }

  let weightOz = PACKAGING_WEIGHT_OZ;
  let lengthIn = 0;
  let widthIn = 0;
  let heightIn = 0;
  let measured = true;

  for (const item of items) {
    const qty = Math.max(1, Math.floor(item.quantity));
    if (!(item.weightOz > 0)) measured = false;

    weightOz += item.weightOz * qty;
    // Each item's own footprint is orientation-independent: the two larger
    // dimensions lie flat and the smallest becomes the stacking height.
    const dims = [item.lengthIn, item.widthIn, item.heightIn].sort((a, b) => b - a);
    lengthIn = Math.max(lengthIn, dims[0]);
    widthIn = Math.max(widthIn, dims[1]);
    heightIn += dims[2] * qty;
  }

  return {
    weightOz: Math.ceil(weightOz),
    lengthIn: round2(lengthIn),
    widthIn: round2(widthIn),
    heightIn: round2(heightIn),
    measured,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** USPS bills domestic parcels in pounds and remaining ounces. */
export function toPoundsAndOunces(weightOz: number): { pounds: number; ounces: number } {
  const total = Math.max(0, Math.ceil(weightOz));
  return { pounds: Math.floor(total / 16), ounces: total % 16 };
}

/** USPS refuses parcels over 70 lb, or over 130 in in length plus girth. */
export function exceedsUspsLimits(parcel: Parcel): string | null {
  if (parcel.weightOz > 70 * 16) return "Parcel is over the 70 lb USPS weight limit";
  const girth = 2 * (parcel.widthIn + parcel.heightIn);
  if (parcel.lengthIn + girth > 130) return "Parcel is over the 130 in USPS length-plus-girth limit";
  return null;
}
