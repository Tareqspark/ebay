import Link from "next/link";
import { Panel } from "@/components/admin/shared/panel";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { getOrders } from "@/lib/admin/data";
import { formatMoney, formatRelative } from "@/lib/admin/format";

export async function RecentOrdersPanel() {
  const orders = await getOrders();
  const recent = orders.slice(0, 8);

  return (
    <Panel title="Recent orders" viewAllHref="/admin/orders" bodyClassName="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 text-xs text-muted-foreground">
            <th className="px-4 py-2 text-left font-medium">Order</th>
            <th className="px-4 py-2 text-left font-medium">Customer</th>
            <th className="px-4 py-2 text-left font-medium">Payment</th>
            <th className="px-4 py-2 text-left font-medium">Fulfillment</th>
            <th className="px-4 py-2 text-right font-medium">Total</th>
            <th className="px-4 py-2 text-right font-medium">Placed</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((order) => {
            return (
              <tr key={order.id} className="border-b border-border/40 last:border-0 hover:bg-muted/40">
                <td className="px-4 py-2.5">
                  <Link href={`/admin/orders?q=${order.id}`} className="font-medium text-foreground hover:underline">
                    {order.id}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{order.customerName}</td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={order.paymentStatus} />
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={order.fulfillmentStatus} />
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-foreground">{formatMoney(order.total)}</td>
                <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">{formatRelative(order.placedAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Panel>
  );
}
