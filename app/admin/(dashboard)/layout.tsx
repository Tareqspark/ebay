import { AdminSidebar } from "@/components/admin/shell/admin-sidebar";
import { AdminTopbar } from "@/components/admin/shell/admin-topbar";
import { Toaster } from "@/components/ui/sonner";
import { requireAdminSession } from "@/lib/admin/auth";
import { getAnnouncements } from "@/lib/admin/data";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [session, announcements] = await Promise.all([requireAdminSession(), getAnnouncements()]);

  return (
    <div className="flex min-h-screen bg-muted/20 text-foreground">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar admin={session.user} announcements={announcements} />
        <main className="min-w-0 flex-1 p-5">{children}</main>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}
