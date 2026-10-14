/**
 * Normalizarea numerelor de telefon românești.
 *
 * Clienții scriu numărul în tot felul de forme — „(0745)052200",
 * „0745 052 200", „+40 745-052-200", „0040745052200". Netopia le respinge pe
 * cele care nu sunt în format internațional („Numărul de telefon nu este
 * valid"), iar curierii au nevoie de un număr curat ca să poată suna la
 * livrare.
 *
 * Numerele străine (care încep cu + și NU cu +40) sunt lăsate neatinse, doar
 * curățate de spații și separatori — nu le cunoaștem regulile.
 */

/** Doar cifrele, păstrând un `+` inițial dacă există. */
function clean(raw: string): string {
  const trimmed = raw.trim()
  const digits = trimmed.replace(/\D/g, "")
  return trimmed.startsWith("+") ? `+${digits}` : digits
}

/**
 * Cele 9 cifre semnificative ale unui număr românesc (fără 0 / +40), sau
 * `null` dacă numărul nu pare românesc.
 */
function roSignificant(raw: string): string | null {
  const c = clean(raw)
  let d: string
  if (c.startsWith("+40")) d = c.slice(3)
  else if (c.startsWith("+")) return null // număr străin
  else if (c.startsWith("0040")) d = c.slice(4)
  else if (c.startsWith("40") && c.length === 11) d = c.slice(2)
  else if (c.startsWith("0")) d = c.slice(1)
  else d = c
  return /^\d{9}$/.test(d) ? d : null
}

/** „+40745052200" — formatul cerut de Netopia. */
export function toE164RoPhone(raw: string | null | undefined): string | undefined {
  if (!raw?.trim()) return undefined
  const sig = roSignificant(raw)
  if (sig) return `+40${sig}`
  const c = clean(raw)
  return c.startsWith("+") ? c : undefined
}

/** „0745052200" — formatul național, folosit pentru curieri. */
export function toNationalRoPhone(raw: string | null | undefined): string | undefined {
  if (!raw?.trim()) return undefined
  const sig = roSignificant(raw)
  if (sig) return `0${sig}`
  const c = clean(raw)
  return c || undefined
}
