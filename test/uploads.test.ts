import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { checkSafeUrl } from "@/lib/sanitize";

// UPLOAD_DIR is read at module scope, so it has to be set before the module
// is first imported — hence the dynamic import in beforeAll.
let uploads: typeof import("@/lib/uploads");
let dir: string;

const PNG_HEADER = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function fileFrom(bytes: number[], type: string, name = "x"): File {
  return new File([new Uint8Array(bytes)], name, { type });
}

beforeAll(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "cartebay-uploads-"));
  process.env.UPLOAD_DIR = dir;
  uploads = await import("@/lib/uploads");
});

afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("saveBannerImage", () => {
  it("stores a real PNG and returns a URL under /uploads/banners", async () => {
    const result = await uploads.saveBannerImage(fileFrom([...PNG_HEADER, 1, 2, 3], "image/png"));
    expect(result.error).toBeUndefined();
    expect(result.url).toMatch(/^\/uploads\/banners\/[0-9A-HJKMNP-TV-Z]{26}\.png$/);
  });

  it("derives the extension from the sniffed type, not the uploaded filename", async () => {
    // The classic "shell.php.png" upload — the stored name must not keep it.
    const result = await uploads.saveBannerImage(fileFrom([...PNG_HEADER], "image/png", "shell.php"));
    expect(result.url?.endsWith(".png")).toBe(true);
    expect(result.url).not.toContain("php");
  });

  it("rejects a non-image masquerading as image/png", async () => {
    const html = [...'<script>alert(1)</script>'].map((c) => c.charCodeAt(0));
    const result = await uploads.saveBannerImage(fileFrom(html, "image/png"));
    expect(result.url).toBeUndefined();
    expect(result.error).toMatch(/Unsupported image type/);
  });

  it("rejects an empty file", async () => {
    const result = await uploads.saveBannerImage(fileFrom([], "image/png"));
    expect(result.error).toMatch(/empty/);
  });

  it("rejects a file over the size cap", async () => {
    // Allocated as a typed array rather than spreading a 4M-element JS array,
    // which is slow enough to trip the default test timeout on its own.
    const big = new Uint8Array(4 * 1024 * 1024);
    big.set(PNG_HEADER);
    const result = await uploads.saveBannerImage(new File([big], "big.png", { type: "image/png" }));
    expect(result.error).toMatch(/under 3MB/);
  });
});

describe("readBannerImage", () => {
  it("serves back a file it wrote, with the right content type", async () => {
    const saved = await uploads.saveBannerImage(fileFrom([...PNG_HEADER], "image/png"));
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
    const result = await uploads.saveUploadedImage(fileFrom([...PNG_HEADER], "image/png"), "products");
    expect(result.url).toMatch(/^\/uploads\/products\/[0-9A-HJKMNP-TV-Z]{26}\.png$/);
  });

  it.each(["../banners", "etc", "", "banners/../.."])("refuses to serve from folder %s", async (folder) => {
    // Correctly shaped filename, but a folder outside the allowlist.
    expect(await uploads.readUploadedImage(folder, "01ARZ3NDEKTSV4RRFFQ69G5FAV.png")).toBeNull();
  });

  it("does not serve a banners file through the products folder", async () => {
    const saved = await uploads.saveUploadedImage(fileFrom([...PNG_HEADER], "image/png"), "banners");
    const filename = saved.url!.split("/").pop()!;
    expect(await uploads.readUploadedImage("products", filename)).toBeNull();
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
