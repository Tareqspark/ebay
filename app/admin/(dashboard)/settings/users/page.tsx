import type { Metadata } from "next";
import { TeamTable } from "@/components/admin/settings/team-table";
import { getAdminTeam } from "@/lib/admin/team";

export const metadata: Metadata = { title: "Users & Permissions" };

export default async function AdminUsersSettingsPage() {
  const team = await getAdminTeam();
  return (
    <div className="flex flex-col gap-4">
      <TeamTable users={team} />
    </div>
  );
}
