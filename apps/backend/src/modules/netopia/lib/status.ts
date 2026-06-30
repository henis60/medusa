// Netopia v2 payment status codes
export const NetopiaStatus = {
  INITIATED: 0,
  PAID: 3,
  CONFIRMED: 5,
  REJECTED: 12,
  PENDING_3DS: 15,
} as const
