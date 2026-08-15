"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { setCategoryImageAction } from "@/lib/admin/category-actions";
import { uploadImageFile } from "@/lib/upload-client";

/**
 * The thumbnail in each tree row, doubling as the upload button.
 *
 * Uploading in place matters at this scale: there are ~1,650 categories, and
 * opening the edit dialog for each one to attach artwork would make the job
 * impractical. Picking a file uploads and saves in one step — no separate
 * form submit — so the row reflects the live value immediately.
 */
export function CategoryImageCell({ id, name, image }: { id: string; name: string; image: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const upload = await uploadImageFile("/api/admin/categories/upload", file);
      if (upload.error) {
        toast.error(upload.error);
        return;
      }

      const result = await setCategoryImageAction(id, upload.url!);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Image set for ${name}`);
      startTransition(() => router.refresh());
    } catch {
      toast.error("Couldn't save the image — please try again");
    } finally {
      setBusy(false);
      // Reset so picking the same file again still fires onChange.
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
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
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        title={image ? `Replace image for ${name}` : `Upload an image for ${name}`}
        aria-label={image ? `Replace image for ${name}` : `Upload an image for ${name}`}
        className="group relative h-8 w-12 shrink-0 overflow-hidden rounded border border-border bg-muted transition-colors hover:border-primary disabled:cursor-wait"
      >
        {image ? (
          <Image src={image} alt="" fill sizes="48px" className="object-cover" />
        ) : (
          // Dashed and empty so a category with no artwork is obvious when
          // scanning the tree — that's how you find the gaps.
          <span className="absolute inset-0 rounded border border-dashed border-border" />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-foreground/55 text-background opacity-0 transition-opacity group-hover:opacity-100">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
        </span>
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-foreground/55 text-background">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          </span>
        )}
      </button>
    </>
  );
}
