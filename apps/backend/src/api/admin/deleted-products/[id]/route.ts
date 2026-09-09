import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, MedusaError } from "@medusajs/framework/utils"

// Permanent delete — only reachable from the deleted-products list, i.e.
// only ever applied to a product that's already soft-deleted. Irreversible:
// unlike restore, there's no going back from this one.
//
// By the time a product gets here it was soft-deleted through the standard
// /admin/products/:id DELETE route (src/api/admin/products/[id]/route.ts),
// which already did the cross-module cleanup — sales channel links
// dismissed, image files removed, inventory items and product/variant
// remote-links deleted via deleteProductsWorkflow. What's left at this point
// is just the DB row (product + its variants/options/images, cascaded by
// the Product model's own `.cascades()` config) and the @medusajs/translation
// module's rows — those reference a product/variant only by a plain
// `reference_id` text field with no FK, so nothing cascades or cleans them
// up automatically; they'd sit orphaned in the DB forever otherwise.
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const productModule = req.scope.resolve(Modules.PRODUCT)
  const translationModule = req.scope.resolve(Modules.TRANSLATION) as any

  const [existing] = await productModule.listProducts(
    { id: [id] },
    { select: ["id", "deleted_at", "variants.id"], withDeleted: true, relations: ["variants"] }
  )

  if (!existing) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Produsul nu a fost găsit")
  }
  if (!existing.deleted_at) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Produsul nu este șters — nu poate fi șters definitiv de aici"
    )
  }

  const variantIds = (existing.variants ?? []).map((v: { id: string }) => v.id)
  const referenceIds = [id, ...variantIds]

  const translations = await translationModule.listTranslations({
    reference_id: referenceIds,
  })
  if (translations.length) {
    await translationModule.deleteTranslations(translations.map((t: { id: string }) => t.id))
  }

  await productModule.deleteProducts([id])

  return res.json({ id, deleted: true })
}
