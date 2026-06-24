import { PaymentSessionStatus } from "@medusajs/framework/types"
import { PlatiOnlineStatus } from "./types"

/** Webhook actions consumed by Medusa's processPaymentWorkflow. */
export type PaymentAction =
  | "authorized"
  | "captured"
  | "failed"
  | "pending"
  | "requires_more"
  | "canceled"
  | "not_supported"

export type MappedStatus = {
  sessionStatus: PaymentSessionStatus
  action: PaymentAction
}

/**
 * Maps a PlatiOnline X_STARE_FIN1 transaction status to a Medusa payment
 * session status and the corresponding webhook action.
 * https://wiki.plati.online/index.php/Codes_for_transaction_status
 */
export function mapFinStatus(statusFin1: number): MappedStatus {
  switch (statusFin1) {
    case PlatiOnlineStatus.Authorized:
      return { sessionStatus: "authorized", action: "authorized" }

    case PlatiOnlineStatus.Settled:
    case PlatiOnlineStatus.Sale:
      return { sessionStatus: "captured", action: "captured" }

    case PlatiOnlineStatus.VoidProcessing:
    case PlatiOnlineStatus.Voided:
      return { sessionStatus: "canceled", action: "canceled" }

    case PlatiOnlineStatus.Declined:
    case PlatiOnlineStatus.Expired:
    case PlatiOnlineStatus.Error:
    case PlatiOnlineStatus.PageExpired:
    case PlatiOnlineStatus.UserAborted:
      return { sessionStatus: "error", action: "failed" }

    case PlatiOnlineStatus.PendingAuth:
    case PlatiOnlineStatus.PendingSettle:
    case PlatiOnlineStatus.PendingCashRaiffeisen:
    case PlatiOnlineStatus.PendingCashPosta:
    case PlatiOnlineStatus.ManualVerification:
    case PlatiOnlineStatus.PendingBankTransfer:
    case PlatiOnlineStatus.PendingPosMobile:
      return { sessionStatus: "pending", action: "pending" }

    default:
      return { sessionStatus: "pending", action: "not_supported" }
  }
}
