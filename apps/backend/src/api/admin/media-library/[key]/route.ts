import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import upsertMediaAssetMetadataWorkflow from "../../../../workflows/upsert-media-asset-metadata"
import deleteMediaAssetPermanentWorkflow from "../../../../workflows/delete-media-asset-permanent"

// The key (an R2 object path, e.g. "products/foo.webp") arrives base64url
// encoded since it contains slashes and can't be a plain route param.
function decodeKey(encoded: string): string {
  return Buffer.from(encoded, "base64url").toString("utf-8")
}

type UpdateBody = {
  alt_text?: string | null
  tags?: string[] | null
}

export async function POST(req: MedusaRequest<UpdateBody>, res: MedusaResponse) {
  const key = decodeKey(req.params.key)
  const { alt_text, tags } = req.body as UpdateBody

  const { result } = await upsertMediaAssetMetadataWorkflow(req.scope).run({
    input: { key, alt_text, tags },
  })

  res.status(200).json({ asset: result.asset })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const key = decodeKey(req.params.key)
  const permanent = req.query.permanent === "true"

  if (permanent) {
    await deleteMediaAssetPermanentWorkflow(req.scope).run({
      input: { key },
    })
    return res.status(200).json({ key, deleted: true, permanent: true })
  }

  await upsertMediaAssetMetadataWorkflow(req.scope).run({
    input: { key, hidden: true },
  })
  res.status(200).json({ key, deleted: true, permanent: false })
}
