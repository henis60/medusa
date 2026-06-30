import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Button, Text, Badge, toast } from "@medusajs/ui"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { sdk } from "../lib/client"

type EawbFulfillment = {
  id: string
  canceled_at?: string | null
  data?: {
    awb?: string
    carrier_name?: string
    service_name?: string
    track_url?: string
    dry_run?: boolean
    europarcel_id?: number
  }
}

type OrderStatus = {
  uses_eawb: boolean
  remaining_items: number
  fulfillments: EawbFulfillment[]
}

const OrderEawbLabelWidget = ({ data: order }: { data: { id: string } }) => {
  const queryClient = useQueryClient()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [fulfilling, setFulfilling] = useState(false)

  const { data, refetch } = useQuery({
    queryKey: ["eawb-order-status", order.id],
    queryFn: () =>
      sdk.client.fetch<OrderStatus>(`/admin/eawb/order-status/${order.id}`),
  })

  // Only render for orders shipped via eAWB.
  if (!data?.uses_eawb) return null

  const fulfillments = data.fulfillments ?? []
  const remainingItems = data.remaining_items ?? 0

  const handleFulfill = async () => {
    setFulfilling(true)
    try {
      await sdk.client.fetch(`/admin/eawb/fulfill/${order.id}`, { method: "POST" })
      toast.success("Comandă pregătită de expediere — AWB generat.")
      await refetch()
      queryClient.invalidateQueries({ queryKey: ["order", order.id] })
    } catch (err: any) {
      toast.error(err?.message || "Eroare la generarea AWB.")
    } finally {
      setFulfilling(false)
    }
  }

  const handleDownloadLabel = async (f: EawbFulfillment) => {
    setLoadingId(f.id)
    try {
      const { url } = await sdk.client.fetch<{ url: string }>(
        `/admin/eawb/label/${f.id}`
      )
      window.open(url, "_blank")
    } catch {
      toast.error("Eroare la generarea etichetei. Verifică logurile serverului.")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Text size="small" weight="plus">
          eAWB / Europarcel
        </Text>
        {remainingItems > 0 && (
          <Button size="small" onClick={handleFulfill} isLoading={fulfilling}>
            Gata de expediere
          </Button>
        )}
      </div>

      {fulfillments.length === 0 && remainingItems === 0 && (
        <div className="px-6 py-4">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Nicio expediere activă.
          </Text>
        </div>
      )}

      {fulfillments.map((f) => {
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
