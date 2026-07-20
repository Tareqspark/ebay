"use client";

import { DataTable } from "@/components/admin/table/data-table";
import { collectionColumns } from "@/components/admin/collections/columns";
import type { Collection } from "@/lib/admin/collections";

export function CollectionsTable({ collections }: { collections: Collection[] }) {
  return <DataTable columns={collectionColumns} data={collections} getRowId={(c) => c.id} pageSize={20} />;
}
