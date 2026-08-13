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
 * unsupported rather than being sanitized.
 */
export type DetectedImageType = "image/jpeg" | "image/png" | "image/gif" | "image/webp" | "image/avif"

const startsWith = (buf: Buffer, bytes: number[], offset = 0): boolean =>
  buf.length >= offset + bytes.length &&
  bytes.every((b, i) => buf[offset + i] === b)

const asciiAt = (buf: Buffer, offset: number, length: number): string =>
  buf.length >= offset + length
    ? buf.subarray(offset, offset + length).toString("ascii")
    : ""

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

  // AVIF: ISO-BMFF box, "ftyp" at offset 4 with an AVIF brand at offset 8.
  if (asciiAt(buffer, 4, 4) === "ftyp") {
    const brand = asciiAt(buffer, 8, 4)
    if (brand === "avif" || brand === "avis") return "image/avif"
  }

  return null
}
