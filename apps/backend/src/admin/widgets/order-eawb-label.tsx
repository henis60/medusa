import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Button, Text, Badge, toast, usePrompt } from "@medusajs/ui"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { sdk } from "../lib/client"

type EawbFulfillment = {
  id: string
  canceled_at?: string | null
  shipped_at?: string | null
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

/**
 * Trei pași, în ordine:
 *
 *   1. Creează AWB  → fulfill pe produse + AWB la Europarcel; rămâne „Neexpediat"
 *   2. Expediat     → coletul a plecat; trimite emailul clientului
 *   3. Anulează     → unfulfill: AWB anulat, produsele revin în stoc
 *                     (doar cât e neexpediat — după „Expediat" Medusa refuză)
 */
const OrderEawbLabelWidget = ({ data: order }: { data: { id: string } }) => {
  const queryClient = useQueryClient()
  const prompt = usePrompt()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [fulfilling, setFulfilling] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  const { data, refetch } = useQuery({
    queryKey: ["eawb-order-status", order.id],
    queryFn: () =>
      sdk.client.fetch<OrderStatus>(`/admin/eawb/order-status/${order.id}`),
  })

  // Only render for orders shipped via eAWB.
  if (!data?.uses_eawb) return null

  const fulfillments = data.fulfillments ?? []
  const remainingItems = data.remaining_items ?? 0

  const refresh = async () => {
    await refetch()
    queryClient.invalidateQueries({ queryKey: ["order", order.id] })
  }

  // 1. Creează AWB
  const handleCreateAwb = async () => {
    setFulfilling(true)
    try {
      await sdk.client.fetch(`/admin/eawb/fulfill/${order.id}`, { method: "POST" })
      toast.success("AWB generat. Marchează „Expediat” când predai coletul.")
      await refresh()
    } catch (err: any) {
      toast.error(err?.message || "Eroare la generarea AWB.")
    } finally {
      setFulfilling(false)
    }
  }

  // 2. Expediat
  const handleShip = async (f: EawbFulfillment) => {
    const confirmed = await prompt({
      title: "Marchezi comanda ca expediată?",
      description:
        "Clientul primește acum emailul cu AWB și link de urmărire. " +
        "După aceasta, expedierea nu mai poate fi anulată din Medusa. " +
        "Apasă doar când coletul a plecat la curier.",
      confirmText: "Da, expediat",
      cancelText: "Nu încă",
    })
    if (!confirmed) return

    setBusy(f.id)
    try {
      await sdk.client.fetch(`/admin/eawb/ship/${f.id}`, { method: "POST" })
      toast.success("Marcat ca expediat. Emailul către client a fost trimis.")
      await refresh()
    } catch (err: any) {
      toast.error(err?.message || "Marcarea ca expediat a eșuat.")
    } finally {
      setBusy(null)
    }
  }

  // 3. Anulează. Neexpediat → unfulfill complet (stoc readus). Expediat → anulează
  // AWB-ul și fulfillment-ul doar ca să se poată anula COMANDA; stocul și
  // cantitățile comenzii rămân neatinse.
  const handleCancel = async (f: EawbFulfillment) => {
    const shipped = !!f.shipped_at
    const confirmed = await prompt({
      title: shipped ? "Anulezi expedierea plecată?" : "Anulezi expedierea?",
      description: shipped
        ? "Se anulează AWB-ul la Europarcel și expedierea, ca să poți anula comanda. " +
          "Stocul NU se readuce. Anulează apoi comanda imediat: fără asta, comanda rămâne " +
          "cu produse marcate expediate și fără expediere activă, deci nu mai poate fi pregătită din nou. " +
          "Clientul a primit deja emailul de expediere."
        : "Se anulează AWB-ul la Europarcel, iar produsele revin în stoc. " +
          "Comanda poate fi apoi anulată sau pregătită din nou.",
      confirmText: "Da, anulează",
      cancelText: "Nu",
    })
    if (!confirmed) return

    setBusy(f.id)
    try {
      await runCancel(f, false)
    } catch (err: any) {
      const reason = err?.message || "Anularea a eșuat."

      // Cel mai des: AWB-ul e deja anulat în contul Europarcel, iar răspunsul lor
      // la o a doua anulare nu e recunoscut. Operatorul poate confirma și continua
      // doar în Medusa — fără apel la curier.
      const skipCourier = await prompt({
        title: "Anularea la Europarcel a eșuat",
        description:
          `${reason}\n\n` +
          "Dacă AWB-ul e deja anulat în contul Europarcel, poți continua și anula doar în Medusa, " +
          "fără alt apel la curier. Verifică întâi în Europarcel.",
        confirmText: "E anulat la Europarcel — continuă",
        cancelText: "Renunț",
      })
      if (skipCourier) {
        try {
          await runCancel(f, true)
        } catch (err2: any) {
          toast.error(err2?.message || "Anularea a eșuat.")
        }
      } else {
        toast.error(reason)
      }
    } finally {
      setBusy(null)
    }
  }

  // `alreadyCanceled` → ruta nu mai apelează Europarcel, doar Medusa.
  const runCancel = async (f: EawbFulfillment, alreadyCanceled: boolean) => {
    await sdk.client.fetch(
      `/admin/eawb/cancel/${f.id}${alreadyCanceled ? "?already_canceled=true" : ""}`,
      { method: "POST" }
    )
    toast.success(
      f.shipped_at
        ? "Expediere anulată. Acum poți anula comanda."
        : "Expediere anulată. AWB anulat, produsele sunt din nou în stoc."
    )
    await refresh()
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
          <Button size="small" onClick={handleCreateAwb} isLoading={fulfilling}>
            Creează AWB
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
        const shipped = !!f.shipped_at
        return (
          <div key={f.id} className="flex flex-col gap-3 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
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
                  <Badge size="2xsmall" color={shipped ? "green" : "grey"}>
                    {shipped ? "Expediat" : "Neexpediat"}
                  </Badge>
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

            {/* Pasul 3 — „Anulează", și pentru expediat. Pasul 2 — „Expediat",
                doar cât coletul n-a plecat. */}
            <div className="flex gap-2 justify-end">
              <Button
                size="small"
                variant="danger"
                isLoading={busy === f.id && shipped}
                disabled={busy === f.id}
                onClick={() => handleCancel(f)}
              >
                Anulează
              </Button>
              {!shipped && (
                <Button
                  size="small"
                  isLoading={busy === f.id}
                  onClick={() => handleShip(f)}
                >
                  Expediat
                </Button>
              )}
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
