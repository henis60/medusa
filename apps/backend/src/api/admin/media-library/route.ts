import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MEDIA_LIBRARY_MODULE } from "../../../modules/media-library"
import MediaLibraryModuleService from "../../../modules/media-library/service"
import { listR2Objects } from "../../../modules/media-library/lib/r2-client"
import uploadMediaAssetWorkflow from "../../../workflows/upload-media-asset"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { cursor, limit, q, prefix } = req.query as {
    cursor?: string
    limit?: string
    q?: string
    prefix?: string
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
      }
    })
    .filter((a) => !a.hidden)

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

  const uploaded: { key: string; url: string }[] = []
  for (const file of files) {
    const key = `${folderPrefix}${sanitizeSegment(file.originalname)}`
    const { result } = await uploadMediaAssetWorkflow(req.scope).run({
      input: {
        key,
        content: file.buffer.toString("base64"),
        mimeType: file.mimetype,
      },
    })
    uploaded.push({ key: result.key, url: result.url })
  }

  res.status(200).json({ files: uploaded })
}
