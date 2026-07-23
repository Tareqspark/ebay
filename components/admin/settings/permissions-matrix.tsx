"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { setRolePermissionAction, setUserPermissionOverrideAction } from "@/lib/admin/permission-actions";
import { ADMIN_PERMISSIONS, PERMISSION_LABELS, type AdminPermission, type NonOwnerRole } from "@/lib/admin/permission-constants";
import type { AdminUser } from "@/lib/admin/team";
import type { AdminPermissionOverrideRow } from "@/lib/admin/data";

const ROLES: NonOwnerRole[] = ["Admin", "Merchandiser", "Catalog Manager", "Support"];

type OverrideValue = "default" | "grant" | "deny";

interface PermissionsMatrixProps {
  users: AdminUser[];
  rolePermissions: Record<NonOwnerRole, AdminPermission[]>;
  overrides: AdminPermissionOverrideRow[];
  isOwner: boolean;
}

export function PermissionsMatrix({ users, rolePermissions, overrides: initialOverrides, isOwner }: PermissionsMatrixProps) {
  const [roleGrants, setRoleGrants] = useState(rolePermissions);
  const [overrides, setOverrides] = useState(initialOverrides);
  const [pendingCell, setPendingCell] = useState<string | null>(null);
  const nonOwnerUsers = useMemo(() => users.filter((u) => u.role !== "Owner"), [users]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(nonOwnerUsers[0]?.id ?? null);

  const selectedUser = nonOwnerUsers.find((u) => u.id === selectedUserId) ?? null;

  async function toggleRolePermission(role: NonOwnerRole, permission: AdminPermission, granted: boolean) {
    const cellKey = `${role}:${permission}`;
    setPendingCell(cellKey);
    const result = await setRolePermissionAction(role, permission, granted);
    setPendingCell(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setRoleGrants((prev) => ({
      ...prev,
      [role]: granted ? [...prev[role], permission] : prev[role].filter((p) => p !== permission),
    }));
  }

  function overrideFor(userId: string, permission: AdminPermission): OverrideValue {
    const row = overrides.find((o) => o.adminUserId === userId && o.permission === permission);
    if (!row) return "default";
    return row.granted ? "grant" : "deny";
  }

  async function setOverride(permission: AdminPermission, value: OverrideValue) {
    if (!selectedUser) return;
    const cellKey = `override:${permission}`;
    setPendingCell(cellKey);
    const result = await setUserPermissionOverrideAction(selectedUser.id, selectedUser.name, permission, value);
    setPendingCell(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setOverrides((prev) => {
      const rest = prev.filter((o) => !(o.adminUserId === selectedUser.id && o.permission === permission));
      if (value === "default") return rest;
      return [...rest, { adminUserId: selectedUser.id, permission, granted: value === "grant" }];
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Role defaults</h2>
          <p className="text-xs text-muted-foreground">
            What each role can see and do by default. Owner always has full access and isn&apos;t shown here.
            {!isOwner && " Only the Owner can make changes."}
          </p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="sticky left-0 bg-card px-3 py-2 text-left text-xs font-medium text-muted-foreground">Section</th>
                {ROLES.map((role) => (
                  <th key={role} className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ADMIN_PERMISSIONS.map((permission) => (
                <tr key={permission} className="border-b border-border/60 last:border-0">
                  <td className="sticky left-0 bg-card px-3 py-1.5 text-foreground">{PERMISSION_LABELS[permission]}</td>
                  {ROLES.map((role) => {
                    const cellKey = `${role}:${permission}`;
                    return (
                      <td key={role} className="px-3 py-1.5 text-center">
                        <Checkbox
                          checked={roleGrants[role].includes(permission)}
                          disabled={!isOwner || pendingCell === cellKey}
                          onCheckedChange={(value) => toggleRolePermission(role, permission, !!value)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Per-user overrides</h2>
          <p className="text-xs text-muted-foreground">Grant or deny individual sections for one person, on top of their role default.</p>
        </div>

        {nonOwnerUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No non-Owner staff accounts yet.</p>
        ) : (
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <Select value={selectedUserId} onValueChange={(v) => setSelectedUserId(v)}>
                <SelectTrigger className="w-64"><SelectValue placeholder="Select a staff member" /></SelectTrigger>
                <SelectContent>
                  {nonOwnerUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} — {u.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedUser && (
              <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
                {ADMIN_PERMISSIONS.map((permission) => {
                  const value = overrideFor(selectedUser.id, permission);
                  const cellKey = `override:${permission}`;
                  const roleDefault = roleGrants[selectedUser.role as NonOwnerRole]?.includes(permission);
                  return (
                    <div key={permission} className="flex items-center justify-between gap-3 py-0.5 text-sm">
                      <span className="text-foreground">
                        {PERMISSION_LABELS[permission]}
                        <span className="ml-1.5 text-xs text-muted-foreground">({roleDefault ? "on" : "off"} by default)</span>
                      </span>
                      <div className="flex shrink-0 gap-0.5 rounded-md border border-border p-0.5">
                        {(["deny", "default", "grant"] as OverrideValue[]).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            disabled={!isOwner || pendingCell === cellKey}
                            onClick={() => setOverride(permission, opt)}
                            className={cn(
                              "rounded px-2 py-0.5 text-xs font-medium capitalize transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                              value === opt ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                            )}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
