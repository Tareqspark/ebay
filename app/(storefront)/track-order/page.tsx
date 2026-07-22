import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { TrackOrderForm } from "@/components/help/track-order-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Track Your Order" };

export default async function TrackOrderPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Track Your Order</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Look up the status and tracking number for any order on your account.
      </p>

      <div className="mt-6">
        {session?.user ? (
          <TrackOrderForm />
        ) : (
          <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border p-6">
            <p className="text-sm text-muted-foreground">Sign in to look up your order by order number.</p>
            <Button render={<Link href="/account/sign-in?next=/track-order" />} nativeButton={false} size="sm">
              Sign in
            </Button>
          </div>
        )}
      </div>

      <div className="mt-10 flex flex-col gap-5 text-sm leading-relaxed text-muted-foreground">
        <div>
          <h2 className="text-base font-semibold text-foreground">How order tracking works</h2>
          <p className="mt-1.5">
            As soon as your order ships, we email you a tracking number. You can also find it any time on this page or
            under <Link href="/account/orders" className="text-foreground underline underline-offset-2">My Orders</Link>.
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">Mixed orders</h2>
          <p className="mt-1.5">
            If your order includes both self-stocked and supplier-fulfilled items, it may arrive in two separate
            shipments with two separate tracking numbers — both are shown here once available. See our{" "}
            <Link href="/help/shipping" className="text-foreground underline underline-offset-2">Shipping Policy</Link> for delivery estimates.
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">Tracking hasn&apos;t updated?</h2>
          <p className="mt-1.5">
            Carrier tracking can take 24–48 hours to show movement after a label is created. If it&apos;s been longer
            than that, or delivery is past the estimated window, contact us on our{" "}
            <Link href="/help" className="text-foreground underline underline-offset-2">Contact Information</Link> page and we&apos;ll look into it.
          </p>
        </div>
      </div>
    </div>
  );
}
