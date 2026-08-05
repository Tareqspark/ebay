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
import { getCollectionColumns } from "@/components/admin/collections/columns";
import { CollectionFormDialog } from "@/components/admin/collections/collection-form-dialog";
import { createCollectionAction, updateCollectionAction, deleteCollectionAction } from "@/lib/admin/collection-actions";
import type { CollectionInput } from "@/lib/admin/collection-actions";
import type { Collection } from "@/lib/admin/collections";

interface CollectionsTableProps {
  collections: Collection[];
  topCategoryOptions: { value: string; label: string }[];
}

export function CollectionsTable({ collections, topCategoryOptions }: CollectionsTableProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Collection | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Real product counts, slugs, and membership are all server-computed —
  // refetching via router.refresh() after a mutation is simpler and more
  // correct than hand-patching an optimistic guess for those values.
  async function handleSubmit(input: CollectionInput) {
    setSubmitting(true);
    const result = editing
      ? await updateCollectionAction(editing.id, input)
      : await createCollectionAction(input);
    setSubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(editing ? "Collection updated" : "Collection created");
    router.refresh();
    setFormOpen(false);
    setEditing(null);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    const result = await deleteCollectionAction(pendingDelete.id, pendingDelete.name);
    if (result.error) {
      toast.error(result.error);
      setPendingDelete(null);
      return;
    }
    toast.success("Collection deleted");
    router.refresh();
    setPendingDelete(null);
  }

  const columns = useMemo(
    () =>
      getCollectionColumns({
        onEdit: (c) => {
          setEditing(c);
          setFormOpen(true);
        },
        onDelete: (c) => setPendingDelete(c),
      }),
    []
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={collections}
        getRowId={(c) => c.id}
        emptyMessage="No collections yet."
        toolbar={(table) => (
          <>
            <TableSearch table={table} placeholder="Search collections..." />
            <Button
              size="sm"
              className="ml-auto gap-1.5"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              New collection
            </Button>
          </>
        )}
      />

      <CollectionFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        collection={editing}
        topCategoryOptions={topCategoryOptions}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{pendingDelete?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the collection from the storefront and admin. This action cannot be undone.
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
