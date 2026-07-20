import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { deleteMediaAssetPermanentStep } from "./steps/delete-media-asset-permanent"

type Input = {
  key: string
}

const deleteMediaAssetPermanentWorkflow = createWorkflow(
  "delete-media-asset-permanent",
  function (input: Input) {
    const result = deleteMediaAssetPermanentStep(input)
    return new WorkflowResponse(result)
  }
)

export default deleteMediaAssetPermanentWorkflow
