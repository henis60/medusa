/**
 * Detects an image's real type from its leading bytes.
 *
 * The multipart `mimetype` is whatever the client claimed, so it can't be
 * trusted to decide what gets stored: an `.svg` or `.html` payload announced as
 * `image/png` would otherwise be written to R2 with `ACL: public-read` and
 * served back with an executable content type, giving stored XSS on the media
 * origin. Sniffing the bytes and deriving the stored ContentType from the
 * result means a file is only ever served as what it actually is.
 *
 * SVG is intentionally absent: it is XML that can carry <script>, so it stays
 * unsupported rather than being sanitized. Everything else the admin could
 * previously upload is accepted — including HEIC/HEIF straight off an iPhone,
 * which matters because the media library's "convert to WebP" toggle defaults
 * to off, so originals are what actually arrive here.
 */
export type DetectedImageType =
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "image/webp"
  | "image/avif"
  | "image/heic"
  | "image/heif"
  | "image/bmp"
  | "image/tiff"
  | "image/x-icon"

const startsWith = (buf: Buffer, bytes: number[], offset = 0): boolean =>
  buf.length >= offset + bytes.length &&
  bytes.every((b, i) => buf[offset + i] === b)

const asciiAt = (buf: Buffer, offset: number, length: number): string =>
  buf.length >= offset + length
    ? buf.subarray(offset, offset + length).toString("ascii")
    : ""

const AVIF_BRANDS = new Set(["avif", "avis"])
const HEIC_BRANDS = new Set(["heic", "heix", "heim", "heis", "hevc", "hevx", "hevm", "hevs"])
const HEIF_BRANDS = new Set(["mif1", "msf1"])

/**
 * Collects an ISO-BMFF file's major brand plus every compatible brand.
 *
 * Reading only the major brand at offset 8 is not enough: plenty of encoders
 * write a generic major brand such as `mif1` and declare `avif` further along
 * in the compatible-brands list, so a major-brand-only check rejects perfectly
 * valid AVIF and HEIC files.
 */
function readBrands(buffer: Buffer): string[] {
  if (asciiAt(buffer, 4, 4) !== "ftyp") return []

  const brands = [asciiAt(buffer, 8, 4)]

  // Box size is a big-endian uint32 at offset 0; compatible brands run from
  // offset 16 to the end of the box, four ASCII bytes each. Clamp to the
  // buffer we actually have, since only a prefix may have been read.
  const boxSize = buffer.length >= 4 ? buffer.readUInt32BE(0) : 0
  const end = Math.min(boxSize > 0 ? boxSize : buffer.length, buffer.length)

  for (let offset = 16; offset + 4 <= end; offset += 4) {
    brands.push(asciiAt(buffer, offset, 4))
  }

  return brands.filter(Boolean)
}

export function detectImageType(buffer: Buffer): DetectedImageType | null {
  // JPEG: FF D8 FF
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return "image/jpeg"

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png"
  }

  // GIF: "GIF87a" / "GIF89a"
  const gif = asciiAt(buffer, 0, 6)
  if (gif === "GIF87a" || gif === "GIF89a") return "image/gif"

  // WebP: "RIFF" .... "WEBP"
  if (asciiAt(buffer, 0, 4) === "RIFF" && asciiAt(buffer, 8, 4) === "WEBP") {
    return "image/webp"
  }

  // ISO-BMFF container: AVIF and HEIC/HEIF share this structure.
  const brands = readBrands(buffer)
  if (brands.length) {
    if (brands.some((b) => AVIF_BRANDS.has(b))) return "image/avif"
    if (brands.some((b) => HEIC_BRANDS.has(b))) return "image/heic"
    if (brands.some((b) => HEIF_BRANDS.has(b))) return "image/heif"
  }

  // BMP: "BM"
  if (startsWith(buffer, [0x42, 0x4d])) return "image/bmp"

  // TIFF: "II*\0" (little-endian) or "MM\0*" (big-endian)
  if (
    startsWith(buffer, [0x49, 0x49, 0x2a, 0x00]) ||
    startsWith(buffer, [0x4d, 0x4d, 0x00, 0x2a])
  ) {
    return "image/tiff"
  }

  // ICO: 00 00 01 00
  if (startsWith(buffer, [0x00, 0x00, 0x01, 0x00])) return "image/x-icon"

  return null
}
