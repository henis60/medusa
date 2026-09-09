import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

// listProducts with withDeleted:true returns BOTH active and soft-deleted
// rows — there's no server-side "deleted only" filter, so the active ones
// are dropped here.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const productModule = req.scope.resolve(Modules.PRODUCT)

  const products = await productModule.listProducts(
    {},
    {
      select: ["id", "title", "handle", "thumbnail", "status", "deleted_at"],
      withDeleted: true,
      order: { deleted_at: "DESC" },
    }
  )

  const deleted = products.filter((p) => p.deleted_at)

  return res.json({ products: deleted, count: deleted.length })
}
