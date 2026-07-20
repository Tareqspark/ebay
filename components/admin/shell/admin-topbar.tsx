"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/shell/admin-breadcrumb";
import { NotificationCenter } from "@/components/admin/shell/notification-center";
import { UserMenu } from "@/components/admin/shell/user-menu";
import { CommandPalette } from "@/components/admin/shell/command-palette";

export function AdminTopbar() {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur">
      <AdminBreadcrumb />

      <div className="flex flex-1 items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex h-8 w-full max-w-xs items-center gap-2 rounded-lg border border-border bg-muted/40 px-2.5 text-sm text-muted-foreground transition-colors hover:border-ring/40 hover:text-foreground"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </button>
        <NotificationCenter />
        <UserMenu />
      </div>

      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
