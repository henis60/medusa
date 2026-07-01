import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { deleteProductsWorkflow } from "@medusajs/medusa/core-flows"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params as { id: string }
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Capture image URLs before deletion
  const { data: products } = await query.graph({
    entity: "product",
    filters: { id: [id] },
    fields: ["images.*"],
  })
  const imageUrls: string[] = products.flatMap((p: any) =>
    (p.images ?? []).map((img: any) => img.url as string)
  )

  // Remove product from all sales channels before deletion to avoid "Cannot delete default sales channels" error
  try {
    const { data: scLinks } = await query.graph({
      entity: "product",
      filters: { id: [id] },
      fields: ["sales_channels.*"],
    })
    const channelIds: string[] = (scLinks?.[0] as any)?.sales_channels?.map((sc: any) => sc.id) ?? []
    if (channelIds.length) {
      const remoteLink = req.scope.resolve(ContainerRegistrationKeys.REMOTE_LINK) as any
      await remoteLink.dismiss(
        channelIds.map((scId: string) => ({
          [Modules.PRODUCT]: { product_id: id },
          [Modules.SALES_CHANNEL]: { sales_channel_id: scId },
        }))
      )
    }
  } catch (e) {
    console.warn("[delete-product] Could not remove sales channel links:", e)
  }

  // Delete the product via standard workflow
  await deleteProductsWorkflow(req.scope).run({ input: { ids: [id] } })

  // Delete associated files from storage
  if (imageUrls.length) {
    try {
      const fileModule = req.scope.resolve(Modules.FILE)
      // File ID = fileKey = last segment of the URL path
      const fileIds = imageUrls
        .map((url) => {
          try {
            return new URL(url).pathname.split("/").pop() ?? ""
          } catch {
            return url.split("/").pop() ?? ""
          }
        })
        .filter(Boolean)

      if (fileIds.length) {
        await (fileModule as any).deleteFiles(fileIds)
      }
    } catch (e) {
      console.warn("[delete-product] Could not delete files:", e)
    }
  }

  res.status(200).json({ id, object: "product", deleted: true })
}
