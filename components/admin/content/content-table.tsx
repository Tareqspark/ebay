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
import { getContentColumns } from "@/components/admin/content/columns";
import { ContentFormDialog } from "@/components/admin/content/content-form-dialog";
import { createContentAction, updateContentAction, deleteContentAction } from "@/lib/admin/content-actions";
import type { ContentInput } from "@/lib/admin/content-actions";
import type { ContentItem } from "@/lib/admin/content";

export function ContentTable({ items: initial }: { items: ContentItem[] }) {
  const [items, setItems] = useState(initial);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ContentItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(input: ContentInput) {
    setSubmitting(true);
    const result = editing ? await updateContentAction(editing.id, input) : await createContentAction(input);
    setSubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (editing) {
      setItems((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...input, updatedAt: new Date().toISOString() } : c)));
      toast.success("Content updated");
    } else {
      setItems((prev) => [
        { id: crypto.randomUUID(), ...input, updatedAt: new Date().toISOString() },
        ...prev,
      ]);
      toast.success("Content created");
    }
    setFormOpen(false);
    setEditing(null);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    const result = await deleteContentAction(pendingDelete.id, pendingDelete.title);
    if (result.error) {
      toast.error(result.error);
      setPendingDelete(null);
      return;
    }
    setItems((prev) => prev.filter((c) => c.id !== pendingDelete.id));
    toast.success("Content deleted");
    setPendingDelete(null);
  }

  const columns = useMemo(
    () =>
      getContentColumns({
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
        data={items}
        getRowId={(c) => c.id}
        emptyMessage="No content yet."
        toolbar={(table) => (
          <>
            <TableSearch table={table} placeholder="Search content..." />
            <Button
              size="sm"
              className="ml-auto gap-1.5"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              New content
            </Button>
          </>
        )}
      />

      <ContentFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        item={editing}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{pendingDelete?.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>This removes the content item. This action cannot be undone.</AlertDialogDescription>
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
