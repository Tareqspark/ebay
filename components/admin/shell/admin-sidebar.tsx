"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, PanelLeftClose, PanelLeftOpen, ShoppingBag } from "lucide-react";
import { ADMIN_NAV, type AdminNavItem } from "@/lib/admin/nav";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200",
        collapsed ? "w-[60px]" : "w-[232px]"
      )}
    >
      <div className={cn("flex h-14 items-center border-b border-border", collapsed ? "justify-center px-0" : "justify-between px-4")}>
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
              <ShoppingBag className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-foreground">Baruashop</span>
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 [scrollbar-width:thin]">
        {ADMIN_NAV.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed && (
              <p className="mb-1 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                {group.label}
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <SidebarItem key={item.href} item={item} collapsed={collapsed} depth={0} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">Baruashop Admin v1.0</p>
        </div>
      )}
    </aside>
  );
}

function SidebarItem({
  item,
  collapsed,
  depth,
}: {
  item: AdminNavItem;
  collapsed: boolean;
  depth: number;
}) {
  const pathname = usePathname();
  const hasChildren = (item.children?.length ?? 0) > 0;
  const baseHref = item.href.split("?")[0];
  const isExact = pathname === baseHref;
  const isSection =
    baseHref !== "/admin" ? pathname.startsWith(baseHref + "/") || isExact : isExact;
  const [open, setOpen] = useState(isSection);
  const Icon = item.icon;

  if (collapsed && depth === 0) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href={item.href}
              aria-label={item.label}
              className={cn(
                "flex h-9 items-center justify-center rounded-md transition-colors",
                isSection ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
            </Link>
          }
        />
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div>
      <div
        className={cn(
          "group flex items-center rounded-md text-sm transition-colors",
          isExact
            ? "bg-muted font-medium text-foreground"
            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
        )}
      >
        <Link
          href={item.href}
          className="flex min-w-0 flex-1 items-center gap-2.5 px-2 py-1.5"
          style={depth > 0 ? { paddingLeft: `${depth * 20 + 8}px` } : undefined}
        >
          {Icon && <Icon className="h-4 w-4 shrink-0" />}
          <span className="truncate">{item.label}</span>
        </Link>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? `Collapse ${item.label}` : `Expand ${item.label}`}
            className="mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground/70 hover:text-foreground"
          >
            <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }} className="flex">
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
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-0.5 pt-0.5">
                {item.children!.map((child) => (
                  <SidebarChildLink key={child.href} item={child} depth={depth + 1} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

function SidebarChildLink({ item, depth }: { item: AdminNavItem; depth: number }) {
  const pathname = usePathname();
  const baseHref = item.href.split("?")[0];
  const hasQuery = item.href.includes("?");
  const isActive = !hasQuery && pathname === baseHref;

  if (item.children?.length) {
    return <SidebarItem item={item} collapsed={false} depth={depth} />;
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "rounded-md py-1.5 pr-2 text-sm transition-colors",
        isActive
          ? "bg-muted font-medium text-foreground"
          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
      )}
      style={{ paddingLeft: `${depth * 20 + 14}px` }}
    >
      {item.label}
    </Link>
  );
}
