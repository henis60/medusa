import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MEDIA_LIBRARY_MODULE } from "../../modules/media-library"
import MediaLibraryModuleService from "../../modules/media-library/service"

type Input = {
  key: string
  alt_text?: string | null
  tags?: string[] | null
  hidden?: boolean
}

export const upsertMediaAssetMetadataStep = createStep(
  "upsert-media-asset-metadata",
  async (input: Input, { container }) => {
    const mediaLibraryModuleService: MediaLibraryModuleService = container.resolve(
      MEDIA_LIBRARY_MODULE
    )

    const [existing] = await mediaLibraryModuleService.listMediaAssets({
      key: input.key,
    })

    const previous = existing
      ? {
          key: existing.key,
          alt_text: existing.alt_text,
          tags: existing.tags,
          hidden: existing.hidden,
        }
      : null

    let asset
    if (existing) {
      asset = await mediaLibraryModuleService.updateMediaAssets({
        id: existing.id,
        alt_text: input.alt_text,
        tags: input.tags as any,
        hidden: input.hidden,
      })
    } else {
      asset = await mediaLibraryModuleService.createMediaAssets({
        key: input.key,
        alt_text: input.alt_text ?? null,
        tags: (input.tags ?? null) as any,
        hidden: input.hidden ?? false,
      })
    }

    return new StepResponse(asset, previous)
  },
  async (previous, { container }) => {
    if (!previous) return
    const mediaLibraryModuleService: MediaLibraryModuleService = container.resolve(
      MEDIA_LIBRARY_MODULE
    )
    const [existing] = await mediaLibraryModuleService.listMediaAssets({
      key: previous.key,
    })
    if (existing) {
      await mediaLibraryModuleService.updateMediaAssets({
        id: existing.id,
        alt_text: previous.alt_text,
        tags: previous.tags as any,
        hidden: previous.hidden,
      })
    }
  }
)
