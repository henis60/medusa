/**
 * Numele sub care un produs din Medusa apare în Oblio: NUMELE CATEGORIEI lui.
 *
 * Oblio nu acceptă orice denumire pe factură: produsele de tip „Marfa" trebuie
 * să existe în nomenclatorul lor, într-o gestiune. Trimițând titlul din Medusa,
 * de exemplu „Batistă de Buzunar Medalion Ornamental", Oblio răspunde cu 400
 * („nu este in gestiunea … din punctul de lucru Sediu").
 *
 * Regula: nomenclatorul Oblio conține câte un produs pentru fiecare categorie
 * din Medusa, cu EXACT același nume (litere mari/mici și diacritice incluse).
 * O categorie nouă pe site cere un produs cu același nume în Oblio — fără
 * modificări de cod.
 *
 * Nu se ghicește nimic. Un produs fără categorie, sau cu mai multe categorii
 * (nu știm care e cea fiscală), oprește factura cu o eroare care îl numește:
 * un document fiscal pe categoria greșită costă mai mult decât unul întârziat.
 */

type Item = {
  title?: string | null
  variant?: {
    product?: {
      title?: string | null
      categories?: Array<{ name?: string | null }> | null
    } | null
  } | null
}

export type OblioNameResult =
  | { name: string }
  | { error: string }

export function oblioProductName(item: Item): OblioNameResult {
  const label = item.title ?? item.variant?.product?.title ?? "produs fără titlu"

  const names = [
    ...new Set(
      (item.variant?.product?.categories ?? [])
        .map((c) => c.name?.trim())
        .filter((n): n is string => !!n)
    ),
  ]

  if (names.length === 1) return { name: names[0] }

  return {
    error:
      names.length === 0
        ? `„${label}" nu are nicio categorie`
        : `„${label}" are mai multe categorii (${names.join(", ")}) și nu știu care e cea fiscală`,
  }
}
