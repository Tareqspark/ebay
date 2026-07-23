import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCart } from "@/lib/cart";
import { getAddressesForCurrentUser } from "@/lib/address-actions";
import { CheckoutClient } from "@/components/checkout/checkout-client";
import { computeTotals, computeTotalsWithDiscount } from "@/lib/checkout";
import { getLoyaltyStatus } from "@/lib/loyalty";

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
  const baseTotals = computeTotals(cart.subtotal);

  const loyalty = await getLoyaltyStatus(session.user.id);
  const loyaltyDiscount =
    loyalty.tier.discountPercent > 0
      ? {
          tierName: loyalty.tier.name,
          discountPercent: loyalty.tier.discountPercent,
          ...computeTotalsWithDiscount(cart.subtotal, {
            discountType: "percent" as const,
            discountPercent: loyalty.tier.discountPercent,
            discountAmountCents: null,
          }),
        }
      : null;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
      <CheckoutClient
        cart={cart}
        baseTotals={baseTotals}
        loyaltyDiscount={loyaltyDiscount}
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
    </div>
  );
}
