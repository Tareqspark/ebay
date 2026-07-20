"use client";

import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = [
  { href: "/admin/supplier", label: "Overview" },
  { href: "/admin/supplier/cj-catalog", label: "CJ Catalog" },
  { href: "/admin/supplier/queue", label: "Import Queue" },
  { href: "/admin/supplier/history", label: "Import History" },
  { href: "/admin/supplier/failed", label: "Failed Imports" },
  { href: "/admin/supplier/after-sales", label: "After-Sales" },
  { href: "/admin/supplier/mapping", label: "Field Mapping" },
  { href: "/admin/supplier/logs", label: "Logs" },
];

export function SupplierTabs() {
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
