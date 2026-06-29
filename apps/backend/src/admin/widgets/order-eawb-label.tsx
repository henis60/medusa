import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Button, Text, Badge } from "@medusajs/ui"
import { useState } from "react"
import { sdk } from "../lib/client"

type EawbFulfillment = {
  id: string
  provider_id?: string
  data?: {
    awb?: string
    carrier_name?: string
    service_name?: string
    track_url?: string
    dry_run?: boolean
    europarcel_id?: number
  }
}

type OrderProps = {
  id: string
  fulfillments?: EawbFulfillment[]
}

const OrderEawbLabelWidget = ({ data: order }: { data: OrderProps }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const eawbFulfillments = (order.fulfillments ?? []).filter(
    (f) => f.provider_id?.startsWith("fp_eawb_")
  )

  if (!eawbFulfillments.length) return null

  const handleDownloadLabel = async (fulfillment: EawbFulfillment) => {
    setLoadingId(fulfillment.id)
    try {
      const { url } = await sdk.client.fetch<{ url: string }>(
        `/admin/eawb/label/${fulfillment.id}`
      )
      window.open(url, "_blank")
    } catch (err) {
      alert("Eroare la generarea etichetei. Verifică logurile serverului.")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Text size="small" weight="plus">
          eAWB / Europarcel
        </Text>
      </div>
      {eawbFulfillments.map((f) => {
        const d = f.data ?? {}
        return (
          <div key={f.id} className="flex items-center justify-between px-6 py-4 gap-4">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <Text size="small" weight="plus" className="truncate">
                  AWB: {d.awb ?? "—"}
                </Text>
                {d.dry_run && (
                  <Badge size="2xsmall" color="orange">
                    DRY RUN
                  </Badge>
                )}
              </div>
              {(d.carrier_name || d.service_name) && (
                <Text size="xsmall" className="text-ui-fg-subtle">
                  {[d.carrier_name, d.service_name].filter(Boolean).join(" — ")}
                </Text>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              {d.track_url && d.track_url !== "#" && (
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => window.open(d.track_url as string, "_blank")}
                >
                  Tracking
                </Button>
              )}
              <Button
                size="small"
                variant="secondary"
                disabled={loadingId === f.id || !!d.dry_run}
                onClick={() => handleDownloadLabel(f)}
              >
                {loadingId === f.id ? "Se generează..." : "Etichetă PDF"}
              </Button>
            </div>
          </div>
        )
      })}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.before",
})

export default OrderEawbLabelWidget
