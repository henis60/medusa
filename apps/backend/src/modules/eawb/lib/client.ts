import {
  EpBillingAddress,
  EpCancelResponse,
  EpCarrier,
  EpFixedLocation,
  EpLabelLinkResponse,
  EpOrder,
  EpPriceRequest,
  EpPriceResponse,
  EpService,
  EpShippingAddress,
  PaginatedResponse,
} from "./types"

const BASE = "https://api.europarcel.com/api/public"

export class EuroparcelClient {
  constructor(private readonly apiKey: string) {}

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        "X-API-Key": this.apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    if (!res.ok) {
      let detail = ""
      try {
        detail = await res.text()
      } catch {}
      throw new Error(`Europarcel API ${method} ${path} failed (${res.status}): ${detail}`)
    }

    return res.json() as Promise<T>
  }

  getCarriers(): Promise<EpCarrier[]> {
    return this.request("GET", "/locations/carriers")
  }

  getFixedLocations(params: {
    country_code?: string
    carrier_id: number | string
    locality_name?: string
    county_name?: string
  }): Promise<EpFixedLocation[]> {
    const country = params.country_code ?? "RO"
    const qs = new URLSearchParams()
    qs.set("carrier_id", String(params.carrier_id))
    if (params.locality_name) qs.set("locality_name", params.locality_name)
    if (params.county_name) qs.set("county_name", params.county_name)
    return this.request("GET", `/locations/fixedlocations/${country}?${qs.toString()}`)
  }

  getServices(params?: { carrier_id?: string; country_code?: string }): Promise<EpService[]> {
    const qs = params
      ? "?" + new URLSearchParams(params as Record<string, string>).toString()
      : ""
    return this.request("GET", `/locations/services${qs}`)
  }

  getShippingAddresses(params?: { all?: boolean }): Promise<PaginatedResponse<EpShippingAddress>> {
    const qs = params?.all ? "?all=true" : ""
    return this.request("GET", `/addresses/shipping${qs}`)
  }

  getBillingAddresses(params?: { all?: boolean }): Promise<PaginatedResponse<EpBillingAddress>> {
    const qs = params?.all ? "?all=true" : ""
    return this.request("GET", `/addresses/billing${qs}`)
  }

  calculatePrices(req: EpPriceRequest): Promise<EpPriceResponse> {
    return this.request("POST", "/orders/prices", req)
  }

  createOrder(req: Record<string, unknown>): Promise<EpOrder> {
    return this.request("POST", "/orders", req)
  }

  cancelOrder(orderId: number, refundChannel: "wallet" | "card" = "wallet"): Promise<EpCancelResponse> {
    return this.request("DELETE", `/orders/${orderId}?refund_channel=${refundChannel}`)
  }

  generateLabelLink(awb: string): Promise<EpLabelLinkResponse> {
    return this.request("GET", `/orders/label-link/${encodeURIComponent(awb)}`)
  }

  trackOrdersByIds(orderIds: number[], language = "ro"): Promise<unknown[]> {
    return this.request("POST", "/orders/track-by-order", { order_ids: orderIds, language })
  }
}
