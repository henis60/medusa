/**
 * Europarcel failures need to be told apart because the admin retrying "Gata de
 * expediere" can only act on some of them: a bad address needs the order edited,
 * an empty wallet needs a top-up, and a 5xx/429 just needs another attempt.
 * A single opaque Error made all three look identical in the logs.
 */
export type EuroparcelErrorKind =
  | "rate_limit" // 429 / throttled — retry later
  | "insufficient_funds" // wallet balance too low — top up, then retry
  | "invalid_request" // 4xx caused by the payload (address, service, weight)
  | "auth" // 401/403 — API key problem
  | "server" // 5xx — transient on Europarcel's side, retry
  | "network" // request never got a response
  | "unknown"

const FUNDS_PATTERN =
  /insufficient|not enough|sold insuficient|fonduri|balance|credit limit|wallet/i
const RATE_PATTERN = /rate.?limit|too many requests|throttl/i

// Bodies can be a full HTML error page; keep logs readable and avoid dumping
// echoed-back recipient data at length.
const MAX_DETAIL = 500

export class EuroparcelApiError extends Error {
  readonly kind: EuroparcelErrorKind
  readonly status: number
  readonly detail: string
  readonly method: string
  readonly path: string
  /** Safe to retry without changing anything about the request. */
  readonly retryable: boolean

  constructor(args: {
    kind: EuroparcelErrorKind
    status: number
    detail: string
    method: string
    path: string
  }) {
    const detail = args.detail.slice(0, MAX_DETAIL)
    super(
      `Europarcel API ${args.method} ${args.path} failed [${args.kind}] (${args.status}): ${detail}`
    )
    this.name = "EuroparcelApiError"
    this.kind = args.kind
    this.status = args.status
    this.detail = detail
    this.method = args.method
    this.path = args.path
    this.retryable =
      args.kind === "rate_limit" || args.kind === "server" || args.kind === "network"
  }

  /** Romanian, admin-facing — shown when a fulfillment attempt fails. */
  get userMessage(): string {
    switch (this.kind) {
      case "rate_limit":
        return "eAWB: prea multe cereri către Europarcel. Reîncearcă în câteva minute."
      case "insufficient_funds":
        return "eAWB: fonduri insuficiente în contul Europarcel. Alimentează portofelul și reîncearcă."
      case "invalid_request":
        return `eAWB: datele comenzii au fost respinse de Europarcel (${this.status}): ${this.detail}`
      case "auth":
        return "eAWB: cheia API Europarcel este invalidă sau expirată."
      case "server":
      case "network":
        return "eAWB: Europarcel nu răspunde momentan. Reîncearcă expedierea."
      default:
        return `eAWB: eroare Europarcel (${this.status}): ${this.detail}`
    }
  }
}

export function classifyEuroparcelError(status: number, detail: string): EuroparcelErrorKind {
  if (status === 429 || RATE_PATTERN.test(detail)) return "rate_limit"
  if (status === 401 || status === 403) return "auth"
  // Europarcel signals an empty wallet with a plain 4xx (402/422 depending on
  // endpoint), so the body text is the only reliable discriminator.
  if (status >= 400 && status < 500 && FUNDS_PATTERN.test(detail)) return "insufficient_funds"
  if (status === 402) return "insufficient_funds"
  if (status >= 400 && status < 500) return "invalid_request"
  if (status >= 500) return "server"
  return "unknown"
}
