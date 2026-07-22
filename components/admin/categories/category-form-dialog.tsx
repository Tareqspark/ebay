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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_ICONS } from "@/lib/category-icons";
import { slugify } from "@/lib/slugify";
import type { CategoryTreeRow, CategoryLevel } from "@/lib/admin/categories";
import type { CategoryInput } from "@/lib/admin/category-actions";

const ICON_NAMES = Object.keys(CATEGORY_ICONS).sort();
const iconItems: Record<string, string> = Object.fromEntries(ICON_NAMES.map((n) => [n, n]));

const LEVEL_LABEL: Record<CategoryLevel, string> = { top: "top-level category", child: "subcategory", grandchild: "leaf category" };

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryTreeRow | null;
  level: CategoryLevel;
  parentName?: string;
  onSubmit: (input: CategoryInput) => Promise<void>;
  submitting: boolean;
}

export function CategoryFormDialog({ open, onOpenChange, category, level, parentName, onSubmit, submitting }: CategoryFormDialogProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [iconName, setIconName] = useState("Tag");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(false);

  useEffect(() => {
    if (open) {
      setName(category?.name ?? "");
      setSlug(category?.slug ?? "");
      setSlugTouched(Boolean(category));
      setIconName(category?.iconName ?? "Tag");
      setImage(category?.image ?? "");
      setDescription(category?.description ?? "");
      setFeatured(category?.featured ?? false);
    }
  }, [open, category]);

  const effectiveLevel = category?.level ?? level;
  const isTop = effectiveLevel === "top";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? `Edit ${LEVEL_LABEL[effectiveLevel]}` : `New ${LEVEL_LABEL[effectiveLevel]}`}
            {!category && parentName ? ` in ${parentName}` : ""}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              value={name}
              autoFocus
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              placeholder="e.g. Home & Kitchen"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-slug">Slug</Label>
            <Input
              id="cat-slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder="home-and-kitchen"
              className="font-mono text-xs"
            />
          </div>
          {isTop && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label>Icon</Label>
                <Select value={iconName} onValueChange={(v) => v && setIconName(v)} items={iconItems}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {ICON_NAMES.map((n) => {
                      const Icon = CATEGORY_ICONS[n];
                      return (
                        <SelectItem key={n} value={n}>
                          <span className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5" />
                            {n}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cat-image">Banner image URL</Label>
                <Input id="cat-image" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://picsum.photos/seed/.../900/900" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cat-description">Description</Label>
                <Textarea id="cat-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
              </div>
              <div className="flex items-center gap-2.5">
                <Switch id="cat-featured" checked={featured} onCheckedChange={setFeatured} />
                <Label htmlFor="cat-featured">Featured on homepage</Label>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit({ name, slug, iconName, image, description, featured })}
            disabled={!name.trim() || !slug.trim() || submitting}
          >
            {submitting ? "Saving..." : category ? "Save changes" : "Create category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
