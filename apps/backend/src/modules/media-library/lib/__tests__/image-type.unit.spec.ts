import { detectImageType } from "../image-type"

/**
 * These cases are the reason the sniffer exists: the multipart `mimetype` is
 * client-supplied, so an SVG or HTML payload announced as `image/png` would be
 * stored public-read and served back with an executable content type — stored
 * XSS on the media origin. The rejection cases below are the security contract;
 * the acceptance cases guard against over-tightening it and breaking real
 * uploads (an iPhone HEIC, or an AVIF whose major brand is `mif1`).
 */

/** Minimal ISO-BMFF header: [size][ftyp][major brand][minor][...compatible] */
const isoBmff = (major: string, compatible: string[] = []): Buffer => {
  const size = 16 + compatible.length * 4
  const buf = Buffer.alloc(size)
  buf.writeUInt32BE(size, 0)
  buf.write("ftyp", 4, "ascii")
  buf.write(major, 8, "ascii")
  buf.writeUInt32BE(0, 12)
  compatible.forEach((brand, i) => buf.write(brand, 16 + i * 4, "ascii"))
  return buf
}

describe("detectImageType", () => {
  describe("accepts real image formats", () => {
    it.each([
      ["JPEG", Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]), "image/jpeg"],
      [
        "PNG",
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        "image/png",
      ],
      ["GIF87a", Buffer.from("GIF87a....."), "image/gif"],
      ["GIF89a", Buffer.from("GIF89a....."), "image/gif"],
      [
        "WebP",
        Buffer.concat([
          Buffer.from("RIFF"),
          Buffer.alloc(4),
          Buffer.from("WEBPVP8 "),
        ]),
        "image/webp",
      ],
      ["BMP", Buffer.from([0x42, 0x4d, 0x01, 0x02]), "image/bmp"],
      ["TIFF (little-endian)", Buffer.from([0x49, 0x49, 0x2a, 0x00]), "image/tiff"],
      ["TIFF (big-endian)", Buffer.from([0x4d, 0x4d, 0x00, 0x2a]), "image/tiff"],
      ["ICO", Buffer.from([0x00, 0x00, 0x01, 0x00, 0x01]), "image/x-icon"],
    ])("detects %s", (_label, bytes, expected) => {
      expect(detectImageType(bytes as Buffer)).toBe(expected)
    })
  })

  describe("handles ISO-BMFF brands", () => {
    it("detects AVIF from the major brand", () => {
      expect(detectImageType(isoBmff("avif", ["avif", "mif1"]))).toBe("image/avif")
    })

    // Regression: reading only the major brand at offset 8 rejected perfectly
    // valid AVIFs that declare a generic `mif1` major and `avif` further along.
    it("detects AVIF declared only in the compatible-brands list", () => {
      expect(detectImageType(isoBmff("mif1", ["mif1", "avif"]))).toBe("image/avif")
    })

    // Regression: the media library's "convert to WebP" toggle defaults to OFF,
    // so originals straight off an iPhone reach the server as HEIC.
    it("detects HEIC from an iPhone", () => {
      expect(detectImageType(isoBmff("heic", ["mif1", "heic"]))).toBe("image/heic")
    })

    it("detects generic HEIF", () => {
      expect(detectImageType(isoBmff("msf1", ["msf1"]))).toBe("image/heif")
    })

    it("rejects non-image ISO-BMFF containers such as MP4", () => {
      expect(detectImageType(isoBmff("isom", ["isom", "mp42"]))).toBeNull()
    })
  })

  describe("rejects payloads that could execute in a browser", () => {
    it("rejects SVG, which can carry <script>", () => {
      const svg = Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
      )
      expect(detectImageType(svg)).toBeNull()
    })

    it("rejects HTML masquerading as an image", () => {
      expect(
        detectImageType(Buffer.from("<html><script>alert(1)</script></html>"))
      ).toBeNull()
    })
  })

  describe("rejects malformed input without throwing", () => {
    it.each([
      ["an empty buffer", Buffer.alloc(0)],
      ["a truncated JPEG header", Buffer.from([0xff, 0xd8])],
      ["a truncated ISO-BMFF header", Buffer.from([0x00, 0x00, 0x00])],
      ["arbitrary bytes", Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05])],
    ])("rejects %s", (_label, bytes) => {
      expect(() => detectImageType(bytes as Buffer)).not.toThrow()
      expect(detectImageType(bytes as Buffer)).toBeNull()
    })
  })
})
