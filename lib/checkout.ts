import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, cartItems } from "@/db/schema";
import { newId } from "@/lib/id";
import { toCents } from "@/lib/money";
import { getStripe } from "@/lib/stripe";
import { sendEmail } from "@/lib/sendgrid";
import { getProductsByIds } from "@/lib/products";
import { getProductMeta } from "@/lib/admin/data";
import { clearCartById } from "@/lib/cart";
import { orderConfirmationEmail } from "@/lib/email-templates";

export const TAX_RATE = 0.0825;
export const FREE_SHIPPING_THRESHOLD = 50;
export const FLAT_SHIPPING = 6.99;

export function computeTotals(subtotal: number) {
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING;
  const tax = Math.round((subtotal + shipping) * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;
  return { shipping, tax, total };
}

async function generateOrderNumber(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `BS-${Math.floor(100000 + Math.random() * 900000)}`;
    const [existing] = await db.select({ id: orders.id }).from(orders).where(eq(orders.orderNumber, candidate)).limit(1);
    if (!existing) return candidate;
  }
  return `BS-${Date.now()}`;
}

interface ShippingAddressInput {
  name: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

/**
 * Idempotent: safe to call from both the Stripe webhook and the success-page
 * fallback (local dev often has no webhook forwarding configured) — the
 * unique index on stripePaymentIntentId means a second call is a no-op.
 */
export async function createOrderFromPaymentIntent(paymentIntentId: string): Promise<string | null> {
  const [existingOrder] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.stripePaymentIntentId, paymentIntentId))
    .limit(1);
  if (existingOrder) return existingOrder.id;

  const stripe = getStripe();
  if (!stripe) return null;

  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (intent.status !== "succeeded") return null;

  const { cartId, userId, email, ...address } = intent.metadata as Record<string, string>;
  if (!cartId || !userId) return null;

  const rows = await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
  if (rows.length === 0) return null;

  const products = await getProductsByIds(rows.map((r) => r.productId));
  const productById = new Map(products.map((p) => [p.id, p]));

  const lineItems = (
    await Promise.all(
      rows.map(async (row) => {
        const product = productById.get(row.productId);
        if (!product) return null;
        const meta = await getProductMeta(product.id);
        return {
          productId: product.id,
          title: product.title,
          image: product.images[0],
          quantity: row.quantity,
          price: product.price,
          source: meta?.source ?? ("self" as const),
        };
      }),
    )
  ).filter((x): x is NonNullable<typeof x> => x !== null);

  const subtotal = Math.round(lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;
  const { shipping, tax, total } = computeTotals(subtotal);

  const shippingAddress: ShippingAddressInput = {
    name: address.name ?? "",
    line1: address.line1 ?? "",
    city: address.city ?? "",
    state: address.state ?? "",
    zip: address.zip ?? "",
    country: address.country ?? "US",
  };

  const orderId = newId();
  const orderNumber = await generateOrderNumber();

  await db.insert(orders).values({
    id: orderId,
    orderNumber,
    userId,
    paymentStatus: "paid",
    fulfillmentStatus: "unfulfilled",
    subtotalCents: toCents(subtotal),
    shippingCents: toCents(shipping),
    taxCents: toCents(tax),
    totalCents: toCents(total),
    paymentMethod: "card",
    stripePaymentIntentId: paymentIntentId,
    shippingAddress,
  });

  await db.insert(orderItems).values(
    lineItems.map((item) => ({
      id: newId(),
      orderId,
      productId: item.productId,
      title: item.title,
      image: item.image,
      quantity: item.quantity,
      priceCents: toCents(item.price),
      source: item.source,
    }))
  );

  await clearCartById(cartId);

  if (email) {
    await sendEmail({
      to: email,
      subject: `Your Baruashop order ${orderNumber} is confirmed`,
      html: orderConfirmationEmail({ orderNumber, items: lineItems, subtotal, shipping, tax, total, shippingAddress }),
    });
  }

  return orderId;
}
