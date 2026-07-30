import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import renameMediaAssetWorkflow from "../../../../../workflows/rename-media-asset"

function decodeKey(encoded: string): string {
  return Buffer.from(encoded, "base64url").toString("utf-8")
}

function sanitizeSegment(segment: string): string {
  return segment.replace(/[/\\]+/g, "-").trim()
}

type RenameBody = {
  filename: string
}

export async function POST(req: MedusaRequest<RenameBody>, res: MedusaResponse) {
  const oldKey = decodeKey(req.params.key)
  const { filename } = req.body as RenameBody

  const sanitized = sanitizeSegment(filename ?? "")
  if (!sanitized) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Numele fișierului este obligatoriu")
  }

  const lastSlash = oldKey.lastIndexOf("/")
  const folderPrefix = lastSlash >= 0 ? oldKey.slice(0, lastSlash + 1) : ""
  const newKey = `${folderPrefix}${sanitized}`

  const { result } = await renameMediaAssetWorkflow(req.scope).run({
    input: { oldKey, newKey },
  })

  res.status(200).json({ asset: result })
}
