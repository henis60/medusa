import { AbstractPaymentProvider, MedusaError } from "@medusajs/framework/utils"
import {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  Logger,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types"

import { NetopiaClient } from "./lib/client"
import { NetopiaOptions, NetopiaIpnPayload, NetopiaBrowserInfo } from "./lib/types"
import { NetopiaStatus } from "./lib/status"

type InjectedDependencies = {
  logger: Logger
}

// PaymentSessionStatus string literals
const PS = {
  pending: "pending" as const,
  authorized: "authorized" as const,
  captured: "captured" as const,
  error: "error" as const,
  canceled: "canceled" as const,
}

function mapStatus(code: number | undefined): typeof PS[keyof typeof PS] {
  switch (code) {
    case NetopiaStatus.CONFIRMED:
    case NetopiaStatus.PAID:
      return PS.authorized
    case NetopiaStatus.REJECTED:
      return PS.error
    default:
      return PS.pending
  }
}

function toNumber(amount: unknown): number {
  if (typeof amount === "number") return amount
  if (typeof amount === "string") return parseFloat(amount)
  const n = Number((amount as any)?.valueOf?.() ?? amount)
  if (Number.isNaN(n)) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Invalid payment amount")
  return n
}

function getNtpID(data: Record<string, unknown>): string | undefined {
  return data?.ntpID as string | undefined
}

export class NetopiaProviderService extends AbstractPaymentProvider<NetopiaOptions> {
  static identifier = "netopia"

  private readonly client: NetopiaClient
  private readonly options: NetopiaOptions
  private readonly logger: Logger

  constructor(container: InjectedDependencies, options: NetopiaOptions) {
    super(container, options)
    this.options = options
    this.client = new NetopiaClient(options)
    this.logger = container.logger
  }

  static validateOptions(options: Record<string, unknown>): void {
    const required = ["apiKey", "posSignature"]
    const missing = required.filter((k) => !options[k])
    if (missing.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Netopia provider missing required options: ${missing.join(", ")} (set NETOPIA_SECRET and NETOPIA_ID)`
      )
    }
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const amountRON = toNumber(input.amount)
    const currency = (input.currency_code ?? "RON").toUpperCase()
    const ctx = input.context as Record<string, unknown> | undefined ?? {}
    // idempotency_key = payment session ID (ps_xxx) — Medusa îl folosește la matching IPN
    const sessionId = (ctx?.idempotency_key
      ?? (ctx?.extra as any)?.session_id
      ?? ctx?.session_id
      ?? `sess_${Date.now()}`) as string

    const inputData = (input.data ?? {}) as Record<string, unknown>
    const billing = this.extractBilling(ctx, inputData.billing_address as Record<string, unknown> | undefined)
    const browserInfo = inputData.browser_info as NetopiaBrowserInfo | undefined
    const redirectUrl = `${this.options.redirectUrl}?session_id=${sessionId}`

    let response
    try {
      response = await this.client.startPayment({
        config: {
          notifyUrl: this.options.notifyUrl,
          redirectUrl,
          language: this.options.language,
        },
        order: {
          posSignature: this.options.posSignature,
          orderID: sessionId,
          dateTime: new Date().toISOString(),
          description: "Comandă online",
          amount: amountRON,
          currency,
          billing,
          shipping: billing,
          products: [
            {
              name: "Comandă",
              code: "ORDER",
              category: "general",
              price: amountRON,
              vat: 19,
            },
          ],
        },
        payment: {
          options: { installments: 0, bonus: 0 },
          instrument: { type: "card", account: "", expMonth: 0, expYear: 0, secretCode: "" },
          ...(browserInfo ? { data: browserInfo } : {}),
        },
      })
    } catch (err) {
      this.logger.error(`Netopia initiatePayment error: ${(err as Error).message}`)
      throw err
    }

    const paymentURL = response.payment?.paymentURL
    const ntpID = response.payment?.ntpID ?? ""

    if (!paymentURL) {
      this.logger.error(`Netopia initiatePayment: no paymentURL — ${JSON.stringify(response)}`)
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "Netopia did not return a payment URL")
    }

    return {
      id: ntpID || sessionId,
      data: {
        redirect_url: paymentURL,
        ntpID,
        orderID: sessionId,
        amountRON,
        currency,
        status: response.payment?.status ?? NetopiaStatus.INITIATED,
      },
    }
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const data = (input.data ?? {}) as Record<string, unknown>
    const { status } = await this.getPaymentStatus({ data })
    return { status, data }
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const data = (input.data ?? {}) as Record<string, unknown>
    const ntpID = getNtpID(data)

    if (!ntpID) {
      return { status: PS.pending, data }
    }

    try {
      const res = await this.client.getStatus(ntpID)
      const status = mapStatus(res.payment?.status)
      return { status, data: { ...data, status: res.payment?.status } }
    } catch (err) {
      this.logger.warn(`Netopia getStatus error: ${(err as Error).message}`)
      return { status: PS.pending, data }
    }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    const data = (input.data ?? {}) as Record<string, unknown>
    const ntpID = getNtpID(data)

    if (!ntpID) return { data }

    try {
      const amountRON = toNumber(data.amountRON ?? 0)
      const currency = (data.currency as string) ?? "RON"
      await this.client.capture(ntpID, amountRON, currency)
    } catch (err) {
      this.logger.warn(`Netopia capture error: ${(err as Error).message}`)
    }

    return { data }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    const data = (input.data ?? {}) as Record<string, unknown>
    const ntpID = getNtpID(data)

    if (!ntpID) return { data }

    try {
      await this.client.void(ntpID)
    } catch (err) {
      this.logger.warn(`Netopia void error: ${(err as Error).message}`)
    }

    return { data }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const data = (input.data ?? {}) as Record<string, unknown>
    const ntpID = getNtpID(data)

    if (!ntpID) return { data }

    try {
      const amountRON = toNumber(input.amount)
      const currency = (data.currency as string) ?? "RON"
      await this.client.refund(ntpID, amountRON, currency)
    } catch (err) {
      this.logger.warn(`Netopia refund error: ${(err as Error).message}`)
    }

    return { data }
  }

  async deletePayment(_input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return {}
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    return { data: (input.data ?? {}) as Record<string, unknown> }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return this.initiatePayment(input as unknown as InitiatePaymentInput)
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    let ipn: NetopiaIpnPayload | undefined

    try {
      const body = payload.data
      const raw = payload.rawData

      if (body && typeof body === "object" && (body as any).payment) {
        ipn = body as NetopiaIpnPayload
      } else if (raw) {
        const text = Buffer.isBuffer(raw) ? raw.toString("utf8") : raw
        ipn = JSON.parse(text)
      }
    } catch {
      return { action: "not_supported" }
    }

    const status = ipn?.payment?.status
    const orderID = ipn?.order?.orderID ?? ""
    const amount = ipn?.payment?.amount ?? 0

    if (status === NetopiaStatus.CONFIRMED || status === NetopiaStatus.PAID) {
      return { action: "authorized", data: { session_id: orderID, amount } }
    }

    if (status === NetopiaStatus.REJECTED) {
      return { action: "failed", data: { session_id: orderID, amount } }
    }

    return { action: "not_supported" }
  }

  // `ctx` (PaymentProviderContext) nu conține billing_address în Medusa —
  // doar customer/account_holder/idempotency_key. Adresa reală de checkout
  // vine prin `dataAddr`, trimisă explicit de storefront în `data.billing_address`.
  private extractBilling(ctx: Record<string, unknown>, dataAddr?: Record<string, unknown>) {
    const customer = ((ctx?.customer ?? {}) as Record<string, unknown>)
    const addr = dataAddr ?? ((ctx?.billing_address ?? {}) as Record<string, unknown>)

    return {
      email: (addr.email ?? customer.email ?? "client@example.com") as string,
      phone: ((addr.phone ?? customer.phone ?? "+40700000000") as string),
      firstName: ((addr.first_name ?? customer.first_name ?? "Client") as string),
      lastName: ((addr.last_name ?? customer.last_name ?? "") as string),
      city: ((addr.city ?? "Bucuresti") as string),
      country: 642,
      countryName: "Romania",
      details: "",
      postalCode: ((addr.postal_code ?? "") as string),
      state: ((addr.province ?? "") as string),
    }
  }
}

export default NetopiaProviderService
