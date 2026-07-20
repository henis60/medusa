import { MedusaService } from "@medusajs/framework/utils"
import MediaAsset from "./models/media-asset"

class MediaLibraryModuleService extends MedusaService({
  MediaAsset,
}) {}

export default MediaLibraryModuleService
