"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminUser, AdminRole, AdminUserStatus } from "@/lib/admin/team";
import type { TeamMemberInput } from "@/lib/admin/team-actions";

const roleItems: Record<AdminRole, string> = {
  Owner: "Owner",
  Admin: "Admin",
  Merchandiser: "Merchandiser",
  Support: "Support",
  "Catalog Manager": "Catalog Manager",
};
const statusItems: Record<AdminUserStatus, string> = { active: "Active", invited: "Invited", disabled: "Disabled" };

interface TeamMemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: AdminUser | null;
  onSubmit: (input: TeamMemberInput) => Promise<void>;
  submitting: boolean;
}

export function TeamMemberFormDialog({ open, onOpenChange, member, onSubmit, submitting }: TeamMemberFormDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("Support");
  const [status, setStatus] = useState<AdminUserStatus>("active");

  useEffect(() => {
    if (open) {
      setName(member?.name ?? "");
      setEmail(member?.email ?? "");
      setRole(member?.role ?? "Support");
      setStatus(member?.status ?? "active");
    }
  }, [open, member]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{member ? "Edit team member" : "Invite team member"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="member-name">Name</Label>
            <Input id="member-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jordan Lee" autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="member-email">Email</Label>
            <Input id="member-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jordan@baruashop.com" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => v && setRole(v as AdminRole)} items={roleItems}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Owner">Owner</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Merchandiser">Merchandiser</SelectItem>
                  <SelectItem value="Support">Support</SelectItem>
                  <SelectItem value="Catalog Manager">Catalog Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => v && setStatus(v as AdminUserStatus)} items={statusItems}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {!member && (
            <p className="text-xs text-muted-foreground">
              A temporary password will be generated and shown once after creating this account.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit({ name, email, role, status })}
            disabled={!name.trim() || !email.trim() || submitting}
          >
            {submitting ? "Saving..." : member ? "Save changes" : "Send invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
