import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/shell/admin-sidebar";
import { AdminTopbar } from "@/components/admin/shell/admin-topbar";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    default: "Baruashop Admin",
    template: "%s | Baruashop Admin",
  },
  description: "Operations console for the Baruashop storefront.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/20 text-foreground">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="min-w-0 flex-1 p-5">{children}</main>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}
