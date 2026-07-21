import type { Metadata } from "next";
import Image from "next/image";
import { AccountTabs } from "@/components/account/account-tabs";
import { auth } from "@/auth";
import { getOrdersForUser } from "@/lib/orders";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "My Orders" };

export default async function AccountOrdersPage() {
  const session = await auth();
  const orders = session?.user?.id ? await getOrdersForUser(session.user.id) : [];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Account</h1>
      </div>
      <AccountTabs />

      {orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">You haven&apos;t placed any orders yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-border bg-card">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    Placed {new Date(order.placedAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="rounded-full bg-muted px-2.5 py-1 font-medium capitalize text-muted-foreground">
                    {order.fulfillmentStatus}
                  </span>
                  <span className="font-semibold text-foreground">{formatPrice(order.total)}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 p-4">
                {order.items.map((item, i) => (
                  <div key={`${item.productId}-${i}`} className="flex items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                      <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
