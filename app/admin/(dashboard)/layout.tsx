import { headers } from "next/headers";
import { AdminSidebar } from "@/components/admin/shell/admin-sidebar";
import { AdminTopbar } from "@/components/admin/shell/admin-topbar";
import { AdminAccessDenied } from "@/components/admin/shell/admin-access-denied";
import { Toaster } from "@/components/ui/sonner";
import { requireAdminSession } from "@/lib/admin/auth";
import { getAnnouncements } from "@/lib/admin/data";
import { hasAdminAccess } from "@/lib/admin/permissions";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [session, announcements, pathname] = await Promise.all([
    requireAdminSession(),
    getAnnouncements(),
    headers().then((h) => h.get("x-pathname") ?? ""),
  ]);
  const allowed = await hasAdminAccess(session.user, pathname);

  return (
    <div className="flex min-h-screen bg-muted/20 text-foreground">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar admin={session.user} announcements={announcements} />
        <main className="min-w-0 flex-1 p-5">{allowed ? children : <AdminAccessDenied />}</main>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}
