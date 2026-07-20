import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shared/page-header";
import { CategoryTreeView } from "@/components/admin/categories/category-tree-view";
import { getCategoryTree, getCategoryTotals } from "@/lib/admin/categories";

export const metadata: Metadata = { title: "Categories" };

export default function AdminCategoriesPage() {
  const tree = getCategoryTree();
  const totals = getCategoryTotals();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Categories"
        description={`${totals.top} top-level, ${totals.child} child, ${totals.grandchild} grandchild — ${totals.total.toLocaleString()} total`}
      />
      <CategoryTreeView tree={tree} />
    </div>
  );
}
