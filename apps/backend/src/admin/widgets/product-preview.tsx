import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { Container, Button, Text } from "@medusajs/ui"
import { Eye } from "@medusajs/icons"
import { useEffect, useState } from "react"
import { sdk } from "../lib/client"

const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL || "http://localhost:8000"

const ProductPreviewWidget = ({ data: product }: DetailWidgetProps<AdminProduct>) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const status = (product as any).status

  useEffect(() => {
    if (status !== "proposed") return

    sdk.client
      .fetch<{ token: string }>(`/admin/ai/preview-token?product_id=${product.id}`)
      .then(({ token }) => {
        setPreviewUrl(`${STOREFRONT_URL}/preview/products/${product.handle}?token=${token}`)
      })
      .catch(() => {})
  }, [product.id, product.handle, status])

  if (status !== "proposed" && status !== "published") return null

  if (status === "published") {
    const liveUrl = `${STOREFRONT_URL}/products/${product.handle}`
    return (
      <Container className="flex items-center justify-between px-6 py-4">
        <div>
          <Text size="small" weight="plus">Pagina produsului</Text>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Vizualizează produsul publicat pe storefront.
          </Text>
        </div>
        <Button
          size="small"
          variant="secondary"
          onClick={() => window.open(liveUrl, "_blank")}
        >
          <Eye className="mr-1.5" /> Vezi pe site
        </Button>
      </Container>
    )
  }

  return (
    <Container className="flex items-center justify-between px-6 py-4">
      <div>
        <Text size="small" weight="plus">Preview produs</Text>
        <Text size="small" className="text-ui-fg-subtle mt-1">
          Vizualizează produsul pe storefront înainte de publicare.
        </Text>
      </div>
      <Button
        size="small"
        variant="secondary"
        disabled={!previewUrl}
        onClick={() => previewUrl && window.open(previewUrl, "_blank")}
      >
        <Eye className="mr-1.5" /> Deschide preview
      </Button>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.before",
})

export default ProductPreviewWidget
