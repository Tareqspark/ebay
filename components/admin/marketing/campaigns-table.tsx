"use client";

import { DataTable } from "@/components/admin/table/data-table";
import { campaignColumns } from "@/components/admin/marketing/columns";
import type { Campaign } from "@/lib/admin/marketing";

export function CampaignsTable({ campaigns }: { campaigns: Campaign[] }) {
  return <DataTable columns={campaignColumns} data={campaigns} getRowId={(c) => c.id} pageSize={20} />;
}
