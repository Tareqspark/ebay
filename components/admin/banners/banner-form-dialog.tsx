"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BannerImageUpload } from "@/components/admin/banners/banner-image-upload";
import { BannerLinkPicker } from "@/components/admin/banners/banner-link-picker";
import {
  PLACEMENT_LABELS,
  LINK_TYPE_LABELS,
  type AdminBanner,
  type BannerPlacement,
  type BannerLinkType,
  type BannerStatus,
} from "@/lib/admin/banners";
import type { BannerInput } from "@/lib/admin/banner-actions";

const statusItems: Record<BannerStatus, string> = { active: "Active", draft: "Draft" };

/** <input type="date"> wants yyyy-mm-dd; the row stores a full ISO timestamp. */
function toDateInput(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

interface BannerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner: AdminBanner | null;
  categoryOptions: { value: string; label: string }[];
  collectionOptions: { value: string; label: string }[];
  onSubmit: (input: BannerInput) => Promise<void>;
  submitting: boolean;
}

export function BannerFormDialog({
  open,
  onOpenChange,
  banner,
  categoryOptions,
  collectionOptions,
  onSubmit,
  submitting,
}: BannerFormDialogProps) {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [placement, setPlacement] = useState<BannerPlacement>("homepage-top");
  const [linkType, setLinkType] = useState<BannerLinkType>("none");
  const [linkValue, setLinkValue] = useState("");
  const [status, setStatus] = useState<BannerStatus>("draft");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [sortOrder, setSortOrder] = useState("0");

  useEffect(() => {
    if (!open) return;
    setName(banner?.name ?? "");
    setImageUrl(banner?.imageUrl ?? "");
    setAltText(banner?.altText ?? "");
    setPlacement(banner?.placement ?? "homepage-top");
    setLinkType(banner?.linkType ?? "none");
    setLinkValue(banner?.linkValue ?? "");
    setStatus(banner?.status ?? "draft");
    setStartsAt(toDateInput(banner?.startsAt ?? null));
    setEndsAt(toDateInput(banner?.endsAt ?? null));
    setSortOrder(String(banner?.sortOrder ?? 0));
  }, [open, banner]);

  // Switching link type invalidates whatever the previous type's value was —
  // a product slug is meaningless once the type is "external".
  function changeLinkType(next: BannerLinkType) {
    setLinkType(next);
    setLinkValue("");
  }

  const canSubmit =
    name.trim().length > 0 &&
    imageUrl.length > 0 &&
    altText.trim().length > 0 &&
    (linkType === "none" || linkValue.trim().length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{banner ? "Edit banner" : "New banner"}</DialogTitle>
        </DialogHeader>
        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="banner-name">Name</Label>
            <Input
              id="banner-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Internal label, e.g. Summer sale — homepage"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Image</Label>
            <BannerImageUpload value={imageUrl} onChange={setImageUrl} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="banner-alt">Alt text</Label>
            <Input
              id="banner-alt"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describes the banner for screen readers and when the image fails to load"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Placement</Label>
            <Select
              value={placement}
              onValueChange={(v) => v && setPlacement(v as BannerPlacement)}
              items={PLACEMENT_LABELS}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PLACEMENT_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Links to</Label>
            <Select value={linkType} onValueChange={(v) => v && changeLinkType(v as BannerLinkType)} items={LINK_TYPE_LABELS}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LINK_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {linkType === "product" && <BannerLinkPicker value={linkValue} onChange={setLinkValue} />}

          {(linkType === "category" || linkType === "collection") && (
            <div className="flex flex-col gap-1.5">
              <Label>{linkType === "category" ? "Category" : "Collection"}</Label>
              <Select
                value={linkValue || undefined}
                onValueChange={(v) => v && setLinkValue(v)}
                items={Object.fromEntries(
                  (linkType === "category" ? categoryOptions : collectionOptions).map((o) => [o.value, o.label])
                )}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`Choose a ${linkType}...`} />
                </SelectTrigger>
                <SelectContent>
                  {(linkType === "category" ? categoryOptions : collectionOptions).map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {linkType === "external" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="banner-url">Destination URL</Label>
              <Input
                id="banner-url"
                value={linkValue}
                onChange={(e) => setLinkValue(e.target.value)}
                placeholder="https://example.com/landing-page"
              />
              <p className="text-xs text-muted-foreground">Opens in a new tab, tagged as a sponsored link.</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="banner-start">Start date (optional)</Label>
              <Input id="banner-start" type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="banner-end">End date (optional)</Label>
              <Input id="banner-end" type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => v && setStatus(v as BannerStatus)} items={statusItems}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="banner-sort">Priority</Label>
              <Input
                id="banner-sort"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">Lowest wins when a slot has several.</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!canSubmit || submitting}
            onClick={() =>
              onSubmit({
                name,
                imageUrl,
                altText,
                placement,
                linkType,
                linkValue,
                status,
                startsAt: startsAt || null,
                endsAt: endsAt || null,
                sortOrder: Number(sortOrder) || 0,
              })
            }
          >
            {submitting ? "Saving..." : banner ? "Save changes" : "Create banner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
