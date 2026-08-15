"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImageFile } from "@/lib/upload-client";

/**
 * Multi-image picker for own-brand products. Uploads each file as it's chosen
 * and keeps the returned URLs, so the caller only ever holds stored paths —
 * the product row can then be saved without any file handling of its own.
 * First image is the one used on cards and in listings.
 */
interface FailedUpload {
  name: string;
  reason: string;
}

export function ProductImageUpload({ value, onChange }: { value: string[]; onChange: (urls: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [failures, setFailures] = useState<FailedUpload[]>([]);
  const [succeeded, setSucceeded] = useState(0);

  const uploading = progress !== null;

  /**
   * Every file is attempted, and each one's outcome is reported.
   *
   * This used to `break` on the first failure, which meant one oversized or
   * unreadable photo silently abandoned every file after it — select ten,
   * have the third fail, and four through ten were never even tried while
   * the UI showed a single error about the third. The photos that did upload
   * still arrived, so it looked like the rest had too.
   *
   * Still sequential rather than parallel: a HEIC decode is CPU-heavy, and
   * ten 12MB conversions at once would fight for the server's memory.
   */
  async function handleFiles(files: FileList) {
    const list = Array.from(files);
    setFailures([]);
    setSucceeded(0);
    setProgress({ done: 0, total: list.length });

    const uploaded: string[] = [];
    const failed: FailedUpload[] = [];

    for (const [index, file] of list.entries()) {
      const result = await uploadImageFile("/api/admin/products/upload", file);
      if (result.error) failed.push({ name: file.name, reason: result.error });
      else uploaded.push(result.url!);
      setProgress({ done: index + 1, total: list.length });
    }

    if (uploaded.length > 0) onChange([...value, ...uploaded]);
    setSucceeded(uploaded.length);
    setFailures(failed);
    setProgress(null);
    // Cleared so re-picking the same file still fires onChange.
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
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
        }}
      />
      <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
        {progress ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {/* Named counts, because a large HEIC takes a second or two each
                and a bare "Uploading..." looks stalled on a batch of ten. */}
            Uploading {progress.done + 1} of {progress.total}...
          </>
        ) : (
          <>
            <ImagePlus className="h-3.5 w-3.5" /> {value.length > 0 ? "Add more photos" : "Upload photos"}
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground">Any image, up to 12MB each — iPhone HEIC and other camera formats are converted automatically. The first is the main photo.</p>

      {failures.length > 0 && (
        <div className="flex flex-col gap-1 rounded-md border border-warning/40 bg-warning/10 p-2.5">
          <p className="text-xs font-medium text-foreground">
            {succeeded > 0
              ? `${succeeded} of ${succeeded + failures.length} uploaded. These didn't:`
              : `Couldn't upload ${failures.length === 1 ? "this photo" : "these photos"}:`}
          </p>
          <ul className="flex flex-col gap-0.5">
            {failures.map((f, i) => (
              // Filenames repeat across a selection, so index is part of the key.
              <li key={`${f.name}-${i}`} className="flex gap-1.5 text-xs text-muted-foreground">
                <span className="max-w-[45%] shrink-0 truncate font-medium text-foreground">{f.name}</span>
                <span className="min-w-0">— {f.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
