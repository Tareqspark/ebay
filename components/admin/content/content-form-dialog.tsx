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
import type { ContentItem, ContentType, ContentStatus } from "@/lib/admin/content";
import type { ContentInput } from "@/lib/admin/content-actions";

const typeItems: Record<ContentType, string> = { page: "Page", banner: "Banner", hero_slide: "Hero slide" };
const statusItems: Record<ContentStatus, string> = { published: "Published", draft: "Draft" };

interface ContentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ContentItem | null;
  onSubmit: (input: ContentInput) => Promise<void>;
  submitting: boolean;
}

export function ContentFormDialog({ open, onOpenChange, item, onSubmit, submitting }: ContentFormDialogProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ContentType>("page");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<ContentStatus>("draft");

  useEffect(() => {
    if (open) {
      setTitle(item?.title ?? "");
      setType(item?.type ?? "page");
      setLocation(item?.location ?? "");
      setStatus(item?.status ?? "draft");
    }
  }, [open, item]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Edit content" : "New content"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="content-title">Title</Label>
            <Input id="content-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Homepage Hero — Summer Sale" autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => v && setType(v as ContentType)} items={typeItems}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="page">Page</SelectItem>
                <SelectItem value="banner">Banner</SelectItem>
                <SelectItem value="hero_slide">Hero slide</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="content-location">Location</Label>
            <Input id="content-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. /homepage/hero" className="font-mono text-xs" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => v && setStatus(v as ContentStatus)} items={statusItems}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="published">Published</SelectItem>
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
            onClick={() => onSubmit({ title, type, location, status })}
            disabled={!title.trim() || !location.trim() || submitting}
          >
            {submitting ? "Saving..." : item ? "Save changes" : "Create content"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
