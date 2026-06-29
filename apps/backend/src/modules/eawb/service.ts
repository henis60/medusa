import { AbstractFulfillmentProviderService, MedusaError } from "@medusajs/framework/utils"
import {
  CalculatedShippingOptionPrice,
  CalculateShippingOptionPriceDTO,
  CreateFulfillmentResult,
  FulfillmentDTO,
  FulfillmentItemDTO,
  FulfillmentOption,
  FulfillmentOrderDTO,
  Logger,
} from "@medusajs/framework/types"

import { EuroparcelClient } from "./lib/client"
import { EawbOptions, EpPriceAddress, EpPriceContent } from "./lib/types"
import { buildContent, roundShippingPrice, toEpAddress } from "./lib/pricing"

type InjectedDependencies = {
  logger: Logger
}

// Resolved from-address id is cached for this long to avoid hitting Europarcel
// on every checkout price calculation.
const FROM_ADDRESS_TTL_MS = 5 * 60 * 1000

export default class EawbFulfillmentProviderService extends AbstractFulfillmentProviderService {
  static identifier = "eawb"

  protected readonly logger_: Logger
  protected readonly options_: EawbOptions
  protected readonly client_: EuroparcelClient
  private billingAddressId_: number | null = null
  private fromAddressId_: number | null = null
  private fromAddressIdAt_ = 0

  constructor({ logger }: InjectedDependencies, options: EawbOptions) {
    super()
    this.logger_ = logger
    this.options_ = options
    this.client_ = new EuroparcelClient(options.api_key)
  }

  static validateOptions(options: Record<string, unknown>): void {
    if (!options.api_key) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `eAWB fulfillment provider requires the "api_key" option.`
      )
    }
  }

  // ─── Internal helpers ───────────────────────────────────────────────────────

  private fromAddressEnv(): EpPriceAddress {
    return {
      contact: this.options_.from_contact ?? "",
      phone: this.options_.from_phone ?? "",
      locality_name: this.options_.from_locality ?? "",
      county_name: this.options_.from_county ?? "",
      street_name: this.options_.from_street ?? "",
      street_number: this.options_.from_street_no ?? "",
      postal_code: this.options_.from_zip ?? "",
      country_code: this.options_.from_country ?? "RO",
    }
  }

  // Always uses the default shipping address configured in the Europarcel
  // account (falls back to the first one). Cached for FROM_ADDRESS_TTL_MS.
  private async resolveFromAddressId(): Promise<number | null> {
    const now = Date.now()
    if (this.fromAddressId_ !== null && now - this.fromAddressIdAt_ < FROM_ADDRESS_TTL_MS) {
      return this.fromAddressId_
    }

    let id: number | null = null
    try {
      const res = await this.client_.getShippingAddresses({ all: true })
      const def = res.list?.find((a) => a.is_default) ?? res.list?.[0]
      if (def) id = def.id
    } catch (err) {
      this.logger_.warn(`eAWB: could not fetch shipping addresses: ${(err as Error).message}`)
    }

    if (id) {
      this.fromAddressId_ = id
      this.fromAddressIdAt_ = now
    }
    return id
  }

  private async getFromAddressData(): Promise<EpPriceAddress> {
    const id = await this.resolveFromAddressId()
    if (id) {
      return { address_from_id: id }
    }
    return this.fromAddressEnv()
  }

  private async getBillingAddressId(): Promise<number> {
    if (this.billingAddressId_) return this.billingAddressId_

    const res = await this.client_.getBillingAddresses({ all: true })
    if (!res.list?.length) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "eAWB: no billing addresses configured in Europarcel account."
      )
    }
    this.billingAddressId_ = res.list[0].id
    return this.billingAddressId_!
  }

  private buildContent(
    items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[],
    totalWeight = 0.5
  ): EpPriceContent {
    return buildContent(items as Array<{ quantity?: number }>, totalWeight)
  }

  private toAddress(shippingAddress: Record<string, unknown>, email?: string): EpPriceAddress {
    return toEpAddress(shippingAddress, email)
  }

  // ─── AbstractFulfillmentProviderService implementation ──────────────────────

  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    const [carriers, services] = await Promise.all([
      this.client_.getCarriers(),
      this.client_.getServices({ country_code: "RO" }),
    ])

    const carrierMap = new Map(carriers.map((c) => [c.id, c.name]))

    return services
      .filter((s) => {
        const carrier = carrierMap.get(s.carrier_id)
        return carrier !== undefined
      })
      .map((s) => ({
        id: `eawb_${s.carrier_id}_${s.service_id}`,
        name: `${carrierMap.get(s.carrier_id) ?? s.carrier_name} — ${s.service_name}`,
        carrier_id: s.carrier_id,
        service_id: s.service_id,
      }))
  }

  async validateOption(data: Record<string, unknown>): Promise<boolean> {
    return !!(data.carrier_id && data.service_id)
  }

  async validateFulfillmentData(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    _context: unknown
  ): Promise<Record<string, unknown>> {
    return {
      ...data,
      carrier_id: optionData.carrier_id,
      service_id: optionData.service_id,
    }
  }

  async canCalculate(_data: unknown): Promise<boolean> {
    return true
  }

  async calculatePrice(
    optionData: CalculateShippingOptionPriceDTO["optionData"],
    _data: CalculateShippingOptionPriceDTO["data"],
    context: CalculateShippingOptionPriceDTO["context"]
  ): Promise<CalculatedShippingOptionPrice> {
    const shippingAddress = context.shipping_address as Record<string, unknown> | undefined

    if (!shippingAddress?.city) {
      return { calculated_amount: 0, is_calculated_price_tax_inclusive: false }
    }

    try {
      const billingAddressId = await this.getBillingAddressId()

      const res = await this.client_.calculatePrices({
        carrier_id: optionData.carrier_id as string | number,
        service_id: optionData.service_id as number,
        billing_to: { billing_address_id: billingAddressId },
        address_from: await this.getFromAddressData(),
        address_to: this.toAddress(shippingAddress),
        content: {
          envelopes_count: 0,
          pallets_count: 0,
          parcels_count: 1,
          total_weight: 0.5,
          parcels: [{ size: { weight: 0.5, width: 30, height: 20, length: 40 }, sequence_no: 1 }],
        },
        extra: { parcel_content: "Produse" },
      })

      const option = res.data?.[0]
      if (!option) {
        return { calculated_amount: 0, is_calculated_price_tax_inclusive: false }
      }

      return {
        calculated_amount: roundShippingPrice(option.price.total),
        is_calculated_price_tax_inclusive: false,
      }
    } catch (err) {
      this.logger_.warn(`eAWB calculatePrice failed: ${(err as Error).message}`)
      return { calculated_amount: 0, is_calculated_price_tax_inclusive: false }
    }
  }

  async createFulfillment(
    data: Record<string, unknown>,
    items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[],
    order: Partial<FulfillmentOrderDTO> | undefined,
    _fulfillment: Partial<Omit<FulfillmentDTO, "provider_id" | "data" | "items">>
  ): Promise<CreateFulfillmentResult> {
    if (this.options_.dry_run) {
      this.logger_.warn("eAWB: DRY_RUN — skipping real AWB creation.")
      return {
        data: { europarcel_id: 0, awb: "DRY000", dry_run: true },
        labels: [{ tracking_number: "DRY000", tracking_url: "#", label_url: "#" }],
      }
    }

    const shippingAddress = order?.shipping_address as Record<string, unknown> | undefined
    if (!shippingAddress) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "eAWB: order has no shipping address."
      )
    }

    // The courier calls the recipient on delivery, so a real phone is mandatory
    // for an actual AWB — never fall back to a placeholder here.
    if (!(shippingAddress.phone as string)?.trim()) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "eAWB: comanda nu are număr de telefon pe adresa de livrare — necesar pentru AWB."
      )
    }

    const billingAddressId = await this.getBillingAddressId()
    const content = this.buildContent(items)

    // For "...to locker" services the customer picked a specific locker at
    // checkout; its id is carried on the shipping method data. Europarcel then
    // only needs the recipient contact + the locker id, not a street address.
    const recipient = this.toAddress(shippingAddress, order?.email ?? undefined)
    const fixedLocationId = data.fixed_location_id
      ? Number(data.fixed_location_id)
      : undefined
    const addressTo = fixedLocationId
      ? {
          fixed_location_id: fixedLocationId,
          contact: recipient.contact,
          phone: recipient.phone,
          email: recipient.email,
        }
      : recipient

    const orderRequest = {
      carrier_id: data.carrier_id,
      service_id: data.service_id,
      billing_to: { billing_address_id: billingAddressId },
      address_from: await this.getFromAddressData(),
      address_to: addressTo,
      content,
      extra: {
        parcel_content:
          items
            .map((i) => i.title)
            .filter(Boolean)
            .join(", ") || "Produse",
      },
    }

    const created = await this.client_.createOrder(orderRequest as Record<string, unknown>)

    return {
      data: {
        europarcel_id: created.id,
        awb: created.awb,
        carrier_name: created.carrier_name,
        service_name: created.service_name,
        track_url: created.track_url ?? "",
      },
      labels: [
        {
          tracking_number: created.awb,
          tracking_url: created.track_url ?? "",
          label_url: "",
        },
      ],
    }
  }

  async cancelFulfillment(data: Record<string, unknown>): Promise<void> {
    if (data.dry_run || !data.europarcel_id) return
    await this.client_.cancelOrder(data.europarcel_id as number, "wallet")
  }

  async createReturnFulfillment(_fulfillment: Record<string, unknown>): Promise<CreateFulfillmentResult> {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "eAWB nu suportă creare automată de retur. Gestionează retururile direct din dashboardul Europarcel."
    )
  }

  async getFulfillmentDocuments(_data: Record<string, unknown>): Promise<never[]> {
    return []
  }

  async retrieveDocuments(_fulfillmentData: Record<string, unknown>, _documentType: string): Promise<void> {
    // Label URLs are fetched on-demand via GET /admin/eawb/label/:fulfillmentId
  }

  async getReturnDocuments(_data: Record<string, unknown>): Promise<never[]> {
    return []
  }

  async getShipmentDocuments(_data: Record<string, unknown>): Promise<never[]> {
    return []
  }
}
