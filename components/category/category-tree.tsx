"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryTreeNode } from "@/lib/category-utils";

interface CategoryTreeProps {
  nodes: CategoryTreeNode[];
  className?: string;
  onNavigate?: () => void;
}

export function CategoryTree({ nodes, className, onNavigate }: CategoryTreeProps) {
  return (
    <nav className={cn("flex flex-col", className)} aria-label="Category navigation">
      {nodes.map((node) => (
        <CategoryTreeItem key={node.id} node={node} depth={0} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}

function CategoryTreeItem({
  node,
  depth,
  onNavigate,
}: {
  node: CategoryTreeNode;
  depth: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === node.href;
  const isAncestorOfActive = pathname?.startsWith(node.href + "/") ?? false;
  const [open, setOpen] = useState(isAncestorOfActive);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center rounded-md pr-1 text-sm transition-colors",
          isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
        )}
        style={{ paddingLeft: `${depth * 14 + 4}px` }}
      >
        <Link href={node.href} onClick={onNavigate} className="min-w-0 flex-1 truncate py-1.5">
          {node.name}
        </Link>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? `Collapse ${node.name}` : `Expand ${node.name}`}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-background"
          >
            <motion.span
              animate={{ rotate: open ? 90 : 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </motion.span>
          </button>
        )}
      </div>
      {hasChildren && (
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              {node.children.map((child) => (
                <CategoryTreeItem key={child.id} node={child} depth={depth + 1} onNavigate={onNavigate} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
