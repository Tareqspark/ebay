"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Multi-image picker for own-brand products. Uploads each file as it's chosen
 * and keeps the returned URLs, so the caller only ever holds stored paths —
 * the product row can then be saved without any file handling of its own.
 * First image is the one used on cards and in listings.
 */
export function ProductImageUpload({ value, onChange }: { value: string[]; onChange: (urls: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList) {
    setUploading(true);
    setError(null);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/products/upload", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Upload failed");
          break;
        }
        uploaded.push(data.url);
      } catch {
        setError("Upload failed — check your connection and try again");
        break;
      }
    }
    if (uploaded.length > 0) onChange([...value, ...uploaded]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((url, index) => (
            <div key={url} className="relative h-20 w-20 overflow-hidden rounded-md border border-border bg-muted">
              <Image src={url} alt="" fill sizes="80px" className="object-cover" />
              {index === 0 && (
                <span className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center text-[10px] text-white">Main</span>
              )}
              <button
                type="button"
                aria-label="Remove image"
                onClick={() => onChange(value.filter((u) => u !== url))}
                className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
        }}
      />
      <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
        {uploading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...
          </>
        ) : (
          <>
            <ImagePlus className="h-3.5 w-3.5" /> {value.length > 0 ? "Add more photos" : "Upload photos"}
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground">JPG, PNG, WebP, GIF or AVIF — up to 3MB each. The first is the main photo.</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
