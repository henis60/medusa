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

  // Europarcel enforces a 5-character minimum on street_name too, not just on
  // contact — and rejects the whole request with a 400 when it's shorter. That
  // surfaces at checkout as a retry prompt the customer can never satisfy, so
  // the order is simply lost (observed in production: "Olt"-length streets).
  // Short Romanian street names are perfectly real (Olt, Jiu, Bega, Dej), and
  // splitStreet strips the house number off the end — so a customer who writes
  // "Olt 3" instead of "Str. Olt 3" lands under the limit through no fault of
  // their own. Restoring the conventional prefix fixes the length without
  // inventing anything: the AWB label still reads as a correct address.
  const safeStreetName =
    street_name.length >= 5 ? street_name : `Str. ${street_name}`.trim()

  return {
    contact: contact.length >= 5 ? contact : "Client",
    phone: (shippingAddress.phone as string)?.trim() || "0700000000",
    email: email || "comenzi@magazin.ro",
    locality_name: (shippingAddress.city as string) ?? "",
    county_name: (shippingAddress.province as string) ?? "",
    street_name: safeStreetName,
    street_number,
    country_code: ((shippingAddress.country_code as string) ?? "RO").toUpperCase(),
  }
}

/**
 * Dimensiunile coletului, din variabile de mediu.
 *
 * DE CE CONTEAZĂ: curierul taxează la MAXIMUL dintre greutatea gravimetrică
 * (reală) și cea volumetrică = lungime×lățime×înălțime / 6000, în cm → kg.
 * Valorile folosite până acum — 40×30×20 cm — dau 24.000/6000 = 4 kg
 * volumetrici pentru un colet declarat de 0,5 kg. Practic fiecare comandă era
 * tarifată ca un colet de 4 kg, oricât de mic ar fi produsul.
 *
 * Ca reper: pentru ca volumetricul să nu depășească 0,5 kg, coletul trebuie să
 * stea sub 3.000 cm³ — de exemplu 25×20×6 cm.
 *
 * Setează-le după cutia folosită efectiv. Prea mari costă bani la fiecare
 * comandă; prea mici riscă taxare suplimentară de curier la livrare.
 */
export function parcelDefaults() {
  const num = (v: string | undefined, fallback: number) => {
    const n = Number(v)
    return Number.isFinite(n) && n > 0 ? n : fallback
  }
  // Implicite pentru o cutie mică de accesorii: 25×20×6 = 3.000 cm³, adică
  // exact 0,5 kg volumetrici — pragul sub care volumul nu mai dictează tariful.
  // Sunt o estimare pentru produse mici (cravate, accesorii), NU o măsurătoare:
  // pentru comenzi mai voluminoase trebuie mărite, altfel declari sub realitate
  // și curierul poate taxa diferența la livrare.
  return {
    length: num(process.env.EAWB_PARCEL_LENGTH, 25),
    width: num(process.env.EAWB_PARCEL_WIDTH, 20),
    height: num(process.env.EAWB_PARCEL_HEIGHT, 6),
    // Greutatea per articol, folosită cât timp variantele nu au `weight`
    // completat în admin (cazul actual). ~150 g e ordinul de mărime al unei
    // cravate cu ambalaj.
    weightPerItem: num(process.env.EAWB_PARCEL_WEIGHT_PER_ITEM, 0.15),
    minWeight: num(process.env.EAWB_PARCEL_MIN_WEIGHT, 0.15),
  }
}

/**
 * Un singur colet fizic. Greutatea vine din variante când e completată
 * (`weight` în grame, convenția Medusa), altfel se estimează din numărul de
 * articole — spre deosebire de varianta anterioară, care declara mereu 0,5 kg
 * indiferent de câte produse conținea comanda (ramura `count * 0.5` era cod
 * mort, fiindcă parametrul avea implicit o valoare truthy).
 */
export function buildContent(
  items: Array<{
    quantity?: number
    variant?: { weight?: number | null } | null
  }>,
  totalWeight?: number
): EpPriceContent {
  const cfg = parcelDefaults()

  const count = Math.max(
    items.reduce((sum, i) => sum + (i.quantity ?? 1), 0),
    1
  )

  // Suma greutăților reale, dar numai dacă TOATE liniile au variantă cu
  // greutate — un catalog completat parțial ar subdeclara coletul.
  const variantGrams = items.reduce((sum, i) => {
    const w = i.variant?.weight
    return w && w > 0 ? sum + w * (i.quantity ?? 1) : NaN
  }, 0)

  const weight =
    totalWeight && totalWeight > 0
      ? totalWeight
      : Number.isFinite(variantGrams) && variantGrams > 0
        ? Math.max(variantGrams / 1000, cfg.minWeight)
        : Math.max(count * cfg.weightPerItem, cfg.minWeight)

  return {
    envelopes_count: 0,
    pallets_count: 0,
    // Always a single physical parcel — `count` only scales its weight
    // above. Europarcel validates parcels.length === parcels_count, so this
    // must stay 1 in lockstep with the single-entry `parcels` array below.
    parcels_count: 1,
    total_weight: weight,
    parcels: [
      {
        size: {
          weight,
          width: cfg.width,
          height: cfg.height,
          length: cfg.length,
        },
        sequence_no: 1,
      },
    ],
  }
}
