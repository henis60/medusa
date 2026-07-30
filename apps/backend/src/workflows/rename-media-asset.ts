import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { renameMediaAssetStep } from "./steps/rename-media-asset"

type Input = {
  oldKey: string
  newKey: string
}

const renameMediaAssetWorkflow = createWorkflow(
  "rename-media-asset",
  function (input: Input) {
    const asset = renameMediaAssetStep(input)
    return new WorkflowResponse(asset)
  }
)

export default renameMediaAssetWorkflow
