import { model } from "@medusajs/framework/utils"

// Thin metadata overlay for R2 objects. The R2 bucket itself (listed live via
// ListObjectsV2) is the source of truth for which files exist — large batches
// get uploaded there directly, outside the admin. This table only stores
// per-key metadata that has no home in R2: alt text, tags, and a hidden flag
// used for "soft delete" (hide from the library without touching the object).
const MediaAsset = model.define("media_asset", {
  id: model.id().primaryKey(),
  key: model.text().unique(),
  alt_text: model.text().nullable(),
  tags: model.json().nullable(),
  hidden: model.boolean().default(false),
})

export default MediaAsset
