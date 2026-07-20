"use client";

import { DataTable } from "@/components/admin/table/data-table";
import { contentColumns } from "@/components/admin/content/columns";
import type { ContentItem } from "@/lib/admin/content";

export function ContentTable({ items }: { items: ContentItem[] }) {
  return <DataTable columns={contentColumns} data={items} getRowId={(c) => c.id} pageSize={20} />;
}
