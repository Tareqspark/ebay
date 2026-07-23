"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { getBundleColumns } from "@/components/admin/bundles/columns";
import { BundleFormDialog } from "@/components/admin/bundles/bundle-form-dialog";
import { createBundleAction, updateBundleAction, deleteBundleAction } from "@/lib/admin/bundle-actions";
import type { BundleInput } from "@/lib/admin/bundle-actions";
import type { AdminBundle } from "@/lib/admin/bundles";

// Bundle rows carry nested product thumbnails the create/update actions
// don't echo back, so — like the category tree — this table refreshes
// from the server after a mutation instead of optimistically patching
// local state; reconstructing that nested shape client-side isn't worth it.
export function BundlesTable({ bundles }: { bundles: AdminBundle[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBundle | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminBundle | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(input: BundleInput) {
    setSubmitting(true);
    const result = editing ? await updateBundleAction(editing.id, input) : await createBundleAction(input);
    setSubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(editing ? "Bundle updated" : "Bundle created");
    setFormOpen(false);
    setEditing(null);
    router.refresh();
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    const result = await deleteBundleAction(pendingDelete.id, pendingDelete.name);
    if (result.error) {
      toast.error(result.error);
      setPendingDelete(null);
      return;
    }
    toast.success("Bundle deleted");
    setPendingDelete(null);
    router.refresh();
  }

  const columns = useMemo(
    () =>
      getBundleColumns({
        onEdit: (b) => {
          setEditing(b);
          setFormOpen(true);
        },
        onDelete: (b) => setPendingDelete(b),
      }),
    []
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={bundles}
        getRowId={(b) => b.id}
        emptyMessage="No bundles yet."
        toolbar={(table) => (
          <>
            <TableSearch table={table} placeholder="Search bundles..." />
            <Button
              size="sm"
              className="ml-auto gap-1.5"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              New bundle
            </Button>
          </>
        )}
      />

      <BundleFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        bundle={editing}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{pendingDelete?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>This removes the bundle and its discount. This action cannot be undone.</AlertDialogDescription>
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
