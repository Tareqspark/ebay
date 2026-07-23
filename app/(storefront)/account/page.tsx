import type { Metadata } from "next";
import { Award } from "lucide-react";
import { AccountTabs } from "@/components/account/account-tabs";
import { auth } from "@/auth";
import { getOrdersForUser } from "@/lib/orders";
import { getLoyaltyStatus } from "@/lib/loyalty";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountOverviewPage() {
  const session = await auth();
  const orders = session?.user?.id ? await getOrdersForUser(session.user.id) : [];
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const loyalty = session?.user?.id ? await getLoyaltyStatus(session.user.id) : null;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Welcome back, {session?.user?.name}.</p>
      </div>
      <AccountTabs />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Orders placed</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{orders.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total spent</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{formatPrice(totalSpent)}</p>
        </div>
        {loyalty && (
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Loyalty tier</p>
            <p className="mt-1 flex items-center gap-1.5 text-2xl font-bold text-foreground">
              <Award className="h-5 w-5 text-amber-500" />
              {loyalty.tier.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {loyalty.tier.discountPercent > 0 ? `${loyalty.tier.discountPercent}% off every order` : "Spend more to unlock a discount"}
              {loyalty.nextTier && ` — ${formatPrice(loyalty.nextTier.remaining)} to ${loyalty.nextTier.name}`}
            </p>
          </div>
        )}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
          <p className="mt-1 truncate text-sm font-medium text-foreground">{session?.user?.email}</p>
        </div>
      </div>
    </div>
  );
}
