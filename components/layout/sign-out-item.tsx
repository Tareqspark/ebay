"use client";

import { LogOut } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/lib/auth-actions";

export function SignOutItem() {
  return (
    <DropdownMenuItem onClick={() => signOutAction()}>
      <LogOut />
      Sign Out
    </DropdownMenuItem>
  );
}
