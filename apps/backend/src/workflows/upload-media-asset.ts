import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { uploadMediaAssetStep } from "./steps/upload-media-asset"

type Input = {
  key: string
  content: string
  mimeType: string
}

const uploadMediaAssetWorkflow = createWorkflow(
  "upload-media-asset",
  function (input: Input) {
    const asset = uploadMediaAssetStep(input)
    return new WorkflowResponse(asset)
  }
)

export default uploadMediaAssetWorkflow
