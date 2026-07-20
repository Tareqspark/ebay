import { PageHeader } from "@/components/admin/shared/page-header";

export default function AdminSettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Settings" description="Store configuration and preferences" />
      {children}
    </div>
  );
}
