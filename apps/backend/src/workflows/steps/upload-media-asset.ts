import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { uploadR2Object, deleteR2Object, R2Object } from "../../modules/media-library/lib/r2-client"

type Input = {
  key: string
  content: string // base64
  mimeType: string
}

export const uploadMediaAssetStep = createStep(
  "upload-media-asset",
  async (input: Input, { container }) => {
    const asset = await uploadR2Object({
      key: input.key,
      content: Buffer.from(input.content, "base64"),
      mimeType: input.mimeType,
    })

    return new StepResponse<R2Object, string>(asset, asset.key)
  },
  async (key) => {
    if (!key) return
    await deleteR2Object(key)
  }
)
