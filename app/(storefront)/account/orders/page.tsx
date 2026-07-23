import type { Metadata } from "next";
import Image from "next/image";
import { AccountTabs } from "@/components/account/account-tabs";
import { ReturnItemButton } from "@/components/account/return-item-button";
import { auth } from "@/auth";
import { getOrdersForUser } from "@/lib/orders";
import { getReturnsByOrderItemForUser } from "@/lib/returns";
import type { CustomerReturn } from "@/lib/returns";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "My Orders" };

const RETURN_STATUS_LABEL = { requested: "Return requested", refunded: "Refunded", rejected: "Return rejected" } as const;

export default async function AccountOrdersPage() {
  const session = await auth();
  const orders = session?.user?.id ? await getOrdersForUser(session.user.id) : [];
  const returnsByItem = session?.user?.id ? await getReturnsByOrderItemForUser(session.user.id) : new Map<string, CustomerReturn>();

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
                {order.items.map((item, i) => {
                  const isReturnable =
                    !!item.id &&
                    item.source === "self" &&
                    (order.fulfillmentStatus === "shipped" || order.fulfillmentStatus === "delivered");
                  const existingReturn = item.id ? returnsByItem.get(item.id) : undefined;
                  return (
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
                      {isReturnable &&
                        (existingReturn ? (
                          <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                            {RETURN_STATUS_LABEL[existingReturn.status]}
                          </span>
                        ) : (
                          <ReturnItemButton orderItemId={item.id!} productTitle={item.title} />
                        ))}
                    </div>
                  );
                })}
                {(order.trackingNumber || order.cjTrackingNumber) && (
                  <div className="flex flex-col gap-1 rounded-md bg-muted/40 px-3 py-2 text-xs">
                    {order.trackingNumber && (
                      <p className="text-foreground">
                        <span className="text-muted-foreground">{order.carrier ?? "Tracking"}: </span>
                        {order.trackingNumber}
                      </p>
                    )}
                    {order.cjTrackingNumber && (
                      <p className="text-foreground">
                        <span className="text-muted-foreground">Supplier shipment: </span>
                        {order.cjTrackingNumber}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
