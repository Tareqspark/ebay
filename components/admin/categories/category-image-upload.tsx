"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImageFile } from "@/lib/upload-client";

/**
 * Uploads the picked file straight away and hands back the stored URL,
 * matching the banner control: the preview is then the real served image,
 * so a bad upload shows up here rather than on the live storefront.
 *
 * The file reaches the server via /api/admin/categories/upload, which is
 * where the size, magic-byte and permission checks live — nothing here is
 * a security boundary.
 */
export function CategoryImageUpload({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const result = await uploadImageFile("/api/admin/categories/upload", file);
      if (result.error) {
        setError(result.error);
        return;
      }
      onChange(result.url!);
    } finally {
      setUploading(false);
      // Clear the input so re-picking the same file still fires onChange.
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {value && (
        <div className="relative aspect-[16/10] w-full max-w-xs overflow-hidden rounded-md border border-border bg-muted">
          <Image src={value} alt="Category image preview" fill sizes="320px" className="object-cover" />
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading || disabled}
          onClick={() => inputRef.current?.click()}
        >
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
        {value && !uploading && (
          <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => onChange("")}>
            <X className="h-3.5 w-3.5" /> Remove
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">Any image, up to 12MB — iPhone HEIC and other camera formats are converted automatically.</p>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
