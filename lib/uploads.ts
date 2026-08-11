import "server-only";
import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { ulid } from "ulid";
import sharp from "sharp";
import heicConvert from "heic-convert";

/**
 * Admin-uploaded images live on disk, deliberately *outside* the deployed
 * app directory: `git pull` and `next build` both rewrite that tree on every
 * deploy, so anything stored inside it would be destroyed. In production
 * UPLOAD_DIR points at /home/cartebay/uploads (a sibling of the app checkout,
 * untouched by deploys); locally it falls back to a gitignored folder in the
 * repo so the feature works with no setup.
 */
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), ".uploads");

const MAX_BYTES = 12 * 1024 * 1024;

/**
 * Formats a browser can display, stored byte-for-byte as uploaded.
 *
 * Keeping GIF here rather than converting preserves animation, and leaving
 * already-web-ready files untouched avoids a pointless recompression pass
 * that would only lose quality.
 */
const WEB_READY: Record<string, string> = {
  jpeg: "jpg",
  png: "png",
  gif: "gif",
  webp: "webp",
};

export interface DecodedImage {
  bytes: Uint8Array;
  ext: string;
  /** Set when the upload was re-encoded, naming the format it arrived as. */
  convertedFrom?: string;
}

/**
 * Decides whether an upload is an image, and hands back something a browser
 * can actually render.
 *
 * The test is a real decode rather than a magic-byte table: "is this an
 * image" is precisely the question sharp answers, and the old hand-written
 * sniff rejected every HEIC — the iPhone camera default since iOS 11 — plus
 * any AVIF whose major brand was `mif1` rather than `avif`.
 *
 * It is still a genuine security boundary. An HTML document renamed .png
 * fails to decode and is rejected, so nothing but a real image is ever
 * written where we later serve it from our own origin. Decompression bombs
 * are covered by sharp's own pixel limit.
 */
async function decodeImage(bytes: Uint8Array): Promise<DecodedImage | null> {
  let meta: sharp.Metadata;
  try {
    meta = await sharp(bytes).metadata();
  } catch {
    return null;
  }
  const format = meta.format;
  if (!format) return null;

  if (WEB_READY[format]) return { bytes, ext: WEB_READY[format] };

  /**
   * sharp reports both AVIF and HEIC as "heif"; only `compression` separates
   * them. AVIF is av1-coded and every current browser renders it, so it is
   * kept as-is — without this check a perfectly good AVIF would be recompressed
   * to WebP for no reason.
   */
  if (format === "heif") {
    if (meta.compression === "av1") return { bytes, ext: "avif" };

    /**
     * HEIC — the iPhone camera default since iOS 11, and the format most of
     * these uploads actually are.
     *
     * sharp reads its metadata but cannot decode it: the bundled libheif has
     * no HEVC decoder plugin, on this machine and on the server, and there
     * are no system heif tools either. Verified against a real Apple HEIC,
     * which failed with "Error while loading plugin: Support for this
     * compression format". heic-convert carries its own decoder, so this
     * doesn't depend on how sharp happens to be built.
     *
     * JPEG rather than WebP because it's one lossy step instead of two —
     * next/image re-encodes to WebP on delivery anyway.
     */
    const jpeg = await heicConvert({ buffer: Buffer.from(bytes), format: "JPEG", quality: 0.92 });
    return { bytes: new Uint8Array(jpeg), ext: "jpg", convertedFrom: "heic" };
  }

  /**
   * SVG is rasterised rather than stored. It is markup, and serving an
   * uploaded one back from our own origin would be stored XSS however
   * carefully it was scanned — turning it into pixels removes the question
   * entirely, and the caller still gets the image they picked.
   */
  if (format === "svg") {
    const png = await sharp(bytes, { density: 192 }).png().toBuffer();
    return { bytes: new Uint8Array(png), ext: "png", convertedFrom: "svg" };
  }

  // HEIC/HEIF, TIFF and anything else sharp can read: no browser renders
  // them reliably, so they're converted on the way in instead of being
  // stored as files that would show up broken on the storefront.
  const webp = await sharp(bytes).webp({ quality: 82 }).toBuffer();
  return { bytes: new Uint8Array(webp), ext: "webp", convertedFrom: format };
}

export interface SavedUpload {
  url: string;
  error?: never;
}
export interface UploadError {
  url?: never;
  error: string;
}

/** Subdirectories under UPLOAD_DIR that may be written to or served — an allowlist so a folder name can never widen into an arbitrary path. */
export const UPLOAD_FOLDERS = ["banners", "products", "categories"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

/** Writes a validated image under UPLOAD_DIR/<folder> and returns the public path app/uploads/[folder]/[file] serves it from. */
export async function saveUploadedImage(file: File, folder: UploadFolder): Promise<SavedUpload | UploadError> {
  if (file.size === 0) return { error: "That file is empty" };
  if (file.size > MAX_BYTES) {
    return { error: `Image must be under ${MAX_BYTES / 1024 / 1024}MB — that one is ${(file.size / 1024 / 1024).toFixed(1)}MB` };
  }

  const uploaded = new Uint8Array(await file.arrayBuffer());

  let decoded: DecodedImage | null;
  try {
    decoded = await decodeImage(uploaded);
  } catch {
    // Decoding is the one step that touches the file's contents, so a
    // corrupt or truncated image surfaces here rather than as a 500.
    return { error: "That image couldn't be read — it may be corrupted" };
  }
  if (!decoded) return { error: "That file isn't an image" };

  const filename = `${ulid()}.${decoded.ext}`;
  const dir = path.join(UPLOAD_DIR, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), decoded.bytes);

  return { url: `/uploads/${folder}/${filename}` };
}

/** Banner-specific wrapper kept so existing call sites read clearly. */
export function saveBannerImage(file: File): Promise<SavedUpload | UploadError> {
  return saveUploadedImage(file, "banners");
}

export function saveCategoryImage(file: File): Promise<SavedUpload | UploadError> {
  return saveUploadedImage(file, "categories");
}

/**
 * True only for paths this module produced. Callers use it before deleting a
 * replaced image, so a category still pointing at picsum.photos or a CDN
 * doesn't send a stray unlink at a path we never wrote.
 */
export function isManagedUpload(url: string | null | undefined): boolean {
  if (!url) return false;
  const [empty, prefix, folder, filename, ...rest] = url.split("/");
  if (empty !== "" || prefix !== "uploads" || rest.length > 0) return false;
  return (UPLOAD_FOLDERS as readonly string[]).includes(folder) && SAFE_FILENAME.test(filename ?? "");
}

/**
 * Filenames are generated by saveBannerImage as `<ulid>.<ext>`, so anything
 * not matching that shape was not produced here and is rejected before it
 * can reach the filesystem — which is what stops `..%2f..%2fetc%2fpasswd`
 * from ever being joined onto a real path.
 */
const SAFE_FILENAME = /^[0-9A-HJKMNP-TV-Z]{26}\.(jpg|png|webp|gif|avif)$/;

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

export interface ServedUpload {
  /** A plain ArrayBuffer, not a Uint8Array: only the former is accepted as a Response BodyInit. */
  body: ArrayBuffer;
  contentType: string;
}

export async function readUploadedImage(folder: string, filename: string): Promise<ServedUpload | null> {
  if (!(UPLOAD_FOLDERS as readonly string[]).includes(folder)) return null;
  if (!SAFE_FILENAME.test(filename)) return null;
  const ext = filename.split(".").pop()!;
  try {
    const file = await readFile(path.join(UPLOAD_DIR, folder, filename));
    // Copied into a standalone ArrayBuffer rather than handing back
    // file.buffer, which is a pooled allocation Node shares between reads and
    // would expose unrelated bytes either side of this file's slice.
    const body = new ArrayBuffer(file.byteLength);
    new Uint8Array(body).set(file);
    return { body, contentType: CONTENT_TYPES[ext] };
  } catch {
    return null;
  }
}

/** Best-effort cleanup when an upload is deleted or replaced — a leftover file is harmless, so a failure here never blocks the mutation. */
export async function deleteUploadedImage(url: string): Promise<void> {
  const [, , folder, filename] = url.split("/");
  if (!folder || !filename) return;
  if (!(UPLOAD_FOLDERS as readonly string[]).includes(folder) || !SAFE_FILENAME.test(filename)) return;
  try {
    await unlink(path.join(UPLOAD_DIR, folder, filename));
  } catch {
    // Already gone, or never written — nothing to clean up.
  }
}
