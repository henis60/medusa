import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MEDIA_LIBRARY_MODULE } from "../../modules/media-library"
import MediaLibraryModuleService from "../../modules/media-library/service"
import { deleteR2Object } from "../../modules/media-library/lib/r2-client"

type Input = {
  key: string
}

// R2 deletion is not compensable (the object is gone), so this step only
// removes the overlay row after the delete succeeds — nothing to roll back.
export const deleteMediaAssetPermanentStep = createStep(
  "delete-media-asset-permanent",
  async (input: Input, { container }) => {
    await deleteR2Object(input.key)

    const mediaLibraryModuleService: MediaLibraryModuleService = container.resolve(
      MEDIA_LIBRARY_MODULE
    )
    const [existing] = await mediaLibraryModuleService.listMediaAssets({
      key: input.key,
    })
    if (existing) {
      await mediaLibraryModuleService.deleteMediaAssets(existing.id)
    }

    return new StepResponse({ key: input.key })
  }
)
