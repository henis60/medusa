import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MEDIA_LIBRARY_MODULE } from "../../../modules/media-library"
import MediaLibraryModuleService from "../../../modules/media-library/service"
import { listR2Objects } from "../../../modules/media-library/lib/r2-client"
import { detectImageType } from "../../../modules/media-library/lib/image-type"
import uploadMediaAssetWorkflow from "../../../workflows/upload-media-asset"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { cursor, limit, q, prefix, unlinked } = req.query as {
    cursor?: string
    limit?: string
    q?: string
    prefix?: string
    unlinked?: string
  }

  // Searching (`q`) scans the whole bucket flat (S3 prefix matching only
  // matches from the start of a key, so this is a "starts with" search, not
  // substring). Without `q`, browse one folder level at a time via `prefix` +
  // the delimiter in listR2Objects, so folders show as their own tiles.
  const { objects, folders, nextCursor } = await listR2Objects({
    cursor,
    limit: limit ? parseInt(limit, 10) : 50,
    prefix: q ? q : (prefix ?? ""),
    flat: !!q,
  })

  const mediaLibraryModuleService: MediaLibraryModuleService = req.scope.resolve(
    MEDIA_LIBRARY_MODULE
  )
  const keys = objects.map((o) => o.key)
  const overlays = keys.length
    ? await mediaLibraryModuleService.listMediaAssets({ key: keys })
    : []
  const overlayByKey = new Map(overlays.map((o) => [o.key, o]))

  // Cross-reference against products so the library can show whether an R2
  // file is actually attached to a product's images, not just sitting in the
  // bucket. Images are a same-module relation of product, so filtering by
  // `images.url` works directly via query.graph (no cross-module link needed).
  const urls = objects.map((o) => o.url)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: matchingProducts } = urls.length
    ? await query.graph({
        entity: "product",
        fields: ["id", "title", "images.url"],
        filters: { images: { url: urls } },
      })
    : { data: [] }

  const productsByUrl = new Map<string, { id: string; title: string }[]>()
  for (const p of matchingProducts as any[]) {
    for (const img of p.images ?? []) {
      const list = productsByUrl.get(img.url) ?? []
      list.push({ id: p.id, title: p.title })
      productsByUrl.set(img.url, list)
    }
  }

  const assets = objects
    .map((obj) => {
      const overlay = overlayByKey.get(obj.key)
      return {
        key: obj.key,
        url: obj.url,
        size: obj.size,
        last_modified: obj.last_modified,
        alt_text: overlay?.alt_text ?? null,
        tags: overlay?.tags ?? null,
        hidden: overlay?.hidden ?? false,
        linked_products: productsByUrl.get(obj.url) ?? [],
      }
    })
    .filter((a) => !a.hidden)
    .filter((a) => (unlinked === "true" ? a.linked_products.length === 0 : true))

  res.status(200).json({ assets, folders, nextCursor })
}

// Sanitizes a single path segment (folder name or filename) — strips slashes
// so a user-typed folder name can't escape into an arbitrary key path.
function sanitizeSegment(segment: string): string {
  return segment.replace(/[/\\]+/g, "-").trim()
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const files = ((req as any).files as Array<{
    originalname: string
    mimetype: string
    buffer: Buffer
  }>) ?? []
  if (!files.length) {
    return res.status(400).json({ message: "No files provided" })
  }

  const folder = ((req.body as any)?.folder ?? "") as string
  const folderPrefix = folder
    ? folder
        .split("/")
        .map(sanitizeSegment)
        .filter(Boolean)
        .join("/") + "/"
    : ""

  // Validate everything before writing anything, so a bad file in the batch
  // doesn't leave half the upload committed to the bucket.
  const validated: { key: string; buffer: Buffer; mimeType: string }[] = []
  for (const file of files) {
    // The declared mimetype is client-supplied; the bytes are not. Storing the
    // detected type is what stops an HTML/SVG payload being served back from
    // the media origin with an executable content type.
    const detected = detectImageType(file.buffer)
    if (!detected) {
      return res.status(415).json({
        message:
          `"${file.originalname}" nu este o imagine acceptată. ` +
          `Sunt permise JPEG, PNG, GIF, WebP și AVIF.`,
      })
    }

    validated.push({
      key: `${folderPrefix}${sanitizeSegment(file.originalname)}`,
      buffer: file.buffer,
      mimeType: detected,
    })
  }

  const uploaded: { key: string; url: string }[] = []
  for (const file of validated) {
    const { result } = await uploadMediaAssetWorkflow(req.scope).run({
      input: {
        key: file.key,
        content: file.buffer.toString("base64"),
        mimeType: file.mimeType,
      },
    })
    uploaded.push({ key: result.key, url: result.url })
  }

  res.status(200).json({ files: uploaded })
}
