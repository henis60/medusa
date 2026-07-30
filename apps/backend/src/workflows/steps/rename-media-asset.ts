import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MEDIA_LIBRARY_MODULE } from "../../modules/media-library"
import MediaLibraryModuleService from "../../modules/media-library/service"
import { renameR2Object } from "../../modules/media-library/lib/r2-client"

type Input = {
  oldKey: string
  newKey: string
}

export const renameMediaAssetStep = createStep(
  "rename-media-asset",
  async (input: Input, { container }) => {
    const asset = await renameR2Object(input)

    const mediaLibraryModuleService: MediaLibraryModuleService = container.resolve(
      MEDIA_LIBRARY_MODULE
    )
    const [existing] = await mediaLibraryModuleService.listMediaAssets({
      key: input.oldKey,
    })
    if (existing) {
      await mediaLibraryModuleService.updateMediaAssets({
        id: existing.id,
        key: input.newKey,
      })
    }

    // No compensation: by the time this step returns, the object only
    // exists at newKey. Re-copying back on an unrelated downstream failure
    // would just risk a second partial rename — renaming again from the UI
    // is the safe recovery path if something goes wrong later.
    return new StepResponse(asset)
  }
)
