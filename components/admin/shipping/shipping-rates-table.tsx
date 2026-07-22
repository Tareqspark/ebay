"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/table/data-table";
import { TableSearch } from "@/components/admin/table/table-search";
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
import { ShippingRateFormDialog } from "@/components/admin/shipping/shipping-rate-form-dialog";
import { formatMoney } from "@/lib/admin/format";
import { createShippingRateAction, updateShippingRateAction, deleteShippingRateAction } from "@/lib/admin/shipping-actions";
import type { ShippingRateInput } from "@/lib/admin/shipping-actions";
import type { ShippingRate } from "@/lib/admin/shipping";

export function ShippingRatesTable({ rates: initial }: { rates: ShippingRate[] }) {
  const [rates, setRates] = useState(initial);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ShippingRate | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ShippingRate | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(input: ShippingRateInput) {
    setSubmitting(true);
    const result = editing ? await updateShippingRateAction(editing.id, input) : await createShippingRateAction(input);
    setSubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (editing) {
      setRates((prev) => prev.map((r) => (r.id === editing.id ? { ...r, ...input } : r)));
      toast.success("Shipping rate updated");
    } else {
      setRates((prev) => [{ id: crypto.randomUUID(), ...input }, ...prev]);
      toast.success("Shipping rate created");
    }
    setFormOpen(false);
    setEditing(null);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    const result = await deleteShippingRateAction(pendingDelete.id, `${pendingDelete.zone} — ${pendingDelete.method}`);
    if (result.error) {
      toast.error(result.error);
      setPendingDelete(null);
      return;
    }
    setRates((prev) => prev.filter((r) => r.id !== pendingDelete.id));
    toast.success("Shipping rate deleted");
    setPendingDelete(null);
  }

  const columns = useMemo<ColumnDef<ShippingRate, unknown>[]>(
    () => [
      { id: "zone", header: "Zone", size: 150, accessorFn: (r) => r.zone, cell: ({ row }) => <span className="font-medium text-foreground">{row.original.zone}</span> },
      { id: "method", header: "Method", size: 160, accessorFn: (r) => r.method, cell: ({ row }) => <span className="text-foreground">{row.original.method}</span> },
      { id: "condition", header: "Condition", size: 150, accessorFn: (r) => r.condition, cell: ({ row }) => <span className="text-muted-foreground">{row.original.condition}</span> },
      { id: "rate", header: "Rate", size: 90, accessorFn: (r) => r.rate, cell: ({ row }) => <span className="tabular-nums text-foreground">{row.original.rate === 0 ? "Free" : formatMoney(row.original.rate)}</span> },
      { id: "estimate", header: "Delivery estimate", size: 170, accessorFn: (r) => r.deliveryEstimate, cell: ({ row }) => <span className="text-muted-foreground">{row.original.deliveryEstimate}</span> },
      { id: "status", header: "Status", size: 100, accessorFn: (r) => r.status, cell: ({ row }) => <StatusBadge status={row.original.status === "active" ? "active" : "archived"} /> },
      {
        id: "actions",
        header: "",
        size: 80,
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
            <Button variant="outline" size="icon-sm" aria-label="Delete" onClick={() => setPendingDelete(row.original)}>
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
      <DataTable
        columns={columns}
        data={rates}
        getRowId={(r) => r.id}
        emptyMessage="No shipping rates yet."
        toolbar={(table) => (
          <>
            <TableSearch table={table} placeholder="Search rates..." />
            <Button
              size="sm"
              className="ml-auto gap-1.5"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              New rate
            </Button>
          </>
        )}
      />

      <ShippingRateFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        rate={editing}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this shipping rate?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.zone} — {pendingDelete?.method}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
