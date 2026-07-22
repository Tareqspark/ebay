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
import type { Campaign, CampaignType, CampaignStatus } from "@/lib/admin/marketing";
import type { CampaignInput } from "@/lib/admin/marketing-actions";

const typeItems: Record<CampaignType, string> = { discount: "Discount", email: "Email", banner: "Banner" };
const statusItems: Record<CampaignStatus, string> = {
  active: "Active",
  scheduled: "Scheduled",
  ended: "Ended",
  draft: "Draft",
};

function toDateInputValue(iso?: string): string {
  return iso ? iso.slice(0, 10) : "";
}

interface CampaignFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
  onSubmit: (input: CampaignInput) => Promise<void>;
  submitting: boolean;
}

export function CampaignFormDialog({ open, onOpenChange, campaign, onSubmit, submitting }: CampaignFormDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<CampaignType>("discount");
  const [status, setStatus] = useState<CampaignStatus>("draft");
  const [channel, setChannel] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (open) {
      setName(campaign?.name ?? "");
      setType(campaign?.type ?? "discount");
      setStatus(campaign?.status ?? "draft");
      setChannel(campaign?.channel ?? "");
      setStartDate(toDateInputValue(campaign?.startDate) || new Date().toISOString().slice(0, 10));
      setEndDate(toDateInputValue(campaign?.endDate));
      setCode(campaign?.code ?? "");
    }
  }, [open, campaign]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{campaign ? "Edit campaign" : "New campaign"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="campaign-name">Name</Label>
            <Input id="campaign-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Labor Day Sale" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => v && setType(v as CampaignType)} items={typeItems}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount">Discount</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="banner">Banner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => v && setStatus(v as CampaignStatus)} items={statusItems}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="campaign-channel">Channel</Label>
            <Input id="campaign-channel" value={channel} onChange={(e) => setChannel(e.target.value)} placeholder="e.g. Email, On-site banner, Social" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="campaign-start">Start date</Label>
              <Input id="campaign-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="campaign-end">End date (optional)</Label>
              <Input id="campaign-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="campaign-code">Discount code (optional)</Label>
            <Input id="campaign-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. LABORDAY20" className="font-mono text-xs" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit({ name, type, status, channel, startDate, endDate, code })}
            disabled={!name.trim() || !channel.trim() || !startDate || submitting}
          >
            {submitting ? "Saving..." : campaign ? "Save changes" : "Create campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
