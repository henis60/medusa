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
  PaymentSessionStatus,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types"

import { PlatiOnlineClient, SOAP_ACTIONS } from "./lib/client"
import { processItsn } from "./lib/itsn"
import { mapFinStatus } from "./lib/status"
import { buildAuthRequest } from "./lib/xml"
import { PlatiOnlineAction, PlatiOnlineOptions } from "./lib/types"

type InjectedDependencies = {
  logger: Logger
}

function toNumber(amount: unknown): number {
  if (typeof amount === "number") {
    return amount
  }
  if (typeof amount === "string") {
    return parseFloat(amount)
  }
  // BigNumber-like
  const n = Number((amount as any)?.valueOf?.() ?? amount)
  if (Number.isNaN(n)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Invalid payment amount")
  }
  return n
}

/**
 * PlatiOnline payment provider (redirect + ITSN flow).
 *
 * - initiatePayment builds an authorization request and returns the redirect URL
 *   the storefront must send the customer to.
 * - The customer pays off-site; PlatiOnline notifies us via ITSN, which is
 *   handled by the `/hooks/plati-online` route (it queries the real status and
 *   runs processPaymentWorkflow).
 */
export default class PlatiOnlineProviderService extends AbstractPaymentProvider<PlatiOnlineOptions> {
  static identifier = "plati-online"

  protected readonly options_: PlatiOnlineOptions
  protected readonly logger_: Logger
  protected readonly client_: PlatiOnlineClient

  constructor(container: InjectedDependencies, options: PlatiOnlineOptions) {
    super(container, options)
    this.options_ = options
    this.logger_ = container.logger
    this.client_ = new PlatiOnlineClient(options)
  }

  static validateOptions(options: Record<string, unknown>): void {
    const required: (keyof PlatiOnlineOptions)[] = [
      "login",
      "website",
      "poPublicKey",
      "merchantPrivateKey",
      "ivAuth",
      "ivItsn",
      "relayUrl",
    ]
    for (const key of required) {
      if (!options[key]) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `PlatiOnline provider requires the "${key}" option.`
        )
      }
    }
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const sessionId =
      (input.data?.session_id as string) ?? input.context?.idempotency_key
    if (!sessionId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "PlatiOnline initiatePayment requires a session id."
      )
    }

    const amount = toNumber(input.amount)
    const customer = input.context?.customer

    // Carry the session id in the relay URL: PlatiOnline returns the customer via
    // a cross-site POST, so the cart cookie isn't sent and we can't rely on it.
    const relaySep = this.options_.relayUrl.includes("?") ? "&" : "?"
    const relayUrl = `${this.options_.relayUrl}${relaySep}session_id=${encodeURIComponent(sessionId)}`

    const xml = buildAuthRequest({
      login: this.options_.login,
      website: this.options_.website,
      testMode: !!this.options_.testMode,
      // Use the Medusa session id as the order number so ITSN/Query echo it back.
      orderNumber: sessionId,
      amount,
      currency: input.currency_code.toUpperCase(),
      orderString: `Order ${sessionId}`,
      sequence: Math.floor(Math.random() * 1_000_000) + 1,
      timestamp: new Date(),
      relayUrl,
      relayMethod: this.options_.relayMethod ?? "PTOR",
      customer: customer
        ? {
            email: customer.email,
            phone: customer.phone,
            firstName: customer.first_name,
            lastName: customer.last_name,
            company: customer.billing_address?.company,
            zip: customer.billing_address?.postal_code,
            country: customer.billing_address?.country_code,
            state: customer.billing_address?.province,
            city: customer.billing_address?.city,
            address: customer.billing_address?.address_1,
          }
        : undefined,
    })

    try {
      const { redirectUrl } = await this.client_.authorize(xml)
      return {
        id: sessionId,
        status: "pending",
        data: {
          session_id: sessionId,
          order_number: sessionId,
          redirect_url: redirectUrl,
          relay_method: this.options_.relayMethod ?? "PTOR",
        },
      }
    } catch (e) {
      const message = (e as Error).message
      this.logger_.error(`PlatiOnline initiatePayment failed: ${message}`)
      // Surface the real reason to the caller (Medusa hides generic Error messages).
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `PlatiOnline: ${message}`)
    }
  }

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    const { status, transactionId } = await this.resolveStatus(input.data)
    return {
      status,
      // Persist the transaction id so capture/refund/void can reference it.
      data: { ...(input.data ?? {}), x_trans_id: transactionId ?? input.data?.x_trans_id },
    }
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    const { status, transactionId } = await this.resolveStatus(input.data)
    return {
      status,
      data: { ...(input.data ?? {}), x_trans_id: transactionId ?? input.data?.x_trans_id },
    }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    const transactionId = input.data?.x_trans_id as string | undefined
    if (transactionId) {
      await this.client_.operation({
        rootTag: "po_settle",
        action: PlatiOnlineAction.Settle,
        soapAction: SOAP_ACTIONS.settle,
        transactionId,
        testMode: !!this.options_.testMode,
      })
    }
    return { data: input.data ?? {} }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const transactionId = input.data?.x_trans_id as string | undefined
    if (transactionId) {
      await this.client_.operation({
        rootTag: "po_refund",
        action: PlatiOnlineAction.Refund,
        soapAction: SOAP_ACTIONS.refund,
        transactionId,
        amount: toNumber(input.amount),
        testMode: !!this.options_.testMode,
      })
    }
    return { data: input.data ?? {} }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    const transactionId = input.data?.x_trans_id as string | undefined
    if (transactionId) {
      await this.client_.operation({
        rootTag: "po_void",
        action: PlatiOnlineAction.Void,
        soapAction: SOAP_ACTIONS.void,
        transactionId,
        testMode: !!this.options_.testMode,
      })
    }
    return { data: input.data ?? {} }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: input.data ?? {} }
  }

  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    return { data: input.data ?? {} }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    // PlatiOnline sessions are immutable once created; nothing to update here.
    return { data: input.data ?? {} }
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    try {
      const result = await processItsn(
        this.options_,
        payload.data as Record<string, unknown>
      )
      return {
        action: result.action,
        data: {
          session_id: result.sessionId ?? "",
          amount: result.amount ?? 0,
        },
      }
    } catch (e) {
      this.logger_.error(`PlatiOnline webhook handling failed: ${(e as Error).message}`)
      return { action: "failed", data: { session_id: "", amount: 0 } }
    }
  }

  /**
   * Resolves the Medusa session status by querying PlatiOnline. Queries by the
   * order number (= Medusa session id, always available from initiatePayment)
   * and by the transaction id when known. Also returns the transaction id from
   * the response so it can be persisted for later capture/refund/void.
   */
  private async resolveStatus(
    data?: Record<string, unknown>
  ): Promise<{ status: PaymentSessionStatus; transactionId?: string }> {
    const orderNumber = (data?.order_number ?? data?.session_id) as string | undefined
    const transactionId = data?.x_trans_id as string | undefined

    this.logger_.info(
      `[PlatiOnline] resolveStatus query → orderNumber=${orderNumber ?? "-"} transactionId=${transactionId ?? "-"}`
    )

    if (!orderNumber && !transactionId) {
      this.logger_.warn("[PlatiOnline] resolveStatus: no orderNumber/transactionId → pending")
      return { status: "pending" }
    }

    try {
      const result = await this.client_.query({
        orderNumber,
        transactionId,
        testMode: !!this.options_.testMode,
      })

      this.logger_.info(
        `[PlatiOnline] query result → statusFin1=${result.statusFin1} statusFin2=${result.statusFin2} ` +
          `x_trans_id=${result.transactionId ?? "-"} amount=${result.amount ?? "-"}`
      )
      this.logger_.info(`[PlatiOnline] query raw (first 600 chars): ${result.raw.slice(0, 600)}`)

      if (result.statusFin1 === undefined) {
        return { status: "pending", transactionId: result.transactionId }
      }
      const mapped = mapFinStatus(result.statusFin1)
      this.logger_.info(
        `[PlatiOnline] mapped status → ${mapped.sessionStatus} (action ${mapped.action})`
      )
      return {
        status: mapped.sessionStatus,
        transactionId: result.transactionId,
      }
    } catch (e) {
      this.logger_.error(`[PlatiOnline] query failed: ${(e as Error).message}`)
      throw e
    }
  }
}
