/**
 * Aduce numărul de telefon la format internațional (E.164), oricum l-ar fi
 * scris clientul:
 *
 *   „(0745)052200", „0745 052 200", „0040745052200" → „+40745052200"
 *   „+33 6 12 34 56 78"                              → „+33612345678"
 *
 * Se salvează mereu în forma asta, ca adresa să fie uniformă în comandă, în
 * admin și pentru orice integrare. Backend-ul (apps/backend/src/lib/phone.ts)
 * o derivă apoi pe cea cerută de fiecare: internațională pentru Netopia,
 * națională („0745052200") pentru curieri.
 */
export function normalizePhone(raw: FormDataEntryValue | null): string {
  const trimmed = String(raw ?? "").trim()
  if (!trimmed) return ""

  const digits = trimmed.replace(/\D/g, "")
  const c = trimmed.startsWith("+") ? `+${digits}` : digits

  let sig: string
  if (c.startsWith("+40")) sig = c.slice(3)
  else if (c.startsWith("+")) return c // număr străin, deja internațional
  else if (c.startsWith("0040")) sig = c.slice(4)
  else if (c.startsWith("40") && c.length === 11) sig = c.slice(2)
  else if (c.startsWith("0")) sig = c.slice(1)
  else sig = c

  // Fără prefix și fără tipar românesc nu putem ști țara — rămâne curățat,
  // nu i se atribuie un prefix inventat.
  return /^\d{9}$/.test(sig) ? `+40${sig}` : c
}
