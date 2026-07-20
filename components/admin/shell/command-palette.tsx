"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FolderTree,
  Package,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { flattenNav } from "@/lib/admin/nav";
import { PRODUCTS } from "@/app/data/products";
import { CATEGORIES } from "@/app/data/categories";
import { ORDERS } from "@/app/data/admin/orders";
import { CUSTOMERS } from "@/app/data/admin/customers";

const navDestinations = flattenNav();

const QUICK_ACTIONS = [
  { label: "Create product", href: "/admin/products?new=1", icon: Plus },
  { label: "Create collection", href: "/admin/collections", icon: Plus },
  { label: "Run supplier sync", href: "/admin/supplier/queue", icon: RefreshCw },
  { label: "Open store settings", href: "/admin/settings", icon: Settings },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const go = useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(href);
    },
    [onOpenChange, router]
  );

  const q = query.trim().toLowerCase();

  const productMatches = useMemo(() => {
    if (q.length < 2) return [];
    return PRODUCTS.filter((p) => p.title.toLowerCase().includes(q)).slice(0, 5);
  }, [q]);

  const orderMatches = useMemo(() => {
    if (q.length < 2) return [];
    return ORDERS.filter((o) => o.id.toLowerCase().includes(q)).slice(0, 5);
  }, [q]);

  const customerMatches = useMemo(() => {
    if (q.length < 2) return [];
    return CUSTOMERS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [q]);

  const categoryMatches = useMemo(() => {
    if (q.length < 2) return [];
    return CATEGORIES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 4);
  }, [q]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Global search"
      description="Search products, orders, customers, and more"
    >
      <Command shouldFilter={false}>
      <CommandInput
        placeholder="Search products, orders, customers, settings..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results for &ldquo;{query}&rdquo;</CommandEmpty>

        {q.length < 2 && (
          <>
            <CommandGroup heading="Quick actions">
              {QUICK_ACTIONS.map((action) => (
                <CommandItem key={action.label} onSelect={() => go(action.href)}>
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Go to">
              {navDestinations.slice(0, 9).map((dest) => (
                <CommandItem key={dest.href + dest.label} onSelect={() => go(dest.href)}>
                  <Search className="h-4 w-4" />
                  {dest.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {productMatches.length > 0 && (
          <CommandGroup heading="Products">
            {productMatches.map((p) => (
              <CommandItem key={p.id} onSelect={() => go(`/admin/products?q=${encodeURIComponent(p.title)}`)}>
                <Package className="h-4 w-4" />
                <span className="truncate">{p.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {orderMatches.length > 0 && (
          <CommandGroup heading="Orders">
            {orderMatches.map((o) => (
              <CommandItem key={o.id} onSelect={() => go(`/admin/orders?q=${encodeURIComponent(o.id)}`)}>
                <ShoppingCart className="h-4 w-4" />
                {o.id}
                <span className="ml-auto text-xs text-muted-foreground">
                  ${o.total.toFixed(2)}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {customerMatches.length > 0 && (
          <CommandGroup heading="Customers">
            {customerMatches.map((c) => (
              <CommandItem key={c.id} onSelect={() => go(`/admin/customers?q=${encodeURIComponent(c.name)}`)}>
                <Users className="h-4 w-4" />
                {c.name}
                <span className="ml-auto truncate text-xs text-muted-foreground">{c.email}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {categoryMatches.length > 0 && (
          <CommandGroup heading="Categories">
            {categoryMatches.map((c) => (
              <CommandItem key={c.id} onSelect={() => go("/admin/categories")}>
                <FolderTree className="h-4 w-4" />
                {c.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {q.length >= 2 && (
          <CommandGroup heading="Navigation & settings">
            {navDestinations
              .filter((d) => d.label.toLowerCase().includes(q))
              .slice(0, 6)
              .map((dest) => (
                <CommandItem key={dest.href + dest.label} onSelect={() => go(dest.href)}>
                  <Search className="h-4 w-4" />
                  {dest.label}
                </CommandItem>
              ))}
          </CommandGroup>
        )}
      </CommandList>
      </Command>
    </CommandDialog>
  );
}
