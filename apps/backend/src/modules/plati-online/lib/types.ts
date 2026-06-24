/**
 * Options for the PlatiOnline payment provider, configured in `medusa-config.ts`
 * and populated from environment variables.
 */
export type PlatiOnlineOptions = {
  /** Merchant/POS identifier (public). Sent as `f_login`. */
  login: string
  /** Website/POS id within the merchant account. Sent as `f_website`. */
  website: string
  /** PlatiOnline RSA public key (PEM) used to encrypt the AES key on outgoing requests. */
  poPublicKey: string
  /** Merchant RSA private key (PEM) used to decrypt the AES key of incoming ITSN notifications. */
  merchantPrivateKey: string
  /** AES initialization vector for outgoing authorization requests (16 chars). */
  ivAuth: string
  /** AES initialization vector for incoming ITSN notifications (16 chars). */
  ivItsn: string
  /** Storefront URL PlatiOnline redirects the customer back to after payment. */
  relayUrl: string
  /** Relay method PlatiOnline uses to return the customer (e.g. PTOR, POST_S2S_PO_PAGE). */
  relayMethod?: "PTOR" | "POST_S2S_PO_PAGE" | "GET"
  /** Base URL of the PlatiOnline gateway. Defaults to https://secure.plationline.ro. */
  baseUrl?: string
  /** When true, requests are flagged as test (`f_test_request = true`). */
  testMode?: boolean
}

/**
 * PlatiOnline `f_action` values used by this provider.
 * Full list: https://wiki.plati.online/index.php/PlatiOnline_F_Action_values
 */
export enum PlatiOnlineAction {
  Query = 0,
  Refund = 1,
  Authorize = 2,
  Settle = 3,
  Void = 7,
}

/**
 * Authorization/settlement transaction status (X_STARE_FIN1).
 * https://wiki.plati.online/index.php/Codes_for_transaction_status
 */
export enum PlatiOnlineStatus {
  PendingAuth = 1,
  Authorized = 2,
  PendingSettle = 3,
  Sale = 4,
  Settled = 5,
  VoidProcessing = 6,
  Voided = 7,
  Declined = 8,
  Expired = 9,
  Error = 10,
  PendingCashRaiffeisen = 11,
  PendingCashPosta = 12,
  ManualVerification = 13,
  PendingBankTransfer = 14,
  PendingPosMobile = 15,
  PageExpired = 16,
  UserAborted = 17,
}
