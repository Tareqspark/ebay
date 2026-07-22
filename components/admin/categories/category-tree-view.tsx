"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ExternalLink, MoreHorizontal, Plus, Search, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { CategoryFormDialog } from "@/components/admin/categories/category-form-dialog";
import { CATEGORY_ICONS } from "@/lib/category-icons";
import { cn } from "@/lib/utils";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction, moveCategoryAction } from "@/lib/admin/category-actions";
import type { CategoryInput } from "@/lib/admin/category-actions";
import type { CategoryTreeRow, CategoryLevel } from "@/lib/admin/categories";

const NEXT_LEVEL: Record<CategoryLevel, CategoryLevel | null> = { top: "child", child: "grandchild", grandchild: null };

interface DialogState {
  mode: "create" | "edit";
  level: CategoryLevel;
  parentId: string | null;
  parentName?: string;
  category: CategoryTreeRow | null;
}

export function CategoryTreeView({ tree }: { tree: CategoryTreeRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CategoryTreeRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [, startTransition] = useTransition();

  const filteredTree = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tree;
    function filterNode(node: CategoryTreeRow): CategoryTreeRow | null {
      const matches = node.name.toLowerCase().includes(q);
      const children = node.children.map(filterNode).filter((n): n is CategoryTreeRow => n !== null);
      if (matches || children.length > 0) return { ...node, children };
      return null;
    }
    return tree.map(filterNode).filter((n): n is CategoryTreeRow => n !== null);
  }, [tree, query]);

  async function handleSubmit(input: CategoryInput) {
    setSubmitting(true);
    const result =
      dialog?.mode === "edit" && dialog.category
        ? await updateCategoryAction(dialog.category.id, input)
        : await createCategoryAction(dialog!.parentId, dialog!.level, input);
    setSubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(dialog?.mode === "edit" ? "Category updated" : "Category created");
    setDialog(null);
    startTransition(() => router.refresh());
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    const result = await deleteCategoryAction(pendingDelete.id);
    if (result.error) {
      toast.error(result.error);
      setPendingDelete(null);
      return;
    }
    toast.success("Category deleted");
    setPendingDelete(null);
    startTransition(() => router.refresh());
  }

  async function handleMove(node: CategoryTreeRow, direction: "up" | "down") {
    const result = await moveCategoryAction(node.id, direction);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search categories..."
            autoComplete="off"
            suppressHydrationWarning
            className="h-8 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <Button
          size="sm"
          className="ml-auto gap-1.5"
          onClick={() => setDialog({ mode: "create", level: "top", parentId: null, category: null })}
        >
          <Plus className="h-3.5 w-3.5" />
          New category
        </Button>
      </div>
      <div className="rounded-lg border border-border bg-card">
        <div className="grid grid-cols-[1fr_110px_90px_120px] gap-2 border-b border-border px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>Category</span>
          <span className="text-right">Products</span>
          <span>Featured</span>
          <span></span>
        </div>
        <div>
          {filteredTree.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">No categories match this search.</p>
          )}
          {filteredTree.map((node, i) => (
            <CategoryRow
              key={node.id}
              node={node}
              depth={0}
              forceOpen={query.trim().length > 0}
              isFirst={i === 0}
              isLast={i === filteredTree.length - 1}
              onEdit={(n) => setDialog({ mode: "edit", level: n.level, parentId: n.parentId, category: n })}
              onAddChild={(n) => {
                const nextLevel = NEXT_LEVEL[n.level];
                if (nextLevel) setDialog({ mode: "create", level: nextLevel, parentId: n.id, parentName: n.name, category: null });
              }}
              onDelete={setPendingDelete}
              onMove={handleMove}
            />
          ))}
        </div>
      </div>

      {dialog && (
        <CategoryFormDialog
          open={dialog !== null}
          onOpenChange={(open) => !open && setDialog(null)}
          category={dialog.mode === "edit" ? dialog.category : null}
          level={dialog.level}
          parentName={dialog.parentName}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{pendingDelete?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This only works if it has no subcategories and no products left in it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface CategoryRowProps {
  node: CategoryTreeRow;
  depth: number;
  forceOpen: boolean;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (node: CategoryTreeRow) => void;
  onAddChild: (node: CategoryTreeRow) => void;
  onDelete: (node: CategoryTreeRow) => void;
  onMove: (node: CategoryTreeRow, direction: "up" | "down") => void;
}

function CategoryRow({ node, depth, forceOpen, isFirst, isLast, onEdit, onAddChild, onDelete, onMove }: CategoryRowProps) {
  const [open, setOpen] = useState(false);
  const isOpen = forceOpen || open;
  const hasChildren = node.children.length > 0;
  const href = `/category/${node.slugPath.join("/")}`;
  const Icon = node.level === "top" ? CATEGORY_ICONS[node.iconName ?? ""] : null;
  const canAddChild = node.level !== "grandchild";

  return (
    <div>
      <div className="grid grid-cols-[1fr_110px_90px_120px] items-center gap-2 border-b border-border/60 px-3 py-2 text-sm last:border-0 hover:bg-muted/40">
        <div className="flex min-w-0 items-center gap-1" style={{ paddingLeft: `${depth * 18}px` }}>
          {hasChildren ? (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-label={isOpen ? "Collapse" : "Expand"}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground"
            >
              <motion.span animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.15 }} className="flex">
                <ChevronRight className="h-3.5 w-3.5" />
              </motion.span>
            </button>
          ) : (
            <span className="w-5 shrink-0" />
          )}
          {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
          <span className={cn("truncate", depth === 0 ? "font-medium text-foreground" : "text-foreground")}>
            {node.name}
          </span>
        </div>
        <span className="text-right tabular-nums text-muted-foreground">{node.productCount.toLocaleString()}</span>
        <span>
          {node.featured && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <Star className="h-3 w-3 fill-current" />
              Featured
            </span>
          )}
        </span>
        <div className="flex items-center justify-end gap-1">
          <Link
            href={href}
            target="_blank"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            View
            <ExternalLink className="h-3 w-3" />
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Category actions">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(node)}>Edit</DropdownMenuItem>
              {canAddChild && <DropdownMenuItem onClick={() => onAddChild(node)}>Add subcategory</DropdownMenuItem>}
              <DropdownMenuItem disabled={isFirst} onClick={() => onMove(node, "up")}>Move up</DropdownMenuItem>
              <DropdownMenuItem disabled={isLast} onClick={() => onMove(node, "down")}>Move down</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(node)}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {hasChildren && (
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="overflow-hidden"
            >
              {node.children.map((child, i) => (
                <CategoryRow
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  forceOpen={forceOpen}
                  isFirst={i === 0}
                  isLast={i === node.children.length - 1}
                  onEdit={onEdit}
                  onAddChild={onAddChild}
                  onDelete={onDelete}
                  onMove={onMove}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
