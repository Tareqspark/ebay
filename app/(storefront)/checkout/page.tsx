import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCart } from "@/lib/cart";
import { getAddressesForCurrentUser } from "@/lib/address-actions";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { computeTotals } from "@/lib/checkout";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/account/sign-in?next=/checkout");
  }

  const cart = await getCart();
  if (cart.items.length === 0) {
    redirect("/cart");
  }

  const addresses = await getAddressesForCurrentUser();
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
  const totals = computeTotals(cart.subtotal);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <CheckoutForm
          defaultAddress={
            defaultAddress
              ? {
                  name: defaultAddress.name,
                  line1: defaultAddress.line1,
                  city: defaultAddress.city,
                  state: defaultAddress.state,
                  zip: defaultAddress.zip,
                  country: defaultAddress.country,
                }
              : { name: session.user.name ?? "", line1: "", city: "", state: "", zip: "", country: "US" }
          }
        />
        <div className="h-fit rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">Order Summary</h2>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            {cart.items.map((line) => (
              <div key={line.itemId} className="flex justify-between text-muted-foreground">
                <span className="truncate pr-2">
                  {line.product.title} × {line.quantity}
                </span>
                <span className="shrink-0 tabular-nums text-foreground">{formatPrice(line.product.price * line.quantity)}</span>
              </div>
            ))}
            <div className="mt-1 border-t border-border pt-2" />
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums text-foreground">{formatPrice(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span className="tabular-nums text-foreground">{totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span>
              <span className="tabular-nums text-foreground">{formatPrice(totals.tax)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold text-foreground">
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(totals.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
