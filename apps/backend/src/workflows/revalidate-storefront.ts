import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { revalidateStorefrontStep } from "./steps/revalidate-storefront"

// Manual, on-demand trigger — the Translations admin page has a "Refresh
// storefront" button so an editor can batch several translation saves before
// paying the revalidation round-trip, instead of firing it on every save.
const revalidateStorefrontWorkflow = createWorkflow(
  "revalidate-storefront",
  function () {
    const result = revalidateStorefrontStep()
    return new WorkflowResponse(result)
  }
)

export default revalidateStorefrontWorkflow
