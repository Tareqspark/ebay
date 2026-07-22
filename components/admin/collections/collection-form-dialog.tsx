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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Collection, CollectionType, CollectionStatus } from "@/lib/admin/collections";
import type { CollectionInput } from "@/lib/admin/collection-actions";

const typeItems: Record<CollectionType, string> = { manual: "Manual", automated: "Automated" };
const statusItems: Record<CollectionStatus, string> = { active: "Active", draft: "Draft" };

interface CollectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: Collection | null;
  onSubmit: (input: CollectionInput) => Promise<void>;
  submitting: boolean;
}

export function CollectionFormDialog({ open, onOpenChange, collection, onSubmit, submitting }: CollectionFormDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<CollectionType>("manual");
  const [ruleDescription, setRuleDescription] = useState("");
  const [status, setStatus] = useState<CollectionStatus>("draft");

  useEffect(() => {
    if (open) {
      setName(collection?.name ?? "");
      setType(collection?.type ?? "manual");
      setRuleDescription(collection?.ruleDescription ?? "");
      setStatus(collection?.status ?? "draft");
    }
  }, [open, collection]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{collection ? "Edit collection" : "New collection"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="collection-name">Name</Label>
            <Input id="collection-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Summer Essentials" autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => v && setType(v as CollectionType)} items={typeItems}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="automated">Automated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="collection-rule">Rule description</Label>
            <Textarea
              id="collection-rule"
              value={ruleDescription}
              onChange={(e) => setRuleDescription(e.target.value)}
              placeholder={type === "automated" ? "e.g. category:electronics AND rating>=4" : "Optional — leave blank for manually curated"}
              rows={2}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => v && setStatus(v as CollectionStatus)} items={statusItems}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit({ name, type, ruleDescription, status })}
            disabled={!name.trim() || submitting}
          >
            {submitting ? "Saving..." : collection ? "Save changes" : "Create collection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
