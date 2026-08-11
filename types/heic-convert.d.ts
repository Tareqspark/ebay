/**
 * heic-convert ships no types of its own.
 *
 * Only the single-image default export is declared, which is all lib/uploads.ts
 * uses — the package also exposes an `all` export for multi-image HEIC
 * containers, deliberately left out so nothing starts depending on an
 * untyped shape by accident.
 */
declare module "heic-convert" {
  interface HeicConvertOptions {
    buffer: Buffer | Uint8Array;
    format: "JPEG" | "PNG";
    /** JPEG only, 0–1. Ignored for PNG. */
    quality?: number;
  }

  export default function convert(options: HeicConvertOptions): Promise<Buffer>;
}
