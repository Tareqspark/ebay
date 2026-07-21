"use server";

import { cookies } from "next/headers";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { carts, cartItems } from "@/db/schema";
import { newId } from "@/lib/id";
import { auth } from "@/auth";
import { getProductsByIds } from "@/lib/products";
import type { Product } from "@/lib/types";
import { revalidatePath } from "next/cache";

const GUEST_COOKIE = "baruashop_guest_cart";

export interface CartLine {
  itemId: string;
  quantity: number;
  product: Product;
}

export interface CartSummary {
  cartId: string | null;
  items: CartLine[];
  itemCount: number;
  subtotal: number;
}

async function getOrCreateCartId(): Promise<string> {
  const session = await auth();
  const cookieStore = await cookies();

  if (session?.user?.id) {
    const [existing] = await db.select().from(carts).where(eq(carts.userId, session.user.id)).limit(1);
    if (existing) return existing.id;
    const id = newId();
    await db.insert(carts).values({ id, userId: session.user.id });
    return id;
  }

  let guestId = cookieStore.get(GUEST_COOKIE)?.value;
  if (guestId) {
    const [existing] = await db.select().from(carts).where(eq(carts.guestId, guestId)).limit(1);
    if (existing) return existing.id;
  }

  guestId = newId();
  const id = newId();
  await db.insert(carts).values({ id, guestId });
  cookieStore.set(GUEST_COOKIE, guestId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 90,
    path: "/",
  });
  return id;
}

/** Peeks at the current cart without creating one — used for read-only header/badge rendering. */
export async function peekCart(): Promise<CartSummary> {
  const session = await auth();
  const cookieStore = await cookies();

  let cartId: string | undefined;
  if (session?.user?.id) {
    const [existing] = await db.select().from(carts).where(eq(carts.userId, session.user.id)).limit(1);
    cartId = existing?.id;
  } else {
    const guestId = cookieStore.get(GUEST_COOKIE)?.value;
    if (guestId) {
      const [existing] = await db.select().from(carts).where(eq(carts.guestId, guestId)).limit(1);
      cartId = existing?.id;
    }
  }

  if (!cartId) return { cartId: null, items: [], itemCount: 0, subtotal: 0 };
  return buildSummary(cartId);
}

async function buildSummary(cartId: string): Promise<CartSummary> {
  const rows = await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
  const products = await getProductsByIds(rows.map((r) => r.productId));
  const productById = new Map(products.map((p) => [p.id, p]));

  const items: CartLine[] = rows
    .map((row) => {
      const product = productById.get(row.productId);
      if (!product) return null;
      return { itemId: row.id, quantity: row.quantity, product };
    })
    .filter((line): line is CartLine => line !== null);

  const itemCount = items.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = Math.round(items.reduce((sum, line) => sum + line.product.price * line.quantity, 0) * 100) / 100;

  return { cartId, items, itemCount, subtotal };
}

export async function getCart(): Promise<CartSummary> {
  const cartId = await getOrCreateCartId();
  return buildSummary(cartId);
}

export async function addToCart(productId: string, quantity = 1): Promise<CartSummary> {
  const cartId = await getOrCreateCartId();
  const [existing] = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)))
    .limit(1);

  if (existing) {
    await db
      .update(cartItems)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(cartItems.id, existing.id));
  } else {
    await db.insert(cartItems).values({ id: newId(), cartId, productId, quantity });
  }

  revalidatePath("/cart");
  return buildSummary(cartId);
}

export async function updateCartItemQuantity(itemId: string, quantity: number): Promise<CartSummary> {
  const cartId = await getOrCreateCartId();
  if (quantity <= 0) {
    await db.delete(cartItems).where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)));
  } else {
    await db.update(cartItems).set({ quantity }).where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)));
  }
  revalidatePath("/cart");
  return buildSummary(cartId);
}

export async function removeCartItem(itemId: string): Promise<CartSummary> {
  return updateCartItemQuantity(itemId, 0);
}

/** Called right after a successful sign-in — folds the guest cart (if any) into the now-known user's cart. */
export async function mergeGuestCartIntoUser(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  const cookieStore = await cookies();
  const guestId = cookieStore.get(GUEST_COOKIE)?.value;
  if (!guestId) return;

  const [guestCart] = await db.select().from(carts).where(eq(carts.guestId, guestId)).limit(1);
  if (!guestCart) return;

  const [userCart] = await db.select().from(carts).where(eq(carts.userId, session.user.id)).limit(1);
  const userCartId = userCart?.id ?? (await createUserCart(session.user.id));

  const guestItems = await db.select().from(cartItems).where(eq(cartItems.cartId, guestCart.id));
  for (const item of guestItems) {
    const [existing] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.cartId, userCartId), eq(cartItems.productId, item.productId)))
      .limit(1);
    if (existing) {
      await db.update(cartItems).set({ quantity: existing.quantity + item.quantity }).where(eq(cartItems.id, existing.id));
    } else {
      await db.insert(cartItems).values({ id: newId(), cartId: userCartId, productId: item.productId, quantity: item.quantity });
    }
  }

  await db.delete(cartItems).where(eq(cartItems.cartId, guestCart.id));
  await db.delete(carts).where(eq(carts.id, guestCart.id));
  cookieStore.delete(GUEST_COOKIE);
}

async function createUserCart(userId: string): Promise<string> {
  const id = newId();
  await db.insert(carts).values({ id, userId });
  return id;
}

/** Empties a cart after a successful order — used by the Stripe webhook handler. */
export async function clearCartById(cartId: string): Promise<void> {
  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
}

export async function getCartIdForCheckout(): Promise<string> {
  return getOrCreateCartId();
}
