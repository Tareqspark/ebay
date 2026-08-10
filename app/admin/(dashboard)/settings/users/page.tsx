import type { Metadata } from "next";
import { TeamTable } from "@/components/admin/settings/team-table";
import { PermissionsMatrix } from "@/components/admin/settings/permissions-matrix";
import { ChangePasswordCard } from "@/components/admin/settings/change-password-card";
import { getAdminTeam } from "@/lib/admin/team";
import { getRolePermissionsMatrix, getPermissionOverrides } from "@/lib/admin/data";
import { auth } from "@/auth";

export const metadata: Metadata = { title: "Users & Permissions" };

export default async function AdminUsersSettingsPage() {
  const [team, rolePermissions, overrides, session] = await Promise.all([
    getAdminTeam(),
    getRolePermissionsMatrix(),
    getPermissionOverrides(),
    auth(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      {/* First on the page: it is the one thing here that concerns the person
          reading it, and the user menu's "Profile" link lands them here. */}
      <ChangePasswordCard email={session?.user?.email ?? ""} />
      <TeamTable users={team} />
      <PermissionsMatrix
        users={team}
        rolePermissions={rolePermissions}
        overrides={overrides}
        isOwner={session?.user?.adminRole === "Owner"}
      />
    </div>
  );
}
