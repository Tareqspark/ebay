"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/table/data-table";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { formatRelative } from "@/lib/admin/format";
import type { AdminUser } from "@/lib/admin/team";

const columns: ColumnDef<AdminUser, unknown>[] = [
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
  { id: "status", header: "Status", size: 100, accessorFn: (r) => r.status, cell: ({ row }) => <StatusBadge status={row.original.status === "active" ? "active" : "draft"} /> },
  { id: "lastActive", header: "Last active", size: 130, accessorFn: (r) => r.lastActiveAt, cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatRelative(row.original.lastActiveAt)}</span> },
];

export function TeamTable({ users }: { users: AdminUser[] }) {
  return <DataTable columns={columns} data={users} getRowId={(u) => u.id} pageSize={20} />;
}
