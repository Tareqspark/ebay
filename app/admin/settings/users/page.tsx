import type { Metadata } from "next";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamTable } from "@/components/admin/settings/team-table";
import { ADMIN_TEAM } from "@/lib/admin/team";

export const metadata: Metadata = { title: "Users & Permissions" };

export default function AdminUsersSettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{ADMIN_TEAM.length} team members</p>
        <Button size="sm" className="gap-1.5">
          <UserPlus className="h-3.5 w-3.5" />
          Invite user
        </Button>
      </div>
      <TeamTable users={ADMIN_TEAM} />
    </div>
  );
}
