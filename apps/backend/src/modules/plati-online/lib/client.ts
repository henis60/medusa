import { encryptRequest } from "./crypto"
import { buildOperationRequest, getStatusCode, getXmlTag } from "./xml"
import { PlatiOnlineAction, PlatiOnlineOptions } from "./types"

const DEFAULT_BASE_URL = "https://secure.plationline.ro"

export type PlatiOnlineClientOptions = Pick<
  PlatiOnlineOptions,
  "login" | "website" | "poPublicKey" | "ivAuth" | "baseUrl"
>

/** SOAPAction header value per PlatiOnline operation. */
export const SOAP_ACTIONS = {
  auth: "auth-only",
  settle: "settle",
  void: "void",
  refund: "refund",
  query: "query",
} as const

function escapeXmlText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

/**
 * Thin HTTP client for the PlatiOnline gateway. Encrypts the inner XML payload
 * and POSTs a `<po_request>` envelope (f_login, f_message, f_crypt_message) with
 * a `SOAPAction` header identifying the operation, mirroring the official PHP
 * kit's SoapClient transport. The SOAPAction is what routes the request to the
 * API; without it the gateway serves its public HTML page instead.
 */
export class PlatiOnlineClient {
  private readonly login: string
  private readonly website: string
  private readonly poPublicKey: string
  private readonly ivAuth: string
  private readonly baseUrl: string

  constructor(options: PlatiOnlineClientOptions) {
    this.login = options.login
    this.website = options.website
    this.poPublicKey = options.poPublicKey
    this.ivAuth = options.ivAuth
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "")
  }

  /**
   * Encrypts the inner XML, wraps it in a `<po_request>` envelope, and POSTs it
   * with the given SOAPAction. Returns the raw response body.
   */
  async send(xml: string, soapAction: string): Promise<string> {
    // eslint-disable-next-line no-console
    console.log(`[PlatiOnline] → SOAPAction="${soapAction}" request: ${xml}`)

    const { fMessage, fCryptMessage } = encryptRequest(xml, {
      ivAuth: this.ivAuth,
      poPublicKey: this.poPublicKey,
    })

    const body =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<po_request>` +
      `<f_login>${escapeXmlText(this.login)}</f_login>` +
      `<f_message>${fMessage}</f_message>` +
      `<f_crypt_message>${fCryptMessage}</f_crypt_message>` +
      `</po_request>`

    const response = await fetch(`${this.baseUrl}/`, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: `"${soapAction}"`,
        "User-Agent": "PlatiOnline-SOAP",
      },
      body,
    })

    const text = await response.text()
    // eslint-disable-next-line no-console
    console.log(
      `[PlatiOnline] ← HTTP ${response.status} response (first 600): ${text.slice(0, 600)}`
    )
    if (!response.ok) {
      throw new Error(
        `PlatiOnline request failed (HTTP ${response.status}): ${text.slice(0, 300)}`
      )
    }
    return text
  }

  /**
   * Sends an authorization request and returns the redirect URL the customer
   * must be sent to. Throws if PlatiOnline reports an error.
   */
  async authorize(xml: string): Promise<{ redirectUrl: string; raw: string }> {
    const raw = await this.send(xml, SOAP_ACTIONS.auth)

    const errorCode = getXmlTag(raw, "po_error_code")
    if (errorCode && errorCode !== "0") {
      const reason = getXmlTag(raw, "po_error_reason") ?? "unknown error"
      throw new Error(`PlatiOnline authorization error ${errorCode}: ${reason}`)
    }

    const redirectUrl = getXmlTag(raw, "po_redirect_url")
    if (!redirectUrl) {
      throw new Error(`PlatiOnline response missing po_redirect_url: ${raw.slice(0, 500)}`)
    }

    return { redirectUrl, raw }
  }

  /**
   * Queries the real transaction status (f_action = 0). PlatiOnline's ITSN only
   * signals that the status changed, so a query is required to read it.
   */
  async query(params: {
    transactionId?: string
    orderNumber?: string
    testMode: boolean
  }): Promise<QueryResult> {
    if (!params.transactionId && !params.orderNumber) {
      throw new Error("PlatiOnline query requires a transactionId or orderNumber")
    }
    const xml = buildOperationRequest({
      rootTag: "po_query",
      action: PlatiOnlineAction.Query,
      login: this.login,
      website: this.website,
      timestamp: new Date(),
      transactionId: params.transactionId,
      orderNumber: params.orderNumber,
    })

    const raw = await this.send(xml, SOAP_ACTIONS.query)

    const errorCode = getXmlTag(raw, "po_error_code")
    if (errorCode && errorCode !== "0") {
      const reason = getXmlTag(raw, "po_error_reason") ?? "unknown error"
      throw new Error(`PlatiOnline query error ${errorCode}: ${reason}`)
    }

    const amount = getXmlTag(raw, "f_amount")

    return {
      raw,
      orderNumber: getXmlTag(raw, "f_order_number") ?? params.orderNumber,
      transactionId: getXmlTag(raw, "x_trans_id") ?? params.transactionId,
      // Status codes are nested as <status_fin1><code>N</code>…</status_fin1>.
      statusFin1: getStatusCode(raw, "status_fin1"),
      statusFin2: getStatusCode(raw, "status_fin2"),
      amount: amount ? parseFloat(amount) : undefined,
      currency: getXmlTag(raw, "f_currency"),
    }
  }

  /**
   * Sends a post-authorization operation (settle / void / refund) keyed by the
   * PlatiOnline transaction id. Throws if PlatiOnline reports an error.
   */
  async operation(params: {
    rootTag: string
    action: PlatiOnlineAction
    soapAction: string
    transactionId: string
    amount?: number
    testMode: boolean
  }): Promise<string> {
    const xml = buildOperationRequest({
      rootTag: params.rootTag,
      action: params.action,
      login: this.login,
      website: this.website,
      timestamp: new Date(),
      transactionId: params.transactionId,
      amount: params.amount,
    })

    const raw = await this.send(xml, params.soapAction)
    const errorCode = getXmlTag(raw, "po_error_code")
    if (errorCode && errorCode !== "0") {
      const reason = getXmlTag(raw, "po_error_reason") ?? "unknown error"
      throw new Error(`PlatiOnline operation error ${errorCode}: ${reason}`)
    }
    return raw
  }
}

export type QueryResult = {
  raw: string
  orderNumber?: string
  transactionId?: string
  /** X_STARE_FIN1 — authorization/settlement status. */
  statusFin1?: number
  /** X_STARE_FIN2 — refund status. */
  statusFin2?: number
  amount?: number
  currency?: string
}
