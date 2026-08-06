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
import { getBannerColumns } from "@/components/admin/banners/columns";
import { BannerFormDialog } from "@/components/admin/banners/banner-form-dialog";
import { createBannerAction, updateBannerAction, deleteBannerAction } from "@/lib/admin/banner-actions";
import type { BannerInput } from "@/lib/admin/banner-actions";
import type { AdminBanner } from "@/lib/admin/banner-constants";

interface BannersTableProps {
  banners: AdminBanner[];
  categoryOptions: { value: string; label: string }[];
  collectionOptions: { value: string; label: string }[];
}

export function BannersTable({ banners, categoryOptions, collectionOptions }: BannersTableProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBanner | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminBanner | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(input: BannerInput) {
    setSubmitting(true);
    const result = editing ? await updateBannerAction(editing.id, input) : await createBannerAction(input);
    setSubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(editing ? "Banner updated" : "Banner created");
    router.refresh();
    setFormOpen(false);
    setEditing(null);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    const result = await deleteBannerAction(pendingDelete.id, pendingDelete.name);
    if (result.error) {
      toast.error(result.error);
      setPendingDelete(null);
      return;
    }
    toast.success("Banner deleted");
    router.refresh();
    setPendingDelete(null);
  }

  const columns = useMemo(
    () =>
      getBannerColumns({
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
        data={banners}
        getRowId={(b) => b.id}
        emptyMessage="No banners yet."
        toolbar={(table) => (
          <>
            <TableSearch table={table} placeholder="Search banners..." />
            <Button
              size="sm"
              className="ml-auto gap-1.5"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              New banner
            </Button>
          </>
        )}
      />

      <BannerFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        banner={editing}
        categoryOptions={categoryOptions}
        collectionOptions={collectionOptions}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{pendingDelete?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the banner from the storefront and deletes its uploaded image. This action cannot be undone.
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
