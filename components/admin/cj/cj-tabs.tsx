"use client";

import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = [
  { href: "/admin/cj", label: "Overview" },
  { href: "/admin/cj/catalog", label: "Catalog" },
  { href: "/admin/cj/orders", label: "Orders" },
  { href: "/admin/cj/after-sales", label: "After-Sales" },
  { href: "/admin/cj/sourcing", label: "Sourcing Requests" },
  { href: "/admin/cj/settings", label: "Settings" },
];

export function CjTabs() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Tabs value={pathname} onValueChange={(v) => v && router.push(v)}>
      <TabsList>
        {TABS.map((tab) => (
          <TabsTrigger key={tab.href} value={tab.href}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
