"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { KeyRound, Pencil, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/table/data-table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { formatRelative } from "@/lib/admin/format";
import { TeamMemberFormDialog } from "@/components/admin/settings/team-member-form-dialog";
import { TempPasswordDialog } from "@/components/admin/settings/temp-password-dialog";
import {
  inviteTeamMemberAction,
  updateTeamMemberAction,
  resetTeamMemberPasswordAction,
  deleteTeamMemberAction,
} from "@/lib/admin/team-actions";
import type { TeamMemberInput } from "@/lib/admin/team-actions";
import type { AdminUser } from "@/lib/admin/team";

export function TeamTable({ users: initial }: { users: AdminUser[] }) {
  const [users, setUsers] = useState(initial);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);
  const [pendingReset, setPendingReset] = useState<AdminUser | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  async function handleSubmit(input: TeamMemberInput) {
    setSubmitting(true);
    const result = editing ? await updateTeamMemberAction(editing.id, input) : await inviteTeamMemberAction(input);
    setSubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (editing) {
      setUsers((prev) => prev.map((u) => (u.id === editing.id ? { ...u, ...input } : u)));
      toast.success("Team member updated");
    } else {
      setUsers((prev) => [
        { id: crypto.randomUUID(), ...input, lastActiveAt: new Date().toISOString() },
        ...prev,
      ]);
      toast.success("Team member invited");
      if (result.tempPassword) {
        setTempPassword(result.tempPassword);
        setPasswordDialogOpen(true);
      }
    }
    setFormOpen(false);
    setEditing(null);
  }

  async function handleResetPassword() {
    if (!pendingReset) return;
    const result = await resetTeamMemberPasswordAction(pendingReset.id, pendingReset.name);
    if (result.error) {
      toast.error(result.error);
      setPendingReset(null);
      return;
    }
    toast.success(`Password reset for ${pendingReset.name}`);
    if (result.tempPassword) {
      setTempPassword(result.tempPassword);
      setPasswordDialogOpen(true);
    }
    setPendingReset(null);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    const result = await deleteTeamMemberAction(pendingDelete.id, pendingDelete.name);
    if (result.error) {
      toast.error(result.error);
      setPendingDelete(null);
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== pendingDelete.id));
    toast.success("Team member removed");
    setPendingDelete(null);
  }

  const columns = useMemo<ColumnDef<AdminUser, unknown>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        size: 220,
        accessorFn: (r) => r.name,
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-foreground">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        ),
      },
      { id: "role", header: "Role", size: 160, accessorFn: (r) => r.role, cell: ({ row }) => <span className="text-foreground">{row.original.role}</span> },
      { id: "status", header: "Status", size: 100, accessorFn: (r) => r.status, cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { id: "lastActive", header: "Last active", size: 130, accessorFn: (r) => r.lastActiveAt, cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatRelative(row.original.lastActiveAt)}</span> },
      {
        id: "actions",
        header: "",
        size: 120,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Edit"
              onClick={() => {
                setEditing(row.original);
                setFormOpen(true);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon-sm" aria-label="Reset password" onClick={() => setPendingReset(row.original)}>
              <KeyRound className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon-sm" aria-label="Remove" onClick={() => setPendingDelete(row.original)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{users.length} team members</p>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <UserPlus className="h-3.5 w-3.5" />
          Invite user
        </Button>
      </div>

      <DataTable columns={columns} data={users} getRowId={(u) => u.id} pageSize={20} emptyMessage="No team members yet." />

      <TeamMemberFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        member={editing}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <TempPasswordDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} password={tempPassword} />

      <AlertDialog open={pendingReset !== null} onOpenChange={(open) => !open && setPendingReset(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset password for {pendingReset?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Their current password stops working immediately, and a new temporary one will be generated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword}>Reset password</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes their staff account. They&apos;ll immediately lose access to the admin console.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
