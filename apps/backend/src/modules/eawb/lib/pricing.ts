import { EpPriceAddress, EpPriceContent } from "./types"

// Shipping prices are rounded UP to the next whole leu, so customers always see
// clean amounts and the shop never loses the fractional part.
export function roundShippingPrice(amount: number): number {
  return Math.ceil(amount)
}

// Europarcel requires a non-empty street_name + street_number for the
// destination. Medusa keeps the whole street in address_1, so we split off a
// trailing house number; address_2 is used as a fallback number.
export function splitStreet(
  address1?: string,
  address2?: string
): { street_name: string; street_number: string } {
  const src = (address1 ?? "").trim()
  const m = src.match(/^(.*?)[\s,]*(\d+[A-Za-z]?)$/)
  if (m && m[1].trim()) {
    return { street_name: m[1].trim(), street_number: m[2] }
  }
  return { street_name: src || "-", street_number: (address2 ?? "").trim() || "-" }
}

// Builds a Europarcel destination address from a Medusa address.
// Notes:
//  - postal_code is intentionally omitted: RO codes aren't 1:1 with localities
//    and Europarcel rejects mismatches, so we let it derive the code itself.
//  - email is a cart-level field (not on the address) so a placeholder is used
//    for price simulation; the real AWB passes the order email.
//  - phone placeholder is only a safety net for price simulation.
export function toEpAddress(
  shippingAddress: Record<string, unknown>,
  email?: string
): EpPriceAddress {
  const firstName = shippingAddress.first_name as string | undefined
  const lastName = shippingAddress.last_name as string | undefined
  const { street_name, street_number } = splitStreet(
    shippingAddress.address_1 as string | undefined,
    shippingAddress.address_2 as string | undefined
  )
  const fullName = [firstName, lastName].filter(Boolean).join(" ")
  const contact = fullName.length >= 5 ? fullName : `${fullName || "Client"} .`.trim()

  return {
    contact: contact.length >= 5 ? contact : "Client",
    phone: (shippingAddress.phone as string)?.trim() || "0700000000",
    email: email || "comenzi@magazin.ro",
    locality_name: (shippingAddress.city as string) ?? "",
    county_name: (shippingAddress.province as string) ?? "",
    street_name,
    street_number,
    country_code: ((shippingAddress.country_code as string) ?? "RO").toUpperCase(),
  }
}

// Single 0.5kg parcel by default; weight scales with item count as a fallback.
export function buildContent(
  items: Array<{ quantity?: number }>,
  totalWeight = 0.5
): EpPriceContent {
  const count = Math.max(
    items.reduce((sum, i) => sum + (i.quantity ?? 1), 0),
    1
  )
  const weight = totalWeight || count * 0.5
  return {
    envelopes_count: 0,
    pallets_count: 0,
    parcels_count: count,
    total_weight: weight,
    parcels: [
      { size: { weight, width: 30, height: 20, length: 40 }, sequence_no: 1 },
    ],
  }
}
