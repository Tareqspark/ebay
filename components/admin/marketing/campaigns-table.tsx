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
import { getCampaignColumns } from "@/components/admin/marketing/columns";
import { CampaignFormDialog } from "@/components/admin/marketing/campaign-form-dialog";
import { createCampaignAction, updateCampaignAction, deleteCampaignAction } from "@/lib/admin/marketing-actions";
import type { CampaignInput } from "@/lib/admin/marketing-actions";
import type { Campaign } from "@/lib/admin/marketing";

export function CampaignsTable({ campaigns: initial }: { campaigns: Campaign[] }) {
  const [campaigns, setCampaigns] = useState(initial);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Campaign | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(input: CampaignInput) {
    setSubmitting(true);
    const result = editing ? await updateCampaignAction(editing.id, input) : await createCampaignAction(input);
    setSubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    const startDate = new Date(input.startDate).toISOString();
    const endDate = input.endDate ? new Date(input.endDate).toISOString() : undefined;
    if (editing) {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === editing.id
            ? { ...c, name: input.name, type: input.type, status: input.status, channel: input.channel, startDate, endDate, code: input.code || undefined }
            : c
        )
      );
      toast.success("Campaign updated");
    } else {
      setCampaigns((prev) => [
        {
          id: crypto.randomUUID(),
          name: input.name,
          type: input.type,
          status: input.status,
          channel: input.channel,
          startDate,
          endDate,
          code: input.code || undefined,
          redemptions: 0,
          revenueAttributed: 0,
        },
        ...prev,
      ]);
      toast.success("Campaign created");
    }
    setFormOpen(false);
    setEditing(null);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    const result = await deleteCampaignAction(pendingDelete.id, pendingDelete.name);
    if (result.error) {
      toast.error(result.error);
      setPendingDelete(null);
      return;
    }
    setCampaigns((prev) => prev.filter((c) => c.id !== pendingDelete.id));
    toast.success("Campaign deleted");
    setPendingDelete(null);
  }

  const columns = useMemo(
    () =>
      getCampaignColumns({
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
        data={campaigns}
        getRowId={(c) => c.id}
        emptyMessage="No campaigns yet."
        toolbar={(table) => (
          <>
            <TableSearch table={table} placeholder="Search campaigns..." />
            <Button
              size="sm"
              className="ml-auto gap-1.5"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              New campaign
            </Button>
          </>
        )}
      />

      <CampaignFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        campaign={editing}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{pendingDelete?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>This removes the campaign. This action cannot be undone.</AlertDialogDescription>
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
