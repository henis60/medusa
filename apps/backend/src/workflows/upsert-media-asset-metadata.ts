import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { upsertMediaAssetMetadataStep } from "./steps/upsert-media-asset-metadata"

type Input = {
  key: string
  alt_text?: string | null
  tags?: string[] | null
  hidden?: boolean
}

const upsertMediaAssetMetadataWorkflow = createWorkflow(
  "upsert-media-asset-metadata",
  function (input: Input) {
    const asset = upsertMediaAssetMetadataStep(input)
    return new WorkflowResponse({ asset })
  }
)

export default upsertMediaAssetMetadataWorkflow
