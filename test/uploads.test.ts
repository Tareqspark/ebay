import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { checkSafeUrl } from "@/lib/sanitize";

// UPLOAD_DIR is read at module scope, so it has to be set before the module
// is first imported — hence the dynamic import in beforeAll.
let uploads: typeof import("@/lib/uploads");
let dir: string;

/**
 * Uploads are validated by actually decoding them, so these have to be real
 * images — a bare file signature is correctly rejected now, which is the
 * point. Generated rather than committed as binary fixtures.
 */
const swatch = () =>
  sharp({ create: { width: 4, height: 4, channels: 3, background: { r: 200, g: 30, b: 30 } } });

let PNG: Uint8Array;
let TIFF: Uint8Array;
let AVIF: Uint8Array;
let GIF: Uint8Array;

function fileFrom(bytes: number[] | Uint8Array, type: string, name = "x"): File {
  const src = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  // Copied onto a plain ArrayBuffer: a Uint8Array<ArrayBufferLike> (which is
  // what sharp and Buffer hand back) isn't assignable to BlobPart, since it
  // might be backed by a SharedArrayBuffer.
  const copy = new Uint8Array(new ArrayBuffer(src.byteLength));
  copy.set(src);
  return new File([copy], name, { type });
}

beforeAll(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "cartebay-uploads-"));
  process.env.UPLOAD_DIR = dir;
  uploads = await import("@/lib/uploads");

  PNG = new Uint8Array(await swatch().png().toBuffer());
  TIFF = new Uint8Array(await swatch().tiff().toBuffer());
  AVIF = new Uint8Array(await swatch().avif().toBuffer());
  GIF = new Uint8Array(await swatch().gif().toBuffer());
});

afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("saveBannerImage", () => {
  it("stores a real PNG and returns a URL under /uploads/banners", async () => {
    const result = await uploads.saveBannerImage(fileFrom(PNG, "image/png"));
    expect(result.error).toBeUndefined();
    expect(result.url).toMatch(/^\/uploads\/banners\/[0-9A-HJKMNP-TV-Z]{26}\.png$/);
  });

  it("derives the extension from the sniffed type, not the uploaded filename", async () => {
    // The classic "shell.php.png" upload — the stored name must not keep it.
    const result = await uploads.saveBannerImage(fileFrom(PNG, "image/png", "shell.php"));
    expect(result.url?.endsWith(".png")).toBe(true);
    expect(result.url).not.toContain("php");
  });

  it("rejects a non-image masquerading as image/png", async () => {
    const html = [...'<script>alert(1)</script>'].map((c) => c.charCodeAt(0));
    const result = await uploads.saveBannerImage(fileFrom(html, "image/png"));
    expect(result.url).toBeUndefined();
    expect(result.error).toMatch(/isn't an image/);
  });

  it("rejects an empty file", async () => {
    const result = await uploads.saveBannerImage(fileFrom([], "image/png"));
    expect(result.error).toMatch(/empty/);
  });

  it("rejects a file over the size cap", async () => {
    // Allocated as a typed array rather than spreading a 13M-element JS array,
    // which is slow enough to trip the default test timeout on its own. The
    // size check runs before decoding, so these bytes need not be an image.
    const big = new Uint8Array(13 * 1024 * 1024);
    const result = await uploads.saveBannerImage(new File([big], "big.png", { type: "image/png" }));
    expect(result.error).toMatch(/under 12MB/);
  });

  it("accepts a photo that the old 3MB cap would have rejected", async () => {
    // A 4MB upload is an ordinary phone photo, and used to be refused.
    const photo = await sharp({
      create: { width: 2400, height: 1600, channels: 3, background: { r: 12, g: 90, b: 200 } },
    })
      .png({ compressionLevel: 0 })
      .toBuffer();
    expect(photo.byteLength).toBeGreaterThan(3 * 1024 * 1024);
    const result = await uploads.saveBannerImage(fileFrom(new Uint8Array(photo), "image/png"));
    expect(result.error).toBeUndefined();
    expect(result.url).toMatch(/\.png$/);
  });
});

/**
 * The rule is now "is it an image?" rather than a fixed format list. Anything
 * a browser can't render is converted on the way in, so what lands on disk is
 * always displayable — storing a HEIC as .heic would have produced a product
 * photo that shows up broken on the storefront.
 */
describe("accepting any image", () => {
  it("converts TIFF to WebP rather than rejecting it", async () => {
    const result = await uploads.saveUploadedImage(fileFrom(TIFF, "image/tiff"), "products");
    expect(result.error).toBeUndefined();
    expect(result.url).toMatch(/\.webp$/);
  });

  it("rasterises SVG to PNG, so uploaded markup is never served back", async () => {
    // The stored-XSS case: an SVG can carry <script>, and serving one from
    // our own origin would execute it. Turning it into pixels removes that.
    const svg = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><script>alert(1)</script><rect width="8" height="8" fill="red"/></svg>'
    );
    const result = await uploads.saveUploadedImage(fileFrom(new Uint8Array(svg), "image/svg+xml"), "products");
    expect(result.error).toBeUndefined();
    expect(result.url).toMatch(/\.png$/);

    const filename = result.url!.split("/").pop()!;
    const served = await uploads.readUploadedImage("products", filename);
    expect(served?.contentType).toBe("image/png");
    // Nothing of the original markup survives.
    expect(Buffer.from(served!.body).includes("script")).toBe(false);
  });

  it("keeps AVIF as-is instead of recompressing it", async () => {
    // sharp reports AVIF and HEIC both as "heif"; only `compression` tells
    // them apart, and getting that wrong would re-encode a web-ready file.
    const result = await uploads.saveUploadedImage(fileFrom(AVIF, "image/avif"), "products");
    expect(result.url).toMatch(/\.avif$/);
  });

  it("keeps GIF as-is, so animation survives", async () => {
    const result = await uploads.saveUploadedImage(fileFrom(GIF, "image/gif"), "products");
    expect(result.url).toMatch(/\.gif$/);
  });

  it("still refuses a file that only claims to be an image", async () => {
    const pdf = Buffer.from("%PDF-1.7\n%\xE2\xE3\xCF\xD3\n1 0 obj", "latin1");
    const result = await uploads.saveUploadedImage(fileFrom(new Uint8Array(pdf), "image/png"), "products");
    expect(result.url).toBeUndefined();
    expect(result.error).toMatch(/isn't an image/);
  });

  it("only ever writes a web-displayable extension", async () => {
    // Whatever comes in, the stored name must stay inside the set the
    // serving route will hand back — SAFE_FILENAME depends on it.
    for (const [bytes, type] of [
      [PNG, "image/png"],
      [TIFF, "image/tiff"],
      [AVIF, "image/avif"],
      [GIF, "image/gif"],
    ] as const) {
      const result = await uploads.saveUploadedImage(fileFrom(bytes, type), "products");
      expect(result.url).toMatch(/\.(jpg|png|webp|gif|avif)$/);
      expect(uploads.isManagedUpload(result.url!)).toBe(true);
    }
  });
});

/**
 * A real 32x24 HEIC produced by an Apple encoder, embedded because nothing in
 * this toolchain can generate one: sharp's libheif has no HEVC *encoder*, and
 * heic-convert only decodes. Without a genuine sample the most important path
 * in this module — the iPhone camera format — would go untested.
 */
const TINY_HEIC_B64 =
  "AAAAGGZ0eXBoZWljAAAAAGhlaWNtaWYxAAABvW1ldGEAAAAAAAAAImhkbHIAAAAAAAAAAHBpY3QAAAAAAAAAAAAAAAAA" +
  "AAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAA5waXRtAAAAAAABAAAAOGlpbmYAAAAAAAIAAAAV" +
  "aW5mZQIAAAAAAQAAaHZjMQAAAAAVaW5mZQIAAAEAAgAARXhpZgAAAAAaaXJlZgAAAAAAAAAOY2RzYwACAAEAAQAAAN9p" +
  "cHJwAAAAv2lwY28AAAATY29scm5jbHgAAgACAAaAAAAAd2h2Y0MBAWAAAACwAAAAAAAe8AD8/fj4AAAPA6AAAQAXQAEM" +
  "Af//AWAAAAMAsAAAAwAAAwAeLAmhAAEAIUIBAQFgAAADALAAAAMAAAMAHqBCGWcuSRKSXE3AgIGAIKIAAQARRAHAYRJM" +
  "BOkRESRJEkSRKkAAAAAUaXNwZQAAAAAAAAAgAAAAGAAAAAlpcm90AAAAABBwaXhpAAAAAAMICAgAAAAYaXBtYQAAAAAA" +
  "AAABAAEFgYIDhAUAAAAsaWxvYwAAAABEAAACAAEAAAABAAACMwAAAPQAAgAAAAEAAAHlAAAATgAAAAFtZGF0AAAAAAAA" +
  "AVIAAAAGRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQA" +
  "AAABAAAAGAAAAAAAAADwJgGtwDlTaVvJsivzAp4NCUZ3Ub6wET1IoRcFe2WayflLLRv/YjItyl4Tn/+mAG4CEKzTHLeq" +
  "qyevta2U2PsCPSije7KkNVukr8QJG3fnfdNSUAAhcrCgFwR4cxWJqT/LJ4TcxfcauUPh6VnsooWJ6V04XZLt39YQthr2" +
  "oZ5K/msa8gyolPSO6OHf+uPybkUS1E0gB+U2BYDE6Pjuc4E98D0TM61FAIw9VaZEZ/fTjv6ghKM/KKC03KjEOhfjSxhs" +
  "6A/KWmpEomeuz0bluCpdGax4QV/gSPULop5vHjkANZI1kIvPPtWLPwQzLauiZ/eA";

describe("HEIC, the iPhone camera format", () => {
  it("is accepted and stored as something a browser can render", async () => {
    // sharp reads HEIC metadata but cannot decode it (no HEVC plugin), so
    // this passing proves the heic-convert fallback is wired in. If it ever
    // regresses the file is rejected as unreadable, exactly as before.
    const heic = new Uint8Array(Buffer.from(TINY_HEIC_B64, "base64"));
    const result = await uploads.saveUploadedImage(fileFrom(heic, "image/heic", "IMG_4021.HEIC"), "products");

    expect(result.error).toBeUndefined();
    expect(result.url).toMatch(/\.jpg$/);

    const served = await uploads.readUploadedImage("products", result.url!.split("/").pop()!);
    expect(served?.contentType).toBe("image/jpeg");
    expect(served!.body.byteLength).toBeGreaterThan(0);
  });

  it("is recognised as HEIF by sharp but not as web-ready AVIF", async () => {
    // Both report format "heif"; only `compression` separates them, and
    // treating HEIC as AVIF would store an unrenderable .avif.
    const meta = await sharp(Buffer.from(TINY_HEIC_B64, "base64")).metadata();
    expect(meta.format).toBe("heif");
    expect(meta.compression).not.toBe("av1");
  });
});

describe("readBannerImage", () => {
  it("serves back a file it wrote, with the right content type", async () => {
    const saved = await uploads.saveBannerImage(fileFrom(PNG, "image/png"));
    const filename = saved.url!.split("/").pop()!;
    const served = await uploads.readUploadedImage("banners", filename);
    expect(served?.contentType).toBe("image/png");
  });

  it.each([
    "../../../etc/passwd",
    "..%2f..%2fetc%2fpasswd",
    "/etc/passwd",
    "evil.php",
    "notaulid.png",
  ])("refuses to read %s", async (name) => {
    expect(await uploads.readUploadedImage("banners", name)).toBeNull();
  });

  it("returns null for a well-formed name that does not exist", async () => {
    expect(await uploads.readUploadedImage("banners", "01ARZ3NDEKTSV4RRFFQ69G5FAV.png")).toBeNull();
  });

  it("cannot be tricked into reading a real file placed outside the banners dir", async () => {
    // Correctly shaped name, but sitting one level up — the join is confined
    // to UPLOAD_DIR/banners, so it must not resolve.
    await mkdir(path.join(dir, "banners"), { recursive: true });
    await writeFile(path.join(dir, "01ARZ3NDEKTSV4RRFFQ69G5FAW.png"), "secret");
    expect(await uploads.readUploadedImage("banners", "01ARZ3NDEKTSV4RRFFQ69G5FAW.png")).toBeNull();
  });
});

describe("upload folders", () => {
  it("stores a product photo under its own folder", async () => {
    const result = await uploads.saveUploadedImage(fileFrom(PNG, "image/png"), "products");
    expect(result.url).toMatch(/^\/uploads\/products\/[0-9A-HJKMNP-TV-Z]{26}\.png$/);
  });

  it.each(["../banners", "etc", "", "banners/../.."])("refuses to serve from folder %s", async (folder) => {
    // Correctly shaped filename, but a folder outside the allowlist.
    expect(await uploads.readUploadedImage(folder, "01ARZ3NDEKTSV4RRFFQ69G5FAV.png")).toBeNull();
  });

  it("does not serve a banners file through the products folder", async () => {
    const saved = await uploads.saveUploadedImage(fileFrom(PNG, "image/png"), "banners");
    const filename = saved.url!.split("/").pop()!;
    expect(await uploads.readUploadedImage("products", filename)).toBeNull();
  });

  it("stores and serves a category image under its own folder", async () => {
    const saved = await uploads.saveUploadedImage(fileFrom(PNG, "image/png"), "categories");
    expect(saved.url).toMatch(/^\/uploads\/categories\/[0-9A-HJKMNP-TV-Z]{26}\.png$/);
    const filename = saved.url!.split("/").pop()!;
    expect((await uploads.readUploadedImage("categories", filename))?.contentType).toBe("image/png");
  });
});

/**
 * isManagedUpload gates an `unlink` — it decides whether a stored image URL
 * refers to a file this app wrote and may therefore delete when the image is
 * replaced. A false positive deletes something we don't own, so anything that
 * isn't exactly `/uploads/<known folder>/<ULID>.<ext>` has to be rejected.
 */
describe("isManagedUpload", () => {
  const VALID = "01J8ZQ9F7K3M2N4P6R8T0V2W4X";

  it("accepts a path this module produced, in every allowed folder", () => {
    for (const folder of uploads.UPLOAD_FOLDERS) {
      expect(uploads.isManagedUpload(`/uploads/${folder}/${VALID}.webp`)).toBe(true);
    }
  });

  it.each(["jpg", "png", "webp", "gif", "avif"])("accepts the %s extension", (ext) => {
    expect(uploads.isManagedUpload(`/uploads/categories/${VALID}.${ext}`)).toBe(true);
  });

  it.each([
    // The common real case: a category still pointing at generated art.
    "https://picsum.photos/seed/electronics/900/900",
    "/category/electronics.webp",
    "",
    "/uploads/products/../../../etc/passwd",
    "/uploads/../.env.local",
    "/uploads/secrets/01J8ZQ9F7K3M2N4P6R8T0V2W4X.webp",
    "/uploads/products/photo.webp",
    "/uploads/products/shell.php",
    // ULID alphabet excludes I, L, O and U.
    "/uploads/products/01J8ZQ9F7K3M2N4P6R8T0V2W4I.webp",
    // Right alphabet, wrong length.
    "/uploads/products/01J8ZQ9F7K3M2N4P6R8T0V2W.webp",
    "/uploads/products/nested/01J8ZQ9F7K3M2N4P6R8T0V2W4X.webp",
    "uploads/products/01J8ZQ9F7K3M2N4P6R8T0V2W4X.webp",
    "/files/products/01J8ZQ9F7K3M2N4P6R8T0V2W4X.webp",
  ])("refuses to claim ownership of %s", (url) => {
    expect(uploads.isManagedUpload(url)).toBe(false);
  });

  it("rejects missing values", () => {
    expect(uploads.isManagedUpload(null)).toBe(false);
    expect(uploads.isManagedUpload(undefined)).toBe(false);
  });
});

describe("checkSafeUrl", () => {
  it.each(["https://example.com/promo", "http://example.com", "/category/electronics"])("allows %s", (url) => {
    expect(checkSafeUrl(url, "Link URL")).toBeNull();
  });

  it.each([
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "//evil.com/phish",
    "not a url",
    "",
  ])("rejects %s", (url) => {
    expect(checkSafeUrl(url, "Link URL")).not.toBeNull();
  });
});
