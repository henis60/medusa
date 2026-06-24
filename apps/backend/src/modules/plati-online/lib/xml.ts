import { PlatiOnlineAction } from "./types"

/**
 * Minimal XML serialization mirroring the official PlatiOnline PHP kit
 * (PlatiOnline/PO5.php `array2xml`):
 *   - object keys become elements
 *   - array elements become repeated <item> tags
 *   - keys containing "coupon" become <coupon> tags
 *   - scalar values are XML-escaped
 * Top-level keys are alphabetically sorted (PHP `ksort`) before serialization.
 */

type XmlValue = string | number | boolean | null | undefined | XmlObject | XmlValue[]
export interface XmlObject {
  [key: string]: XmlValue
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function scalarToXml(value: Exclude<XmlValue, XmlObject | XmlValue[]>): string {
  if (value === null || value === undefined) {
    return ""
  }
  return escapeXml(String(value))
}

function isPlainObject(value: XmlValue): value is XmlObject {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

function nodeToXml(key: string, value: XmlValue): string {
  // Skip null/undefined and empty strings so optional fields are omitted rather
  // than emitted empty — PlatiOnline's schema enforces minLength 1 on most
  // optional fields, so an empty element fails validation.
  if (value === null || value === undefined || value === "") {
    return ""
  }

  const tag = key.includes("coupon") ? "coupon" : key

  if (Array.isArray(value)) {
    const inner = value
      .map((entry) =>
        isPlainObject(entry)
          ? `<item>${objectToXml(entry)}</item>`
          : `<item>${scalarToXml(entry as any)}</item>`
      )
      .join("")
    return `<${tag}>${inner}</${tag}>`
  }

  if (isPlainObject(value)) {
    return `<${tag}>${objectToXml(value)}</${tag}>`
  }

  return `<${tag}>${scalarToXml(value)}</${tag}>`
}

export function objectToXml(obj: XmlObject): string {
  return Object.keys(obj)
    .map((key) => nodeToXml(key, obj[key]))
    .join("")
}

/**
 * ISO 8601 timestamp with timezone offset, matching PHP `date('Y-m-d\TH:i:sP')`,
 * e.g. `2026-06-23T14:30:00+03:00`.
 */
export function formatTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  const offsetMin = -date.getTimezoneOffset()
  const sign = offsetMin >= 0 ? "+" : "-"
  const abs = Math.abs(offsetMin)
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  )
}

export type CartItem = {
  prodid: string
  name: string
  description?: string
  qty: number
  /** Unit price excluding VAT. */
  itemprice: number
  vat: number
  prodtype_id?: number
}

export type AuthRequestParams = {
  login: string
  website: string
  testMode: boolean
  orderNumber: string
  amount: number
  currency: string
  language?: string
  orderString: string
  customerIp?: string
  sequence: number
  timestamp: Date
  relayUrl: string
  relayMethod: string
  customer?: {
    email?: string | null
    phone?: string | null
    firstName?: string | null
    lastName?: string | null
    company?: string | null
    zip?: string | null
    country?: string | null
    state?: string | null
    city?: string | null
    address?: string | null
  }
  items?: CartItem[]
}

/**
 * Builds the `po_auth_request` XML for an authorization (f_action = 2).
 * Structure mirrors the official kit's auth.php example.
 */
export function buildAuthRequest(params: AuthRequestParams): string {
  const contact = params.customer
    ? {
        f_email: params.customer.email ?? undefined,
        f_phone: params.customer.phone ?? undefined,
        f_first_name: params.customer.firstName ?? undefined,
        f_last_name: params.customer.lastName ?? undefined,
      }
    : undefined

  const invoice = params.customer
    ? {
        f_company: params.customer.company ?? undefined,
        f_zip: params.customer.zip ?? undefined,
        f_country: params.customer.country ?? undefined,
        f_state: params.customer.state ?? undefined,
        f_city: params.customer.city ?? undefined,
        f_address: params.customer.address ?? undefined,
      }
    : undefined

  const request: XmlObject = {
    f_action: PlatiOnlineAction.Authorize,
    f_test_request: params.testMode ? 1 : 0,
    f_sequence: params.sequence,
    f_customer_ip: params.customerIp,
    f_timestamp: formatTimestamp(params.timestamp),
    f_login: params.login,
    f_website: params.website,
    f_order_number: params.orderNumber,
    f_amount: params.amount.toFixed(2),
    f_currency: params.currency,
    f_language: params.language ?? "RO",
    f_order_string: params.orderString,
    customer_info: contact || invoice ? { contact, invoice } : undefined,
    f_order_cart: params.items?.length
      ? (params.items.map((i) => ({
          prodid: i.prodid,
          name: i.name,
          description: i.description ?? i.name,
          qty: i.qty,
          itemprice: i.itemprice.toFixed(2),
          vat: i.vat,
          prodtype_id: i.prodtype_id ?? 1,
        })) as unknown as XmlValue)
      : undefined,
    transaction_relay_response: {
      f_relay_response_url: params.relayUrl,
      f_relay_method: params.relayMethod,
      f_post_declined: 1,
      f_relay_handshake: 1,
    },
  }

  // PHP applies ksort() to the top-level request before serializing.
  const sorted: XmlObject = {}
  for (const key of Object.keys(request).sort()) {
    sorted[key] = request[key]
  }

  return `<?xml version="1.0" encoding="UTF-8"?><po_auth_request>${objectToXml(sorted)}</po_auth_request>`
}

/**
 * Builds a simple operation request (query / settle / void / refund) keyed by
 * the PlatiOnline transaction id. Used for post-authorization operations.
 */
export function buildOperationRequest(params: {
  rootTag: string
  action: PlatiOnlineAction
  login: string
  website: string
  timestamp: Date
  /** PlatiOnline transaction id (required for settle/void/refund). */
  transactionId?: string
  /** Merchant order number (= Medusa session id); required for query. */
  orderNumber?: string
  amount?: number
}): string {
  // Operation schemas (po_query/po_settle/po_void/po_refund) use f_login,
  // f_website, f_action, f_timestamp (+ x_trans_id/f_order_number). Unlike
  // po_auth_request, they do NOT allow f_sequence or f_test_request.
  const request: XmlObject = {
    f_action: params.action,
    f_timestamp: formatTimestamp(params.timestamp),
    f_login: params.login,
    f_website: params.website,
    x_trans_id: params.transactionId,
    f_order_number: params.orderNumber,
    f_amount: params.amount !== undefined ? params.amount.toFixed(2) : undefined,
  }

  const sorted: XmlObject = {}
  for (const key of Object.keys(request).sort()) {
    sorted[key] = request[key]
  }

  return `<?xml version="1.0" encoding="UTF-8"?><${params.rootTag}>${objectToXml(sorted)}</${params.rootTag}>`
}

/**
 * Builds the mandatory ITSN acknowledgement returned to PlatiOnline.
 * `f_response_code` 1 = processed OK, 0 = error (PlatiOnline retries up to 72h).
 */
export function buildItsnResponse(params: {
  responseCode: 0 | 1
  merchServerStamp: string
  transactionId: string
}): string {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<po_itsn_response>` +
    `<f_response_code>${params.responseCode}</f_response_code>` +
    `<merchServerStamp>${escapeXml(params.merchServerStamp)}</merchServerStamp>` +
    `<x_trans_id>${escapeXml(params.transactionId)}</x_trans_id>` +
    `</po_itsn_response>`
  )
}

/**
 * Extracts the text content of the first occurrence of an XML tag.
 * Mirrors the kit's `get_xml_tag_content`. Responses are flat, so a regex is
 * sufficient and keeps the module dependency-free.
 */
/**
 * Extracts a transaction status code from a query response. PlatiOnline returns
 * status fields nested as `<status_fin1><code>2</code><timestamp>…</timestamp></status_fin1>`,
 * so the numeric value lives in a child `<code>` element (with a flat fallback).
 */
export function getStatusCode(xml: string, statusTag: string): number | undefined {
  const block = getXmlTag(xml, statusTag)
  if (block === undefined) {
    return undefined
  }
  const code = getXmlTag(block, "code") ?? block
  const n = parseInt(code, 10)
  return Number.isNaN(n) ? undefined : n
}

export function getXmlTag(xml: string, tag: string): string | undefined {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"))
  if (!match) {
    return undefined
  }

  const content = match[1].trim()

  // PlatiOnline wraps values (redirect URL, error reasons) in CDATA, whose
  // content is literal and must not be entity-unescaped.
  const cdata = content.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/)
  if (cdata) {
    return cdata[1].trim()
  }

  return content
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&amp;/g, "&")
    .trim()
}
