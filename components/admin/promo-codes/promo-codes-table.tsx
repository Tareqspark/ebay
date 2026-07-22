"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
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
import { getPromoCodeColumns } from "@/components/admin/promo-codes/columns";
import { PromoCodeFormDialog } from "@/components/admin/promo-codes/promo-code-form-dialog";
import { createPromoCodeAction, updatePromoCodeAction, deletePromoCodeAction } from "@/lib/admin/promo-actions";
import type { PromoCodeInput } from "@/lib/admin/promo-actions";
import type { PromoCode } from "@/lib/admin/promos";

export function PromoCodesTable({ promoCodes: initial }: { promoCodes: PromoCode[] }) {
  const [promoCodes, setPromoCodes] = useState(initial);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PromoCode | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(input: PromoCodeInput) {
    setSubmitting(true);
    const result = editing ? await updatePromoCodeAction(editing.id, input) : await createPromoCodeAction(input);
    setSubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    const code = input.code.trim().toUpperCase();
    const startDate = new Date(input.startDate).toISOString();
    const endDate = input.endDate ? new Date(input.endDate).toISOString() : undefined;

    if (editing) {
      setPromoCodes((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? {
                ...p,
                code,
                discountType: input.discountType,
                discountPercent: input.discountType === "percent" ? input.discountPercent : undefined,
                discountAmount: input.discountType === "fixed" ? input.discountAmount : undefined,
                usageLimit: input.usageLimit,
                minOrderAmount: input.minOrderAmount,
                status: input.status,
                startDate,
                endDate,
              }
            : p
        )
      );
      toast.success("Promo code updated");
    } else {
      setPromoCodes((prev) => [
        {
          id: crypto.randomUUID(),
          code,
          discountType: input.discountType,
          discountPercent: input.discountType === "percent" ? input.discountPercent : undefined,
          discountAmount: input.discountType === "fixed" ? input.discountAmount : undefined,
          usageLimit: input.usageLimit,
          minOrderAmount: input.minOrderAmount,
          status: input.status,
          startDate,
          endDate,
          usageCount: 0,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      toast.success("Promo code created");
    }
    setFormOpen(false);
    setEditing(null);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    const result = await deletePromoCodeAction(pendingDelete.id, pendingDelete.code);
    if (result.error) {
      toast.error(result.error);
      setPendingDelete(null);
      return;
    }
    setPromoCodes((prev) => prev.filter((p) => p.id !== pendingDelete.id));
    toast.success("Promo code deleted");
    setPendingDelete(null);
  }

  const columns = useMemo(
    () =>
      getPromoCodeColumns({
        onEdit: (p) => {
          setEditing(p);
          setFormOpen(true);
        },
        onDelete: (p) => setPendingDelete(p),
      }),
    []
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={promoCodes}
        getRowId={(p) => p.id}
        emptyMessage="No promo codes yet."
        toolbar={(table) => (
          <>
            <TableSearch table={table} placeholder="Search promo codes..." />
            <Button
              size="sm"
              className="ml-auto gap-1.5"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              New promo code
            </Button>
          </>
        )}
      />

      <PromoCodeFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        promo={editing}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{pendingDelete?.code}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the promo code. Past orders that used it keep their own record — this only stops future
              use. This action cannot be undone.
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
