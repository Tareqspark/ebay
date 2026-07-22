"use client";

import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminSignOutAction } from "@/lib/admin/auth-actions";

interface UserMenuProps {
  name: string;
  email: string;
  role?: string;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserMenu({ name, email, role }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background"
            aria-label="Account menu"
          >
            {initials(name)}
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <p className="font-medium text-foreground">{name}</p>
            <p className="text-xs font-normal text-muted-foreground">{email}</p>
            {role && <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">{role}</p>}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/admin/settings/users"><User />Profile</Link>} />
        <DropdownMenuItem render={<Link href="/admin/settings"><Settings />Settings</Link>} />
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => adminSignOutAction()}>
          <LogOut />Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
