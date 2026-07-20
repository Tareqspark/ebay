"use client";

import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background"
            aria-label="Account menu"
          >
            PP
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="font-medium text-foreground">Priya Patel</p>
          <p className="text-xs font-normal text-muted-foreground">priya@baruashop.com</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/admin/settings/users"><User />Profile</Link>} />
        <DropdownMenuItem render={<Link href="/admin/settings"><Settings />Settings</Link>} />
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" render={<Link href="/"><LogOut />Sign out</Link>} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
