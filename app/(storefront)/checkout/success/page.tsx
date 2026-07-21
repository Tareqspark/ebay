import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { auth } from "@/auth";
import { createOrderFromPaymentIntent } from "@/lib/checkout";
import { getOrderForUser } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Order Confirmed" };

interface CheckoutSuccessPageProps {
  searchParams: Promise<{ payment_intent?: string; redirect_status?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const { payment_intent: paymentIntentId, redirect_status: status } = await searchParams;
  const session = await auth();

  if (!paymentIntentId || status !== "succeeded" || !session?.user?.id) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-sm text-muted-foreground">We couldn&apos;t confirm this payment. If you were charged, check My Orders shortly.</p>
        <Button render={<Link href="/" />} nativeButton={false} className="mt-4">
          Return Home
        </Button>
      </div>
    );
  }

  const orderId = await createOrderFromPaymentIntent(paymentIntentId);
  const order = orderId ? await getOrderForUser(session.user.id, orderId) : null;

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-sm text-muted-foreground">
          Your payment is confirmed and your order is being finalized — it&apos;ll appear in My Orders in a moment.
        </p>
        <Button render={<Link href="/account/orders" />} nativeButton={false} className="mt-4">
          View My Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-16 text-center">
      <CheckCircle2 className="h-12 w-12 text-emerald-600" />
      <h1 className="text-2xl font-bold text-foreground">Order confirmed</h1>
      <p className="text-sm text-muted-foreground">
        Order <strong className="text-foreground">{order.orderNumber}</strong> is confirmed. A receipt has been sent to your email.
      </p>
      <div className="w-full rounded-lg border border-border bg-card p-4 text-left text-sm">
        {order.items.map((item, i) => (
          <div key={`${item.productId}-${i}`} className="flex justify-between py-1 text-muted-foreground">
            <span>
              {item.title} × {item.quantity}
            </span>
            <span className="text-foreground">{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold text-foreground">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button render={<Link href="/account/orders" />} nativeButton={false} variant="outline">
          View Orders
        </Button>
        <Button render={<Link href="/" />} nativeButton={false}>
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
