"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Uploads immediately on file pick and hands back the stored URL, rather
 * than holding the File until the banner is saved — the preview below is
 * then the real served image, so a broken upload shows up here instead of
 * after the banner goes live.
 */
export function BannerImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/banners/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Upload failed — check your connection and try again");
    } finally {
      setUploading(false);
      // Clear the input so re-picking the same file still fires onChange.
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {value && (
        <div className="relative aspect-[1440/220] w-full overflow-hidden rounded-md border border-border bg-muted">
          <Image src={value} alt="Banner preview" fill sizes="100vw" className="object-cover" />
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
        {uploading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...
          </>
        ) : (
          <>
            <ImagePlus className="h-3.5 w-3.5" /> {value ? "Replace image" : "Upload image"}
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground">JPG, PNG, WebP, GIF or AVIF — up to 3MB.</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
